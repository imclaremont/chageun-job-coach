import { progressService } from "@/features/progress/server";
import { ok, withApiHandler } from "@/shared/api";

// 코치 대시보드 집계
export const GET = withApiHandler(async () => ok(await progressService.dashboard()));
