#!/usr/bin/env node
// PreToolUse(Bash) 가드: AI 도구 표기, 비밀 파일 열람, 강제 푸시, 보호 브랜치, 비밀 정보 커밋, 마감 이후 동결
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { FREEZE_AT, PROJECT_DIR, block, git, isSecretEnvFile, readHookInput } from "./lib.mjs";

const HOOK = "guard-bash";
const PROTECTED = new Set(["main", "develop"]);
const SECRET_PATTERNS = [
  { name: "OpenAI API 키", regex: /sk-[A-Za-z0-9_-]{20,}/ },
  {
    name: "GitHub 토큰",
    regex: /\b(ghp|gho|ghs|ghu)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
  },
  { name: "AWS 액세스 키", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Google API 키", regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: "개인 키", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

// AI 도구 서명·공동 작성자 표기
const AI_SIGNATURE =
  /Co-Authored-By:[^\n]*(Claude|Anthropic|Copilot|Codex|ChatGPT|Cursor)|Generated with \[?Claude Code|🤖 Generated/i;

const command = readHookInput()?.tool_input?.command ?? "";
if (!command) process.exit(0);

// 0. 커밋·PR·이슈의 AI 도구 표기 차단
const writesMessage = /\bgit\s+commit\b|\bgh\s+(pr|issue)\s+(create|edit|comment|merge)\b/.test(
  command,
);
if (writesMessage) {
  const bodyFiles = [
    ...command.matchAll(/(?:--body-file|-F|--file)\s+(?:"([^"]+)"|'([^']+)'|(\S+))/g),
  ]
    .map((match) => match[1] ?? match[2] ?? match[3])
    .filter((path) => path && !path.includes("$") && existsSync(path));
  const texts = [command, ...bodyFiles.map((path) => readFileSync(path, "utf8"))];
  if (texts.some((text) => AI_SIGNATURE.test(text))) {
    block(
      HOOK,
      "AI 도구 서명·공동 작성자 표기 금지. 해당 줄을 지우고 다시 실행 (작성자는 사용자 본인만)",
    );
  }
}

// 1. .env 계열 파일 내용 출력 차단
const READERS = "cat|head|tail|less|more|bat|grep|rg|awk|sed|nl|strings|xxd|od|source|open|code";
const readerMatch = command.match(
  new RegExp(`\\b(?:${READERS})\\b[^;&|]*?(\\.env(?:\\.[\\w-]+)*)`, "g"),
);
if (readerMatch?.some((part) => isSecretEnvFile(part.match(/\.env(?:\.[\w-]+)*/g)?.pop() ?? ""))) {
  block(
    HOOK,
    ".env 계열 파일은 열람 금지 (.env.example만 허용). 필요한 값은 사용자에게 직접 설정을 요청",
  );
}

const isPush = /\bgit\s+push\b/.test(command);
const isCommit = /\bgit\s+commit\b/.test(command);
if (!isPush && !isCommit) process.exit(0);

const branch = git(["branch", "--show-current"]);
// 같은 명령 안에서 브랜치를 바꾸면 실행 시점 브랜치를 알 수 없으므로 브랜치 검사 생략
const switchesBranch = /\bgit\s+(checkout|switch)\b/.test(command);

if (isPush) {
  const pushPart = command.match(/\bgit\s+push\b[^;&|]*/)?.[0] ?? "";
  // 2. 강제 푸시 차단, 사용자 승인 시에만 FORCE_PUSH_APPROVED=1 접두로 허용
  const forceApproved = /\bFORCE_PUSH_APPROVED=1\b/.test(command);
  if (/\s(--force(?!-with-lease)\b|-f\b)/.test(pushPart) && !forceApproved) {
    block(
      HOOK,
      "강제 푸시 금지. 히스토리 수정이 필요하면 사용자 승인 후 FORCE_PUSH_APPROVED=1 접두로 실행",
    );
  }
  // 3. 보호 브랜치 직접 푸시 차단
  const args = pushPart
    .split(/\s+/)
    .slice(2)
    .filter((arg) => !arg.startsWith("-"));
  const refspecs = args.slice(1).map((ref) => ref.replace(/^['"]|['"]$/g, ""));
  const targets =
    refspecs.length > 0
      ? refspecs.map((ref) => ref.split(":").pop())
      : switchesBranch
        ? []
        : [branch];
  if (targets.some((target) => PROTECTED.has(target)) && !forceApproved) {
    block(HOOK, "main·develop 직접 푸시 금지. 작업 브랜치를 푸시하고 PR로 머지");
  }
}

if (isCommit) {
  if (!switchesBranch) {
    // 4. 보호 브랜치 직접 커밋 차단
    if (PROTECTED.has(branch)) {
      block(
        HOOK,
        `${branch} 직접 커밋 금지. develop에서 'type/#이슈번호-description' 브랜치를 만들어 작업`,
      );
    }
    // 5. 마감 이후 동결
    if (Date.now() > FREEZE_AT && !/^(hotfix|docs)\//.test(branch)) {
      block(
        HOOK,
        "제출 마감(2026-11-23 17:00 KST) 이후: 기능·알고리즘·프롬프트·데이터 변경 금지. 접속·환경 복구는 hotfix/* 브랜치에서 사유와 함께 처리",
      );
    }
  }

  // 6. 비밀 정보가 섞인 커밋 차단
  const stagesInCommand =
    /\bgit\s+add\b/.test(command) ||
    /\bgit\s+commit\b[^;&|]*\s(-[a-zA-Z]*a[a-zA-Z]*|--all)\b/.test(command);
  const names = new Set(git(["diff", "--cached", "--name-only"]).split("\n").filter(Boolean));
  let diff = git(["diff", "--cached", "-U0"]);
  if (stagesInCommand) {
    git(["diff", "HEAD", "--name-only"])
      .split("\n")
      .filter(Boolean)
      .forEach((name) => names.add(name));
    diff += "\n" + git(["diff", "HEAD", "-U0"]);
    for (const name of git(["ls-files", "--others", "--exclude-standard"])
      .split("\n")
      .filter(Boolean)) {
      names.add(name);
      const path = join(PROJECT_DIR, name);
      if (existsSync(path) && statSync(path).isFile() && statSync(path).size < 300_000) {
        diff +=
          "\n" +
          readFileSync(path, "utf8")
            .split("\n")
            .map((line) => "+" + line)
            .join("\n");
      }
    }
  }

  const envFile = [...names].find((name) => isSecretEnvFile(name));
  if (envFile) block(HOOK, `${envFile} 커밋 금지. 환경변수 파일은 .env.example만 커밋`);

  const added = diff.split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++"));
  for (const { name, regex } of SECRET_PATTERNS) {
    if (added.some((line) => regex.test(line))) {
      block(
        HOOK,
        `${name}로 보이는 값이 변경분에 포함됨. 해당 값을 제거하고 환경변수로 옮긴 뒤 다시 커밋`,
      );
    }
  }
}

process.exit(0);
