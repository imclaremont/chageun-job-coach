#!/usr/bin/env bash
# 훅 자체 점검: 훅 입력을 흉내 내어 차단(2)·허용(0) 여부 확인
# 사용: bash .claude/hooks/selftest.sh
set -u
cd "$(dirname "$0")/../.." || exit 1
export CLAUDE_PROJECT_DIR="$PWD"
fail=0

t() { # 기대 종료 코드, 훅 이름, 입력 JSON
  local expect="$1" hook="$2" json="$3" out code
  out=$(printf '%s' "$json" | node ".claude/hooks/$hook.mjs" 2>&1)
  code=$?
  if [ "$code" = "$expect" ]; then
    printf 'PASS'
  else
    printf 'FAIL(got %s)' "$code"
    fail=1
  fi
  printf ' [%s] %s\n' "$hook" "$(printf '%s' "$json" | cut -c1-110)"
}
bash_input() { printf '{"tool_name":"Bash","tool_input":{"command":"%s"}}' "$1"; }
file_input() { printf '{"tool_name":"Read","tool_input":{"file_path":"%s"}}' "$1"; }

branch=$(git branch --show-current)
echo "현재 브랜치: $branch"

echo "--- guard-bash"
t 0 guard-bash "$(bash_input 'ls -la')"
t 2 guard-bash "$(bash_input 'cat .env.local')"
t 2 guard-bash "$(bash_input 'grep KEY .env')"
t 0 guard-bash "$(bash_input 'cat .env.example')"
t 0 guard-bash "$(bash_input 'cp .env.example .env.local')"
t 2 guard-bash "$(bash_input 'git push --force origin feat/x')"
t 2 guard-bash "$(bash_input 'git push -f')"
t 2 guard-bash "$(bash_input 'git push origin main')"
t 2 guard-bash "$(bash_input 'git push origin HEAD:develop')"
t 0 guard-bash "$(bash_input 'git push -u origin feat/#9-sample')"
t 0 guard-bash "$(bash_input 'git push origin v1.0.0')"
t 0 guard-bash "$(bash_input 'FORCE_PUSH_APPROVED=1 git push --force origin main develop')"
t 2 guard-bash "$(bash_input 'git commit -m sample -m \"Co-Authored-By: Claude <noreply@anthropic.com>\"')"
t 2 guard-bash "$(bash_input 'gh pr create --title sample --body \"Generated with [Claude Code](https://claude.com/claude-code)\"')"
t 0 guard-bash "$(bash_input 'gh pr create --base develop --title sample --body ok')"

case "$branch" in
  main | develop) t 2 guard-bash "$(bash_input 'git commit -m sample')" ;;
  *) echo "SKIP 보호 브랜치 커밋 차단 (보호 브랜치에서 실행해야 확인 가능)" ;;
esac

# 가짜 키가 담긴 미추적 파일로 비밀 정보 커밋 차단 확인
probe="tmp-hook-selftest-secret.txt"
printf 'OPENAI_API_KEY=sk-%s\n' "FAKEfakeFAKEfakeFAKEfake1234567890" >"$probe"
t 2 guard-bash "$(bash_input 'git add -A && git commit -m sample')"
rm -f "$probe"

echo "--- protect-secrets"
t 2 protect-secrets "$(file_input "$PWD/.env.local")"
t 2 protect-secrets "$(file_input "$PWD/.env")"
t 0 protect-secrets "$(file_input "$PWD/.env.example")"
t 0 protect-secrets "$(file_input "$PWD/src/app/page.tsx")"

echo "--- 차단 없이 끝나야 하는 훅"
t 0 format-on-edit "$(file_input "$PWD/README.md")"
t 0 typecheck-on-stop '{"stop_hook_active":true}'

echo "--- session-context 출력"
echo '{}' | node .claude/hooks/session-context.mjs
echo

if [ "$fail" = 0 ]; then echo "모든 점검 통과"; else echo "실패한 점검 있음"; fi
exit "$fail"
