# CLAUDE.md

@AGENTS.md

## Claude Code 전용

공통 지침은 위에서 불러온 `AGENTS.md`가 원본이며, 여기에는 Claude Code에만 해당하는 내용만 둔다

- **경로별 규칙** — `.claude/rules/`의 규칙은 해당 경로 파일을 다룰 때 자동으로 로드된다. `git.md`·`code-style.md`는 항상 로드된다
- **스킬** — 여러 단계 절차는 스킬을 쓴다
  - `/ship`: 이슈 → 브랜치 → 커밋 → PR → `develop` 머지, 릴리즈
  - `/submission-check`: 대회 제출 전 점검
- **훅** — `.claude/settings.json`의 훅이 아래를 기계적으로 처리한다
  - `.env*` 접근 차단, 비밀 정보가 섞인 커밋 차단
  - `main`·`develop` 직접 커밋과 강제 푸시 차단
  - 마감 이후 `hotfix/*`·`docs/*` 외 브랜치의 커밋 차단
  - 파일 수정 후 Prettier 자동 정리
  - 세션 시작 시 현재 브랜치와 마감까지 남은 시간 안내
- **개인 설정** — `CLAUDE.local.md`와 `.claude/settings.local.json`은 git에서 제외된다
