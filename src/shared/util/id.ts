import { randomUUID } from "node:crypto";

// 접두어가 붙은 짧은 식별자, 예: g_3f9a1c2b7d
export function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 10)}`;
}
