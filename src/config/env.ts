import "server-only";
import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();

const EnvSchema = z.object({
  OPENAI_API_KEY: optionalText,
  OPENAI_MODEL: z.string().trim().min(1).default("gpt-5-mini"),
  OPENAI_REASONING_EFFORT: z.enum(["minimal", "low", "medium", "high"]).optional(),
  // 호스팅 키-값 저장소(Upstash Redis REST), 없으면 로컬 파일 또는 메모리 사용
  KV_REST_API_URL: optionalText,
  KV_REST_API_TOKEN: optionalText,
  // Vercel 실행 환경 여부
  VERCEL: optionalText,
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

const read = (name: string) => process.env[name] || undefined;

// 환경변수 검증, 값 자체는 로그와 응답에 노출 금지
export function getEnv(): Env {
  cached ??= EnvSchema.parse({
    OPENAI_API_KEY: read("OPENAI_API_KEY"),
    OPENAI_MODEL: read("OPENAI_MODEL"),
    OPENAI_REASONING_EFFORT: read("OPENAI_REASONING_EFFORT"),
    KV_REST_API_URL: read("KV_REST_API_URL") ?? read("UPSTASH_REDIS_REST_URL"),
    KV_REST_API_TOKEN: read("KV_REST_API_TOKEN") ?? read("UPSTASH_REDIS_REST_TOKEN"),
    VERCEL: read("VERCEL"),
  });
  return cached;
}
