import "server-only";
import type { Guide } from "@/features/guide";
import { AppError, ErrorCode } from "@/shared/error";
import { createId } from "@/shared/util/id";
import { logger } from "@/shared/util/logger";
import type { ProgressRepository } from "./repository";
import {
  toRunProgress,
  type DashboardResponse,
  type HelpRequest,
  type Run,
  type StartRunRequest,
  type StuckStepItem,
} from "./schema";
import { findWorker } from "./workers";

type Dependencies = {
  repository: ProgressRepository;
  getApprovedGuide: (guideId: string) => Promise<Guide>;
  now?: () => Date;
};

export type ProgressService = ReturnType<typeof createProgressService>;

// 간단 보기 추천 기준: 같은 일을 도움 없이 연속으로 끝낸 횟수
export const SIMPLE_MODE_STREAK = 2;
// 진행 중으로 볼 최근 활동 시간
const ACTIVE_WINDOW_MS = 12 * 60 * 60 * 1000;

const helpTotal = (run: Run) => run.stepLogs.reduce((total, log) => total + log.helpCount, 0);
const byNewest = <T extends { updatedAt?: string; createdAt?: string }>(a: T, b: T) =>
  (b.updatedAt ?? b.createdAt ?? "").localeCompare(a.updatedAt ?? a.createdAt ?? "");

