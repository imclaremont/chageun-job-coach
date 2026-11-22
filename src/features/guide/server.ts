import "server-only";
import { generateStructured, getModelName } from "@/infra/openai";
import { getStore } from "@/infra/store";
import { createGuideRepository } from "./repository";
import { createGuideService } from "./service";

// 서버 전용 진입점, route와 다른 기능의 서버 코드에서 사용
export const guideService = createGuideService({
  repository: createGuideRepository(getStore),
  generate: (options) => generateStructured(options),
  modelName: getModelName,
});
