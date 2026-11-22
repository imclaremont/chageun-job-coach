import "server-only";
import type { KeyValueStore } from "./types";

type RedisReply<T> = { result?: T; error?: string };

// Upstash Redis REST API 저장소, 배포 환경용
export function createRedisStore(url: string, token: string): KeyValueStore {
  async function command<T>(...args: string[]): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    const reply = (await response.json()) as RedisReply<T>;
    if (!response.ok || reply.error) {
      throw new Error(`redis command failed: ${args[0]} ${reply.error ?? response.status}`);
    }
    return reply.result as T;
  }

  return {
    driver: "redis",
    async get<T>(key: string) {
      const raw = await command<string | null>("GET", key);
      return raw === null ? null : (JSON.parse(raw) as T);
    },
    async set<T>(key: string, value: T) {
      await command("SET", key, JSON.stringify(value));
    },
    async delete(key: string) {
      await command("DEL", key);
    },
    async list<T>(prefix: string) {
      const keys = await command<string[]>("KEYS", `${prefix}*`);
      if (keys.length === 0) return [];
      const values = await command<(string | null)[]>("MGET", ...keys);
      return values.filter((raw): raw is string => raw !== null).map((raw) => JSON.parse(raw) as T);
    },
  };
}
