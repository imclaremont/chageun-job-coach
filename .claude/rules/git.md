# Git 규칙

## 브랜치

- `main`: 제출·배포본, `develop`: 통합 브랜치
- 작업 브랜치 형식: `type/#이슈번호-description`
  - 예시: `feat/#5-manual-to-steps`, `chore/#1-agent-harness`
  - `type`: `feat`, `fix`, `refactor`, `docs`, `chore`, `test` 중 하나
  - `description`: 영어 kebab-case
  - zsh의 `#` 주석 처리 방지를 위해 브랜치명은 따옴표로 감싸기
- 작업 브랜치는 항상 `develop`에서 분기
- 마감(2026-11-23 17:00 KST) 이후: `hotfix/#이슈번호-description`만 사용, 접속·인증정보·실행 환경 복구 외 변경 금지

## 커밋

- 형식: `type: 변경 내용` — 예시: `feat: 매뉴얼 단계 변환 서비스 추가`
- `type`은 브랜치와 같은 소문자
- 한국어 핵심만, 개조식 명사형, 끝에 온점 금지
- 하나의 커밋은 하나의 목적 (Atomic Commit)
- 작성자는 저장소 사용자 본인만, `Co-Authored-By` 등 AI 도구 표기 금지

## 머지 전략

- 작업 브랜치 → `develop`: Merge commit (작업 PR 단위 히스토리 보존)
- `develop` → `main`: Squash merge (릴리즈 단위 1커밋)
- 릴리즈 후 `main`에 `v{major}.{minor}.{patch}` 태그 (제출 시점 버전 식별용)
- 강제 푸시 금지, 히스토리 수정이 필요하면 사용자 승인 후 `FORCE_PUSH_APPROVED=1` 접두로 실행

## 이슈·PR

- 제목 형식: `[Type] 한국어 핵심` — 예시: `[Feat] 매뉴얼 단계 변환 에이전트`
- `Type`: `Feat`, `Fix`, `Refactor`, `Docs`, `Chore`, `Test`, `Release` 중 하나
- 릴리즈 이슈·PR·Squash 커밋 제목: `[Release] v{major}.{minor}.{patch} 운영 배포`
- 작업 브랜치 → `develop` Merge commit 메시지: `[Type] 한국어 핵심 (#PR번호)`
- 이슈 본문은 `.github/ISSUE_TEMPLATE.md`, PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 기준
- 연결 이슈가 있는 PR은 `Closes #이슈번호` 포함
- `develop` 머지는 이슈 자동 종료 미지원, 머지 후 `gh issue close`로 직접 종료
- 본문에 `🤖 Generated with Claude Code` 등 AI 도구 서명 금지

절차와 실제 명령은 `/ship` 스킬 참고
