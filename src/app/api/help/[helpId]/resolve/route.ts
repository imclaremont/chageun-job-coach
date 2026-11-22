import { progressService } from "@/features/progress/server";
import { ok, withApiHandler } from "@/shared/api";

type Context = RouteContext<"/api/help/[helpId]/resolve">;

// 코치가 사람 호출을 확인 처리
export const POST = withApiHandler<Context>(async (_request, context) => {
  const { helpId } = await context.params;
  return ok(await progressService.resolveHelp(helpId));
});
