import { z } from "zod";
import { progressService } from "@/features/progress/server";
import { ok, withApiHandler } from "@/shared/api";

const Query = z.object({ workerId: z.string().min(1), guideId: z.string().min(1) });

// 익숙해진 근로자에게 간단 보기 추천 여부
export const GET = withApiHandler(async (request) => {
  const { workerId, guideId } = Query.parse(Object.fromEntries(request.nextUrl.searchParams));
  const simpleRecommended = await progressService.isSimpleRecommended(workerId, guideId);
  return ok({ simpleRecommended });
});
