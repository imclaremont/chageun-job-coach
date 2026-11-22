import { AskHelpRequest } from "@/features/coaching";
import { coachingService } from "@/features/coaching/server";
import { ok, withApiHandler } from "@/shared/api";

type Context = RouteContext<"/api/runs/[runId]/help">;

// AI 도구 호출 반복 시간 확보, 배포 환경 제한에 맞춤
export const maxDuration = 60;

// '잘 모르겠어요': AI 코칭 답변
export const POST = withApiHandler<Context>(async (request, context) => {
  const { runId } = await context.params;
  const body = AskHelpRequest.parse(await request.json());
  return ok(await coachingService.ask(runId, body));
});
