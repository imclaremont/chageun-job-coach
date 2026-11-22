import { connection, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { AppError, ErrorCode } from "@/shared/error";
import { logger } from "@/shared/util/logger";
import { fail } from "./response";

type RouteHandler<Context> = (
  request: NextRequest,
  context: Context,
) => Promise<Response> | Response;

// route 공통 래퍼: 요청 시점 실행 보장, 예외를 공통 응답으로 변환
export function withApiHandler<Context>(handler: RouteHandler<Context>): RouteHandler<Context> {
  return async (request, context) => {
    // 빌드 시점 사전 렌더링 제외, 중단 신호 전파를 위해 try 밖에서 호출
    await connection();

    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn("api request rejected", {
          path: request.nextUrl.pathname,
          code: error.errorCode.code,
          detail: error.detail,
        });
        return fail(error.errorCode);
      }
      if (error instanceof ZodError || error instanceof SyntaxError) {
        logger.warn("api request invalid", { path: request.nextUrl.pathname });
        return fail(ErrorCode.INVALID_REQUEST);
      }
      logger.error("api request failed", { path: request.nextUrl.pathname, error });
      return fail(ErrorCode.INTERNAL_ERROR);
    }
  };
}
