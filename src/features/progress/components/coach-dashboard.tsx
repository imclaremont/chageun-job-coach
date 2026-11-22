"use client";

import {
  BellRing,
  CircleCheck,
  Footprints,
  History,
  MessagesSquare,
  Siren,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ErrorBlock, LoadingBlock } from "@/shared/ui/feedback";
import { errorMessage, postJson } from "@/shared/util/api-client";
import { useApi } from "@/shared/util/use-api";
import type { DashboardResponse, HelpRequest, RunProgressItem } from "../schema";

// 화면 갱신 주기
const REFRESH_MS = 5_000;

// AI가 쓴 도구의 화면 표시 이름
const TOOL_LABELS: Record<string, string> = {
  get_step: "단계 확인",
  search_manual: "원문 찾기",
  split_into_small_steps: "작게 나누기",
  call_coach: "사람 부르기",
  answer_worker: "답변",
};

function toolLabel(entry: string): string {
  const retry = entry.endsWith("(다시)");
  const name = retry ? entry.slice(0, -"(다시)".length) : entry;
  const label = TOOL_LABELS[name] ?? name;
  return retry ? `${label} 점검 탈락` : label;
}

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}시간 전` : `${Math.floor(hours / 24)}일 전`;
}

type Tone = "brand" | "amber" | "violet" | "red";
const TILE_TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  amber: "bg-amber-100 text-amber-800",
  violet: "bg-violet-100 text-violet-800",
  red: "bg-red-100 text-red-700",
};

function Tile({
  icon,
  label,
  value,
  tone = "brand",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone?: Tone;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-card ring-1 ring-stone-900/5">
      <span className="flex items-center gap-2.5 text-sm font-semibold text-stone-600">
        <span
          aria-hidden
          className={`flex size-9 items-center justify-center rounded-xl ${TILE_TONES[tone]}`}
        >
          {icon}
        </span>
        {label}
      </span>
      <span className="text-4xl font-extrabold tabular-nums">{value}</span>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-stone-900/5 sm:p-6">
      <h3 className="flex items-center gap-2.5 text-lg font-extrabold">
        <span aria-hidden className="text-stone-500">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

const Empty = ({ children }: { children: ReactNode }) => (
  <p className="rounded-2xl bg-stone-100/70 px-4 py-6 text-center text-base text-stone-600">
    {children}
  </p>
);

// 이름 첫 글자 표시
const Initial = ({ name }: { name: string }) => (
  <span
    aria-hidden
    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-extrabold text-brand-800"
  >
    {name.slice(0, 1)}
  </span>
);

function ProgressRow({ run }: { run: RunProgressItem }) {
  const percent = run.totalSteps === 0 ? 0 : Math.round((run.doneSteps / run.totalSteps) * 100);
  return (
    <li className="flex items-center gap-3">
      <Initial name={run.workerName} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-base">
          <span>
            <span className="font-bold">{run.workerName}</span> · {run.guideTitle}
          </span>
          <span className="text-sm text-stone-600 tabular-nums">
            {run.doneSteps}/{run.totalSteps}단계 · 도움 {run.helpTotal}회 · {timeAgo(run.updatedAt)}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`${run.workerName} 진행 정도`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-2 overflow-hidden rounded-full bg-stone-200"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </li>
  );
}

// 코치 대시보드: 진행 상황, 사람 호출, 자주 막히는 단계, AI 코칭 기록
export function CoachDashboard() {
  const { data, error, loading, reload } = useApi<DashboardResponse>("/api/dashboard", {
    refreshMs: REFRESH_MS,
  });
  const [resolving, setResolving] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function resolve(help: HelpRequest) {
    setResolving(help.id);
    setActionError(null);
    try {
      await postJson(`/api/help/${help.id}/resolve`);
      reload();
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setResolving(null);
    }
  }

  if (loading && !data) return <LoadingBlock label="현황을 불러오는 중이에요" />;
  if (!data) return <ErrorBlock message={error ?? "현황을 불러오지 못했어요"} onRetry={reload} />;

  const { summary, openHelp, activeRuns, recentDone, stuckSteps, recentCoaching } = data;
  const hasUrgent = openHelp.some((help) => help.urgent);

  return (
    <section aria-labelledby="dashboard-title" className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <h2 id="dashboard-title" className="text-2xl font-extrabold">
          오늘의 현황
        </h2>
        <span className="flex items-center gap-1.5 text-sm text-stone-600">
          <span aria-hidden className="size-2 rounded-full bg-brand-500" />
          5초마다 새로 고쳐요
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          icon={<Footprints className="size-5" />}
          label="일하는 중"
          value={summary.activeCount}
        />
        <Tile
          icon={<CircleCheck className="size-5" />}
          label="오늘 끝낸 일"
          value={summary.doneTodayCount}
        />
        <Tile
          icon={hasUrgent ? <Siren className="size-5" /> : <BellRing className="size-5" />}
          label="사람 호출 대기"
          value={summary.openHelpCount}
          tone={hasUrgent ? "red" : "amber"}
        />
        <Tile
          icon={<Sparkles className="size-5" />}
          label="오늘 AI 코칭"
          value={summary.aiHelpTodayCount}
          tone="violet"
        />
      </div>

      {openHelp.length > 0 && (
        <section
          aria-label="사람 호출"
          className="flex flex-col gap-4 rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-300 sm:p-6"
        >
          <h3 className="flex flex-wrap items-center gap-2.5 text-lg font-extrabold text-amber-950">
            <BellRing aria-hidden className="size-6" />
            선생님을 찾고 있어요
            <Badge tone="amber">{openHelp.length}건</Badge>
          </h3>
          {actionError && (
            <p role="alert" className="text-base text-red-800">
              {actionError}
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {openHelp.map((help) => (
              <li
                key={help.id}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 ${
                  help.urgent ? "ring-2 ring-red-500" : "ring-1 ring-stone-900/5"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Initial name={help.workerName} />
                  <div className="flex min-w-0 flex-col gap-1 text-base">
                    {help.urgent && (
                      <span className="self-start">
                        <Badge tone="red" icon={<Siren aria-hidden className="size-4" />}>
                          긴급 · 다쳤다고 알렸어요
                        </Badge>
                      </span>
                    )}
                    <span>
                      <span className="font-bold">{help.workerName}</span> · {help.guideTitle}{" "}
                      {help.stepNumber}번 단계
                    </span>
                    <span className="text-stone-700">&ldquo;{help.stepAction}&rdquo;</span>
                    {help.question && (
                      <span>
                        <span className="font-semibold">근로자의 말</span> {help.question}
                      </span>
                    )}
                    <span className="text-sm text-stone-600">
                      {help.reason} · {timeAgo(help.createdAt)}
                    </span>
                  </div>
                </div>
                <Button disabled={resolving === help.id} onClick={() => resolve(help)}>
                  <CircleCheck aria-hidden className="size-5" />
                  확인했어요
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="지금 일하는 중" icon={<Footprints className="size-5" />}>
          {activeRuns.length === 0 ? (
            <Empty>지금 일하는 근로자가 없어요.</Empty>
          ) : (
            <ul className="flex flex-col gap-4">
              {activeRuns.map((run) => (
                <ProgressRow key={run.runId} run={run} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="자주 막히는 단계" icon={<TrendingDown className="size-5" />}>
          {stuckSteps.length === 0 ? (
            <Empty>아직 도움 요청이 없어요.</Empty>
          ) : (
            <ol className="flex flex-col gap-3">
              {stuckSteps.map((step, index) => (
                <li
                  key={`${step.guideId}-${step.stepNumber}`}
                  className="flex items-center gap-3 text-base"
                >
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-extrabold text-amber-900 tabular-nums"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    {step.guideTitle} {step.stepNumber}번 &ldquo;{step.stepAction}&rdquo;
                    <span className="text-stone-600"> · 도움 {step.helpCount}회</span>
                  </span>
                  <Link
                    href={`/coach/guides/${step.guideId}`}
                    className="shrink-0 rounded-lg text-sm font-bold text-brand-700 underline underline-offset-4 hover:text-brand-900"
                  >
                    가이드 고치기
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="최근 AI 코칭" icon={<MessagesSquare className="size-5" />}>
          {recentCoaching.length === 0 ? (
            <Empty>아직 AI 코칭 기록이 없어요.</Empty>
          ) : (
            <ul className="flex flex-col gap-5">
              {recentCoaching.map((help) => (
                <li
                  key={help.id}
                  className="flex flex-col gap-2 border-b border-stone-200/70 pb-5 text-base last:border-0 last:pb-0"
                >
                  <span className="text-sm text-stone-600">
                    {help.workerName} · {help.guideTitle} {help.stepNumber}번 ·{" "}
                    {timeAgo(help.createdAt)}
                  </span>
                  <p className="max-w-[90%] self-end rounded-2xl rounded-tr-md bg-brand-700 px-3.5 py-2 text-white">
                    <span className="sr-only">물음 </span>
                    {help.question ?? "'잘 모르겠어요' 버튼"}
                  </p>
                  <p className="max-w-[90%] self-start rounded-2xl rounded-tl-md bg-stone-100 px-3.5 py-2">
                    <span className="sr-only">답 </span>
                    {help.answer}
                  </p>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {help.trace.length === 0 ? (
                      <span className="rounded-full bg-stone-200/70 px-2 py-0.5 text-xs font-semibold text-stone-700">
                        승인된 단계로 대체
                      </span>
                    ) : (
                      help.trace.map((entry, index) => (
                        <span
                          key={`${index}-${entry}`}
                          className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800"
                        >
                          {toolLabel(entry)}
                        </span>
                      ))
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="최근 끝낸 일" icon={<History className="size-5" />}>
          {recentDone.length === 0 ? (
            <Empty>아직 끝낸 일이 없어요.</Empty>
          ) : (
            <ul className="flex flex-col gap-4">
              {recentDone.map((run) => (
                <ProgressRow key={run.runId} run={run} />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </section>
  );
}
