import { z } from "zod";
import type { Guide } from "@/features/guide";
import { checkEasySentence, findUngroundedNumbers, splitEasySentences } from "./checks";

// 도구 이름
export const TOOL = {
  GET_STEP: "get_step",
  SEARCH_MANUAL: "search_manual",
  SPLIT: "split_into_small_steps",
  CALL_COACH: "call_coach",
  ANSWER: "answer_worker",
} as const;

export const ANSWER_MAX_SENTENCES = 3;
// 답변이 사람을 부른다고 말하는지 판별
const SAYS_CALLING_COACH = /(선생님|코치|매니저|담당자)[^.!?]*(부를|불렀|불러|부르)/;
// 답변 점검 실패를 허용하는 횟수, 넘으면 승인된 단계 내용으로 대체
export const ANSWER_MAX_REJECTS = 2;

const GetStepInput = z.object({
  stepNumber: z.number().describe("확인할 단계 번호 (1부터)"),
});
const SearchManualInput = z.object({
  keyword: z.string().describe("원문 매뉴얼에서 찾을 낱말"),
});
const SplitInput = z.object({
  smallSteps: z
    .array(z.string())
    .describe("지금 단계를 더 잘게 나눈 행동 2~4개, 각각 쉬운 말 한 문장"),
});
const CallCoachInput = z.object({
  reason: z.string().describe("코치에게 전할 호출 이유"),
  urgent: z.boolean().describe("근로자가 다쳤거나 아프다고 하면 true, 그 밖에는 false"),
});
const AnswerInput = z.object({
  message: z.string().describe("근로자에게 할 말, 쉬운 말 3문장 이하"),
  encouragement: z.string().describe("격려 한마디"),
});

export const TOOL_SPECS = [
  {
    name: TOOL.GET_STEP,
    description: "승인된 가이드에서 특정 번호 단계의 내용을 확인",
    parameters: GetStepInput,
  },
  {
    name: TOOL.SEARCH_MANUAL,
    description: "원문 매뉴얼에서 낱말이 들어 있는 줄을 찾기",
    parameters: SearchManualInput,
  },
  {
    name: TOOL.SPLIT,
    description: "지금 단계를 더 작은 행동으로 나눠 근로자에게 보여 주기, 쉬운 말 기준 점검 포함",
    parameters: SplitInput,
  },
  {
    name: TOOL.CALL_COACH,
    description: "사람(코치)을 부르기, 답을 찾지 못했거나 사람이 봐야 하는 상황일 때 사용",
    parameters: CallCoachInput,
  },
  {
    name: TOOL.ANSWER,
    description: "근로자에게 최종 답변 전달, 쉬운 말 기준과 원문에 없는 숫자 점검 포함",
    parameters: AnswerInput,
  },
];

export type ToolState = {
  smallSteps: string[];
  coachReason: string | null;
  coachUrgent: boolean;
  answer: { message: string; encouragement: string } | null;
  answerRejects: number;
};

export const createToolState = (): ToolState => ({
  smallSteps: [],
  coachReason: null,
  coachUrgent: false,
  answer: null,
  answerRejects: 0,
});

type ToolResult = Record<string, unknown>;

const failure = (problems: string[]): ToolResult => ({ ok: false, problems });

// 도구 실행, 결과는 다음 차례에 AI에게 전달
export function runTool(
  name: string,
  rawArgs: unknown,
  context: { guide: Guide },
  state: ToolState,
): ToolResult {
  const { guide } = context;
  // 목록 번호는 근거 숫자에서 제외
  const manualBody = guide.manual.replace(/^\s*\d+[.)]\s*/gm, "");
  const sourceText = `${manualBody}\n${guide.steps
    .map((step) => `${step.action} ${step.detail} ${step.caution ?? ""} ${step.doneCheck}`)
    .join("\n")}`;

  switch (name) {
    case TOOL.GET_STEP: {
      const args = GetStepInput.safeParse(rawArgs);
      const step = args.success ? guide.steps[args.data.stepNumber - 1] : undefined;
      if (!step) return failure([`단계 번호는 1부터 ${guide.steps.length}까지`]);
      return {
        ok: true,
        action: step.action,
        detail: step.detail,
        caution: step.caution,
        doneCheck: step.doneCheck,
      };
    }

    case TOOL.SEARCH_MANUAL: {
      const args = SearchManualInput.safeParse(rawArgs);
      const keyword = args.success ? args.data.keyword.trim() : "";
      if (!keyword) return failure(["찾을 낱말이 비어 있음"]);
      const lines = guide.manual
        .split("\n")
        .filter((line) => line.includes(keyword))
        .slice(0, 3);
      return lines.length > 0
        ? { ok: true, lines }
        : { ok: true, lines: [], note: "원문에 없는 낱말, 지어내지 말고 필요하면 call_coach 사용" };
    }

    case TOOL.SPLIT: {
      const args = SplitInput.safeParse(rawArgs);
      if (!args.success) return failure(["smallSteps 형식 오류"]);
      const smallSteps = args.data.smallSteps.map((item) => item.trim()).filter(Boolean);
      if (smallSteps.length < 2 || smallSteps.length > 4) {
        return failure(["작은 행동은 2개 이상 4개 이하"]);
      }
      const problems = smallSteps.flatMap((sentence, index) =>
        checkEasySentence(sentence).map((problem) => `${index + 1}번: ${problem}`),
      );
      const numbers = findUngroundedNumbers(smallSteps.join(" "), sourceText);
      if (numbers.length > 0) problems.push(`원문에 없는 숫자: ${numbers.join(", ")}`);
      if (problems.length > 0) return failure(problems);
      state.smallSteps = smallSteps;
      return { ok: true };
    }

    case TOOL.CALL_COACH: {
      // 긴급 여부가 빠져도 호출 자체는 진행
      const args = CallCoachInput.partial().safeParse(rawArgs);
      state.coachReason = (args.success && args.data.reason?.trim()) || "근로자 도움 요청";
      state.coachUrgent ||= args.success && args.data.urgent === true;
      return { ok: true, note: "코치에게 알림 완료, 근로자에게 선생님을 불렀다고 말해 주기" };
    }

    case TOOL.ANSWER: {
      const args = AnswerInput.safeParse(rawArgs);
      if (!args.success) return failure(["message와 encouragement 필요"]);
      const message = args.data.message.trim();
      const sentences = splitEasySentences(message);
      const problems = sentences.flatMap((sentence) => checkEasySentence(sentence, "answer"));
      if (sentences.length === 0) problems.push("답변이 비어 있음");
      if (sentences.length > ANSWER_MAX_SENTENCES) {
        problems.push(`답변은 ${ANSWER_MAX_SENTENCES}문장 이하`);
      }
      const numbers = findUngroundedNumbers(message, sourceText);
      if (numbers.length > 0) problems.push(`원문에 없는 숫자: ${numbers.join(", ")}`);

      if (problems.length > 0) {
        state.answerRejects += 1;
        return failure(problems);
      }
      // 사람을 부른다고 답하면서 호출 도구를 쓰지 않은 경우 코드가 대신 호출
      if (!state.coachReason && SAYS_CALLING_COACH.test(message)) {
        state.coachReason = "답변에서 사람 호출을 안내";
      }
      state.answer = { message, encouragement: args.data.encouragement.trim() };
      return { ok: true };
    }

    default:
      return failure([`없는 도구: ${name}`]);
  }
}
