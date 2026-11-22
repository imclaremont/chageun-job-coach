import "server-only";
import type { KeyValueStore } from "@/infra/store";
import { GuideSchema, type Guide } from "./schema";

const PREFIX = "guide:";

export type GuideRepository = ReturnType<typeof createGuideRepository>;

// 가이드 저장소 접근, 읽은 값은 스키마 검증 후 반환
export function createGuideRepository(getStore: () => KeyValueStore) {
  return {
    async findById(id: string): Promise<Guide | null> {
      const raw = await getStore().get<unknown>(`${PREFIX}${id}`);
      return raw === null ? null : GuideSchema.parse(raw);
    },
    async findAll(): Promise<Guide[]> {
      const raws = await getStore().list<unknown>(PREFIX);
      return raws.map((raw) => GuideSchema.parse(raw));
    },
    async save(guide: Guide): Promise<void> {
      await getStore().set(`${PREFIX}${guide.id}`, guide);
    },
  };
}
