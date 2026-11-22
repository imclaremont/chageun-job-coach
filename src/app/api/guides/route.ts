import { CreateGuideRequest, toGuideResponse, toGuideSummary } from "@/features/guide";
import { guideService } from "@/features/guide/server";
import { ok, SuccessCode, withApiHandler } from "@/shared/api";

// AI 생성과 재작성 시간 확보
export const maxDuration = 120;

// 가이드 목록, view=worker이면 승인된 가이드만
export const GET = withApiHandler(async (request) => {
  const workerView = request.nextUrl.searchParams.get("view") === "worker";
  const guides = workerView ? await guideService.listApproved() : await guideService.list();
  return ok(guides.map(toGuideSummary));
});

// 매뉴얼 → 쉬운 단계 가이드 생성
export const POST = withApiHandler(async (request) => {
  const body = CreateGuideRequest.parse(await request.json());
  const guide = await guideService.createFromManual(body);
  return ok(toGuideResponse(guide), SuccessCode.CREATED);
});
