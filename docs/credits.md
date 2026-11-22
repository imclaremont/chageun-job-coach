# 외부 자원·출처

README Credits / Licenses 섹션의 원본
라이브러리·데이터·이미지·폰트·API·AI 도구 추가 시 같은 PR에서 기재

## 오픈소스·템플릿

| 명칭               | 버전   | 라이선스   | 링크                                        | 사용 위치                  |
| ------------------ | ------ | ---------- | ------------------------------------------- | -------------------------- |
| Next.js            | 16.4.6 | MIT        | https://github.com/vercel/next.js           | 웹 프레임워크, 초기 템플릿 |
| React · React DOM  | 19.3.0 | MIT        | https://github.com/facebook/react           | UI                         |
| Tailwind CSS       | 4.3.3  | MIT        | https://github.com/tailwindlabs/tailwindcss | 스타일                     |
| OpenAI Node SDK    | 6.49.0 | Apache-2.0 | https://github.com/openai/openai-node       | OpenAI API 호출            |
| Zod                | 4.6.7  | MIT        | https://github.com/colinhacks/zod           | 입력·AI 출력 검증          |
| server-only        | 0.0.1  | MIT        | https://www.npmjs.com/package/server-only   | 서버 전용 모듈 표시        |
| Lucide React       | 1.77.0 | ISC        | https://github.com/lucide-icons/lucide      | 화면 아이콘                |
| TypeScript         | 5.9.3  | Apache-2.0 | https://github.com/microsoft/TypeScript     | 타입 검사 (개발)           |
| ESLint             | 9.39.5 | MIT        | https://github.com/eslint/eslint            | 린트 (개발)                |
| eslint-config-next | 16.4.6 | MIT        | https://github.com/vercel/next.js           | 린트 규칙 (개발)           |
| Prettier           | 3.10.1 | MIT        | https://github.com/prettier/prettier        | 코드 포맷 (개발)           |
| Vitest             | 3.2.7  | MIT        | https://github.com/vitest-dev/vitest        | 테스트 (개발)              |

## 외부 데이터·API

| 명칭 | 제공처 | 라이선스·이용 조건 | 기준일 | 사용 위치 |
| ---- | ------ | ------------------ | ------ | --------- |
|      |        |                    |        |           |

## AI 모델·개발 도구

| 명칭                                     | 구분     | 제공처    | 사용 위치                                   |
| ---------------------------------------- | -------- | --------- | ------------------------------------------- |
| Claude Code                              | 개발용   | Anthropic | 저장소 구성, 코드·문서 초안 작성, 검증 보조 |
| Azure OpenAI Service (gpt-4.1-mini 배포) | 서비스용 | Microsoft | 매뉴얼 단계 변환, 막힘 코칭                 |

## 이미지·음원·폰트

| 자료명        | 제작자·출처 | 라이선스 | 사용 위치          |
| ------------- | ----------- | -------- | ------------------ |
| 서비스 아이콘 | 직접 제작   | -        | `src/app/icon.svg` |

- 글꼴: 기기 설치 글꼴 사용, 외부 글꼴 파일 없음

## 직접 만든 데이터

| 명칭             | 내용                                             | 위치                               |
| ---------------- | ------------------------------------------------ | ---------------------------------- |
| 기본 가이드      | 가상 매장의 아이스 아메리카노 매뉴얼과 단계 13개 | `src/features/guide/sample.ts`     |
| 예시 매뉴얼      | 가상 매장의 업무 매뉴얼 2종                      | `src/features/guide/examples.ts`   |
| 어려운 낱말 목록 | 어려운 낱말과 쉬운 표현 32쌍                     | `src/features/guide/easy-read.ts`  |
| 가상 근로자      | 시연용 가상 이름 3개                             | `src/features/progress/workers.ts` |
