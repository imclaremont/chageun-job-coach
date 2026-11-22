"use client";

import { BellRing, CircleCheck, Footprints, Sparkles, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
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

function Tile({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      {icon}
      <div className="flex flex-col">
        <span className="text-sm text-stone-600">{label}</span>
        <span className="text-2xl font-bold tabular-nums">{value}</span>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <h3 className="text-lg font-bold">{title}</h3>
      {children}
    </section>
  );
}

const Empty = ({ children }: { children: ReactNode }) => (
  <p className="text-base text-stone-500">{children}</p>
);

function ProgressRow({ run }: { run: RunProgressItem }) {
  const percent = run.totalSteps === 0 ? 0 : Math.round((run.doneSteps / run.totalSteps) * 100);
  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-base">
        <span>
          <span className="font-semibold">{run.workerName}</span> · {run.guideTitle}
        </span>
        <span className="text-sm text-stone-600">
          {run.doneSteps} / {run.totalSteps}단계 · 도움 {run.helpTotal}회 · {timeAgo(run.updatedAt)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${run.workerName} 진행 정도`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2.5 overflow-hidden rounded-full bg-stone-200"
      >
        <div className="h-full rounded-full bg-teal-600" style={{ width: `${percent}%` }} />
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

  return (
    <section aria-labelledby="dashboard-title" className="flex flex-col gap-4">
      <h2 id="dashboard-title" className="text-2xl font-bold">
        오늘의 현황
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile
          icon={<Footprints aria-hidden className="size-7 text-teal-700" />}
          label="일하는 중"
          value={summary.activeCount}
        />
        <Tile
          icon={<CircleCheck aria-hidden className="size-7 text-teal-700" />}
          label="오늘 끝낸 일"
          value={summary.doneTodayCount}
        />
        <Tile
          icon={<BellRing aria-hidden className="size-7 text-amber-700" />}
          label="사람 호출 대기"
          value={summary.openHelpCount}
        />
        <Tile
          icon={<Sparkles aria-hidden className="size-7 text-violet-700" />}
          label="오늘 AI 코칭"
          value={summary.aiHelpTodayCount}
        />
      </div>

      {openHelp.length > 0 && (
        <section
          aria-label="사람 호출"
          className="flex flex-col gap-3 rounded-2xl bg-amber-100 p-5 ring-1 ring-amber-300"
        >
          <h3 className="flex items-center gap-2 text-lg font-bold text-amber-950">
            <BellRing aria-hidden className="size-6" />
            선생님을 찾고 있어요
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
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4"
              >
                <div className="flex flex-col gap-1 text-base">
                  <span>
                    <span className="font-semibold">{help.workerName}</span> · {help.guideTitle}{" "}
                    {help.stepNumber}번 단계
                  </span>
                  <span className="text-stone-700">&ldquo;{help.stepAction}&rdquo;</span>
                  <span className="text-sm text-stone-600">
                    {help.reason} · {timeAgo(help.createdAt)}
                  </span>
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
        <Panel title="지금 일하는 중">
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

        <Panel title="자주 막히는 단계">
          {stuckSteps.length === 0 ? (
            <Empty>아직 도움 요청이 없어요.</Empty>
          ) : (
            <ul className="flex flex-col gap-3">
              {stuckSteps.map((step) => (
                <li
                  key={`${step.guideId}-${step.stepNumber}`}
                  className="flex items-center justify-between gap-3 text-base"
                >
                  <span className="flex items-start gap-2">
                    <TrendingDown aria-hidden className="mt-0.5 size-5 shrink-0 text-amber-700" />
                    <span>
                      {step.guideTitle} {step.stepNumber}번 &ldquo;{step.stepAction}&rdquo;
                      <span className="text-stone-600"> · 도움 {step.helpCount}회</span>
                    </span>
                  </span>
                  <Link
                    href={`/coach/guides/${step.guideId}`}
                    className="shrink-0 text-sm font-semibold text-teal-800 underline underline-offset-4"
                  >
                    가이드 고치기
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="최근 AI 코칭">
          {recentCoaching.length === 0 ? (
            <Empty>아직 AI 코칭 기록이 없어요.</Empty>
          ) : (
            <ul className="flex flex-col gap-4">
              {recentCoaching.map((help) => (
                <li
                  key={help.id}
                  className="flex flex-col gap-1.5 border-b border-stone-100 pb-3 text-base last:border-0 last:pb-0"
                >
                  <span className="text-sm text-stone-600">
                    {help.workerName} · {help.guideTitle} {help.stepNumber}번 ·{" "}
                    {timeAgo(help.createdAt)}
                  </span>
                  <span>
                    <span className="font-semibold">물음</span>{" "}
                    {help.question ?? "'잘 모르겠어요' 버튼"}
                  </span>
                  <span>
                    <span className="font-semibold">답</span> {help.answer}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {help.trace.length === 0 ? (
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700">
                        승인된 단계로 대체
                      </span>
                    ) : (
                      help.trace.map((entry, index) => (
                        <span
                          key={`${index}-${entry}`}
                          className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800"
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

        <Panel title="최근 끝낸 일">
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
