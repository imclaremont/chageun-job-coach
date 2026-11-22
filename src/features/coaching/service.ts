import "server-only";
import type { Guide } from "@/features/guide";
import type { ProgressService } from "@/features/progress/server";
import { AppError, ErrorCode } from "@/shared/error";
import { logger } from "@/shared/util/logger";
import { maskPersonalInfo } from "@/shared/util/mask";
import {
  buildFallbackReply,
  buildUrgentReply,
  runCoachingAgent,
  type ToolChat,
} from "./agent/run-coaching";
import { mentionsInjury } from "./safety";
import type { AskHelpRequest, CallCoachRequest, CoachingResponse } from "./schema";

type Dependencies = {
  progress: Pick<ProgressService, "getRun" | "countHelp" | "recordHelp">;
  getApprovedGuide: (guideId: string) => Promise<Guide>;
  chat: ToolChat;
};

export type CoachingService = ReturnType<typeof createCoachingService>;

// 같은 단계에서 이 횟수만큼 막히면 AI 판단과 관계없이 사람 호출
export const AUTO_CALL_COACH_AT = 3;
// 긴급 호출 사유
export const HURT_REASON = "근로자가 다쳤다고 알림";

export function createCoachingService({ progress, getApprovedGuide, chat }: Dependencies) {
  async function locate(runId: string, stepId: string) {
    const run = await progress.getRun(runId);
    const guide = await getApprovedGuide(run.guideId);
    const index = guide.steps.findIndex((step) => step.id === stepId);
    if (index === -1) throw new AppError(ErrorCode.STEP_NOT_FOUND, { detail: stepId });
    return { run, guide, step: guide.steps[index], stepNumber: index + 1 };
  }

  return {
    // '잘 모르겠어요': AI 코칭, 실패해도 승인된 단계 내용으로 답변
    async ask(runId: string, request: AskHelpRequest): Promise<CoachingResponse> {
      const located = await locate(runId, request.stepId);
      const { guide, step, stepNumber } = located;
      // 외부 AI 전송 전에 개인정보로 보이는 값 가림
      const question = request.question ? maskPersonalInfo(request.question).text : null;
      const target = { stepId: step.id, stepNumber, stepAction: step.action };

      // 다쳤거나 아프다는 말은 AI를 거치지 않고 바로 긴급 호출, 막힘 횟수에도 미포함
      if (question && mentionsInjury(question)) {
        await progress.recordHelp({
          ...target,
          run: located.run,
          kind: "human",
          urgent: true,
          question,
          answer: null,
          reason: HURT_REASON,
          trace: [],
        });
        logger.info("urgent coach call by rule", { runId, stepNumber });
        const log = located.run.stepLogs.find((item) => item.stepId === step.id);
        return { ...buildUrgentReply(), helpCount: log?.helpCount ?? 0 };
      }

      const { run, helpCount } = await progress.countHelp(runId, request.stepId);

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
      const base = { ...target, run };

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
          urgent: reply.urgent,
          question,
          answer: null,
          reason: reply.urgent
            ? "AI가 다쳤거나 아픈 상황으로 판단"
            : autoCall
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
        urgent: reply.urgent,
      });
      return { ...reply, coachCalled, helpCount };
    },

    // '선생님 부르기'와 '다쳤어요': 근로자가 직접 사람 호출
    async callCoach(runId: string, request: CallCoachRequest): Promise<{ called: true }> {
      const { run, step, stepNumber } = await locate(runId, request.stepId);
      const urgent = request.reason === "hurt";
      await progress.recordHelp({
        run,
        stepId: step.id,
        stepNumber,
        stepAction: step.action,
        kind: "human",
        urgent,
        question: null,
        answer: null,
        reason: urgent ? HURT_REASON : "근로자가 직접 호출",
        trace: [],
      });
      logger.info("coach called by worker", { runId, stepNumber, urgent });
      return { called: true };
    },
  };
}
