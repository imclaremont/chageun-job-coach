# CLAUDE.md

@AGENTS.md

## Claude Code 전용

공통 지침의 원본은 위에서 불러온 `AGENTS.md`

- **표기 금지** — 커밋·PR·이슈에 `Co-Authored-By: Claude`, `🤖 Generated with Claude Code` 등 Claude 서명 추가 금지 (`.claude/settings.json`의 `attribution`과 훅으로 강제)
- **경로별 규칙** — `.claude/rules/`의 규칙은 해당 경로 파일 작업 시 자동 로드, `git.md`·`code-style.md`는 항상 로드
- **스킬** — 여러 단계 절차에 사용
  - `/ship`: 이슈 → 브랜치 → 커밋 → PR → `develop` 머지, 릴리즈
- **훅** — `.claude/settings.json`의 훅이 기계적으로 처리하는 항목
  - `.env*` 접근 차단, 비밀 정보 포함 커밋 차단
  - AI 도구 서명·공동 작성자 표기 포함 커밋·PR 차단
  - `main`·`develop` 직접 커밋과 강제 푸시 차단
  - 동결 시각(로컬 환경변수 `FREEZE_AT`)을 설정하면 그 이후 `hotfix/*`·`docs/*` 외 브랜치 커밋 차단
  - 파일 수정 후 Prettier 자동 정리
  - 세션 시작 시 현재 브랜치와 미커밋 변경 안내
  - 종료 전 타입 검사
- **개인 설정** — `CLAUDE.local.md`, `.claude/settings.local.json`은 git 제외
