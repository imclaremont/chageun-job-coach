"use client";

import { ArrowLeft, CircleCheck, Eye, LoaderCircle, Plus, Save, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, LinkButton } from "@/shared/ui/button";
import { ErrorBlock, LoadingBlock } from "@/shared/ui/feedback";
import { errorMessage, patchJson, postJson } from "@/shared/util/api-client";
import { useApi } from "@/shared/util/use-api";
import { MAX_STEPS, type GuideResponse, type StepInput } from "../schema";
import { StepEditor, type EditableStep } from "./step-editor";

let nextKey = 0;
const createKey = () => `new-${(nextKey += 1)}`;

const toEditable = (guide: GuideResponse): EditableStep[] =>
  guide.steps.map((step) => ({
    key: step.id,
    id: step.id,
    action: step.action,
    detail: step.detail,
    emoji: step.emoji,
    caution: step.caution ?? "",
    doneCheck: step.doneCheck,
    sourceQuote: step.sourceQuote,
    issues: step.issues,
    editedByCoach: step.editedByCoach,
    touched: false,
  }));

const toInput = (step: EditableStep): StepInput => ({
  id: step.id,
  action: step.action.trim(),
  detail: step.detail.trim(),
  emoji: step.emoji.trim() || "▶️",
  caution: step.caution.trim() || null,
  doneCheck: step.doneCheck.trim(),
  sourceQuote: step.sourceQuote.trim(),
});

type Notice = { tone: "success" | "error"; text: string };

// 코치 검수 화면: 불러오기와 저장 후 재초기화
export function GuideReview({ guideId }: { guideId: string }) {
  const { data, error, loading, reload, setData } = useApi<GuideResponse>(`/api/guides/${guideId}`);

  if (loading) return <LoadingBlock label="가이드를 불러오는 중이에요" />;
  if (error || !data) {
    return <ErrorBlock message={error ?? "가이드를 불러오지 못했어요"} onRetry={reload} />;
  }
  // 서버 저장본이 바뀌면 편집 상태 초기화
  return <ReviewEditor key={data.updatedAt} guide={data} onUpdated={setData} />;
}

