import { CallCoachRequest } from "@/features/coaching";
import { coachingService } from "@/features/coaching/server";
import { ok, withApiHandler } from "@/shared/api";

type Context = RouteContext<"/api/runs/[runId]/call-coach">;

// '선생님 부르기': 사람 호출
export const POST = withApiHandler<Context>(async (request, context) => {
  const { runId } = await context.params;
  const body = CallCoachRequest.parse(await request.json());
  return ok(await coachingService.callCoach(runId, body));
});
