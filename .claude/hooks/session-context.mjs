#!/usr/bin/env node
// SessionStart: 현재 브랜치와 미커밋 변경을 세션 컨텍스트에 주입
import { FREEZE_AT, git } from "./lib.mjs";

const branch = git(["branch", "--show-current"]) || "(브랜치 없음)";
const dirty = git(["status", "--porcelain"]).split("\n").filter(Boolean).length;

const lines = [`현재 브랜치: ${branch}`, `커밋되지 않은 변경: ${dirty}개 파일`];

if (FREEZE_AT !== null) {
  const remainingMs = FREEZE_AT - Date.now();
  if (remainingMs > 0) {
    const hours = Math.floor(remainingMs / 3_600_000);
    const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
    lines.push(`동결 시각까지 ${hours}시간 ${minutes}분 남음`);
  } else {
    lines.push("동결 시각 지남: hotfix/*·docs/* 브랜치에서만 커밋 가능");
  }
}

if (branch === "main" || branch === "develop") {
  lines.push("보호 브랜치에 있음: 작업 전 develop에서 'type/#이슈번호-description' 브랜치 생성");
}

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: lines.join("\n") },
  }),
);
