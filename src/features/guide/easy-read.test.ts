import { describe, expect, it } from "vitest";
import { findUncoveredClauses, splitManualClauses } from "./coverage";
import {
  checkStep,
  checkSteps,
  findHardWords,
  hasMultipleActions,
  isGroundedInManual,
  splitSentences,
} from "./easy-read";
import { EXAMPLE_MANUALS } from "./examples";
import { SAMPLE_DEFINITIONS } from "./sample";
import type { DraftStep } from "./schema";

const MANUAL = "컵에 얼음을 가득 채운다. 포터필터가 뜨거우니 손잡이만 잡는다.";

const step = (overrides: Partial<DraftStep> = {}): DraftStep => ({
  action: "컵에 얼음을 채워요",
  detail: "얼음을 가득 채워요.",
  emoji: "🧊",
  caution: null,
  doneCheck: "얼음이 가득 찼어요",
  sourceQuote: "컵에 얼음을 가득 채운다",
  ...overrides,
});

const codes = (target: DraftStep, manual = MANUAL) =>
  checkStep(target, manual).map((issue) => issue.code);

describe("hasMultipleActions", () => {
  it.each([
    "뚜껑을 닫고 빨대를 꽂아요",
    "버튼을 누른 뒤 기다려요",
    "컵을 꺼낸 다음 얼음을 넣어요",
    "손을 씻어요, 장갑을 껴요",
    "물을 부으면서 저어요",
  ])("여러 행동으로 판단: %s", (sentence) => {
    expect(hasMultipleActions(sentence)).toBe(true);
  });

  it.each([
    "컵에 얼음을 채워요",
    "냉장고 문을 닫아요",
    "창고 불을 꺼요",
    "다음 손님을 기다려요",
    "버튼이 꺼질 때까지 기다려요",
  ])("한 가지 행동으로 판단: %s", (sentence) => {
    expect(hasMultipleActions(sentence)).toBe(false);
  });
});

describe("isGroundedInManual", () => {
  it("원문에 있는 구절 인정", () => {
    expect(isGroundedInManual("컵에 얼음을 가득 채운다", MANUAL)).toBe(true);
  });

  it("띄어쓰기와 문장 부호 차이 허용", () => {
    expect(isGroundedInManual("컵에  얼음을 가득 채운다.", MANUAL)).toBe(true);
  });

  it("글자 한두 개 차이 허용", () => {
    expect(isGroundedInManual("포터필터가 뜨거우니 손잡이를 잡는다", MANUAL)).toBe(true);
  });

  it("원문에 없는 내용 거부", () => {
    expect(isGroundedInManual("시럽을 두 번 넣는다", MANUAL)).toBe(false);
  });

  it("너무 짧은 근거 거부", () => {
    expect(isGroundedInManual("컵", MANUAL)).toBe(false);
  });
});

describe("checkStep", () => {
  it("기준을 지킨 단계는 문제 없음", () => {
    expect(checkStep(step(), MANUAL)).toEqual([]);
  });

  it("긴 지시 문장 표시", () => {
    const action = "제빙기 앞에 있는 커다란 얼음 스쿱으로 얼음을 아주 조심해서 가득 채워요";
    expect(codes(step({ action }))).toContain("LONG_SENTENCE");
  });

  it("한 문장의 여러 행동 표시", () => {
    expect(codes(step({ action: "뚜껑을 닫고 빨대를 꽂아요" }))).toContain("MULTI_ACTION");
  });

  it("어려운 낱말 표시", () => {
    expect(codes(step({ detail: "얼음을 컵에 투입해요." }))).toContain("HARD_WORD");
    expect(findHardWords("세척 후 보충")).toHaveLength(2);
  });

  it("원문에 없는 근거 표시", () => {
    expect(codes(step({ sourceQuote: "시럽을 두 번 넣는다" }))).toContain("NO_SOURCE");
  });

  it("위험한 내용인데 주의 문구가 없으면 표시", () => {
    const hot = step({
      action: "포터필터를 잡아요",
      sourceQuote: "포터필터가 뜨거우니 손잡이만 잡는다",
    });
    expect(codes(hot)).toContain("MISSING_CAUTION");
    expect(codes({ ...hot, caution: "뜨거워요. 손잡이만 잡아요." })).not.toContain(
      "MISSING_CAUTION",
    );
  });

  it("설명 문장 수 초과 표시", () => {
    const detail = "스쿱을 잡아요. 얼음을 떠요. 컵에 넣어요.";
    expect(splitSentences(detail)).toHaveLength(3);
    expect(codes(step({ detail }))).toContain("LONG_SENTENCE");
  });
});

