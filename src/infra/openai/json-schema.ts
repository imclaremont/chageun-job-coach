import { z } from "zod";

// 구조화 출력의 strict 모드가 받지 않는 키워드
const UNSUPPORTED_KEYWORDS = new Set([
  "$schema",
  "minItems",
  "maxItems",
  "minLength",
  "maxLength",
  "minimum",
  "maximum",
  "pattern",
  "format",
  "default",
]);

function strip(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(strip);
  if (node === null || typeof node !== "object") return node;
  return Object.fromEntries(
    Object.entries(node)
      .filter(([key]) => !UNSUPPORTED_KEYWORDS.has(key))
      .map(([key, value]) => [key, strip(value)]),
  );
}

// zod 스키마 → strict 모드용 JSON 스키마, 제거한 제약은 응답 수신 후 zod로 재검증
export function toStrictJsonSchema(schema: z.ZodType): Record<string, unknown> {
  return strip(z.toJSONSchema(schema)) as Record<string, unknown>;
}
