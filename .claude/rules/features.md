---
paths:
  - "src/features/**"
---

# 기능 도메인 규칙

`src/features/{기능명}/`은 기능 단위로 묶고 내부에서 책임을 나눈다

```text
features/{기능명}/
 ├─ components/    : 기능 전용 UI
 ├─ service.ts     : 비즈니스 로직 (서버 전용)
 ├─ repository.ts  : 저장소 접근 (서버 전용)
 ├─ schema.ts      : zod 스키마와 타입 (요청·응답 DTO, 저장 모델)
 ├─ agent/         : 에이전트 정의 (프롬프트·도구·실행 루프), AI 기능이 있을 때만
 └─ index.ts       : 다른 기능에 공개하는 진입점
```

## Service

- 도메인 규칙, 상태 변경, 검증, 예외 발생 담당
- 여러 repository와 `infra`를 조합
- 파일 첫 줄에 `import "server-only"`
- 허용: 승인 가능 상태 판단, `AppError` 던지기
- 금지: `NextResponse` 생성, 요청·응답 객체 직접 다루기

## Repository

- 저장소 접근 전용, 조회·저장·삭제만 수행
- 저장소 드라이버는 `@/infra/store`를 통해서만 사용
- 파일 첫 줄에 `import "server-only"`
- 허용: `findById`, `save`, `listByWorker`
- 금지: 승인 여부 판단 같은 비즈니스 규칙, 응답 DTO 변환

## Schema

- 외부와 주고받는 모양(요청·응답 DTO)과 저장 모델을 zod로 정의하고 타입은 `z.infer`로 얻는다
- 저장 모델 → 응답 DTO 변환은 `toXxxResponse()` 함수로 경계 유지
- 스키마에 비즈니스 로직과 저장 로직을 넣지 않는다

## Components

- 서버 전용 모듈(`service`, `repository`, `@/infra/*`)을 import하지 않는다. 데이터는 props나 API 호출로 받는다
- 상호작용이 필요한 컴포넌트만 `"use client"`

## 기능 간 의존

- 다른 기능은 `@/features/{기능명}`(index.ts)으로만 가져온다. 내부 파일 직접 import 금지
- 외부 시스템 연동은 기능 내부에 두지 않고 `src/infra`에 둔다
