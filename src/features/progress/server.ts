import "server-only";
import { guideService } from "@/features/guide/server";
import { getStore } from "@/infra/store";
import { createProgressRepository } from "./repository";
import { createProgressService } from "./service";

export type { ProgressService } from "./service";

// 서버 전용 진입점
export const progressService = createProgressService({
  repository: createProgressRepository(getStore),
  getApprovedGuide: (guideId) => guideService.getApproved(guideId),
});
