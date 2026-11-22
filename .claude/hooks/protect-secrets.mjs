#!/usr/bin/env node
// PreToolUse(Read|Edit|Write) 가드: .env 계열 파일 접근 차단
import { block, isSecretEnvFile, readHookInput } from "./lib.mjs";

const input = readHookInput();
const filePath = input?.tool_input?.file_path ?? input?.tool_input?.notebook_path ?? "";

if (filePath && isSecretEnvFile(filePath)) {
  block(
    "protect-secrets",
    ".env 계열 파일은 읽기·쓰기 금지 (.env.example만 허용). 키 설정은 사용자가 직접 하도록 안내",
  );
}

process.exit(0);
