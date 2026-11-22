const PATTERNS: { label: string; regex: RegExp }[] = [
  { label: "주민등록번호", regex: /\b\d{6}\s?-\s?[1-4]\d{6}\b/g },
  { label: "전화번호", regex: /\b0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}\b/g },
  { label: "이메일", regex: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g },
  { label: "계좌·카드번호", regex: /\b\d{3,6}[-\s]\d{2,6}[-\s]\d{2,6}(?:[-\s]\d{1,6})?\b/g },
];

export type MaskResult = { text: string; maskedCount: number };

// 외부 AI 전송과 저장 전에 개인정보로 보이는 값 가림
export function maskPersonalInfo(text: string): MaskResult {
  let maskedCount = 0;
  let masked = text;
  for (const { label, regex } of PATTERNS) {
    masked = masked.replace(regex, () => {
      maskedCount += 1;
      return `[${label} 가림]`;
    });
  }
  return { text: masked, maskedCount };
}
