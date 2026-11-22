import type { DraftStep } from "./schema";
import { createWordMatcher, toWords } from "./text";

// 원문 구절 하나가 단계에 반영됐다고 보는 낱말 일치 비율
const COVERAGE_THRESHOLD = 0.5;
const MIN_CLAUSE_LENGTH = 6;
// 설명 낱말 중 원문에 있어야 하는 비율
const GROUNDED_THRESHOLD = 0.6;

type StepText = Pick<DraftStep, "action" | "detail" | "caution" | "doneCheck">;

// 원문을 내용 단위 구절로 분리: 제목 줄 제외, 목록 번호 제거, 문장·쉼표 기준
export function splitManualClauses(manual: string): string[] {
  return (
    manual
      .split("\n")
      .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, "").trim())
      .flatMap((line) => line.split(/(?<=[.!?])\s+/))
      .map((sentence) => sentence.trim())
      // 서술형으로 끝나는 문장만 대상, 제목이나 머리말 제외
      .filter((sentence) => /(다|요|오)[.!?]*$/.test(sentence))
      .flatMap((sentence) => sentence.split(/[,，]\s*/))
      .map((clause) => clause.replace(/[.!?]+$/, "").trim())
      .filter((clause) => clause.length >= MIN_CLAUSE_LENGTH)
  );
}

// 원문 구절 중 어떤 단계에도 반영되지 않은 것 추정, 코치 검수용 힌트
export function findUncoveredClauses(manual: string, steps: StepText[]): string[] {
  const stepText = steps
    .map((step) => `${step.action} ${step.detail} ${step.caution ?? ""} ${step.doneCheck}`)
    .join(" ");
  const inSteps = createWordMatcher(stepText);

  const stepNumbers = new Set(stepText.match(/\d+/g) ?? []);

  return splitManualClauses(manual).filter((clause) => {
    // 양·시간·개수 같은 숫자는 단계에 반드시 있어야 함
    const numbers = clause.match(/\d+/g) ?? [];
    if (numbers.some((number) => !stepNumbers.has(number))) return true;

    // 서술어는 활용형이 달라 비교에서 제외
    const words = toWords(clause).slice(0, -1);
    if (words.length === 0) return false;
    return words.filter(inSteps).length / words.length < COVERAGE_THRESHOLD;
  });
}

// 설명·주의 문구에서 원문에 없는 낱말 추정, 지어낸 내용 탐지용
export function findUngroundedWords(text: string, manual: string): string[] {
  const inManual = createWordMatcher(manual);
  // 서술어는 활용형이 달라 비교에서 제외, 문장마다 마지막 낱말 제거
  const words = text.split(/(?<=[.!?])\s+/).flatMap((sentence) => toWords(sentence).slice(0, -1));
  if (words.length === 0) return [];

  const unmatched = words.filter((word) => !inManual(word));
  return unmatched.length / words.length > 1 - GROUNDED_THRESHOLD ? unmatched : [];
}
