import "server-only";
import type { Guide } from "@/features/guide";
import type { ProgressService } from "@/features/progress/server";
import { AppError, ErrorCode } from "@/shared/error";
import { logger } from "@/shared/util/logger";
import { maskPersonalInfo } from "@/shared/util/mask";
import { buildFallbackReply, runCoachingAgent, type ToolChat } from "./agent/run-coaching";
import type { AskHelpRequest, CallCoachRequest, CoachingResponse } from "./schema";

type Dependencies = {
  progress: Pick<ProgressService, "getRun" | "countHelp" | "recordHelp">;
  getApprovedGuide: (guideId: string) => Promise<Guide>;
  chat: ToolChat;
};

export type CoachingService = ReturnType<typeof createCoachingService>;

// 같은 단계에서 이 횟수만큼 막히면 AI 판단과 관계없이 사람 호출
export const AUTO_CALL_COACH_AT = 3;

export function createCoachingService({ progress, getApprovedGuide, chat }: Dependencies) {
  async function locate(runId: string, stepId: string) {
    const run = await progress.getRun(runId);
    const guide = await getApprovedGuide(run.guideId);
    const index = guide.steps.findIndex((step) => step.id === stepId);
    if (index === -1) throw new AppError(ErrorCode.STEP_NOT_FOUND, { detail: stepId });
    return { guide, step: guide.steps[index], stepNumber: index + 1 };
  }

  return {
    // '잘 모르겠어요': AI 코칭, 실패해도 승인된 단계 내용으로 답변
    async ask(runId: string, request: AskHelpRequest): Promise<CoachingResponse> {
      const { guide, step, stepNumber } = await locate(runId, request.stepId);
      const { run, helpCount } = await progress.countHelp(runId, request.stepId);
      // 외부 AI 전송 전에 개인정보로 보이는 값 가림
      const question = request.question ? maskPersonalInfo(request.question).text : null;

      let reply;
      try {
        reply = await runCoachingAgent({ guide, step, stepNumber, helpCount, question }, chat);
      } catch (error) {
        logger.warn("coaching agent failed, using fallback", {
          runId,
          code: error instanceof AppError ? error.errorCode.code : "UNKNOWN",
        });
        reply = buildFallbackReply(step);
      }

      const autoCall = helpCount >= AUTO_CALL_COACH_AT;
      const coachCalled = reply.coachCalled || autoCall;
      const base = { run, stepId: step.id, stepNumber, stepAction: step.action };

      await progress.recordHelp({
        ...base,
        kind: "ai",
        question,
        answer: reply.message,
        reason: null,
        trace: reply.trace,
      });
      if (coachCalled) {
        await progress.recordHelp({
          ...base,
          kind: "human",
          question,
          answer: null,
          reason: autoCall
            ? `같은 단계에서 ${helpCount}번 도움 요청`
            : "AI가 사람의 도움이 필요하다고 판단",
          trace: [],
        });
      }

      logger.info("coaching answered", {
        runId,
        stepNumber,
        helpCount,
        source: reply.source,
        coachCalled,
      });
      return { ...reply, coachCalled, helpCount };
    },

    // '선생님 부르기': 근로자가 직접 사람 호출
    async callCoach(runId: string, request: CallCoachRequest): Promise<{ called: true }> {
      const { step, stepNumber } = await locate(runId, request.stepId);
      const run = await progress.getRun(runId);
      await progress.recordHelp({
        run,
        stepId: step.id,
        stepNumber,
        stepAction: step.action,
        kind: "human",
        question: null,
        answer: null,
        reason: "근로자가 직접 호출",
        trace: [],
      });
      logger.info("coach called by worker", { runId, stepNumber });
      return { called: true };
    },
  };
}
