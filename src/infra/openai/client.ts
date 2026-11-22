import "server-only";
import OpenAI, { AzureOpenAI } from "openai";
import type { z } from "zod";
import { getAiProvider, getEnv } from "@/config/env";
import { AppError, ErrorCode } from "@/shared/error";
import { logger } from "@/shared/util/logger";
import { toStrictJsonSchema } from "./json-schema";

export type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type AssistantMessage = OpenAI.Chat.Completions.ChatCompletionMessage;

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: z.ZodType;
};

const REQUEST_TIMEOUT_MS = 50_000;

let client: OpenAI | undefined;

function requireProvider() {
  const provider = getAiProvider();
  if (!provider) throw new AppError(ErrorCode.AI_NOT_CONFIGURED);
  return provider;
}

// Azure OpenAI와 OpenAI 직접 연결 모두 같은 Chat Completions 호출 사용
function getClient(): OpenAI {
  if (client) return client;
  const provider = requireProvider();
  const common = { apiKey: provider.apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 };
  client =
    provider.kind === "azure"
      ? new AzureOpenAI({
          ...common,
          endpoint: provider.endpoint,
          apiVersion: provider.apiVersion,
          deployment: provider.model,
        })
      : new OpenAI(common);
  return client;
}

function baseParams() {
  const { OPENAI_REASONING_EFFORT, OPENAI_TEMPERATURE } = getEnv();
  return {
    model: requireProvider().model,
    ...(OPENAI_REASONING_EFFORT ? { reasoning_effort: OPENAI_REASONING_EFFORT } : {}),
    ...(OPENAI_TEMPERATURE === undefined ? {} : { temperature: OPENAI_TEMPERATURE }),
  };
}

// SDK 오류 → 도메인 오류, 원인은 로그에만 기록
function toAppError(error: unknown, operation: string): AppError {
  if (error instanceof AppError) return error;
  logger.error("openai request failed", { operation, error });
  return new AppError(ErrorCode.AI_FAILED, { detail: operation, cause: error });
}

export function getModelName(): string {
  return getAiProvider()?.model ?? getEnv().OPENAI_MODEL;
}

// 구조화 출력 요청, 응답은 zod 검증 후 반환 (검증 실패 시 1회 재요청)
export async function generateStructured<Schema extends z.ZodType>(options: {
  operation: string;
  schemaName: string;
  schema: Schema;
  messages: ChatMessage[];
}): Promise<z.infer<Schema>> {
  const { operation, schemaName, schema } = options;
  const messages = [...options.messages];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let content: string | null;
    try {
      const completion = await getClient().chat.completions.create({
        ...baseParams(),
        messages,
        response_format: {
          type: "json_schema",
          json_schema: { name: schemaName, strict: true, schema: toStrictJsonSchema(schema) },
        },
      });
      const message = completion.choices[0]?.message;
      if (message?.refusal) {
        throw new AppError(ErrorCode.AI_FAILED, { detail: `${operation} refused` });
      }
      content = message?.content ?? null;
    } catch (error) {
      throw toAppError(error, operation);
    }

    const parsed = safeJsonParse(content);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;

    logger.warn("openai output failed validation", { operation, attempt });
    messages.push(
      { role: "assistant", content: content ?? "" },
      {
        role: "user",
        content: `출력이 형식 검증에 실패했습니다. 다음 문제를 고쳐 전체를 다시 출력하세요: ${result.error.issues
          .slice(0, 5)
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      },
    );
  }

  throw new AppError(ErrorCode.AI_FAILED, { detail: `${operation} invalid output` });
}

// 도구 호출이 가능한 대화 1회 요청, 도구 실행과 반복은 호출하는 쪽 책임
export async function chatWithTools(options: {
  operation: string;
  messages: ChatMessage[];
  tools: ToolDefinition[];
}): Promise<AssistantMessage> {
  try {
    const completion = await getClient().chat.completions.create({
      ...baseParams(),
      messages: options.messages,
      tools: options.tools.map((tool) => ({
        type: "function" as const,
        function: {
          name: tool.name,
          description: tool.description,
          strict: true,
          parameters: toStrictJsonSchema(tool.parameters),
        },
      })),
      tool_choice: "required",
      parallel_tool_calls: false,
    });
    const message = completion.choices[0]?.message;
    if (!message) throw new AppError(ErrorCode.AI_FAILED, { detail: `${options.operation} empty` });
    return message;
  } catch (error) {
    throw toAppError(error, options.operation);
  }
}

// 계정에서 쓸 수 있는 모델 목록, 설정 점검용
export async function listModelIds(): Promise<string[]> {
  try {
    const ids: string[] = [];
    for await (const model of getClient().models.list()) ids.push(model.id);
    return ids.sort();
  } catch (error) {
    throw toAppError(error, "list models");
  }
}

function safeJsonParse(content: string | null): unknown {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
