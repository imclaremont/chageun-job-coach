import { toRunResponse } from "@/features/progress";
import { progressService } from "@/features/progress/server";
import { ok, withApiHandler } from "@/shared/api";

type Context = RouteContext<"/api/runs/[runId]">;

export const GET = withApiHandler<Context>(async (_request, context) => {
  const { runId } = await context.params;
  return ok(toRunResponse(await progressService.getRun(runId)));
});
