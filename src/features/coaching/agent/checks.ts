// 코칭 답변의 쉬운 말·근거 점검, 가이드 생성 때와 같은 기준 사용
import { ACTION_MAX_LENGTH } from "@/features/guide";

export const ANSWER_SENTENCE_MAX_LENGTH = 45;

// 근로자에게 쓰면 안 되는 표현
const HARSH_PATTERN = /빨리|서둘|왜\s?못|또\s?틀|잘못했|안\s?되잖|똑바로|정신\s?차/;
// 어려운 낱말 일부, 답변에서 자주 나오는 것 위주
const HARD_WORDS = ["투입", "세척", "제조", "폐기", "보충", "착용", "수령", "실시", "준수", "유의"];

export function splitEasySentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

// 한 문장 점검, kind에 따라 길이 기준 선택
export function checkEasySentence(sentence: string, kind: "step" | "answer" = "step"): string[] {
  const problems: string[] = [];
  const max = kind === "step" ? ACTION_MAX_LENGTH : ANSWER_SENTENCE_MAX_LENGTH;
  if (sentence.length > max) problems.push(`문장이 ${sentence.length}자, ${max}자 이하로`);
  if (HARSH_PATTERN.test(sentence)) problems.push("혼내거나 재촉하는 표현 금지");
  const hard = HARD_WORDS.filter((word) => sentence.includes(word));
  if (hard.length > 0) problems.push(`어려운 낱말: ${hard.join(", ")}`);
  if (kind === "step" && /[,，]/.test(sentence)) problems.push("한 문장에 한 가지 행동만");
  return problems;
}

// 답변 속 숫자가 승인된 단계나 원문에 있는지 확인, 없는 양·시간을 지어내는 것 방지
export function findUngroundedNumbers(text: string, sourceText: string): string[] {
  const numbers = text.match(/\d+(?:\.\d+)?/g) ?? [];
  const sourceNumbers = new Set(sourceText.match(/\d+(?:\.\d+)?/g) ?? []);
  return [...new Set(numbers)].filter((number) => !sourceNumbers.has(number));
}
