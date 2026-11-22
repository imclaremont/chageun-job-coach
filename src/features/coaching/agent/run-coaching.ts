import type { Guide, Step } from "@/features/guide";
import type { CoachingReply } from "../schema";
import { buildCoachingContext, COACHING_SYSTEM_PROMPT } from "./prompts";
import { ANSWER_MAX_REJECTS, createToolState, runTool, TOOL, TOOL_SPECS } from "./tools";

// 도구 호출 반복 상한
export const MAX_TURNS = 6;

type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

export type AgentMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

// AI 호출 함수, 테스트에서 대체 가능하도록 주입
export type ToolChat = (options: {
  operation: string;
  messages: AgentMessage[];
  tools: typeof TOOL_SPECS;
}) => Promise<{ content: string | null; tool_calls?: ToolCall[] }>;

export type CoachingInput = {
  guide: Guide;
  step: Step;
  stepNumber: number;
  helpCount: number;
  question: string | null;
};

const ENCOURAGEMENT = "천천히 해도 괜찮아요";

// AI 없이 승인된 단계 내용만으로 만든 답변
export function buildFallbackReply(step: Step, trace: string[] = []): CoachingReply {
  const smallSteps = step.detail
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return {
    message: `괜찮아요. 다시 같이 봐요. ${step.action}.`,
    smallSteps,
    encouragement: ENCOURAGEMENT,
    coachCalled: false,
    urgent: false,
    source: "fallback",
    trace,
  };
}

// 다쳤다고 알렸을 때의 고정 답변, AI를 거치지 않고 바로 사람 호출
export function buildUrgentReply(): CoachingReply {
  return {
    message: "선생님을 불렀어요. 하던 일을 멈춰요. 그 자리에서 기다려요.",
    smallSteps: [],
    encouragement: "선생님이 곧 와요",
    coachCalled: true,
    urgent: true,
    source: "rule",
    trace: [],
  };
}

function parseArguments(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// 코칭 에이전트: AI가 도구를 골라 쓰고, 코드가 실행·점검한 결과를 다시 전달하는 반복
export async function runCoachingAgent(
  input: CoachingInput,
  chat: ToolChat,
): Promise<CoachingReply> {
  const { guide, step, stepNumber, helpCount, question } = input;
  const state = createToolState();
  const trace: string[] = [];
  const messages: AgentMessage[] = [
    { role: "system", content: COACHING_SYSTEM_PROMPT },
    {
      role: "user",
      content: buildCoachingContext({
        guideTitle: guide.title,
        totalSteps: guide.steps.length,
        stepNumber,
        step,
        helpCount,
        question,
      }),
    },
  ];

  for (let turn = 0; turn < MAX_TURNS && !state.answer; turn += 1) {
    const assistant = await chat({ operation: "coaching", messages, tools: TOOL_SPECS });
    const calls = assistant.tool_calls ?? [];
    if (calls.length === 0) break;
    messages.push({ role: "assistant", content: assistant.content, tool_calls: calls });

    for (const call of calls) {
      const result = runTool(
        call.function.name,
        parseArguments(call.function.arguments),
        { guide },
        state,
      );
      trace.push(result.ok ? call.function.name : `${call.function.name}(다시)`);
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    }

    if (state.answerRejects > ANSWER_MAX_REJECTS) break;
  }

  if (!state.answer) {
    // 답변을 끝내지 못한 경우 승인된 단계 내용으로 대체, 사람 호출 결정은 유지
    return {
      ...buildFallbackReply(step, trace),
      coachCalled: state.coachReason !== null,
      urgent: state.coachUrgent,
    };
  }

  return {
    message: state.answer.message,
    smallSteps: state.smallSteps,
    encouragement: state.answer.encouragement || ENCOURAGEMENT,
    coachCalled: state.coachReason !== null,
    urgent: state.coachUrgent,
    source: "ai",
    trace,
  };
}

export { TOOL };
