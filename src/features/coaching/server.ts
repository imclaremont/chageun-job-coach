import "server-only";
import { guideService } from "@/features/guide/server";
import { progressService } from "@/features/progress/server";
import { chatWithTools, type ChatMessage } from "@/infra/openai";
import { createCoachingService } from "./service";

// 서버 전용 진입점
export const coachingService = createCoachingService({
  progress: progressService,
  getApprovedGuide: (guideId) => guideService.getApproved(guideId),
  chat: async ({ operation, messages, tools }) => {
    const message = await chatWithTools({
      operation,
      messages: messages as ChatMessage[],
      tools,
    });
    return {
      content: message.content,
      tool_calls: message.tool_calls?.flatMap((call) =>
        call.type === "function"
          ? [{ id: call.id, type: "function" as const, function: call.function }]
          : [],
      ),
    };
  },
});
