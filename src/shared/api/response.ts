import { NextResponse } from "next/server";
import type { ErrorCodeDef } from "@/shared/error";

// 모든 API가 쓰는 공통 응답 형식, HTTP 상태 코드는 NextResponse에서 관리
export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
};

export const SuccessCode = {
  OK: { status: 200, code: "OK", message: "요청이 성공했습니다" },
  CREATED: { status: 201, code: "CREATED", message: "생성되었습니다" },
} as const;

type SuccessCodeDef = (typeof SuccessCode)[keyof typeof SuccessCode];

export function ok<T>(data: T, successCode: SuccessCodeDef = SuccessCode.OK) {
  const body: ApiResponse<T> = {
    success: true,
    code: successCode.code,
    message: successCode.message,
    data,
  };
  return NextResponse.json(body, { status: successCode.status });
}

export function fail(errorCode: ErrorCodeDef) {
  const body: ApiResponse<null> = {
    success: false,
    code: errorCode.code,
    message: errorCode.message,
    data: null,
  };
  return NextResponse.json(body, { status: errorCode.status });
}
