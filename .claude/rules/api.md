---
paths:
  - "src/app/api/**"
  - "src/shared/api/**"
  - "src/shared/error/**"
---

# API 라우트 규칙

`src/app/api/**/route.ts`는 HTTP 진입점이며 다른 프레임워크의 controller에 해당한다

## 책임

- 요청 수신과 zod 검증, `service` 호출, 결과를 `ApiResponse`로 감싸 반환
- HTTP 상태 코드와 헤더 결정
- 비즈니스 로직, 저장소 접근, 외부 API 호출을 직접 수행하지 않는다
- 허용: `guideService.approve(guideId)`
- 금지: route에서 `guideRepository.save(...)`나 OpenAI 클라이언트 직접 호출

## 응답 형식

모든 응답은 공통 응답 객체를 쓴다

```ts
type ApiResponse<T> = {
  success: boolean; // 성공·실패 여부만 표현
  code: string;
  message: string;
  data: T | null;
};
```

- 성공: `ok(data)` 또는 `ok(data, SuccessCode.CREATED)`
- 실패: `fail(errorCode)`
- HTTP 상태 코드는 응답 객체가 아니라 `NextResponse`의 status로 관리

## 에러 처리

1. service·도메인 로직에서 `throw new AppError(ErrorCode.GUIDE_NOT_FOUND)`
2. route는 `withApiHandler`로 감싸고 개별 try/catch를 두지 않는다
3. `withApiHandler`가 `AppError`는 해당 상태 코드로, zod 오류는 400으로, 그 외는 500으로 변환해 `fail(...)` 반환
4. 예상하지 못한 오류는 영어 로그로 남기고 사용자에게는 내부 정보를 노출하지 않는다

```ts
export const POST = withApiHandler(async (request) => {
  const body = CreateGuideRequest.parse(await request.json());
  const guide = await guideService.createFromManual(body);
  return ok(toGuideResponse(guide), SuccessCode.CREATED);
});
```

## 응답 데이터

- 저장 모델을 그대로 반환하지 않고 응답 DTO로 변환 (`toGuideResponse(guide)`)
- 원문 매뉴얼 전체나 내부 프롬프트처럼 화면에 필요 없는 값은 응답에서 제외
