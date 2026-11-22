import "server-only";
import { join } from "node:path";
import { getEnv } from "@/config/env";
import { createFileStore } from "./file-store";
import { createMemoryStore } from "./memory-store";
import { createRedisStore } from "./redis-store";
import type { KeyValueStore } from "./types";

export type { KeyValueStore } from "./types";
export { createMemoryStore } from "./memory-store";

// 개발 서버의 모듈 재로딩에도 같은 인스턴스 유지
const globalStore = globalThis as typeof globalThis & { __chageunStore?: KeyValueStore };

function createStore(): KeyValueStore {
  const env = getEnv();
  if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    return createRedisStore(env.KV_REST_API_URL, env.KV_REST_API_TOKEN);
  }
  // Vercel 함수는 파일 쓰기 불가, 저장소 미설정 시 메모리로 대체
  if (env.VERCEL) return createMemoryStore();
  return createFileStore(join(process.cwd(), ".data", "store.json"));
}

export function getStore(): KeyValueStore {
  globalStore.__chageunStore ??= createStore();
  return globalStore.__chageunStore;
}
