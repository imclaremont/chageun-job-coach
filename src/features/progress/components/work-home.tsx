"use client";

import { ArrowRight, ListChecks, UserRound } from "lucide-react";
import Link from "next/link";
import type { GuideSummaryResponse } from "@/features/guide";
import { Button } from "@/shared/ui/button";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/ui/feedback";
import { useApi } from "@/shared/util/use-api";
import { WORKERS } from "../workers";
import { selectWorker, useCurrentWorker } from "./worker-store";

// 크게 누를 수 있는 선택 카드 공통 모양
const CHOICE_CARD =
  "group flex w-full items-center gap-5 rounded-[1.75rem] bg-white p-4 pr-5 text-left shadow-card ring-1 ring-stone-900/5 transition-[box-shadow,transform] duration-150 hover:shadow-raised active:scale-[0.99]";
const CHOICE_ARROW =
  "flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition-transform duration-150 group-hover:translate-x-0.5";

// 근로자 첫 화면: 이름 고르기 → 오늘 할 일 고르기
export function WorkHome() {
  const worker = useCurrentWorker();

  if (worker === undefined) return <LoadingBlock label="준비하고 있어요" />;

  if (worker === null) {
    return (
      <section className="flex animate-rise flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl leading-snug font-extrabold">누가 일하나요?</h1>
          <p className="text-2xl text-stone-700">내 이름을 눌러요.</p>
        </div>
        <ul className="flex flex-col gap-4">
          {WORKERS.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => selectWorker(item.id)} className={CHOICE_CARD}>
                <span
                  aria-hidden
                  className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-brand-50 text-5xl"
                >
                  {item.emoji}
                </span>
                <span className="flex-1 text-3xl font-extrabold">{item.name}</span>
                <span aria-hidden className={CHOICE_ARROW}>
                  <ArrowRight className="size-7" />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xl text-stone-600">연습용으로 만든 이름이에요.</p>
      </section>
    );
  }

  return <TaskList workerName={worker.name} workerEmoji={worker.emoji} />;
}

function TaskList({ workerName, workerEmoji }: { workerName: string; workerEmoji: string }) {
  const { data, error, loading, reload } =
    useApi<GuideSummaryResponse[]>("/api/guides?view=worker");

  return (
    <section className="flex animate-rise flex-col gap-8">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-white text-5xl shadow-card ring-1 ring-stone-900/5"
        >
          {workerEmoji}
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl leading-snug font-extrabold">{workerName} 님, 안녕하세요</h1>
          <p className="text-2xl text-stone-700">오늘 할 일을 눌러요.</p>
        </div>
      </div>

      {loading && <LoadingBlock label="할 일을 가져오고 있어요" />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyBlock>아직 할 일이 없어요. 선생님에게 물어봐요.</EmptyBlock>}

      <ul className="flex flex-col gap-4">
        {data?.map((guide) => (
          <li key={guide.id}>
            <Link href={`/work/${guide.id}`} className={CHOICE_CARD}>
              <span
                aria-hidden
                className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-brand-50 text-brand-700 sm:size-20"
              >
                <ListChecks className="size-9 sm:size-10" />
              </span>
              <span className="flex flex-1 flex-col gap-1">
                <span className="text-2xl leading-snug font-extrabold sm:text-3xl">
                  {guide.title}
                </span>
                <span className="text-xl text-stone-600">모두 {guide.stepCount}단계예요</span>
              </span>
              <span aria-hidden className={CHOICE_ARROW}>
                <ArrowRight className="size-7" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Button variant="ghost" size="lg" className="self-start" onClick={() => selectWorker(null)}>
        <UserRound aria-hidden className="size-6" />
        {workerName} 님이 아니에요
      </Button>
    </section>
  );
}
