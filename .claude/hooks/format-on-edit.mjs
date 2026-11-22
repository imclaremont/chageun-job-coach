#!/usr/bin/env node
// PostToolUse(Edit|Write): 수정한 파일을 Prettier로 정리, 실패해도 작업은 막지 않음
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { PROJECT_DIR, readHookInput } from "./lib.mjs";

const input = readHookInput();
const filePath = input?.tool_response?.filePath ?? input?.tool_input?.file_path ?? "";
const prettier = join(PROJECT_DIR, "node_modules", ".bin", "prettier");

const rel = filePath ? relative(PROJECT_DIR, filePath) : "";
const inProject = rel && !rel.startsWith("..") && !/(^|\/)(node_modules|\.next|\.git)\//.test(rel);
const formattable = /\.(ts|tsx|js|jsx|mjs|cjs|json|css|md|yml|yaml)$/.test(rel);

if (inProject && formattable && existsSync(prettier) && existsSync(filePath)) {
  spawnSync(prettier, ["--write", "--log-level", "silent", filePath], { cwd: PROJECT_DIR, timeout: 15_000 });
}

process.exit(0);
