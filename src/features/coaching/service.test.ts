import { describe, expect, it } from "vitest";
import { buildSampleGuide, SAMPLE_GUIDE_ID } from "@/features/guide/sample";
import { createProgressRepository } from "@/features/progress/repository";
import { createProgressService } from "@/features/progress/service";
import { createMemoryStore } from "@/infra/store/memory-store";
import { AppError, ErrorCode } from "@/shared/error";
import { TOOL, type ToolChat } from "./agent/run-coaching";
import { AUTO_CALL_COACH_AT, createCoachingService, HURT_REASON } from "./service";

const guide = buildSampleGuide();
const stepId = guide.steps[2].id;

const answering: ToolChat = async () => ({
  content: null,
  tool_calls: [
    {
      id: "call_1",
      type: "function",
      function: {
        name: TOOL.ANSWER,
        arguments: JSON.stringify({ message: "괜찮아요. 얼음을 채워요.", encouragement: "좋아요" }),
      },
    },
  ],
});

async function setup(chat: ToolChat = answering) {
  const store = createMemoryStore();
  const getApprovedGuide = async () => guide;
  const progress = createProgressService({
    repository: createProgressRepository(() => store),
    getApprovedGuide,
  });
  const coaching = createCoachingService({ progress, getApprovedGuide, chat });
  const run = await progress.startRun({
    guideId: SAMPLE_GUIDE_ID,
    workerId: "w_haneul",
    mode: "full",
  });
  return { progress, coaching, run };
}

describe("coachingService", () => {
  it("도움 요청마다 횟수와 AI 코칭 기록을 남김", async () => {
    const { progress, coaching, run } = await setup();

    const reply = await coaching.ask(run.id, { stepId });
    const dashboard = await progress.dashboard();

    expect(reply).toMatchObject({ source: "ai", helpCount: 1, coachCalled: false });
    expect(dashboard.recentCoaching[0]).toMatchObject({
      kind: "ai",
      stepNumber: 3,
      answer: "괜찮아요. 얼음을 채워요.",
    });
    expect(dashboard.stuckSteps[0]).toMatchObject({ stepNumber: 3, helpCount: 1 });
  });

  it(`같은 단계에서 ${AUTO_CALL_COACH_AT}번 막히면 AI 판단과 관계없이 사람 호출`, async () => {
    const { progress, coaching, run } = await setup();

    await coaching.ask(run.id, { stepId });
    await coaching.ask(run.id, { stepId });
    expect((await progress.dashboard()).openHelp).toHaveLength(0);

    const third = await coaching.ask(run.id, { stepId });

    expect(third.coachCalled).toBe(true);
    expect((await progress.dashboard()).openHelp[0].reason).toContain("3번 도움 요청");
  });

  it("AI 호출이 실패해도 승인된 단계 내용으로 답변", async () => {
    const failing: ToolChat = async () => {
      throw new AppError(ErrorCode.AI_FAILED);
    };
    const { coaching, run } = await setup(failing);

    const reply = await coaching.ask(run.id, { stepId });

    expect(reply.source).toBe("fallback");
    expect(reply.message).toContain("컵에 얼음을 채워요");
  });

  it("질문 속 개인정보로 보이는 값은 AI 전송 전에 가림", async () => {
    const prompts: string[] = [];
    const spying: ToolChat = async (options) => {
      prompts.push(options.messages[1].content ?? "");
      return answering(options);
    };
    const { coaching, run } = await setup(spying);

    await coaching.ask(run.id, { stepId, question: "010-1234-5678로 전화해도 돼요?" });

    expect(prompts[0]).not.toContain("010-1234-5678");
  });

  it("근로자가 직접 부른 호출은 코치가 확인할 때까지 열려 있음", async () => {
    const { progress, coaching, run } = await setup();

    await coaching.callCoach(run.id, { stepId, reason: "help" });
    const [help] = (await progress.dashboard()).openHelp;
    expect(help).toMatchObject({
      kind: "human",
      status: "open",
      urgent: false,
      reason: "근로자가 직접 호출",
    });

    await progress.resolveHelp(help.id);
    expect((await progress.dashboard()).openHelp).toHaveLength(0);
  });

  it("'다쳤어요' 버튼은 긴급 호출로 기록", async () => {
    const { progress, coaching, run } = await setup();

    await coaching.callCoach(run.id, { stepId, reason: "hurt" });

    expect((await progress.dashboard()).openHelp[0]).toMatchObject({
      kind: "human",
      urgent: true,
      reason: HURT_REASON,
    });
  });

  it("다쳤다는 말은 AI를 거치지 않고 바로 긴급 호출", async () => {
    let aiCalls = 0;
    const counting: ToolChat = async (options) => {
      aiCalls += 1;
      return answering(options);
    };
    const { progress, coaching, run } = await setup(counting);

    const reply = await coaching.ask(run.id, { stepId, question: "뜨거운 물에 손을 데었어요" });
    const dashboard = await progress.dashboard();

    expect(aiCalls).toBe(0);
    expect(reply).toMatchObject({ urgent: true, coachCalled: true, source: "rule", helpCount: 0 });
    expect(dashboard.openHelp[0]).toMatchObject({
      urgent: true,
      question: "뜨거운 물에 손을 데었어요",
      reason: HURT_REASON,
    });
    // 막힘 횟수와 AI 코칭 기록에는 미포함
    expect(dashboard.recentCoaching).toHaveLength(0);
    expect(dashboard.stuckSteps).toHaveLength(0);
  });

  it("AI가 다친 상황으로 판단한 호출도 긴급으로 기록", async () => {
    const urgentByAi: ToolChat = async ({ messages }) => {
      const called = messages.some((message) => message.role === "tool");
      const next = called
        ? { name: TOOL.ANSWER, args: { message: "선생님을 불렀어요.", encouragement: "" } }
        : { name: TOOL.CALL_COACH, args: { reason: "빨간 것이 난다고 말함", urgent: true } };
      return {
        content: null,
        tool_calls: [
          {
            id: "call_1",
            type: "function",
            function: { name: next.name, arguments: JSON.stringify(next.args) },
          },
        ],
      };
    };
    const { progress, coaching, run } = await setup(urgentByAi);

    const reply = await coaching.ask(run.id, { stepId, question: "손에서 빨간 게 나와요" });

    expect(reply.urgent).toBe(true);
    expect((await progress.dashboard()).openHelp[0]).toMatchObject({ urgent: true });
  });
});
