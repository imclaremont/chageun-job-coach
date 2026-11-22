# 코드 스타일

## 공통

- TypeScript strict 유지, `any` 지양 (불가피하면 사유 주석)
- 외부에서 들어오는 값(요청 본문, AI 응답, 저장소에서 읽은 값)은 zod로 검증한 뒤 사용
- 절대 경로 import는 `@/` 별칭 사용
- 포맷은 Prettier가 결정하므로 수동 정렬 금지

## 주석

- 핵심만 한국어로 작성
- 문장형 설명보다 명사형 표현, 서술형 동사 지양
- 주석 끝 온점 금지
- 자명한 코드 주석 생략

```ts
// 승인된 단계만 근로자 화면 노출
const visible = steps.filter((step) => step.status === "approved");
```

## 서버 로그

- 서버 로그 메시지는 영어로 작성, 한국어와 이모지 금지
- `console.log` 대신 `@/shared/util/logger` 사용
- 비밀 정보와 개인정보, 프롬프트 원문 전체를 로그에 남기지 않는다
- 코드 주석, 커밋 메시지, PR·이슈 본문, 사용자 답변은 한국어 규칙 유지

```ts
logger.info("guide generated", { guideId, stepCount });
```

## 화면 문구

- 근로자 화면 문구는 `.claude/rules/ui-easy-read.md`의 쉬운 말 기준을 따른다
- 코치 화면 문구는 일반 존댓말
