import "server-only";
import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();

const EnvSchema = z.object({
  // Azure OpenAI 연결, 엔드포인트·키·배포 이름이 모두 있으면 우선 사용
  AZURE_OPENAI_ENDPOINT: optionalText,
  AZURE_OPENAI_API_KEY: optionalText,
  AZURE_OPENAI_DEPLOYMENT_NAME: optionalText,
  AZURE_OPENAI_API_VERSION: z.string().trim().min(1).default("2024-12-01-preview"),
  // OpenAI 직접 연결
  OPENAI_API_KEY: optionalText,
  OPENAI_MODEL: z.string().trim().min(1).default("gpt-5-mini"),
  OPENAI_REASONING_EFFORT: z.enum(["minimal", "low", "medium", "high"]).optional(),
  // 응답 변동 폭, 지원하지 않는 모델(추론 모델)에서는 생략
  OPENAI_TEMPERATURE: z.coerce.number().min(0).max(2).optional(),
  // 호스팅 키-값 저장소(Upstash Redis REST), 없으면 로컬 파일 또는 메모리 사용
  KV_REST_API_URL: optionalText,
  KV_REST_API_TOKEN: optionalText,
  // Vercel 실행 환경 여부
  VERCEL: optionalText,
});

export type Env = z.infer<typeof EnvSchema>;

// AI 연결 정보, 설정이 없으면 null
export type AiProvider =
  | { kind: "azure"; endpoint: string; apiKey: string; model: string; apiVersion: string }
  | { kind: "openai"; apiKey: string; model: string };

let cached: Env | undefined;

const read = (name: string) => process.env[name] || undefined;

// 환경변수 검증, 값 자체는 로그와 응답에 노출 금지
export function getEnv(): Env {
  cached ??= EnvSchema.parse({
    AZURE_OPENAI_ENDPOINT: read("AZURE_OPENAI_ENDPOINT"),
    AZURE_OPENAI_API_KEY: read("AZURE_OPENAI_API_KEY"),
    AZURE_OPENAI_DEPLOYMENT_NAME: read("AZURE_OPENAI_DEPLOYMENT_NAME"),
    AZURE_OPENAI_API_VERSION: read("AZURE_OPENAI_API_VERSION"),
    OPENAI_API_KEY: read("OPENAI_API_KEY"),
    OPENAI_MODEL: read("OPENAI_MODEL"),
    OPENAI_REASONING_EFFORT: read("OPENAI_REASONING_EFFORT"),
    OPENAI_TEMPERATURE: read("OPENAI_TEMPERATURE"),
    KV_REST_API_URL: read("KV_REST_API_URL") ?? read("UPSTASH_REDIS_REST_URL"),
    KV_REST_API_TOKEN: read("KV_REST_API_TOKEN") ?? read("UPSTASH_REDIS_REST_TOKEN"),
    VERCEL: read("VERCEL"),
  });
  return cached;
}

// Azure 배포에서는 배포 이름이 모델 이름 역할
export function getAiProvider(): AiProvider | null {
  const env = getEnv();
  if (env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY && env.AZURE_OPENAI_DEPLOYMENT_NAME) {
    return {
      kind: "azure",
      endpoint: env.AZURE_OPENAI_ENDPOINT,
      apiKey: env.AZURE_OPENAI_API_KEY,
      model: env.AZURE_OPENAI_DEPLOYMENT_NAME,
      apiVersion: env.AZURE_OPENAI_API_VERSION,
    };
  }
  if (env.OPENAI_API_KEY) {
    return { kind: "openai", apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL };
  }
  return null;
}