function ReviewEditor({
  guide,
  onUpdated,
}: {
  guide: GuideResponse;
  onUpdated: (guide: GuideResponse) => void;
}) {
  const [title, setTitle] = useState(guide.title);
  const [steps, setSteps] = useState<EditableStep[]>(() => toEditable(guide));
  const [structureChanged, setStructureChanged] = useState(false);
  const [busy, setBusy] = useState<"save" | "approve" | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const dirty = structureChanged || title !== guide.title || steps.some((step) => step.touched);
  const approved = guide.status === "approved" && !dirty;
  const hasEmptyAction = steps.some((step) => !step.action.trim());
  const canSave = dirty && !hasEmptyAction && title.trim().length > 0 && busy === null;
  const needsAcknowledge = guide.issueCount > 0;
  const canApprove =
    !dirty && guide.status !== "approved" && busy === null && (!needsAcknowledge || acknowledged);

  function changeStep(key: string, patch: Partial<EditableStep>) {
    setSteps((current) =>
      current.map((step) => (step.key === key ? { ...step, ...patch, touched: true } : step)),
    );
    setNotice(null);
  }

  function moveStep(index: number, delta: -1 | 1) {
    setSteps((current) => {
      const next = [...current];
      const target = index + delta;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setStructureChanged(true);
  }

  function removeStep(key: string) {
    setSteps((current) => current.filter((step) => step.key !== key));
    setStructureChanged(true);
  }

  function addStep() {
    setSteps((current) => [
      ...current,
      {
        key: createKey(),
        id: null,
        action: "",
        detail: "",
        emoji: "▶️",
        caution: "",
        doneCheck: "",
        sourceQuote: "",
        issues: [],
        editedByCoach: true,
        touched: true,
      },
    ]);
    setStructureChanged(true);
  }

  async function save() {
    setBusy("save");
    setNotice(null);
    try {
      const updated = await patchJson<GuideResponse>(`/api/guides/${guide.id}`, {
        title: title.trim(),
        steps: steps.map(toInput),
      });
      onUpdated(updated);
    } catch (caught) {
      setNotice({ tone: "error", text: errorMessage(caught) });
      setBusy(null);
    }
  }

  async function approve() {
    setBusy("approve");
    setNotice(null);
    try {
      const updated = await postJson<GuideResponse>(`/api/guides/${guide.id}/approve`, {
        acknowledgeIssues: acknowledged,
      });
      onUpdated(updated);
    } catch (caught) {
      setNotice({ tone: "error", text: errorMessage(caught) });
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-40">
      <Link
        href="/coach"
        className="inline-flex items-center gap-1 self-start text-base text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft aria-hidden className="size-5" />
        가이드 목록
      </Link>

      <header className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
          업무 이름
          <input
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-2xl font-bold"
            value={title}
            maxLength={60}
            disabled={busy !== null}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 text-base text-stone-600">
          {guide.workplace && <span>{guide.workplace}</span>}
          <span>단계 {steps.length}개</span>
          {approved ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-sm font-medium text-teal-800">
              <CircleCheck aria-hidden className="size-4" />
              승인됨 · 근로자 화면에 보여요
            </span>
          ) : (
            <span className="rounded-full bg-stone-200 px-2.5 py-1 text-sm font-medium text-stone-700">
              검수 필요 · 근로자 화면에 아직 안 보여요
            </span>
          )}
        </div>
      </header>

      <section
        aria-label="AI 생성과 점검 요약"
        className="flex flex-col gap-2 rounded-2xl bg-stone-100 p-4 text-base leading-relaxed text-stone-700"
      >
        {guide.generation ? (
          <p>
            AI({guide.generation.model})가 단계를 만들고 스스로 점검했어요. AI 호출{" "}
            {guide.generation.rounds}회, 점검에서 찾은 문제 {guide.generation.issuesFound}건 중{" "}
            {guide.generation.issuesFound - guide.generation.issuesRemaining}건을 스스로 고쳤습니다.
          </p>
        ) : (
          <p>기본으로 제공하는 가이드예요. 자유롭게 고쳐 써도 됩니다.</p>
        )}
        {guide.maskedCount > 0 && (
          <p>개인정보로 보이는 값 {guide.maskedCount}개를 가린 뒤 AI에 보냈어요.</p>
        )}
        {guide.issueCount > 0 ? (
          <p className="flex items-center gap-2 font-semibold text-amber-900">
            <TriangleAlert aria-hidden className="size-5" />
            확인이 필요한 내용이 {guide.issueCount}건 있어요. 아래 노란 표시를 확인해 주세요.
          </p>
        ) : (
          <p className="font-medium text-teal-800">
            자동 점검을 모두 통과했어요. 내용이 실제 업무와 맞는지 확인해 주세요.
          </p>
        )}
      </section>

      <details className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
        <summary className="cursor-pointer text-lg font-semibold">원문 매뉴얼 보기</summary>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-base leading-relaxed text-stone-700">
          {guide.manual}
        </pre>
      </details>

      <ol className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <StepEditor
            key={step.key}
            step={step}
            index={index}
            total={steps.length}
            disabled={busy !== null}
            aiGenerated={guide.generation !== null}
            onChange={(patch) => changeStep(step.key, patch)}
            onMove={(delta) => moveStep(index, delta)}
            onRemove={() => removeStep(step.key)}
          />
        ))}
      </ol>

      <Button
        variant="secondary"
        className="self-start"
        disabled={busy !== null || steps.length >= MAX_STEPS}
        onClick={addStep}
      >
        <Plus aria-hidden className="size-5" />
        단계 추가
      </Button>

      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-6 py-4">
          {notice && (
            <p
              role={notice.tone === "error" ? "alert" : "status"}
              className={`rounded-xl px-3 py-2 text-base ${
                notice.tone === "error" ? "bg-red-50 text-red-800" : "bg-teal-50 text-teal-800"
              }`}
            >
              {notice.text}
            </p>
          )}
          {hasEmptyAction && (
            <p className="text-base text-amber-900">
              &lsquo;지금 할 일&rsquo;이 비어 있는 단계가 있어요.
            </p>
          )}
          {!dirty && needsAcknowledge && guide.status !== "approved" && (
            <label className="flex items-start gap-3 text-base">
              <input
                type="checkbox"
                className="mt-1 size-5 accent-teal-700"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
              />
              확인이 필요한 {guide.issueCount}건을 직접 살펴봤고, 이대로 근로자에게 보여도 됩니다
            </label>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {dirty && (
              <span className="mr-auto text-base text-stone-600">저장하지 않은 수정이 있어요</span>
            )}
            {approved && (
              <LinkButton href={`/work/${guide.id}`} variant="secondary" className="mr-auto">
                <Eye aria-hidden className="size-5" />
                근로자 화면으로 보기
              </LinkButton>
            )}
            <Button variant="secondary" disabled={!canSave} onClick={save}>
              {busy === "save" ? (
                <LoaderCircle aria-hidden className="size-5 animate-spin" />
              ) : (
                <Save aria-hidden className="size-5" />
              )}
              저장하고 다시 점검
            </Button>
            <Button disabled={!canApprove} onClick={approve}>
              {busy === "approve" ? (
                <LoaderCircle aria-hidden className="size-5 animate-spin" />
              ) : (
                <CircleCheck aria-hidden className="size-5" />
              )}
              {guide.status === "approved" && !dirty ? "승인 완료" : "승인하고 근로자에게 보이기"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
