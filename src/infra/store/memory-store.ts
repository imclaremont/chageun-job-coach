import type { KeyValueStore } from "./types";

// 프로세스 메모리 저장소, 테스트와 저장소 미설정 환경용 (재시작 시 초기화)
export function createMemoryStore(): KeyValueStore {
  const data = new Map<string, string>();

  return {
    driver: "memory",
    async get<T>(key: string) {
      const raw = data.get(key);
      return raw === undefined ? null : (JSON.parse(raw) as T);
    },
    async set<T>(key: string, value: T) {
      data.set(key, JSON.stringify(value));
    },
    async delete(key: string) {
      data.delete(key);
    },
    async list<T>(prefix: string) {
      return [...data.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([, raw]) => JSON.parse(raw) as T);
    },
  };
}
