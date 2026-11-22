"use client";

import {
  Bandage,
  Check,
  CircleHelp,
  House,
  ListPlus,
  TriangleAlert,
  Volume2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CoachingResponse } from "@/features/coaching";
import {
  HelpPanel,
  UrgentNotice,
  type HelpState,
  type UrgentStatus,
} from "@/features/coaching/components";
import type { WorkerGuideResponse } from "@/features/guide";
import { Button, LinkButton } from "@/shared/ui/button";
import { errorMessage, postJson } from "@/shared/util/api-client";
import { canSpeak, speak, stopSpeaking } from "@/shared/util/speech";
import type { RunResponse } from "../schema";

type Props = { initialRun: RunResponse; guide: WorkerGuideResponse };

// 좁은 화면에서도 글자가 한 줄에 들어가도록 아이콘을 위에 배치
const STACKED_BUTTON = "flex-col gap-1 px-3 py-3 whitespace-nowrap max-sm:text-xl";
// 단계 수가 이보다 많으면 칸 대신 이어진 막대로 표시
const SEGMENT_LIMIT = 16;

// 진행 정도: 끝낸 단계는 진하게, 지금 단계는 연하게
function ProgressTrack({ index, total }: { index: number; total: number }) {
  return (
    <div
      role="progressbar"
      aria-label="진행 정도"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={index}
      className="flex-1"
    >
      {total <= SEGMENT_LIMIT ? (
        <div className="flex gap-1">
          {Array.from({ length: total }, (_, position) => (
            <span
              key={position}
              className={`h-3 flex-1 rounded-full transition-colors duration-300 ${
                position < index
                  ? "bg-brand-600"
                  : position === index
                    ? "bg-brand-300"
                    : "bg-stone-300/70"
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="h-3 overflow-hidden rounded-full bg-stone-300/70">
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// 단계 수행 화면: 한 화면에 한 단계, 아래 고정 버튼은 '다쳤어요'와 주요 버튼 두 개
export function RunSession({ initialRun, guide }: Props) {
  const [run, setRun] = useState(initialRun);
  const [help, setHelp] = useState<HelpState | null>(null);
  const [coachCalled, setCoachCalled] = useState(false);
  const [urgent, setUrgent] = useState<UrgentStatus | null>(null);
  const [showDetail, setShowDetail] = useState(initialRun.mode === "full");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = guide.steps.length;
  const index = Math.min(run.currentIndex, total - 1);
  const step = guide.steps[index];
  const number = index + 1;

  if (run.status === "done") {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div className="relative flex size-40 items-center justify-center">
          <span aria-hidden className="absolute inset-0 rounded-full bg-brand-100" />
          <span aria-hidden className="absolute inset-5 animate-pop rounded-full bg-brand-700" />
          <Check aria-hidden strokeWidth={3} className="relative size-16 animate-pop text-white" />
        </div>
        <h1 className="text-5xl leading-snug font-extrabold">다 했어요!</h1>
        <p className="text-2xl leading-relaxed text-stone-700">
          {guide.title}
          <br />
          {total}단계를 모두 끝냈어요.
          <br />
          정말 잘했어요.
        </p>
        <LinkButton href="/work" size="xl" className="w-full max-w-md">
          <House aria-hidden className="size-8" />
          처음으로
        </LinkButton>
      </section>
    );
  }

  async function complete() {
    setSaving(true);
    setError(null);
    stopSpeaking();
    try {
      const updated = await postJson<RunResponse>(`/api/runs/${run.id}/steps/${step.id}/done`);
      setRun(updated);
      setHelp(null);
      setCoachCalled(false);
      setShowDetail(run.mode === "full");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function askHelp(question?: string) {
    setHelp({ status: "loading" });
    setShowDetail(true);
    // 도움말이 화면에 보이도록 이동
    requestAnimationFrame(() =>
      document.getElementById("help-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
    try {
      const reply = await postJson<CoachingResponse>(`/api/runs/${run.id}/help`, {
        stepId: step.id,
        question,
      });
      // 다쳤거나 아프다는 말이면 도움말 대신 기다림 안내
      if (reply.urgent) {
        setHelp(null);
        setUrgent("called");
        return;
      }
      setHelp({ status: "ready", reply });
      if (reply.coachCalled) setCoachCalled(true);
    } catch (caught) {
      setHelp({ status: "error", message: errorMessage(caught) });
    }
  }

  async function callCoach() {
    setCoachCalled(true);
    try {
      await postJson(`/api/runs/${run.id}/call-coach`, { stepId: step.id });
    } catch (caught) {
      setCoachCalled(false);
      setError(errorMessage(caught));
    }
  }

  // '다쳤어요': AI 없이 바로 사람 호출
  async function reportHurt() {
    stopSpeaking();
    setHelp(null);
    setError(null);
    setUrgent("called");
    try {
      await postJson(`/api/runs/${run.id}/call-coach`, { stepId: step.id, reason: "hurt" });
    } catch {
      setUrgent("failed");
    }
  }

  if (urgent) {
    return <UrgentNotice status={urgent} onRetry={reportHurt} onResume={() => setUrgent(null)} />;
  }

  const readAloud = () =>
    speak(
      [step.action, step.detail, step.caution ? `조심해요. ${step.caution}` : ""]
        .filter(Boolean)
        .join(". "),
    );

  return (
    <div className="flex flex-1 flex-col gap-5 pb-60">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-extrabold tabular-nums">
          {number}
          <span className="font-bold text-stone-600"> / {total}</span>
        </span>
        <ProgressTrack index={index} total={total} />
        <Link
          href="/work"
          aria-label="그만하기"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-stone-700 shadow-card ring-1 ring-stone-900/5 transition-colors hover:bg-stone-100"
        >
          <X aria-hidden className="size-6" />
        </Link>
      </div>

      <article
        key={step.id}
        className="flex animate-rise flex-col gap-5 rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-stone-900/5 sm:p-8"
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex size-24 shrink-0 items-center justify-center rounded-[1.75rem] bg-brand-50 text-6xl leading-none"
          >
            {step.emoji}
          </span>
          <p className="text-xl font-bold text-brand-700">지금 할 일</p>
        </div>

        <h1 className="text-4xl leading-snug font-extrabold">{step.action}</h1>

        {showDetail && step.detail && (
          <p className="text-2xl leading-relaxed text-stone-800">{step.detail}</p>
        )}

        {step.caution && (
          <div className="flex flex-col gap-1 rounded-3xl bg-amber-100 p-5 ring-1 ring-amber-300/70">
            <p className="flex items-center gap-2 text-xl font-extrabold text-amber-900">
              <TriangleAlert aria-hidden className="size-7 shrink-0" />
              조심해요
            </p>
            <p className="text-2xl leading-relaxed font-semibold text-amber-950">{step.caution}</p>
          </div>
        )}

        {showDetail && step.doneCheck && (
          <div className="flex flex-col gap-1 rounded-3xl bg-stone-100 p-5">
            <p className="text-xl font-bold text-stone-600">이렇게 되면 끝이에요</p>
            <p className="flex items-start gap-2.5 text-2xl leading-relaxed text-stone-900">
              <Check
                aria-hidden
                strokeWidth={3}
                className="mt-1.5 size-6 shrink-0 text-brand-600"
              />
              {step.doneCheck}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {canSpeak() && (
            <Button variant="secondary" size="lg" className="text-xl" onClick={readAloud}>
              <Volume2 aria-hidden className="size-7" />
              읽어 주기
            </Button>
          )}
          {!showDetail && step.detail && (
            <Button
              variant="secondary"
              size="lg"
              className="text-xl"
              onClick={() => setShowDetail(true)}
            >
              <ListPlus aria-hidden className="size-7" />
              자세히 보기
            </Button>
          )}
        </div>
      </article>

      {help && (
        <HelpPanel
          help={help}
          coachCalled={coachCalled}
          onAsk={askHelp}
          onCallCoach={callCoach}
          onClose={() => setHelp(null)}
        />
      )}

      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-red-50 p-4 text-xl text-red-900 ring-1 ring-red-200"
        >
          {error}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-900/10 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2.5 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <Button variant="danger" size="lg" className="text-xl" onClick={reportHurt}>
            <Bandage aria-hidden className="size-7" />
            다쳤어요
          </Button>
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              size="xl"
              className={STACKED_BUTTON}
              disabled={saving || help?.status === "loading"}
              onClick={() => askHelp()}
            >
              <CircleHelp aria-hidden className="size-8" />
              <span>잘 모르겠어요</span>
            </Button>
            <Button size="xl" className={STACKED_BUTTON} disabled={saving} onClick={complete}>
              <Check aria-hidden strokeWidth={3} className="size-8" />
              <span>다 했어요</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
