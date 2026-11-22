"use client";

import {
  BellRing,
  LifeBuoy,
  LoaderCircle,
  Mic,
  MicOff,
  Send,
  ThumbsUp,
  Volume2,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { AiBadge } from "@/shared/ui/feedback";
import { canSpeak, speak, stopSpeaking } from "@/shared/util/speech";
import { useSpeechInput, type SpeechInputError } from "@/shared/util/use-speech-input";
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
const QUESTION_MAX_LENGTH = 200;

// 말로 물어보기가 안 될 때의 안내
const VOICE_ERRORS: Record<SpeechInputError, string> = {
  denied: "마이크를 쓸 수 없어요. 글로 써요.",
  silent: "잘 안 들렸어요. 다시 눌러요.",
  failed: "지금은 듣기 어려워요. 글로 써요.",
};

// 답하는 쪽 말풍선
const REPLY_BUBBLE = "flex flex-col gap-4 rounded-3xl rounded-tl-lg bg-stone-100 p-5";

// '잘 모르겠어요'를 눌렀을 때의 코칭 화면: 묻고 답하는 대화 모양
export function HelpPanel({ help, coachCalled, onAsk, onCallCoach, onClose }: Props) {
  const [question, setQuestion] = useState("");
  // 마지막으로 물어본 말, 말로 물었을 때 제대로 들렸는지 확인용
  const [asked, setAsked] = useState<string | null>(null);
  const busy = help.status === "loading";

  function ask(text: string) {
    setAsked(text);
    onAsk(text);
  }

  const voice = useSpeechInput((heard) => ask(heard.slice(0, QUESTION_MAX_LENGTH)));

  function toggleVoice() {
    if (voice.listening) return voice.stop();
    // 읽어 주는 소리가 마이크에 섞이지 않도록 중단
    stopSpeaking();
    voice.start();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    setQuestion("");
    ask(text);
  }

  return (
    <section
      id="help-panel"
      aria-label="도움말"
      aria-live="polite"
      className="flex animate-rise scroll-mt-4 flex-col gap-5 rounded-[2rem] bg-white p-5 shadow-card ring-2 ring-brand-600 sm:p-7"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
          <LifeBuoy aria-hidden className="size-8 text-brand-700" />
          도움말
        </h2>
        {help.status === "ready" &&
          (help.reply.source === "ai" ? (
            <AiBadge label="AI가 알려 줘요" />
          ) : (
            <Badge>안내를 다시 보여 줘요</Badge>
          ))}
      </header>

      {asked && (
        <p className="max-w-[88%] self-end rounded-3xl rounded-tr-lg bg-brand-700 px-5 py-3.5 text-2xl leading-snug font-semibold text-white">
          <span className="sr-only">물어본 말 </span>
          {asked}
        </p>
      )}

      {help.status === "loading" && (
        <p role="status" className={`${REPLY_BUBBLE} text-2xl font-semibold text-stone-800`}>
          <span className="flex items-center gap-3">
            <LoaderCircle aria-hidden className="size-8 shrink-0 animate-spin text-brand-600" />
            괜찮아요. 같이 볼게요.
          </span>
        </p>
      )}

      {help.status === "error" && (
        <p
          role="alert"
          className="rounded-3xl rounded-tl-lg bg-red-50 p-5 text-2xl leading-relaxed font-semibold text-red-950 ring-1 ring-red-200"
        >
          지금은 대답하기 어려워요. 선생님을 불러요.
        </p>
      )}

      {help.status === "ready" && (
        <div className={REPLY_BUBBLE}>
          <p className="text-2xl leading-relaxed font-semibold">{help.reply.message}</p>

          {help.reply.smallSteps.length > 0 && (
            <ol className="flex flex-col gap-2.5">
              {help.reply.smallSteps.map((small, index) => (
                <li
                  key={`${index}-${small}`}
                  className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3 text-2xl leading-snug ring-1 ring-stone-900/5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xl font-extrabold text-white tabular-nums">
                    {index + 1}
                  </span>
                  {small}
                </li>
              ))}
            </ol>
          )}

          <p className="text-xl font-semibold text-brand-800">{help.reply.encouragement}</p>

          {canSpeak() && (
            <Button
              variant="secondary"
              size="lg"
              className="self-start text-xl"
              onClick={() =>
                speak(
                  [help.reply.message, ...help.reply.smallSteps, help.reply.encouragement].join(
                    ". ",
                  ),
                )
              }
            >
              <Volume2 aria-hidden className="size-7" />
              읽어 주기
            </Button>
          )}
        </div>
      )}

      {coachCalled && (
        <p
          role="status"
          className="flex items-center gap-3 rounded-3xl bg-amber-100 p-5 text-2xl font-bold text-amber-950 ring-1 ring-amber-300/70"
        >
          <BellRing aria-hidden className="size-8 shrink-0" />
          선생님을 불렀어요. 잠깐 기다려요.
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-stone-200 pt-5">
        <p className="text-xl font-extrabold">더 물어볼래요?</p>
        <div className="flex flex-wrap gap-2.5">
          {QUICK_QUESTIONS.map((quick) => (
            <Button
              key={quick}
              variant="secondary"
              size="lg"
              className="rounded-full text-xl"
              disabled={busy}
              onClick={() => ask(quick)}
            >
              {quick}
            </Button>
          ))}
        </div>
        {voice.supported && (
          <div className="flex flex-col gap-2">
            <Button
              variant={voice.listening ? "primary" : "secondary"}
              size="lg"
              className="text-xl"
              disabled={busy}
              aria-pressed={voice.listening}
              onClick={toggleVoice}
            >
              {voice.listening ? (
                <MicOff aria-hidden className="size-7" />
              ) : (
                <Mic aria-hidden className="size-7" />
              )}
              {voice.listening ? "그만 듣기" : "말로 물어보기"}
            </Button>
            {voice.listening && (
              <p
                role="status"
                className="flex items-center gap-2.5 text-xl font-bold text-brand-800"
              >
                <span aria-hidden className="relative flex size-3">
                  <span className="absolute inset-0 animate-ring rounded-full bg-brand-500" />
                  <span className="relative size-3 rounded-full bg-brand-600" />
                </span>
                듣고 있어요. 지금 말해요.
              </p>
            )}
            {voice.error && !voice.listening && (
              <p role="alert" className="text-xl font-semibold text-stone-800">
                {VOICE_ERRORS[voice.error]}
              </p>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <input
            className="min-h-14 w-full rounded-2xl border border-stone-300 bg-white px-4 text-xl transition-colors placeholder:text-stone-500 hover:border-stone-400 focus:border-brand-600"
            value={question}
            maxLength={QUESTION_MAX_LENGTH}
            disabled={busy}
            placeholder="궁금한 것을 써요"
            aria-label="궁금한 것 쓰기"
            onChange={(event) => setQuestion(event.target.value)}
          />
          <Button
            type="submit"
            size="lg"
            className="shrink-0 px-5"
            disabled={busy || !question.trim()}
            aria-label="물어보기"
          >
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
