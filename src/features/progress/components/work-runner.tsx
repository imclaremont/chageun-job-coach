"use client";

import { LoaderCircle, Play, Star } from "lucide-react";
import { useState } from "react";
import type { WorkerGuideResponse } from "@/features/guide";
import { Button, LinkButton } from "@/shared/ui/button";
import { ErrorBlock, LoadingBlock } from "@/shared/ui/feedback";
import { errorMessage, postJson } from "@/shared/util/api-client";
import { useApi } from "@/shared/util/use-api";
import type { Run, RunResponse } from "../schema";
import { RunSession } from "./run-session";
import { useCurrentWorker } from "./worker-store";

type Session = { run: RunResponse; guide: WorkerGuideResponse };

// 일 시작 전 화면: 할 일 확인 → 시작, 익숙해지면 짧게 보기 제안
export function WorkRunner({ guideId }: { guideId: string }) {
  const worker = useCurrentWorker();
  const guideQuery = useApi<WorkerGuideResponse>(`/api/guides/${guideId}?view=worker`);
  const recommendation = useApi<{ simpleRecommended: boolean }>(
    worker ? `/api/runs/recommendation?workerId=${worker.id}&guideId=${guideId}` : null,
  );
  const [session, setSession] = useState<Session | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session) return <RunSession initialRun={session.run} guide={session.guide} />;
  if (worker === undefined || guideQuery.loading) return <LoadingBlock label="준비하고 있어요" />;

  if (worker === null) {
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold leading-snug">먼저 이름을 골라요</h1>
        <LinkButton href="/work" size="xl">
          이름 고르러 가기
        </LinkButton>
      </section>
    );
  }

  if (guideQuery.error || !guideQuery.data) {
    return (
      <section className="flex flex-col gap-6">
        <ErrorBlock
          message={guideQuery.error ?? "할 일을 가져오지 못했어요"}
          onRetry={guideQuery.reload}
        />
        <LinkButton href="/work" variant="secondary" size="xl">
          처음으로
        </LinkButton>
      </section>
    );
  }

  const guide = guideQuery.data;
  const simpleRecommended = recommendation.data?.simpleRecommended ?? false;
  const workerId = worker.id;

  async function start(mode: Run["mode"]) {
    setStarting(true);
    setError(null);
    try {
      setSession(await postJson<Session>("/api/runs", { guideId, workerId, mode }));
    } catch (caught) {
      setError(errorMessage(caught));
      setStarting(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p className="text-2xl text-stone-700">{worker.name} 님이 할 일</p>
        <h1 className="text-5xl font-bold leading-snug">{guide.title}</h1>
        <p className="text-2xl text-stone-700">
          모두 {guide.steps.length}단계예요. 한 단계씩 같이 해요.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-xl text-red-800">
          {error}
        </p>
      )}

      {simpleRecommended ? (
        <div className="flex flex-col gap-4 rounded-3xl bg-amber-100 p-6">
          <p className="flex items-center gap-3 text-2xl font-bold text-amber-950">
            <Star aria-hidden className="size-8 shrink-0" />이 일을 잘하게 됐어요!
          </p>
          <p className="text-2xl text-amber-950">설명을 짧게 볼까요?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="xl" disabled={starting} onClick={() => start("simple")}>
              짧게 볼래요
            </Button>
            <Button variant="secondary" size="xl" disabled={starting} onClick={() => start("full")}>
              자세히 볼래요
            </Button>
          </div>
        </div>
      ) : (
        <Button size="xl" disabled={starting} onClick={() => start("full")}>
          {starting ? (
            <LoaderCircle aria-hidden className="size-8 animate-spin" />
          ) : (
            <Play aria-hidden className="size-8" />
          )}
          시작해요
        </Button>
      )}

      <LinkButton href="/work" variant="ghost" size="lg" className="self-start">
        다른 일 고르기
      </LinkButton>
    </section>
  );
}
