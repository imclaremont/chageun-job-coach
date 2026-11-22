"use client";

import { ChevronRight, CircleCheck, FilePen, Plus, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/shared/ui/button";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/ui/feedback";
import { useApi } from "@/shared/util/use-api";
import type { GuideSummaryResponse } from "../schema";

function StatusBadge({ status }: { status: GuideSummaryResponse["status"] }) {
  return status === "approved" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-sm font-medium text-teal-800">
      <CircleCheck aria-hidden className="size-4" />
      승인됨
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-1 text-sm font-medium text-stone-700">
      <FilePen aria-hidden className="size-4" />
      검수 필요
    </span>
  );
}

// 코치 홈의 가이드 목록
export function GuideList() {
  const { data, error, loading, reload } = useApi<GuideSummaryResponse[]>("/api/guides");

  return (
    <section aria-labelledby="guide-list-title" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="guide-list-title" className="text-2xl font-bold">
          업무 가이드
        </h2>
        <LinkButton href="/coach/guides/new">
          <Plus aria-hidden className="size-5" />새 가이드 만들기
        </LinkButton>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data?.length === 0 && (
        <EmptyBlock>아직 가이드가 없어요. 매뉴얼을 넣어 첫 가이드를 만들어 보세요.</EmptyBlock>
      )}

      <ul className="flex flex-col gap-3">
        {data?.map((guide) => (
          <li key={guide.id}>
            <Link
              href={`/coach/guides/${guide.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 transition-colors hover:bg-stone-100"
            >
              <span className="flex flex-col gap-2">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-semibold">{guide.title}</span>
                  <StatusBadge status={guide.status} />
                  {guide.isSample && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-900">
                      기본 제공
                    </span>
                  )}
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-stone-600">
                  {guide.workplace && <span>{guide.workplace}</span>}
                  <span>단계 {guide.stepCount}개</span>
                  {guide.issueCount > 0 && (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-800">
                      <TriangleAlert aria-hidden className="size-4" />
                      확인 필요 {guide.issueCount}건
                    </span>
                  )}
                </span>
              </span>
              <ChevronRight aria-hidden className="size-6 shrink-0 text-stone-500" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
