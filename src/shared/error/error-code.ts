export type ErrorCodeDef = {
  status: number;
  code: string;
  // 사용자에게 보여도 되는 안내 문구
  message: string;
};

const define = (status: number, code: string, message: string): ErrorCodeDef => ({
  status,
  code,
  message,
});

export const ErrorCode = {
  // 공통
  INVALID_REQUEST: define(400, "INVALID_REQUEST", "요청 형식이 올바르지 않습니다"),
  NOT_FOUND: define(404, "NOT_FOUND", "요청한 내용을 찾을 수 없습니다"),
  INTERNAL_ERROR: define(500, "INTERNAL_ERROR", "잠시 후 다시 시도해 주세요"),

  // AI
  AI_NOT_CONFIGURED: define(503, "AI_NOT_CONFIGURED", "AI 연결이 설정되지 않았습니다"),
  AI_FAILED: define(502, "AI_FAILED", "AI 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요"),

  // 가이드
  GUIDE_NOT_FOUND: define(404, "GUIDE_NOT_FOUND", "가이드를 찾을 수 없습니다"),
  MANUAL_REJECTED: define(
    422,
    "MANUAL_REJECTED",
    "업무 순서를 찾지 못했습니다. 순서가 있는 업무 내용을 넣어 주세요",
  ),
  GUIDE_HAS_ISSUES: define(
    409,
    "GUIDE_HAS_ISSUES",
    "확인이 필요한 단계가 남아 있습니다. 내용을 확인한 뒤 승인해 주세요",
  ),

  // 수행과 도움 요청
  RUN_NOT_FOUND: define(404, "RUN_NOT_FOUND", "수행 기록을 찾을 수 없습니다"),
  WORKER_NOT_FOUND: define(404, "WORKER_NOT_FOUND", "근로자를 찾을 수 없습니다"),
  STEP_NOT_FOUND: define(404, "STEP_NOT_FOUND", "단계를 찾을 수 없습니다"),
  HELP_NOT_FOUND: define(404, "HELP_NOT_FOUND", "도움 요청을 찾을 수 없습니다"),
} as const satisfies Record<string, ErrorCodeDef>;
