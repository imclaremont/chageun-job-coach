import { ApproveGuideRequest, toGuideResponse } from "@/features/guide";
import { guideService } from "@/features/guide/server";
import { ok, withApiHandler } from "@/shared/api";

type Context = RouteContext<"/api/guides/[guideId]/approve">;

// 코치 승인, 승인된 가이드만 근로자 화면에 노출
export const POST = withApiHandler<Context>(async (request, context) => {
  const { guideId } = await context.params;
  const body = ApproveGuideRequest.parse(await request.json().catch(() => ({})));
  return ok(toGuideResponse(await guideService.approve(guideId, body)));
});