describe("말투와 반복 점검", () => {
  it("'~해요' 말투가 아닌 문장 표시", () => {
    expect(codes(step({ detail: "컵 끝까지 채웁니다." }))).toContain("NOT_EASY_STYLE");
    expect(codes(step({ action: "컵에 얼음을 채운다" }))).toContain("NOT_EASY_STYLE");
    expect(codes(step({ caution: "뜨거우니 조심하세요." }))).not.toContain("NOT_EASY_STYLE");
  });

  it("앞 단계와 같은 설명, 할 일과 같은 설명 표시", () => {
    const first = step({ detail: "컵 끝까지 채워요." });
    const repeated = step({ action: "얼음을 더 넣어요", detail: "컵 끝까지 채워요." });
    const echoed = step({ action: "뚜껑을 닫아요", detail: "뚜껑을 닫아요." });

    const [, second, third] = checkSteps([first, repeated, echoed], MANUAL);

    expect(second.map((issue) => issue.code)).toContain("REPEATED_TEXT");
    expect(third.map((issue) => issue.code)).toContain("REPEATED_TEXT");
  });
});

describe("원문 누락 추정", () => {
  const manual = `[카페 차근] 테이블 정리

손님이 나간 테이블은 5분 안에 정리한다.
1. 소독 스프레이를 테이블에 3번 뿌린다. 소독 스프레이는 얼굴 쪽으로 향하지 않게 하고, 손에 묻으면 물로 씻는다.`;
  const spray = step({
    action: "소독 스프레이를 테이블에 뿌려요",
    detail: "3번 뿌려요.",
    caution: "얼굴 쪽으로 향하지 않게 해요.",
    doneCheck: "스프레이를 뿌렸어요",
  });

  it("제목은 빼고 문장과 쉼표 기준으로 구절 분리", () => {
    expect(splitManualClauses(manual)).toEqual([
      "손님이 나간 테이블은 5분 안에 정리한다",
      "소독 스프레이를 테이블에 3번 뿌린다",
      "소독 스프레이는 얼굴 쪽으로 향하지 않게 하고",
      "손에 묻으면 물로 씻는다",
    ]);
  });

  it("단계에 반영되지 않은 구절만 찾음", () => {
    expect(findUncoveredClauses(manual, [spray])).toEqual([
      "손님이 나간 테이블은 5분 안에 정리한다",
      "손에 묻으면 물로 씻는다",
    ]);
  });

  it("원문의 숫자가 단계에 없으면 누락으로 판단", () => {
    const withoutCount = { ...spray, detail: "여러 번 뿌려요." };

    expect(findUncoveredClauses(manual, [withoutCount])).toContain(
      "소독 스프레이를 테이블에 3번 뿌린다",
    );
  });

  it("빠진 내용을 단계에 넣으면 누락 없음", () => {
    const complete = [
      step({ action: "테이블을 정리해요", detail: "손님이 나간 뒤 5분 안에 정리해요." }),
      { ...spray, caution: "얼굴 쪽으로 향하지 않게 해요. 손에 묻으면 물로 씻어요." },
    ];
    expect(findUncoveredClauses(manual, complete)).toEqual([]);
  });
});

describe("설명의 원문 근거", () => {
  const manual = "8. 사용한 행주는 행주 통에 넣고 손을 씻는다.";

  it("원문에 없는 말을 덧붙인 설명 표시", () => {
    const invented = step({
      action: "손을 씻어요",
      detail: "손을 물과 비누로 깨끗하게 씻어요.",
      sourceQuote: "손을 씻는다",
    });

    const issue = checkStep(invented, manual).find((item) => item.field === "detail");

    expect(issue?.code).toBe("NO_SOURCE");
    expect(issue?.message).toContain("비누로");
  });

  it("원문 낱말로 쓴 설명은 통과", () => {
    const grounded = step({
      action: "행주를 통에 넣어요",
      detail: "사용한 행주를 행주 통에 넣어요.",
      sourceQuote: "사용한 행주는 행주 통에 넣고",
    });

    expect(checkStep(grounded, manual)).toEqual([]);
  });
});

describe("기본 제공 데이터", () => {
  it.each(SAMPLE_DEFINITIONS)("기본 가이드에 원문 누락 없음: $title", ({ manual, steps }) => {
    expect(findUncoveredClauses(manual, steps)).toEqual([]);
  });

  it.each(SAMPLE_DEFINITIONS)(
    "기본 가이드의 모든 단계가 점검 통과: $title",
    ({ manual, steps }) => {
      const problems = checkSteps(steps, manual).flatMap((issues, index) =>
        issues.map((issue) => `${index + 1}. ${steps[index].action}: ${issue.message}`),
      );
      expect(problems).toEqual([]);
    },
  );

  it("기본 가이드의 식별자는 서로 다름", () => {
    const ids = SAMPLE_DEFINITIONS.map((definition) => definition.id);
    const prefixes = SAMPLE_DEFINITIONS.map((definition) => definition.stepPrefix);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it("예시 매뉴얼은 입력 길이 기준 충족", () => {
    for (const example of EXAMPLE_MANUALS) {
      expect(example.manual.length).toBeGreaterThan(30);
      expect(example.manual.length).toBeLessThan(6000);
    }
  });
});
