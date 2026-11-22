import { toRunResponse } from "@/features/progress";
import { progressService } from "@/features/progress/server";
import { ok, withApiHandler } from "@/shared/api";

type Context = RouteContext<"/api/runs/[runId]/steps/[stepId]/done">;

// '다 했어요': 단계 완료 기록
export const POST = withApiHandler<Context>(async (_request, context) => {
  const { runId, stepId } = await context.params;
  return ok(toRunResponse(await progressService.completeStep(runId, stepId)));
});
