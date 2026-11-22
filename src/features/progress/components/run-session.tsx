"use client";

import { Bandage, Check, CircleHelp, PartyPopper, TriangleAlert, Volume2, X } from "lucide-react";
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
const STACKED_BUTTON = "flex-col gap-1 py-3 whitespace-nowrap max-sm:text-xl";

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
        <PartyPopper aria-hidden className="size-24 text-teal-700" />
        <h1 className="text-5xl font-bold leading-snug">다 했어요!</h1>
        <p className="text-2xl leading-relaxed text-stone-700">
          {guide.title}
          <br />
          {total}단계를 모두 끝냈어요. 정말 잘했어요.
        </p>
        <LinkButton href="/work" size="xl" className="w-full max-w-md">
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
    <div className="flex flex-1 flex-col gap-6 pb-56">
      <div className="flex items-center gap-4">
        <div
          role="progressbar"
          aria-label="진행 정도"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index}
          className="h-4 flex-1 overflow-hidden rounded-full bg-stone-200"
        >
          <div
            className="h-full rounded-full bg-teal-600 transition-[width]"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
        <span className="text-2xl font-bold tabular-nums">
          {number} / {total}
        </span>
        <Link
          href="/work"
          aria-label="그만하기"
          className="flex size-12 items-center justify-center rounded-full text-stone-600 hover:bg-stone-200"
        >
          <X aria-hidden className="size-7" />
        </Link>
      </div>

      <article className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8">
        <p className="text-xl font-semibold text-teal-800">지금 할 일</p>
        <div className="flex items-center gap-5">
          <span aria-hidden className="text-7xl leading-none">
            {step.emoji}
          </span>
          <h1 className="text-4xl font-bold leading-snug">{step.action}</h1>
        </div>

        {showDetail && step.detail && (
          <p className="text-2xl leading-relaxed text-stone-800">{step.detail}</p>
        )}

        {step.caution && (
          <p className="flex items-start gap-3 rounded-2xl bg-amber-100 p-4 text-2xl font-semibold leading-relaxed text-amber-950">
            <TriangleAlert aria-hidden className="mt-1 size-8 shrink-0" />
            <span>
              <span className="sr-only">조심해요. </span>
              {step.caution}
            </span>
          </p>
        )}

        {showDetail && step.doneCheck && (
          <p className="flex flex-col gap-1 rounded-2xl bg-stone-100 p-4 text-xl text-stone-800">
            <span className="text-base font-semibold text-stone-600">이렇게 되면 끝이에요</span>
            <span className="flex items-center gap-2">
              <Check aria-hidden className="size-6 shrink-0 text-teal-700" />
              {step.doneCheck}
            </span>
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {canSpeak() && (
            <Button variant="secondary" size="lg" onClick={readAloud}>
              <Volume2 aria-hidden className="size-7" />
              읽어 주기
            </Button>
          )}
          {!showDetail && step.detail && (
            <Button variant="secondary" size="lg" onClick={() => setShowDetail(true)}>
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
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-xl text-red-800">
          {error}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4">
          <Button variant="danger" size="lg" className="text-xl" onClick={reportHurt}>
            <Bandage aria-hidden className="size-7" />
            다쳤어요
          </Button>
          <div className="grid grid-cols-2 gap-3">
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
              <Check aria-hidden className="size-8" />
              <span>다 했어요</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
