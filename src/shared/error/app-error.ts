import type { ErrorCodeDef } from "./error-code";

// 도메인 예외, route를 감싼 withApiHandler가 공통 응답으로 변환
export class AppError extends Error {
  readonly errorCode: ErrorCodeDef;
  // 로그 전용 상세, 응답 미포함
  readonly detail?: string;

  constructor(errorCode: ErrorCodeDef, options?: { detail?: string; cause?: unknown }) {
    super(errorCode.message, { cause: options?.cause });
    this.name = "AppError";
    this.errorCode = errorCode;
    this.detail = options?.detail;
  }
}
