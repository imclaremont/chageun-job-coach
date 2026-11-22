import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AppError, ErrorCode } from "@/shared/error";
import { withApiHandler } from "./handler";
import { ok, SuccessCode } from "./response";

// 요청 범위 밖 connection() 호출 불가, 테스트용 대체
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => {},
}));

const request = () => new NextRequest("http://localhost/api/sample");

describe("withApiHandler", () => {
  it("성공 결과를 공통 응답으로 반환", async () => {
    const handler = withApiHandler(async () => ok({ id: "g1" }, SuccessCode.CREATED));

    const response = await handler(request(), undefined);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      success: true,
      code: "CREATED",
      message: "생성되었습니다",
      data: { id: "g1" },
    });
  });

  it("AppError를 해당 상태 코드의 실패 응답으로 변환", async () => {
    const handler = withApiHandler(async () => {
      throw new AppError(ErrorCode.NOT_FOUND, { detail: "guide g1" });
    });

    const response = await handler(request(), undefined);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({ success: false, code: "NOT_FOUND", data: null });
    // 로그 전용 상세의 응답 노출 방지
    expect(JSON.stringify(body)).not.toContain("guide g1");
  });

  it("요청 검증 실패를 400으로 변환", async () => {
    const handler = withApiHandler(async () => {
      z.object({ title: z.string() }).parse({});
      return ok(null);
    });

    const response = await handler(request(), undefined);

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("INVALID_REQUEST");
  });

  it("예상하지 못한 오류는 내부 정보를 숨기고 500으로 변환", async () => {
    const handler = withApiHandler(async () => {
      throw new Error("db password leaked");
    });

    const response = await handler(request(), undefined);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(body)).not.toContain("db password");
  });
});
