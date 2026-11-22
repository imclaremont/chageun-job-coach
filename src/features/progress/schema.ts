import { z } from "zod";

// 수행 기록: 근로자가 가이드를 한 번 따라 하는 과정
export const RunMode = z.enum(["full", "simple"]);
export const StepLogSchema = z.object({
  stepId: z.string(),
  doneAt: z.string().nullable(),
  helpCount: z.number(),
});
export const RunSchema = z.object({
  id: z.string(),
  guideId: z.string(),
  guideTitle: z.string(),
  workerId: z.string(),
  workerName: z.string(),
  mode: RunMode,
  stepLogs: z.array(StepLogSchema),
  // 아직 끝내지 않은 첫 단계의 순번 (0부터)
  currentIndex: z.number(),
  status: z.enum(["in_progress", "done"]),
  startedAt: z.string(),
  updatedAt: z.string(),
  finishedAt: z.string().nullable(),
});

// 도움 요청: AI 코칭 기록(ai)과 사람 호출(human)
export const HelpRequestSchema = z.object({
  id: z.string(),
  kind: z.enum(["ai", "human"]),
  runId: z.string(),
  guideId: z.string(),
  guideTitle: z.string(),
  stepId: z.string(),
  stepNumber: z.number(),
  stepAction: z.string(),
  workerId: z.string(),
  workerName: z.string(),
  question: z.string().nullable(),
  answer: z.string().nullable(),
  // 사람 호출 사유
  reason: z.string().nullable(),
  // 다쳤거나 아프다고 알린 긴급 호출
  urgent: z.boolean().default(false),
  // AI가 쓴 도구 순서
  trace: z.array(z.string()),
  status: z.enum(["open", "resolved"]),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
});

export type Run = z.infer<typeof RunSchema>;
export type StepLog = z.infer<typeof StepLogSchema>;
export type HelpRequest = z.infer<typeof HelpRequestSchema>;

// 요청 DTO
export const StartRunRequest = z.object({
  guideId: z.string().min(1),
  workerId: z.string().min(1),
  mode: RunMode.default("full"),
});
export type StartRunRequest = z.infer<typeof StartRunRequest>;

// 응답 DTO
export type RunResponse = Run & { totalSteps: number; helpTotal: number };
export type RunProgressItem = {
  runId: string;
  workerName: string;
  guideTitle: string;
  doneSteps: number;
  totalSteps: number;
  helpTotal: number;
  status: Run["status"];
  updatedAt: string;
};
export type StuckStepItem = {
  guideId: string;
  guideTitle: string;
  stepNumber: number;
  stepAction: string;
  helpCount: number;
};
export type DashboardResponse = {
  summary: {
    activeCount: number;
    doneTodayCount: number;
    openHelpCount: number;
    aiHelpTodayCount: number;
  };
  openHelp: HelpRequest[];
  activeRuns: RunProgressItem[];
  recentDone: RunProgressItem[];
  stuckSteps: StuckStepItem[];
  recentCoaching: HelpRequest[];
};

const sumHelp = (run: Run) => run.stepLogs.reduce((total, log) => total + log.helpCount, 0);
const countDone = (run: Run) => run.stepLogs.filter((log) => log.doneAt !== null).length;

export function toRunResponse(run: Run): RunResponse {
  return { ...run, totalSteps: run.stepLogs.length, helpTotal: sumHelp(run) };
}

export function toRunProgress(run: Run): RunProgressItem {
  return {
    runId: run.id,
    workerName: run.workerName,
    guideTitle: run.guideTitle,
    doneSteps: countDone(run),
    totalSteps: run.stepLogs.length,
    helpTotal: sumHelp(run),
    status: run.status,
    updatedAt: run.updatedAt,
  };
}