export function createProgressService({ repository, getApprovedGuide, now }: Dependencies) {
  const currentTime = () => now?.() ?? new Date();
  const timestamp = () => currentTime().toISOString();

  async function getRun(id: string): Promise<Run> {
    const run = await repository.findRun(id);
    if (!run) throw new AppError(ErrorCode.RUN_NOT_FOUND, { detail: id });
    return run;
  }

  return {
    getRun,

    // 익숙해진 근로자에게 간단 보기 추천
    async isSimpleRecommended(workerId: string, guideId: string): Promise<boolean> {
      const finished = (await repository.findAllRuns())
        .filter(
          (run) => run.workerId === workerId && run.guideId === guideId && run.status === "done",
        )
        .sort(byNewest)
        .slice(0, SIMPLE_MODE_STREAK);
      return (
        finished.length === SIMPLE_MODE_STREAK && finished.every((run) => helpTotal(run) === 0)
      );
    },

    async startRun(request: StartRunRequest): Promise<Run> {
      const worker = findWorker(request.workerId);
      if (!worker) throw new AppError(ErrorCode.WORKER_NOT_FOUND, { detail: request.workerId });
      const guide = await getApprovedGuide(request.guideId);

      const startedAt = timestamp();
      const run: Run = {
        id: createId("r"),
        guideId: guide.id,
        guideTitle: guide.title,
        workerId: worker.id,
        workerName: worker.name,
        mode: request.mode,
        stepLogs: guide.steps.map((step) => ({ stepId: step.id, doneAt: null, helpCount: 0 })),
        currentIndex: 0,
        status: "in_progress",
        startedAt,
        updatedAt: startedAt,
        finishedAt: null,
      };
      await repository.saveRun(run);
      logger.info("run started", { runId: run.id, guideId: guide.id, mode: run.mode });
      return run;
    },

    async completeStep(runId: string, stepId: string): Promise<Run> {
      const run = await getRun(runId);
      const log = run.stepLogs.find((item) => item.stepId === stepId);
      if (!log) throw new AppError(ErrorCode.STEP_NOT_FOUND, { detail: `${runId} ${stepId}` });

      const doneAt = timestamp();
      log.doneAt ??= doneAt;
      const nextIndex = run.stepLogs.findIndex((item) => item.doneAt === null);
      const finished = nextIndex === -1;
      const updated: Run = {
        ...run,
        currentIndex: finished ? run.stepLogs.length : nextIndex,
        status: finished ? "done" : "in_progress",
        finishedAt: finished ? (run.finishedAt ?? doneAt) : null,
        updatedAt: doneAt,
      };
      await repository.saveRun(updated);
      if (finished) logger.info("run finished", { runId, helpTotal: helpTotal(updated) });
      return updated;
    },

    // 도움 요청 횟수 기록, 해당 단계의 누적 횟수 반환
    async countHelp(runId: string, stepId: string): Promise<{ run: Run; helpCount: number }> {
      const run = await getRun(runId);
      const log = run.stepLogs.find((item) => item.stepId === stepId);
      if (!log) throw new AppError(ErrorCode.STEP_NOT_FOUND, { detail: `${runId} ${stepId}` });
      log.helpCount += 1;
      const updated: Run = { ...run, updatedAt: timestamp() };
      await repository.saveRun(updated);
      return { run: updated, helpCount: log.helpCount };
    },

    async recordHelp(
      input: Pick<HelpRequest, "kind" | "question" | "answer" | "reason" | "trace"> & {
        run: Run;
        stepId: string;
        stepNumber: number;
        stepAction: string;
      },
    ): Promise<HelpRequest> {
      const help: HelpRequest = {
        id: createId("h"),
        kind: input.kind,
        runId: input.run.id,
        guideId: input.run.guideId,
        guideTitle: input.run.guideTitle,
        stepId: input.stepId,
        stepNumber: input.stepNumber,
        stepAction: input.stepAction,
        workerId: input.run.workerId,
        workerName: input.run.workerName,
        question: input.question,
        answer: input.answer,
        reason: input.reason,
        trace: input.trace,
        // AI 코칭 기록은 바로 종료 상태, 사람 호출은 코치 확인 전까지 열림
        status: input.kind === "human" ? "open" : "resolved",
        createdAt: timestamp(),
        resolvedAt: null,
      };
      await repository.saveHelp(help);
      return help;
    },

    async resolveHelp(helpId: string): Promise<HelpRequest> {
      const help = await repository.findHelp(helpId);
      if (!help) throw new AppError(ErrorCode.HELP_NOT_FOUND, { detail: helpId });
      const resolved: HelpRequest = { ...help, status: "resolved", resolvedAt: timestamp() };
      await repository.saveHelp(resolved);
      return resolved;
    },

    async dashboard(): Promise<DashboardResponse> {
      const [runs, helps] = await Promise.all([repository.findAllRuns(), repository.findAllHelp()]);
      const nowMs = currentTime().getTime();
      const today = timestamp().slice(0, 10);

      const activeRuns = runs
        .filter(
          (run) =>
            run.status === "in_progress" && nowMs - Date.parse(run.updatedAt) < ACTIVE_WINDOW_MS,
        )
        .sort(byNewest);
      const doneRuns = runs.filter((run) => run.status === "done").sort(byNewest);
      const openHelp = helps
        .filter((help) => help.kind === "human" && help.status === "open")
        .sort(byNewest);
      const aiHelps = helps.filter((help) => help.kind === "ai").sort(byNewest);

      // 단계별 AI 도움 횟수 집계, 자주 막히는 단계 파악용
      const stuck = new Map<string, StuckStepItem>();
      for (const help of aiHelps) {
        const key = `${help.guideId}:${help.stepId}`;
        const item = stuck.get(key) ?? {
          guideId: help.guideId,
          guideTitle: help.guideTitle,
          stepNumber: help.stepNumber,
          stepAction: help.stepAction,
          helpCount: 0,
        };
        item.helpCount += 1;
        stuck.set(key, item);
      }

      return {
        summary: {
          activeCount: activeRuns.length,
          doneTodayCount: doneRuns.filter((run) => run.finishedAt?.startsWith(today)).length,
          openHelpCount: openHelp.length,
          aiHelpTodayCount: aiHelps.filter((help) => help.createdAt.startsWith(today)).length,
        },
        openHelp,
        activeRuns: activeRuns.slice(0, 10).map(toRunProgress),
        recentDone: doneRuns.slice(0, 5).map(toRunProgress),
        stuckSteps: [...stuck.values()].sort((a, b) => b.helpCount - a.helpCount).slice(0, 5),
        recentCoaching: aiHelps.slice(0, 6),
      };
    },
  };
}
