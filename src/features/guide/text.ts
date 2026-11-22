// 한글 문장 비교용 유틸, 형태소 분석 없이 낱말 앞부분으로 근사

// 글자와 숫자만 남긴 비교용 문자열
export const normalize = (text: string) => text.replace(/[^가-힣a-zA-Z0-9]/g, "").toLowerCase();

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

// 문장 부호와 괄호를 기준으로도 낱말 분리, 예: "컵(16온스)을" → 컵, 16온스, 을
export function toWords(text: string): string[] {
  return text
    .replace(/[^가-힣a-zA-Z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// 기준 글에 낱말이 있는지 판별하는 함수 생성
// 조사·어미 차이를 줄이려고 앞 두 글자로 비교, 두 글자 이하 낱말은 첫 글자로 비교
export function createWordMatcher(source: string): (word: string) => boolean {
  const sourceWords = toWords(source);
  const prefixes = new Set(sourceWords.map((word) => word.slice(0, 2)));
  const firstChars = new Set(sourceWords.map((word) => word[0]));
  const shortFirstChars = new Set(
    sourceWords.filter((word) => word.length <= 2).map((word) => word[0]),
  );

  return (word) => {
    if (word.length <= 2) return firstChars.has(word[0]);
    return prefixes.has(word.slice(0, 2)) || shortFirstChars.has(word[0]);
  };
}
