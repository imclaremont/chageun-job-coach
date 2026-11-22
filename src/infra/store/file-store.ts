import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { KeyValueStore } from "./types";

type Snapshot = Record<string, unknown>;

// 로컬 개발용 JSON 파일 저장소
export function createFileStore(filePath: string): KeyValueStore {
  // 동시 쓰기 직렬화
  let queue: Promise<unknown> = Promise.resolve();

  async function load(): Promise<Snapshot> {
    try {
      return JSON.parse(await readFile(filePath, "utf8")) as Snapshot;
    } catch {
      return {};
    }
  }

  async function mutate(change: (snapshot: Snapshot) => void) {
    const task = queue.then(async () => {
      const snapshot = await load();
      change(snapshot);
      await mkdir(dirname(filePath), { recursive: true });
      // 임시 파일 기록 후 교체, 중간 상태 파일 방지
      const tempPath = `${filePath}.tmp`;
      await writeFile(tempPath, JSON.stringify(snapshot, null, 2), "utf8");
      await rename(tempPath, filePath);
    });
    queue = task.catch(() => {});
    await task;
  }

  return {
    driver: "file",
    async get<T>(key: string) {
      await queue;
      const snapshot = await load();
      return (snapshot[key] as T | undefined) ?? null;
    },
    async set<T>(key: string, value: T) {
      await mutate((snapshot) => {
        snapshot[key] = value;
      });
    },
    async delete(key: string) {
      await mutate((snapshot) => {
        delete snapshot[key];
      });
    },
    async list<T>(prefix: string) {
      await queue;
      const snapshot = await load();
      return Object.entries(snapshot)
        .filter(([key]) => key.startsWith(prefix))
        .map(([, value]) => value as T);
    },
  };
}
