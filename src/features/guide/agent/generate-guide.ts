import type { z } from "zod";
import { findUncoveredClauses } from "../coverage";
import { checkSteps } from "../easy-read";
import { normalize } from "../text";
import { DraftGuideSchema, type DraftGuide, type DraftStep, type StepIssue } from "../schema";
import { buildDraftPrompt, buildRevisePrompt, GUIDE_SYSTEM_PROMPT } from "./prompts";

// 재작성 최대 횟수, 초안 1회 + 재작성 2회
export const MAX_REVISIONS = 2;

// 그림 기호 하나 (변형 선택자와 결합 기호 포함)
const EMOJI_PATTERN = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/u;
const DEFAULT_EMOJI = "▶️";

type ChatMessage = { role: "system" | "user"; content: string };

// AI 호출 함수, 테스트에서 대체 가능하도록 주입
export type StructuredGenerator = (options: {
  operation: string;
  schemaName: string;
  schema: z.ZodType<DraftGuide>;
  messages: ChatMessage[];
}) => Promise<DraftGuide>;

export type GuideGenerationResult = {
  title: string;
  steps: DraftStep[];
  issuesByStep: StepIssue[][];
  uncovered: string[];
  rejectReason: string | null;
  rounds: number;
  issuesFound: number;
  issuesRemaining: number;
};

type Checked = { draft: DraftGuide; issuesByStep: StepIssue[][]; uncovered: string[] };

const countProblems = ({ issuesByStep, uncovered }: Checked) =>
  issuesByStep.reduce((total, issues) => total + issues.length, 0) + uncovered.length;

// 생성 → 코드 점검 → 문제 있으면 재작성, 가장 문제가 적은 결과 채택
export async function generateGuide(
  input: { manual: string; titleHint?: string },
  generate: StructuredGenerator,
): Promise<GuideGenerationResult> {
  const { manual, titleHint } = input;
  const request = (operation: string, prompt: string) =>
    generate({
      operation,
      schemaName: "easy_guide",
      schema: DraftGuideSchema,
      messages: [
        { role: "system", content: GUIDE_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

  let draft = await request("guide draft", buildDraftPrompt(manual, titleHint));
  let rounds = 1;

  if (draft.steps.length === 0 || draft.rejectReason) {
    return {
      title: draft.title,
      steps: [],
      issuesByStep: [],
      uncovered: [],
      rejectReason: draft.rejectReason ?? "단계를 만들 내용을 찾지 못했습니다",
      rounds,
      issuesFound: 0,
      issuesRemaining: 0,
    };
  }

  const check = (target: DraftGuide): Checked => {
    // 코드로 바로잡을 수 있는 것은 AI에게 다시 묻지 않고 정리
    const steps = target.steps.map((step) => ({
      ...step,
      // 할 일을 그대로 되풀이한 설명 비움
      detail: normalize(step.detail) === normalize(step.action) ? "" : step.detail,
      // 그림 기호만 남기고, 없으면 기본 기호 사용
      emoji: step.emoji.match(EMOJI_PATTERN)?.[0] ?? DEFAULT_EMOJI,
    }));
    return {
      draft: { ...target, steps },
      issuesByStep: checkSteps(steps, manual),
      uncovered: findUncoveredClauses(manual, steps),
    };
  };

  let best = check(draft);
  const issuesFound = countProblems(best);

  while (countProblems(best) > 0 && rounds <= MAX_REVISIONS) {
    draft = await request(
      "guide revise",
      buildRevisePrompt(manual, best.draft.steps, best.issuesByStep, best.uncovered),
    );
    rounds += 1;
    if (draft.steps.length === 0) break;

    const revised = check(draft);
    if (countProblems(revised) < countProblems(best)) best = revised;
  }

  return {
    title: best.draft.title,
    steps: best.draft.steps,
    issuesByStep: best.issuesByStep,
    uncovered: best.uncovered,
    rejectReason: null,
    rounds,
    issuesFound,
    issuesRemaining: countProblems(best),
  };
}
