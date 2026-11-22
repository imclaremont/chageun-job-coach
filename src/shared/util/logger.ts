type Level = "debug" | "info" | "warn" | "error";
type Meta = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) return { name: error.name, message: error.message };
  return { message: String(error) };
}

function write(level: Level, message: string, meta?: Meta) {
  const { error, ...rest } = meta ?? {};
  const entry = {
    level,
    message,
    ...rest,
    ...(error === undefined ? {} : { error: serializeError(error) }),
    time: new Date().toISOString(),
  };
  console[level](JSON.stringify(entry));
}

// 서버 로그 메시지는 영어, 비밀 정보·개인정보·프롬프트 원문 기록 금지
export const logger = {
  debug: (message: string, meta?: Meta) => write("debug", message, meta),
  info: (message: string, meta?: Meta) => write("info", message, meta),
  warn: (message: string, meta?: Meta) => write("warn", message, meta),
  error: (message: string, meta?: Meta) => write("error", message, meta),
};
