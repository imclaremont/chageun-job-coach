import { getEnv } from "@/config/env";
import { ok, withApiHandler } from "@/shared/api";

// 배포 상태 확인용, 키 값이 아니라 설정 여부만 노출
export const GET = withApiHandler(async () => {
  return ok({ status: "up", aiConfigured: Boolean(getEnv().OPENAI_API_KEY) });
});
