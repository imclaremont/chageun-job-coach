import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

// 환경변수 검증, 값 자체는 로그와 응답에 노출 금지
export function getEnv(): Env {
  cached ??= EnvSchema.parse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
  });
  return cached;
}
