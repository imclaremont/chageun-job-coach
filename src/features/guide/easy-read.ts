import { findUngroundedWords } from "./coverage";
import type { DraftStep, StepIssue } from "./schema";

// 쉬운 말 기준, 프롬프트와 별개로 코드에서 다시 확인
export const ACTION_MAX_LENGTH = 30;
export const DETAIL_SENTENCE_MAX_LENGTH = 45;
export const DETAIL_MAX_SENTENCES = 2;

// 어려운 낱말과 쉬운 표현, 직접 정리한 목록
const HARD_WORDS: Record<string, string> = {
  투입: "넣기",
  세척: "씻기",
  제조: "만들기",
  폐기: "버리기",
  보충: "채우기",
  착용: "입기·쓰기",
  수령: "받기",
  배출: "내놓기",
  진열: "보기 좋게 놓기",
  비치: "놓아 두기",
  계량: "양 재기",
  소분: "나누어 담기",
  취식: "먹기",
  파기: "없애기",
  "확인 후": "확인한 다음",
  실시: "하기",
  완료: "끝내기",
  수행: "하기",
  유의: "조심하기",
  준수: "지키기",
  금지: "하지 않기",
  즉시: "바로",
  반드시: "꼭",
  익일: "다음 날",
  금일: "오늘",
  상기: "위에 적힌",
  해당: "그",
  셋팅: "준비",
  세팅: "준비",
  픽업: "가져가기",
  체크: "확인",
  리필: "다시 채우기",
};

const HAZARD_PATTERN =
  /뜨거|뜨겁|끓|화상|스팀|고온|오븐|가스불|칼|가위|날카|깨지|유리|세제|락스|소독|표백|전기|콘센트|플러그|미끄|무거|무겁/;

// '고'로 끝나지만 연결 어미가 아닌 낱말
const NOUNS_ENDING_WITH_GO = new Set([
  "창고",
  "냉장고",
  "냉동고",
  "재고",
  "광고",
  "보고",
  "경고",
  "사고",
  "금고",
  "최고",
  "참고",
  "신고",
]);

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const FINAL_NIEUN = 4;

function hasFinalNieun(char: string | undefined): boolean {
  if (!char) return false;
  const code = char.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return false;
  return (code - HANGUL_START) % 28 === FINAL_NIEUN;
}

