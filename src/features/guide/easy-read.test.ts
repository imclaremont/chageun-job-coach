import { describe, expect, it } from "vitest";
import {
  checkStep,
  findHardWords,
  hasMultipleActions,
  isGroundedInManual,
  splitSentences,
} from "./easy-read";
import { EXAMPLE_MANUALS } from "./examples";
import { SAMPLE_MANUAL, SAMPLE_STEPS } from "./sample";
import type { DraftStep } from "./schema";

const MANUAL = "컵에 얼음을 가득 채운다. 포터필터가 뜨거우니 손잡이만 잡는다.";

const step = (overrides: Partial<DraftStep> = {}): DraftStep => ({
  action: "컵에 얼음을 채워요",
  detail: "컵 끝까지 채워요.",
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

describe("기본 제공 데이터", () => {
  it("기본 가이드의 모든 단계가 점검 통과", () => {
    const problems = SAMPLE_STEPS.flatMap((sample) =>
      checkStep(sample, SAMPLE_MANUAL).map((issue) => `${sample.action}: ${issue.message}`),
    );
    expect(problems).toEqual([]);
  });

  it("예시 매뉴얼은 입력 길이 기준 충족", () => {
    for (const example of EXAMPLE_MANUALS) {
      expect(example.manual.length).toBeGreaterThan(30);
      expect(example.manual.length).toBeLessThan(6000);
    }
  });
});
