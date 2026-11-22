"use client";

import { RotateCw, Siren, ThumbsUp } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { speak, stopSpeaking } from "@/shared/util/speech";

export type UrgentStatus = "called" | "failed";

type Props = {
  status: UrgentStatus;
  onRetry: () => void;
  onResume: () => void;
};

const COPY: Record<UrgentStatus, { title: string; lines: string[] }> = {
  called: { title: "선생님을 불렀어요", lines: ["하던 일을 멈춰요.", "그 자리에서 기다려요."] },
  failed: { title: "선생님을 못 불렀어요", lines: ["큰 소리로 선생님을 불러요."] },
};

// 다쳤다고 알린 뒤의 화면: 할 일 하나만 크게 안내하고 소리로도 읽어 줌
export function UrgentNotice({ status, onRetry, onResume }: Props) {
  const { title, lines } = COPY[status];

  useEffect(() => {
    speak([title, ...lines].join(" "));
    return stopSpeaking;
  }, [title, lines]);

  return (
    <section
      role="alert"
      className="flex flex-1 animate-rise flex-col items-center justify-center gap-8 rounded-[2rem] bg-red-50 px-6 py-10 text-center ring-1 ring-red-200"
    >
      <div className="relative flex size-36 items-center justify-center">
        {status === "called" && (
          <span aria-hidden className="absolute inset-3 animate-ring rounded-full bg-red-400" />
        )}
        <span aria-hidden className="absolute inset-3 rounded-full bg-red-600" />
        <Siren aria-hidden className="relative size-16 text-white" />
      </div>
      <h1 className="text-4xl leading-snug font-extrabold text-red-950 sm:text-5xl">{title}</h1>
      <p className="text-3xl leading-relaxed font-semibold text-stone-900">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
      <div className="flex w-full max-w-md flex-col gap-3">
        {status === "failed" && (
          <Button size="xl" onClick={onRetry}>
            <RotateCw aria-hidden className="size-8" />
            다시 부르기
          </Button>
        )}
        <Button variant="secondary" size="xl" onClick={onResume}>
          <ThumbsUp aria-hidden className="size-8" />
          이제 괜찮아요
        </Button>
      </div>
    </section>
  );
}
