#!/usr/bin/env node
// Stop: 커밋되지 않은 TS 변경이 있으면 타입 검사, 오류가 있으면 종료를 막고 오류를 되돌려 줌
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PROJECT_DIR, git, readHookInput } from "./lib.mjs";

const input = readHookInput();
// 이미 이 훅 때문에 이어서 작업 중이면 반복 차단 방지
if (input?.stop_hook_active) process.exit(0);

const tsc = join(PROJECT_DIR, "node_modules", ".bin", "tsc");
if (!existsSync(tsc) || !existsSync(join(PROJECT_DIR, "tsconfig.json"))) process.exit(0);

const changedTs = git(["status", "--porcelain"])
  .split("\n")
  .some((line) => /\.(ts|tsx)$/.test(line.trim()));
if (!changedTs) process.exit(0);

const result = spawnSync(tsc, ["--noEmit", "--pretty", "false"], {
  cwd: PROJECT_DIR,
  encoding: "utf8",
  timeout: 90_000,
});

if (result.status !== 0 && result.status !== null) {
  const errors = (result.stdout || "").split("\n").filter(Boolean).slice(0, 25).join("\n");
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: `타입 오류가 남아 있음. 고친 뒤 마무리:\n${errors}`,
    }),
  );
}

process.exit(0);
