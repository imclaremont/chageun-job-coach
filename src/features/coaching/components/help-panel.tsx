"use client";

import { BellRing, LoaderCircle, Send, ThumbsUp, Volume2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { AiBadge } from "@/shared/ui/feedback";
import { canSpeak, speak } from "@/shared/util/speech";
import type { CoachingResponse } from "../schema";

export type HelpState =
  | { status: "loading" }
  | { status: "ready"; reply: CoachingResponse }
  | { status: "error"; message: string };

type Props = {
  help: HelpState;
  coachCalled: boolean;
  onAsk: (question?: string) => void;
  onCallCoach: () => void;
  onClose: () => void;
};

// 자주 하는 질문, 누르면 바로 물어봄
const QUICK_QUESTIONS = ["어디에 있어요?", "얼마나 해요?", "어떻게 해요?"];

// '잘 모르겠어요'를 눌렀을 때의 코칭 화면
export function HelpPanel({ help, coachCalled, onAsk, onCallCoach, onClose }: Props) {
  const [question, setQuestion] = useState("");
  const busy = help.status === "loading";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    setQuestion("");
    onAsk(text);
  }

  return (
    <section
      id="help-panel"
      aria-label="도움말"
      aria-live="polite"
      className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm ring-2 ring-teal-600"
    >
      {help.status === "loading" && (
        <p role="status" className="flex items-center gap-3 text-2xl font-semibold text-stone-800">
          <LoaderCircle aria-hidden className="size-8 animate-spin text-teal-700" />
          괜찮아요. 같이 볼게요.
        </p>
      )}

      {help.status === "error" && (
        <p role="alert" className="text-2xl leading-relaxed text-stone-800">
          지금은 대답하기 어려워요. 선생님을 불러요.
        </p>
      )}

      {help.status === "ready" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {help.reply.source === "ai" ? (
              <AiBadge label="AI가 알려 줘요" />
            ) : (
              <span className="rounded-full bg-stone-200 px-2.5 py-1 text-sm font-medium text-stone-700">
                안내를 다시 보여 줘요
              </span>
            )}
            {canSpeak() && (
              <Button
                variant="secondary"
                onClick={() =>
                  speak(
                    [help.reply.message, ...help.reply.smallSteps, help.reply.encouragement].join(
                      ". ",
                    ),
                  )
                }
              >
                <Volume2 aria-hidden className="size-6" />
                읽어 주기
              </Button>
            )}
          </div>

          <p className="text-2xl font-semibold leading-relaxed">{help.reply.message}</p>

          {help.reply.smallSteps.length > 0 && (
            <ol className="flex flex-col gap-3">
              {help.reply.smallSteps.map((small, index) => (
                <li
                  key={`${index}-${small}`}
                  className="flex items-center gap-4 rounded-2xl bg-teal-50 px-4 py-3 text-2xl leading-snug"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xl font-bold text-white">
                    {index + 1}
                  </span>
                  {small}
                </li>
              ))}
            </ol>
          )}

          <p className="text-xl text-teal-800">{help.reply.encouragement}</p>
        </>
      )}

      {coachCalled && (
        <p
          role="status"
          className="flex items-center gap-3 rounded-2xl bg-amber-100 px-4 py-3 text-2xl font-semibold text-amber-950"
        >
          <BellRing aria-hidden className="size-8 shrink-0" />
          선생님을 불렀어요. 잠깐 기다려요.
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-stone-200 pt-5">
        <p className="text-xl font-semibold">더 물어볼래요?</p>
        <div className="flex flex-wrap gap-3">
          {QUICK_QUESTIONS.map((quick) => (
            <Button
              key={quick}
              variant="secondary"
              size="lg"
              disabled={busy}
              onClick={() => onAsk(quick)}
            >
              {quick}
            </Button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            className="min-h-14 w-full rounded-2xl border border-stone-300 bg-white px-4 text-xl placeholder:text-stone-400"
            value={question}
            maxLength={200}
            disabled={busy}
            placeholder="궁금한 것을 써요"
            aria-label="궁금한 것 쓰기"
            onChange={(event) => setQuestion(event.target.value)}
          />
          <Button type="submit" size="lg" disabled={busy || !question.trim()} aria-label="물어보기">
            <Send aria-hidden className="size-6" />
          </Button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" size="xl" disabled={coachCalled} onClick={onCallCoach}>
          <BellRing aria-hidden className="size-8" />
          선생님 부르기
        </Button>
        <Button size="xl" disabled={busy} onClick={onClose}>
          <ThumbsUp aria-hidden className="size-8" />
          이제 알겠어요
        </Button>
      </div>
    </section>
  );
}
