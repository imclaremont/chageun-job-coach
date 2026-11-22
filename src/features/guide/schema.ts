import { z } from "zod";

// 자동 점검 결과
export const StepIssueCode = z.enum([
  "NO_SOURCE",
  "LONG_SENTENCE",
  "MULTI_ACTION",
  "HARD_WORD",
  "MISSING_CAUTION",
  "EMPTY_FIELD",
  "NOT_EASY_STYLE",
  "REPEATED_TEXT",
]);
export const StepField = z.enum(["action", "detail", "caution", "doneCheck", "sourceQuote"]);
export const StepIssueSchema = z.object({
  code: StepIssueCode,
  field: StepField,
  message: z.string(),
});

// AI가 출력하는 단계 초안
export const DraftStepSchema = z.object({
  // 지금 할 일, 쉬운 말 한 문장
  action: z.string(),
  // 하는 방법
  detail: z.string(),
  // 그림 기호
  emoji: z.string(),
  // 위험 요소가 있을 때만
  caution: z.string().nullable(),
  // 다 했는지 스스로 확인하는 문장
  doneCheck: z.string(),
  // 원문 매뉴얼의 근거 구절
  sourceQuote: z.string(),
});
export const DraftGuideSchema = z.object({
  title: z.string(),
  steps: z.array(DraftStepSchema),
  // 업무 매뉴얼로 볼 수 없을 때의 사유
  rejectReason: z.string().nullable(),
});

// 저장 모델
export const StepSchema = DraftStepSchema.extend({
  id: z.string(),
  issues: z.array(StepIssueSchema),
  editedByCoach: z.boolean(),
});
export const GuideStatus = z.enum(["draft", "approved"]);
export const GenerationReportSchema = z.object({
  model: z.string(),
  // AI 호출 횟수 (초안 1회 + 재작성)
  rounds: z.number(),
  issuesFound: z.number(),
  issuesRemaining: z.number(),
});
export const GuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  workplace: z.string(),
  manual: z.string(),
  steps: z.array(StepSchema),
  // 원문 구절 중 단계에 반영되지 않은 것으로 추정되는 내용, 코치 검수용
  uncovered: z.array(z.string()).default([]),
  status: GuideStatus,
  isSample: z.boolean(),
  maskedCount: z.number(),
  generation: GenerationReportSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  approvedAt: z.string().nullable(),
});

export type StepIssue = z.infer<typeof StepIssueSchema>;
export type DraftStep = z.infer<typeof DraftStepSchema>;
export type DraftGuide = z.infer<typeof DraftGuideSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Guide = z.infer<typeof GuideSchema>;
export type GenerationReport = z.infer<typeof GenerationReportSchema>;

// 요청 DTO
export const MANUAL_MIN_LENGTH = 30;
export const MANUAL_MAX_LENGTH = 6000;
export const MAX_STEPS = 20;

export const CreateGuideRequest = z.object({
  title: z.string().trim().max(60).optional(),
  workplace: z.string().trim().max(40).optional(),
  manual: z.string().trim().min(MANUAL_MIN_LENGTH).max(MANUAL_MAX_LENGTH),
});
export const StepInput = z.object({
  id: z.string().nullable(),
  action: z.string().trim().min(1).max(80),
  detail: z.string().trim().max(200),
  emoji: z.string().trim().min(1).max(8),
  caution: z.string().trim().max(120).nullable(),
  doneCheck: z.string().trim().max(80),
  sourceQuote: z.string().trim().max(300),
});
export const UpdateGuideRequest = z.object({
  title: z.string().trim().min(1).max(60),
  steps: z.array(StepInput).min(1).max(MAX_STEPS),
});
export const ApproveGuideRequest = z.object({
  // 점검 경고가 남은 상태로 승인할 때 필요한 확인
  acknowledgeIssues: z.boolean().default(false),
});

export type CreateGuideRequest = z.infer<typeof CreateGuideRequest>;
export type StepInput = z.infer<typeof StepInput>;
export type UpdateGuideRequest = z.infer<typeof UpdateGuideRequest>;
export type ApproveGuideRequest = z.infer<typeof ApproveGuideRequest>;

// 응답 DTO
export type GuideResponse = Guide & { issueCount: number };
export type GuideSummaryResponse = {
  id: string;
  title: string;
  workplace: string;
  status: Guide["status"];
  isSample: boolean;
  stepCount: number;
  issueCount: number;
  updatedAt: string;
  approvedAt: string | null;
};
// 근로자 화면용, 원문과 점검 결과 제외
export type WorkerStepResponse = Pick<
  Step,
  "id" | "action" | "detail" | "emoji" | "caution" | "doneCheck"
>;
export type WorkerGuideResponse = {
  id: string;
  title: string;
  workplace: string;
  steps: WorkerStepResponse[];
};

// 코치가 확인해야 할 건수: 단계별 점검 경고 + 원문 누락 추정
export const countIssues = (guide: Pick<Guide, "steps" | "uncovered">) =>
  guide.steps.reduce((total, step) => total + step.issues.length, 0) + guide.uncovered.length;

export function toGuideResponse(guide: Guide): GuideResponse {
  return { ...guide, issueCount: countIssues(guide) };
}

export function toGuideSummary(guide: Guide): GuideSummaryResponse {
  return {
    id: guide.id,
    title: guide.title,
    workplace: guide.workplace,
    status: guide.status,
    isSample: guide.isSample,
    stepCount: guide.steps.length,
    issueCount: countIssues(guide),
    updatedAt: guide.updatedAt,
    approvedAt: guide.approvedAt,
  };
}

export function toWorkerGuide(guide: Guide): WorkerGuideResponse {
  return {
    id: guide.id,
    title: guide.title,
    workplace: guide.workplace,
    steps: guide.steps.map(({ id, action, detail, emoji, caution, doneCheck }) => ({
      id,
      action,
      detail,
      emoji,
      caution,
      doneCheck,
    })),
  };
}
