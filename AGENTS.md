# AGENTS.md

차근(chageun-job-coach) 저장소의 모든 코딩 에이전트 공통 지침
세부 규칙은 아래 문서 색인에서 필요할 때 참조

## 프로젝트

발달장애·경계선지능 청년의 첫 직장 적응을 돕는 AI 직무 코치

- 흐름: 코치의 업무 매뉴얼 입력 → AI의 쉬운 단계 카드 변환 → 코치 검수·승인 → 근로자의 단계별 수행과 막힘 코칭 → 코치의 진행 확인
- 스택: Next.js(App Router)·TypeScript·Tailwind CSS / OpenAI API / Vercel

## 언어와 환경

- 답변, 주석, 커밋 메시지, 문서 모두 한국어
- 서버 로그 메시지만 영어
- 사용자 운영체제 macOS Apple Silicon, 명령어와 경로는 macOS 기준

## 글쓰기 규칙

### 주석과 커밋 메시지

- 핵심만 담아 가독성 좋게 작성
- 문장형 금지, 개조식
- 서술형 동사 대신 명사형 (예: `제어함` X, `제어` O)
- 끝에 온점 금지
- 자명한 코드 주석 생략

### 주석과 문서

- 최종 결과 기준으로 핵심만 간결하게
- 작업 과정, 변경 히스토리, 이전 상태, 수정 이유 등 현재 문맥에 불필요한 정보 제거
- 가독성과 정보 전달 최우선

### AI 도구 표기 금지

- `🤖 Generated with Claude Code`, `Co-Authored-By: Claude` 등 AI 도구 서명·공동 작성자 표기는 커밋, PR, 이슈, 문서, 코드 어디에도 사용 금지
- 커밋 작성자는 저장소 사용자 본인만

## 명령어

| 명령                 | 용도                                         |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | 개발 서버 (http://localhost:3000)            |
| `npm run check`      | lint + 타입 검사 + 테스트, 완료 선언 전 필수 |
| `npm run build`      | 프로덕션 빌드                                |
| `npm run format`     | Prettier 일괄 정리                           |
| `npm test -- <패턴>` | 테스트 일부만 실행                           |

## 구조

```text
src/
 ├─ app/          : 라우팅 계층, 화면 조립과 HTTP 진입점(api/**/route.ts)
 ├─ features/     : 기능별 도메인 (guide · coaching · progress)
 │   └─ {기능명}/ : components · service · repository · schema · agent
 ├─ infra/        : OpenAI, 저장소, 공공 API 등 외부 시스템 통신
 ├─ shared/       : 공통 응답 · 에러 · UI · 유틸
 └─ config/       : 환경변수 검증 등 설정
```

- 의존 방향: `app → features → infra · shared · config` 단방향
- 레이어별 책임과 금지 사항: `docs/architecture.md`

## 절대 규칙

위반 시 사용자 피해나 보안 사고로 이어지는 항목, 일부는 훅과 린트로 강제

1. **비밀 정보** — API 키·토큰의 코드·문서·로그·커밋 포함 금지, `.env*` 파일 읽기·직접 편집 금지 (`.env.example`만 예외), 사용자가 준 값은 `bash scripts/set-env.sh 이름=값`으로만 기록하고 재출력 금지
2. **개인정보** — 실제 개인정보의 코드·시드 데이터·화면·프롬프트 사용 금지, 전부 가상 데이터
3. **근거 있는 안내** — 근로자에게 보이는 업무 지시는 승인된 단계와 원문 매뉴얼 근거 필수, 근거 없으면 생성 대신 사람 호출 안내
4. **사람 승인** — AI가 만든 단계는 코치 승인 전 근로자 화면 노출 금지
5. **출처 기록** — 라이브러리·데이터·이미지·폰트·API 추가 시 같은 PR에서 `docs/credits.md` 기재
6. **브랜치 보호** — `main`·`develop` 직접 커밋 금지

## 작업 방식

- 기존 코드 스타일 우선, 변경 범위 최소화, 불필요한 리팩터링 지양
- 새 작업 브랜치는 `develop` 기준 분기
- 순서: 이슈 → 브랜치 → 구현 → `npm run check` → 화면 변경 시 브라우저 확인 → PR → `develop` 머지
- 완료 기준: `npm run check` 통과, 화면 변경은 실제 화면에서 주요 흐름 확인
- 요구가 불명확하면 추측으로 범위 확대 금지, 질문 우선
- 훅·린트 차단 시 우회 금지, 원인 해결
- iCloud 동기화 폴더에서는 `node_modules`·`.next`를 `*.nosync` 폴더의 링크로 유지, `npm ci` 후 `bash scripts/icloud-nosync.sh` 실행

## 문서 색인

| 주제                            | 위치                            |
| ------------------------------- | ------------------------------- |
| 제품 정의와 MVP 범위            | `docs/product.md`               |
| 아키텍처와 레이어별 책임        | `docs/architecture.md`          |
| API 응답·에러 처리              | `.claude/rules/api.md`          |
| 기능 도메인 코드 작성           | `.claude/rules/features.md`     |
| AI 호출·프롬프트·에이전트       | `.claude/rules/ai.md`           |
| 근로자 화면의 쉬운 말·접근성    | `.claude/rules/ui-easy-read.md` |
| 주석·로그·코드 스타일           | `.claude/rules/code-style.md`   |
| Git 브랜치·커밋·PR 규칙         | `.claude/rules/git.md`          |
| 외부 자원·출처·라이선스         | `docs/credits.md`               |

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
