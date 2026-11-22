import { z } from "zod";

// 근로자에게 보여 줄 코칭 답변
export const CoachingReplySchema = z.object({
  // 쉬운 말 안내
  message: z.string(),
  // 더 잘게 나눈 행동, 없으면 빈 배열
  smallSteps: z.array(z.string()),
  // 격려 한마디
  encouragement: z.string(),
  // 사람(코치) 호출 여부
  coachCalled: z.boolean(),
  // ai: AI 답변, fallback: AI 실패 시 승인된 단계 내용으로 대체
  source: z.enum(["ai", "fallback"]),
  // AI가 쓴 도구 순서
  trace: z.array(z.string()),
});
export type CoachingReply = z.infer<typeof CoachingReplySchema>;

// 요청 DTO
export const AskHelpRequest = z.object({
  stepId: z.string().min(1),
  question: z.string().trim().max(200).optional(),
});
export const CallCoachRequest = z.object({
  stepId: z.string().min(1),
});
export type AskHelpRequest = z.infer<typeof AskHelpRequest>;
export type CallCoachRequest = z.infer<typeof CallCoachRequest>;

export type CoachingResponse = CoachingReply & { helpCount: number };
