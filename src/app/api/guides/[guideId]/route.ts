import { toGuideResponse, toWorkerGuide, UpdateGuideRequest } from "@/features/guide";
import { guideService } from "@/features/guide/server";
import { ok, withApiHandler } from "@/shared/api";

type Context = RouteContext<"/api/guides/[guideId]">;

// 가이드 상세, view=worker이면 승인된 가이드의 근로자용 내용만
export const GET = withApiHandler<Context>(async (request, context) => {
  const { guideId } = await context.params;
  if (request.nextUrl.searchParams.get("view") === "worker") {
    return ok(toWorkerGuide(await guideService.getApproved(guideId)));
  }
  return ok(toGuideResponse(await guideService.get(guideId)));
});

// 코치 수정 반영
export const PATCH = withApiHandler<Context>(async (request, context) => {
  const { guideId } = await context.params;
  const body = UpdateGuideRequest.parse(await request.json());
  return ok(toGuideResponse(await guideService.update(guideId, body)));
});
