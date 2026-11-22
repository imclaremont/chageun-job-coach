import { toWorkerGuide } from "@/features/guide";
import { guideService } from "@/features/guide/server";
import { StartRunRequest, toRunResponse } from "@/features/progress";
import { progressService } from "@/features/progress/server";
import { ok, SuccessCode, withApiHandler } from "@/shared/api";

// 수행 시작, 승인된 가이드만 가능
export const POST = withApiHandler(async (request) => {
  const body = StartRunRequest.parse(await request.json());
  const run = await progressService.startRun(body);
  const guide = await guideService.getApproved(run.guideId);
  return ok({ run: toRunResponse(run), guide: toWorkerGuide(guide) }, SuccessCode.CREATED);
});
