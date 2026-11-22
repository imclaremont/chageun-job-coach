import type { z } from "zod";
import { checkStep } from "../easy-read";
import { DraftGuideSchema, type DraftGuide, type DraftStep, type StepIssue } from "../schema";
import { buildDraftPrompt, buildRevisePrompt, GUIDE_SYSTEM_PROMPT } from "./prompts";

// 재작성 최대 횟수, 초안 1회 + 재작성 2회
export const MAX_REVISIONS = 2;

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
  rejectReason: string | null;
  rounds: number;
  issuesFound: number;
  issuesRemaining: number;
};

const countIssues = (issuesByStep: StepIssue[][]) =>
  issuesByStep.reduce((total, issues) => total + issues.length, 0);

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
      rejectReason: draft.rejectReason ?? "단계를 만들 내용을 찾지 못했습니다",
      rounds,
      issuesFound: 0,
      issuesRemaining: 0,
    };
  }

  let issuesByStep = draft.steps.map((step) => checkStep(step, manual));
  const issuesFound = countIssues(issuesByStep);
  let best = { draft, issuesByStep };

  while (countIssues(best.issuesByStep) > 0 && rounds <= MAX_REVISIONS) {
    draft = await request(
      "guide revise",
      buildRevisePrompt(manual, best.draft.steps, best.issuesByStep),
    );
    rounds += 1;
    if (draft.steps.length === 0) break;

    issuesByStep = draft.steps.map((step) => checkStep(step, manual));
    if (countIssues(issuesByStep) < countIssues(best.issuesByStep)) {
      best = { draft, issuesByStep };
    }
  }

  return {
    title: best.draft.title,
    steps: best.draft.steps,
    issuesByStep: best.issuesByStep,
    rejectReason: null,
    rounds,
    issuesFound,
    issuesRemaining: countIssues(best.issuesByStep),
  };
}