// 한 문장에 여러 행동이 이어지는지 추정
export function hasMultipleActions(sentence: string): boolean {
  if (/[,，]|그리고|그다음|그 다음/.test(sentence)) return true;

  const words = sentence.trim().split(/\s+/);
  for (let index = 0; index < words.length - 1; index += 1) {
    const word = words[index].replace(/[^가-힣]/g, "");
    const next = words[index + 1].replace(/[^가-힣]/g, "");
    // 연결 어미: 넣고, 닫으며, 잡으면서
    if (word.length >= 2 && /(고|며|면서)$/.test(word) && !NOUNS_ENDING_WITH_GO.has(word)) {
      return true;
    }
    // 관형형 + 뒤·다음·후: 닫은 뒤, 누른 다음
    if (/^(뒤|다음|후)(에)?$/.test(next) && hasFinalNieun(word.at(-1))) return true;
  }
  return false;
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

const normalize = (text: string) => text.replace(/[^가-힣a-zA-Z0-9]/g, "").toLowerCase();

// 근거 구절이 원문에 실제로 있는지 대조, 글자 몇 개가 달라도 허용
export function isGroundedInManual(sourceQuote: string, manual: string): boolean {
  const quote = normalize(sourceQuote);
  const source = normalize(manual);
  if (quote.length < 4) return false;
  if (source.includes(quote)) return true;

  // 세 글자 묶음의 70% 이상이 원문에 있으면 인정
  const size = 3;
  const total = quote.length - size + 1;
  if (total < 4) return false;
  let matched = 0;
  for (let index = 0; index < total; index += 1) {
    if (source.includes(quote.slice(index, index + size))) matched += 1;
  }
  return matched / total >= 0.7;
}

export function findHardWords(text: string): { word: string; easier: string }[] {
  return Object.entries(HARD_WORDS)
    .filter(([word]) => text.includes(word))
    .map(([word, easier]) => ({ word, easier }));
}

export function mentionsHazard(text: string): boolean {
  return HAZARD_PATTERN.test(text);
}

// '~요'로 끝나는 쉬운 말투 여부
export function endsPolitely(sentence: string): boolean {
  return /요[.!?]*$/.test(sentence.trim());
}

// 단계 하나의 쉬운 말·근거·안전 점검
export function checkStep(step: DraftStep, manual: string): StepIssue[] {
  const issues: StepIssue[] = [];
  const action = step.action.trim();
  const detail = step.detail.trim();

  if (!action) {
    issues.push({ code: "EMPTY_FIELD", field: "action", message: "지금 할 일이 비어 있어요" });
  }
  if (action.length > ACTION_MAX_LENGTH) {
    issues.push({
      code: "LONG_SENTENCE",
      field: "action",
      message: `지금 할 일이 ${action.length}자예요 (${ACTION_MAX_LENGTH}자 이하 권장)`,
    });
  }
  if (action && hasMultipleActions(action)) {
    issues.push({
      code: "MULTI_ACTION",
      field: "action",
      message: "한 문장에 행동이 여러 개 있어요, 단계를 나눠 주세요",
    });
  }

  const sentences = splitSentences(detail);
  if (sentences.length > DETAIL_MAX_SENTENCES) {
    issues.push({
      code: "LONG_SENTENCE",
      field: "detail",
      message: `설명이 ${sentences.length}문장이에요 (${DETAIL_MAX_SENTENCES}문장 이하 권장)`,
    });
  }
  const longSentence = sentences.find((sentence) => sentence.length > DETAIL_SENTENCE_MAX_LENGTH);
  if (longSentence) {
    issues.push({
      code: "LONG_SENTENCE",
      field: "detail",
      message: `설명 문장이 ${longSentence.length}자예요 (${DETAIL_SENTENCE_MAX_LENGTH}자 이하 권장)`,
    });
  }

  for (const field of ["action", "detail", "caution", "doneCheck"] as const) {
    for (const { word, easier } of findHardWords(step[field] ?? "")) {
      issues.push({
        code: "HARD_WORD",
        field,
        message: `'${word}'은(는) 어려운 말이에요, '${easier}'처럼 바꿔 보세요`,
      });
    }
  }

  for (const field of ["action", "detail", "caution", "doneCheck"] as const) {
    const impolite = splitSentences(step[field] ?? "").find((sentence) => !endsPolitely(sentence));
    if (impolite) {
      issues.push({
        code: "NOT_EASY_STYLE",
        field,
        message: `'~해요' 말투가 아니에요: "${impolite}"`,
      });
    }
  }

  if (!isGroundedInManual(step.sourceQuote, manual)) {
    issues.push({
      code: "NO_SOURCE",
      field: "sourceQuote",
      message: "원문 매뉴얼에서 근거를 찾지 못했어요, 내용을 직접 확인해 주세요",
    });
  }

  for (const field of ["detail", "caution"] as const) {
    const words = findUngroundedWords(step[field] ?? "", manual);
    if (words.length > 0) {
      issues.push({
        code: "NO_SOURCE",
        field,
        message: `원문에 없는 말이 있어요: ${words.join(", ")}`,
      });
    }
  }

  if (!step.caution?.trim() && mentionsHazard(`${step.sourceQuote} ${action} ${detail}`)) {
    issues.push({
      code: "MISSING_CAUTION",
      field: "caution",
      message: "위험할 수 있는 내용인데 주의 문구가 없어요",
    });
  }

  return issues;
}

// 가이드 전체 점검: 단계별 점검 + 단계 사이의 설명 반복
export function checkSteps(steps: DraftStep[], manual: string): StepIssue[][] {
  const seenDetails = new Set<string>();

  return steps.map((step) => {
    const issues = checkStep(step, manual);
    const detail = normalize(step.detail);

    if (detail && detail === normalize(step.action)) {
      issues.push({
        code: "REPEATED_TEXT",
        field: "detail",
        message: "할 일과 설명이 같아요, 설명은 비워도 돼요",
      });
    } else if (detail && seenDetails.has(detail)) {
      issues.push({
        code: "REPEATED_TEXT",
        field: "detail",
        message: "앞 단계와 설명이 같아요, 이 단계의 방법만 적어 주세요",
      });
    }
    if (detail) seenDetails.add(detail);
    return issues;
  });
}
