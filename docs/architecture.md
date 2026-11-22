# 아키텍처

## 구조

```text
src/
 ├─ app/                    : 라우팅 계층 (Next.js App Router)
 │   ├─ **/page.tsx         : 화면 조립, 로직 금지
 │   └─ api/**/route.ts     : HTTP 진입점 (controller 역할)
 ├─ features/               : 기능별 도메인
 │   └─ {기능명}/
 │       ├─ components/     : 기능 전용 UI
 │       ├─ service.ts      : 비즈니스 로직 (서버 전용)
 │       ├─ repository.ts   : 저장소 접근 (서버 전용)
 │       ├─ schema.ts       : zod 스키마와 타입 (요청·응답 DTO, 저장 모델)
 │       ├─ agent/          : 에이전트 정의 (프롬프트·도구·실행 루프)
 │       └─ index.ts        : 다른 기능에 공개하는 진입점
 ├─ infra/                  : 외부 시스템 통신
 │   ├─ openai/             : OpenAI 호출
 │   └─ store/              : 저장소 드라이버
 ├─ shared/                 : 공통 인프라
 │   ├─ api/                : 공통 응답, 라우트 래퍼
 │   ├─ error/              : AppError, ErrorCode
 │   ├─ ui/                 : 공통 UI 컴포넌트
 │   └─ util/               : 공통 유틸 (logger 등)
 └─ config/                 : 환경변수 검증 등 설정
```

## 기능 도메인

| 기능       | 책임                                            |
| ---------- | ----------------------------------------------- |
| `guide`    | 매뉴얼 → 단계 변환, 검수·수정·승인, 가이드 조회 |
| `coaching` | 막힘 코칭 에이전트, 도움 요청, 사람 부르기      |
| `progress` | 근로자 수행 기록, 코치 대시보드 집계            |

## 의존 방향

```text
app  →  features  →  infra · shared · config
```

- `app`의 화면과 route는 `features`의 공개 진입점만 쓴다
- `features`끼리는 `@/features/{기능명}`(index.ts)으로만 참조한다
- `infra`는 `features`를 import하지 않는다
- `shared`·`config`는 위 계층을 import하지 않는다

## 레이어별 책임

| 레이어                    | 한다                                                        | 하지 않는다                              |
| ------------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| Route (`api/**/route.ts`) | 요청 검증, service 호출, `ApiResponse` 반환, 상태 코드 결정 | 비즈니스 로직, 저장소·외부 API 직접 호출 |
| Service                   | 도메인 규칙, 상태 변경, 예외 발생, repository·infra 조합    | `NextResponse` 생성, 요청·응답 객체 처리 |
| Repository                | 조회·저장·삭제                                              | 비즈니스 판단, 응답 DTO 변환             |
| Schema                    | 주고받는 데이터와 저장 모델의 모양 정의, DTO 변환 함수      | 비즈니스 로직, 저장 로직                 |
| Components                | 표시와 상호작용                                             | 서버 전용 모듈 import                    |
| Infra                     | 외부 시스템 호출, 타임아웃·오류 변환                        | 도메인 규칙                              |

## 응답과 에러

- 모든 API 응답은 `ApiResponse<T>` (`success`, `code`, `message`, `data`)
- HTTP 상태 코드는 `NextResponse`에서 관리하고, `success`는 성공·실패만 표현한다
- 도메인 예외는 `AppError`와 `ErrorCode`로 통일하고, route를 감싼 `withApiHandler`가 공통으로 변환한다

## 저장소

- 저장소 접근은 `infra/store`의 인터페이스 뒤에 둔다
- 개발 환경은 로컬 파일, 배포 환경은 호스팅 키-값 저장소를 쓰고 환경변수로 고른다

## 기계적으로 강제되는 것

| 규칙                                   | 강제 수단                               |
| -------------------------------------- | --------------------------------------- |
| UI에서 서버 전용 모듈 import 금지      | `server-only` 패키지 (빌드 실패)        |
| OpenAI SDK는 `infra/openai`에서만 사용 | ESLint `no-restricted-imports`          |
| 기능 내부 파일 직접 참조 금지          | ESLint `no-restricted-imports`          |
| 타입·린트·테스트 통과                  | `npm run check`, GitHub Actions         |
| 비밀 정보·AI 도구 표기·보호 브랜치     | `.claude/hooks`                         |
| 코드 포맷                              | Prettier (편집 후 훅, `npm run format`) |
