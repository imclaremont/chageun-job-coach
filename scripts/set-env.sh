#!/usr/bin/env bash
# .env.local에 환경변수 기록, 값은 화면에 출력하지 않음
# 같은 이름이 있으면 교체, 파일은 소유자만 읽기·쓰기
# 사용: bash scripts/set-env.sh 이름=값 [이름=값 ...]
set -eu
cd "$(dirname "$0")/.."

file=".env.local"
touch "$file"
chmod 600 "$file"

for pair in "$@"; do
  name="${pair%%=*}"
  value="${pair#*=}"
  case "$name" in
    "" | *[!A-Za-z0-9_]*)
      echo "잘못된 이름: $name" >&2
      exit 1
      ;;
  esac
  if [ "$name" = "$pair" ] || [ -z "$value" ]; then
    echo "값이 비어 있음: $name" >&2
    exit 1
  fi

  tmp="$(mktemp)"
  grep -v "^${name}=" "$file" >"$tmp" || true
  printf '%s=%s\n' "$name" "$value" >>"$tmp"
  mv "$tmp" "$file"
  chmod 600 "$file"
  echo "설정 완료: $name"
done
