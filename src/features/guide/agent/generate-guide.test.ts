import { describe, expect, it } from "vitest";
import type { DraftGuide, DraftStep } from "../schema";
import { generateGuide, MAX_REVISIONS, type StructuredGenerator } from "./generate-guide";

const MANUAL = "컵에 얼음을 가득 채운다. 뚜껑을 닫고 빨대를 꽂는다.";

const cleanStep: DraftStep = {
  action: "컵에 얼음을 채워요",
  detail: "",
  emoji: "🧊",
  caution: null,
  doneCheck: "얼음이 가득 찼어요",
  sourceQuote: "컵에 얼음을 가득 채운다",
};
const multiActionStep: DraftStep = {
  ...cleanStep,
  action: "뚜껑을 닫고 빨대를 꽂아요",
  sourceQuote: "뚜껑을 닫고 빨대를 꽂는다",
};
const lidStep: DraftStep = { ...multiActionStep, action: "뚜껑을 닫아요" };

const draft = (steps: DraftStep[], rejectReason: string | null = null): DraftGuide => ({
  title: "아이스 음료 만들기",
  steps,
  rejectReason,
});

// 준비한 응답을 순서대로 돌려주는 가짜 생성기, 마지막 응답 반복
function fakeGenerator(responses: DraftGuide[]) {
  const prompts: string[] = [];
  const generate: StructuredGenerator = async ({ messages }) => {
    prompts.push(messages.at(-1)?.content ?? "");
    return responses[Math.min(prompts.length - 1, responses.length - 1)];
  };
  return { generate, prompts };
}

describe("generateGuide", () => {
  it("문제 없는 초안은 한 번의 호출로 종료", async () => {
    const { generate, prompts } = fakeGenerator([draft([cleanStep, lidStep])]);

    const result = await generateGuide({ manual: MANUAL }, generate);

    expect(prompts).toHaveLength(1);
    expect(result).toMatchObject({ rounds: 1, issuesFound: 0, issuesRemaining: 0 });
  });

  it("점검에서 문제가 나오면 문제 내용을 담아 재작성 요청", async () => {
    const { generate, prompts } = fakeGenerator([
      draft([cleanStep, multiActionStep]),
      draft([cleanStep, lidStep]),
    ]);

    const result = await generateGuide({ manual: MANUAL }, generate);

    expect(prompts).toHaveLength(2);
    expect(prompts[1]).toContain("2번 단계 (action)");
    expect(result.rounds).toBe(2);
    expect(result.issuesFound).toBeGreaterThan(0);
    expect(result.issuesRemaining).toBe(0);
    expect(result.steps[1].action).toBe("뚜껑을 닫아요");
  });

  it("재작성해도 고쳐지지 않으면 정해진 횟수에서 멈추고 문제를 남김", async () => {
    const { generate, prompts } = fakeGenerator([draft([multiActionStep])]);

    const result = await generateGuide({ manual: MANUAL }, generate);

    expect(prompts).toHaveLength(1 + MAX_REVISIONS);
    expect(result.issuesRemaining).toBeGreaterThan(0);
    expect(result.issuesByStep[0].map((issue) => issue.code)).toContain("MULTI_ACTION");
  });

  it("재작성 결과가 더 나쁘면 이전 결과 유지", async () => {
    const worse: DraftStep = { ...multiActionStep, sourceQuote: "원문에 없는 문장" };
    const { generate } = fakeGenerator([draft([multiActionStep]), draft([worse])]);

    const result = await generateGuide({ manual: MANUAL }, generate);

    expect(result.steps[0].sourceQuote).toBe("뚜껑을 닫고 빨대를 꽂는다");
  });

  it("그림 기호 자리에 글자가 오면 기본 기호로 교체, 할 일과 같은 설명은 비움", async () => {
    const messy: DraftStep = { ...cleanStep, emoji: "ice cube", detail: "컵에 얼음을 채워요." };
    const { generate, prompts } = fakeGenerator([draft([messy, lidStep])]);

    const result = await generateGuide({ manual: MANUAL }, generate);

    expect(prompts).toHaveLength(1);
    expect(result.steps[0]).toMatchObject({ emoji: "▶️", detail: "" });
  });

  it("그림 기호에 글자가 섞여 오면 기호만 남김", async () => {
    const mixed: DraftStep = { ...cleanStep, emoji: "spray:🧴" };
    const { generate } = fakeGenerator([draft([mixed, lidStep])]);

    const result = await generateGuide({ manual: MANUAL }, generate);

    expect(result.steps[0].emoji).toBe("🧴");
  });

  it("업무 매뉴얼이 아니면 거절 사유 반환", async () => {
    const { generate, prompts } = fakeGenerator([draft([], "업무 순서가 없는 글")]);

    const result = await generateGuide({ manual: "오늘 날씨가 참 좋다" }, generate);

    expect(prompts).toHaveLength(1);
    expect(result.rejectReason).toBe("업무 순서가 없는 글");
    expect(result.steps).toEqual([]);
  });

  it("원문 내용을 빠뜨리면 누락 내용을 알려 주며 재작성 요청", async () => {
    const manual = "컵에 얼음을 가득 채운다. 손님에게 5분 안에 건넨다.";
    const serveStep: DraftStep = {
      ...cleanStep,
      action: "손님에게 건네요",
      detail: "5분 안에 건네요.",
      sourceQuote: "손님에게 5분 안에 건넨다",
    };
    const { generate, prompts } = fakeGenerator([
      draft([cleanStep]),
      draft([cleanStep, serveStep]),
    ]);

    const result = await generateGuide({ manual }, generate);

    expect(prompts[1]).toContain('원문 내용 누락: "손님에게 5분 안에 건넨다"');
    expect(result.uncovered).toEqual([]);
    expect(result.issuesRemaining).toBe(0);
  });

  it("매뉴얼을 데이터 영역으로 감싸 전달", async () => {
    const { generate, prompts } = fakeGenerator([draft([cleanStep, lidStep])]);

    await generateGuide({ manual: MANUAL }, generate);

    expect(prompts[0]).toContain(`<manual>\n${MANUAL}\n</manual>`);
  });
});
