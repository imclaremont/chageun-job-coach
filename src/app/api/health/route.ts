import { getAiProvider } from "@/config/env";
import { getStore } from "@/infra/store";
import { ok, withApiHandler } from "@/shared/api";

// 배포 상태 확인용, 키 값이 아니라 설정 여부만 노출
export const GET = withApiHandler(async () => {
  const provider = getAiProvider();
  return ok({
    status: "up",
    aiConfigured: provider !== null,
    aiProvider: provider?.kind ?? null,
    model: provider?.model ?? null,
    store: getStore().driver,
  });
});
