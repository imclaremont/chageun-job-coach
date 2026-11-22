# Git 규칙

## 브랜치

- `main`: 제출·배포본, `develop`: 통합 브랜치
- 작업 브랜치 형식: `type/#이슈번호-description`
  - 예시: `feat/#5-manual-to-steps`, `chore/#1-agent-harness`
  - `type`은 `feat`, `fix`, `refactor`, `docs`, `chore`, `test` 중 하나
  - `description`은 영어 kebab-case
  - zsh에서 `#`이 주석으로 처리될 수 있으므로 브랜치명은 따옴표로 감싸기
- 작업 브랜치는 항상 `develop`에서 분기
- 마감(2026-11-23 17:00 KST) 이후에는 `hotfix/#이슈번호-description`만 사용하고, 접속·인증정보·실행 환경 복구 외의 변경 금지

## 커밋

- 형식: `type: 변경 내용` — 예시: `feat: 매뉴얼 단계 변환 서비스 추가`
- `type`은 브랜치와 같은 소문자 사용
- 한국어 핵심만, 명사형 표현, 문장 끝 온점 금지
- 하나의 커밋은 하나의 목적만 가진다 (Atomic Commit)
- AI 에이전트가 작성에 참여한 커밋은 `Co-Authored-By` 트레일러 유지 (AI 활용 투명성)

## 머지 전략

- 작업 브랜치 → `develop`: Merge commit (작업 PR 단위 히스토리 보존)
- `develop` → `main`: Squash merge (릴리즈 단위 1커밋)
- 릴리즈 후 `main`에 `v{major}.{minor}.{patch}` 태그 — 제출 시점 버전 식별용

## 이슈·PR

- 제목 형식: `[Type] 한국어 핵심` — 예시: `[Feat] 매뉴얼 단계 변환 에이전트`
- `Type`은 `Feat`, `Fix`, `Refactor`, `Docs`, `Chore`, `Test`, `Release` 중 하나
- 릴리즈 이슈·PR·Squash 커밋 제목: `[Release] v{major}.{minor}.{patch} 운영 배포`
- 작업 브랜치 → `develop` Merge commit 메시지: `[Type] 한국어 핵심 (#PR번호)`
- 이슈 본문은 `.github/ISSUE_TEMPLATE.md`, PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 기준
- 연결 이슈가 있는 PR은 `Closes #이슈번호` 포함

절차와 실제 명령은 `/ship` 스킬 참고
