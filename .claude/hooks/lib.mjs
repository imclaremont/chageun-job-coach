// 훅 공통 유틸
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// 동결 시각, 로컬 환경변수 FREEZE_AT(ISO 형식)으로 지정, 없으면 동결 없음
const freezeAt = Date.parse(process.env.FREEZE_AT ?? "");
export const FREEZE_AT = Number.isNaN(freezeAt) ? null : freezeAt;
export const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function readHookInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

export function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: PROJECT_DIR,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 8 * 1024 * 1024,
    }).trim();
  } catch {
    return "";
  }
}

// 종료 코드 2 + stderr = 도구 호출 차단, 사유는 에이전트에게 전달
export function block(hook, reason) {
  process.stderr.write(`[${hook}] ${reason}\n`);
  process.exit(2);
}

// .env 계열 중 예시 파일만 허용
export function isSecretEnvFile(filePath) {
  const name = String(filePath).split("/").pop() ?? "";
  return /^\.env(\..+)?$/.test(name) && name !== ".env.example";
}
