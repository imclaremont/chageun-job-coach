"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { GuideSummaryResponse } from "@/features/guide";
import { Button } from "@/shared/ui/button";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/ui/feedback";
import { useApi } from "@/shared/util/use-api";
import { WORKERS } from "../workers";
import { selectWorker, useCurrentWorker } from "./worker-store";

// 근로자 첫 화면: 이름 고르기 → 오늘 할 일 고르기
export function WorkHome() {
  const worker = useCurrentWorker();

  if (worker === undefined) return <LoadingBlock label="준비하고 있어요" />;

  if (worker === null) {
    return (
      <section className="flex flex-col gap-8">
        <h1 className="text-4xl font-bold leading-snug">누가 일하나요?</h1>
        <p className="text-2xl text-stone-700">내 이름을 눌러요.</p>
        <ul className="flex flex-col gap-4">
          {WORKERS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => selectWorker(item.id)}
                className="flex min-h-24 w-full items-center gap-5 rounded-3xl bg-white px-6 text-left text-3xl font-bold shadow-sm ring-1 ring-stone-300 transition-colors hover:bg-teal-50"
              >
                <span aria-hidden className="text-5xl">
                  {item.emoji}
                </span>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="text-lg text-stone-600">시연용 가상 이름이에요.</p>
      </section>
    );
  }

  return <TaskList workerName={worker.name} />;
}

function TaskList({ workerName }: { workerName: string }) {
  const { data, error, loading, reload } =
    useApi<GuideSummaryResponse[]>("/api/guides?view=worker");

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold leading-snug">{workerName} 님, 안녕하세요</h1>
        <p className="text-2xl text-stone-700">오늘 할 일을 눌러요.</p>
      </div>

      {loading && <LoadingBlock label="할 일을 가져오고 있어요" />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyBlock>아직 할 일이 없어요. 선생님에게 물어봐요.</EmptyBlock>}

      <ul className="flex flex-col gap-4">
        {data?.map((guide) => (
          <li key={guide.id}>
            <Link
              href={`/work/${guide.id}`}
              className="flex min-h-28 items-center justify-between gap-4 rounded-3xl bg-teal-700 px-6 py-5 text-white shadow-sm transition-colors hover:bg-teal-800"
            >
              <span className="flex flex-col gap-1">
                <span className="text-3xl font-bold leading-snug">{guide.title}</span>
                <span className="text-xl text-teal-50">모두 {guide.stepCount}단계예요</span>
              </span>
              <ChevronRight aria-hidden className="size-10 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>

      <Button variant="ghost" size="lg" className="self-start" onClick={() => selectWorker(null)}>
        {workerName} 님이 아니에요
      </Button>
    </section>
  );
}
