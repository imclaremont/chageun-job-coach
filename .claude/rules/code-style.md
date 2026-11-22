# 코드 스타일

## 공통

- TypeScript strict 유지, `any` 지양 (불가피하면 사유 주석)
- 외부에서 들어오는 값(요청 본문, AI 응답, 저장소에서 읽은 값)은 zod 검증 후 사용
- 절대 경로 import는 `@/` 별칭 사용
- 포맷은 Prettier 기준, 수동 정렬 금지

## 주석

- 핵심만 한국어로 작성
- 문장형 금지, 개조식
- 서술형 동사 대신 명사형 (`제어함` X, `제어` O / `노출하지 않음` X, `노출 금지` O)
- 끝에 온점 금지
- 자명한 코드 주석 생략
- 작업 과정, 변경 히스토리, 이전 상태 서술 금지, 현재 코드 기준 설명만

```ts
// 승인된 단계만 근로자 화면 노출
const visible = steps.filter((step) => step.status === "approved");
```

## 서버 로그

- 메시지는 영어, 한국어와 이모지 금지
- `console.log` 대신 `@/shared/util/logger` 사용
- 비밀 정보, 개인정보, 프롬프트 원문 전체 기록 금지

```ts
logger.info("guide generated", { guideId, stepCount });
```

## 문서

- 최종 결과 기준으로 핵심만 간결하게
- 작업 과정, 변경 히스토리, 수정 이유 등 현재 문맥에 불필요한 정보 제거
- AI 도구 서명·공동 작성자 표기 금지

## 화면 문구

- 근로자 화면: `.claude/rules/ui-easy-read.md`의 쉬운 말 기준
- 코치 화면: 일반 존댓말
