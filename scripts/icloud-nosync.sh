#!/usr/bin/env bash
# iCloud 동기화 폴더에서 작업할 때 node_modules·.next를 동기화 대상에서 제외
# 실제 폴더를 *.nosync로 옮기고 원래 이름은 링크로 유지, npm ci 후 다시 실행
# 사용: bash scripts/icloud-nosync.sh
set -eu
cd "$(dirname "$0")/.."

for name in node_modules .next; do
  target="$name.nosync"
  if [ -L "$name" ]; then
    echo "$name: 이미 링크"
    continue
  fi
  if [ -d "$name" ]; then
    rm -rf "$target"
    mv "$name" "$target"
  else
    mkdir -p "$target"
  fi
  ln -s "$target" "$name"
  echo "$name → $target"
done
