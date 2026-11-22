# AGENTS.md

차근(chageun-job-coach) 저장소에서 일하는 모든 코딩 에이전트의 공통 지침
이 파일은 지도 역할만 하고, 세부 규칙은 아래 문서 색인에서 필요할 때 읽는다

## 프로젝트

발달장애·경계선지능 청년이 첫 직장에서 새 업무를 스스로 익히도록 돕는 AI 직무 코치

- 흐름: 코치(관리자·직무지도원)가 업무 매뉴얼 입력 → AI가 쉬운 단계 카드로 변환 → 사람이 검수·승인 → 근로자가 한 단계씩 수행, 막히면 AI가 쉬운 말로 코칭 → 코치가 진행 상황 확인
- 스택: Next.js(App Router)·TypeScript·Tailwind CSS / OpenAI API / Vercel
- 2026 대한민국 청년 CAREER FAIR AI 해커톤 출품작, **제출 마감 2026-11-23(월) 17:00 KST**

## 기본 응답

- 항상 한국어로 답변
- 명령어와 경로는 macOS Apple Silicon 기준

## 명령어

| 명령                   | 용도                                         |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | 개발 서버 (http://localhost:3000)            |
| `npm run check`        | lint + 타입 검사 + 테스트, 완료 선언 전 필수 |
| `npm run build`        | 프로덕션 빌드                                |
| `npm run format`       | Prettier 일괄 정리                           |
| `npm test -- <패턴>`   | 테스트 일부만 실행                           |

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

의존 방향은 `app → features → infra · shared · config` 한쪽으로만 흐른다
레이어별 책임과 금지 사항은 `docs/architecture.md` 참고

## 절대 규칙

어기면 대회 실격 또는 사용자 피해로 이어지는 항목이며, 일부는 훅과 린트가 기계적으로 막는다

1. **비밀 정보** — API 키·토큰을 코드·문서·로그·커밋에 넣지 않는다. `.env*` 파일은 읽지도 쓰지도 않는다 (`.env.example`만 예외)
2. **개인정보** — 실제 개인정보를 코드·시드 데이터·화면·프롬프트에 넣지 않는다. 전부 가상 데이터를 쓴다
3. **근거 있는 안내** — 근로자에게 보이는 업무 지시는 승인된 단계와 원문 매뉴얼에 근거해야 한다. 근거가 없으면 지어내지 않고 사람을 부르도록 안내한다
4. **사람 승인** — AI가 만든 단계는 코치가 승인하기 전에 근로자 화면에 노출하지 않는다
5. **마감 이후 동결** — 2026-11-23 17:00 이후 기능·알고리즘·프롬프트·데이터를 바꾸지 않는다. 접속·환경 복구만 `hotfix/*` 브랜치에서 사유와 함께 처리한다
6. **출처 기록** — 라이브러리·데이터·이미지·폰트·API를 추가하면 같은 PR에서 `docs/credits.md`에 적는다
7. **브랜치 보호** — `main`·`develop`에 직접 커밋하지 않는다

## 작업 방식

- 기존 코드 스타일 우선, 변경 범위 최소화, 불필요한 리팩터링 지양
- 새 작업 브랜치는 `develop` 기준 분기
- 순서: 이슈 → 브랜치 → 구현 → `npm run check` → 화면 변경이면 브라우저 확인 → PR → `develop` 머지
- 완료 기준: `npm run check` 통과, 화면 변경은 실제 화면에서 주요 흐름 확인, 의미 있는 작업은 `docs/ai-usage-log.md`에 한 줄 기록
- 요구가 불명확하면 추측으로 범위를 넓히지 말고 질문한다
- 훅이나 린트에 막히면 우회하지 말고 원인을 고친다

## 문서 색인

| 주제                              | 위치                                |
| --------------------------------- | ----------------------------------- |
| 제품 정의와 MVP 범위              | `docs/product.md`                   |
| 대회 일정·제출물·평가 기준·규칙   | `docs/contest.md`                   |
| 아키텍처와 레이어별 책임          | `docs/architecture.md`              |
| API 응답·에러 처리                | `.claude/rules/api.md`              |
| 기능 도메인 코드 작성             | `.claude/rules/features.md`         |
| AI 호출·프롬프트·에이전트         | `.claude/rules/ai.md`               |
| 근로자 화면의 쉬운 말·접근성      | `.claude/rules/ui-easy-read.md`     |
| 주석·로그·코드 스타일             | `.claude/rules/code-style.md`       |
| Git 브랜치·커밋·PR 규칙           | `.claude/rules/git.md`              |
| 외부 자원·출처·라이선스           | `docs/credits.md`                   |
| AI 활용 기록 (제출용 근거)        | `docs/ai-usage-log.md`              |
