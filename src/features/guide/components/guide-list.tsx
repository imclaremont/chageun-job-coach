"use client";

import { ChevronRight, CircleCheck, FilePen, ListChecks, Plus, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { LinkButton } from "@/shared/ui/button";
import { ErrorBlock, LoadingBlock } from "@/shared/ui/feedback";
import { useApi } from "@/shared/util/use-api";
import type { GuideSummaryResponse } from "../schema";

function StatusBadge({ status }: { status: GuideSummaryResponse["status"] }) {
  return status === "approved" ? (
    <Badge tone="brand" icon={<CircleCheck aria-hidden className="size-4" />}>
      승인됨
    </Badge>
  ) : (
    <Badge icon={<FilePen aria-hidden className="size-4" />}>검수 필요</Badge>
  );
}

// 코치 홈의 가이드 목록
export function GuideList() {
  const { data, error, loading, reload } = useApi<GuideSummaryResponse[]>("/api/guides");

  return (
    <section aria-labelledby="guide-list-title" className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <h2 id="guide-list-title" className="text-2xl font-extrabold">
          업무 가이드
        </h2>
        {data && <span className="text-base text-stone-600 tabular-nums">{data.length}개</span>}
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data?.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-stone-300 bg-white/50 p-10 text-center">
          <p className="text-lg text-stone-600">
            아직 가이드가 없어요. 매뉴얼을 넣어 첫 가이드를 만들어 보세요.
          </p>
          <LinkButton href="/coach/guides/new">
            <Plus aria-hidden className="size-5" />새 가이드 만들기
          </LinkButton>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {data?.map((guide) => (
          <li key={guide.id}>
            <Link
              href={`/coach/guides/${guide.id}`}
              className="group flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card ring-1 ring-stone-900/5 transition-shadow duration-150 hover:shadow-raised sm:p-5"
            >
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"
              >
                <ListChecks className="size-6" />
              </span>
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold">{guide.title}</span>
                  <StatusBadge status={guide.status} />
                  {guide.isSample && <Badge tone="amber">기본 제공</Badge>}
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-stone-600">
                  {guide.workplace && <span>{guide.workplace}</span>}
                  <span className="tabular-nums">단계 {guide.stepCount}개</span>
                  {guide.issueCount > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                      <TriangleAlert aria-hidden className="size-4" />
                      확인 필요 {guide.issueCount}건
                    </span>
                  )}
                </span>
              </span>
              <ChevronRight
                aria-hidden
                className="size-6 shrink-0 text-stone-500 transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
