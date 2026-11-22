export type ErrorCodeDef = {
  status: number;
  code: string;
  // 사용자에게 보여도 되는 안내 문구
  message: string;
};

export const ErrorCode = {
  INVALID_REQUEST: {
    status: 400,
    code: "INVALID_REQUEST",
    message: "요청 형식이 올바르지 않습니다",
  },
  NOT_FOUND: { status: 404, code: "NOT_FOUND", message: "요청한 내용을 찾을 수 없습니다" },
  INTERNAL_ERROR: { status: 500, code: "INTERNAL_ERROR", message: "잠시 후 다시 시도해 주세요" },
  AI_NOT_CONFIGURED: {
    status: 503,
    code: "AI_NOT_CONFIGURED",
    message: "AI 연결이 설정되지 않았습니다",
  },
  AI_FAILED: { status: 502, code: "AI_FAILED", message: "AI 응답을 받지 못했습니다" },
} as const satisfies Record<string, ErrorCodeDef>;
