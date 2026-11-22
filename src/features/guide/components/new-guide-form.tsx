"use client";

import { Check, FileText, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { FIELD_CLASS } from "@/shared/ui/feedback";
import { errorMessage, postJson } from "@/shared/util/api-client";
import { EXAMPLE_MANUALS } from "../examples";
import { MANUAL_MAX_LENGTH, MANUAL_MIN_LENGTH, type GuideResponse } from "../schema";

const LABEL_CLASS = "flex flex-col gap-2 text-sm font-medium text-stone-700";
const CARD_CLASS = "rounded-3xl bg-white p-5 shadow-card ring-1 ring-stone-900/5 sm:p-7";

// AI가 변환하면서 지키는 것
const AI_RULES = [
  "한 단계에 한 가지 행동만",
  "짧고 쉬운 말, '~해요' 말투",
  "단계마다 원문 매뉴얼의 근거",
  "다칠 수 있는 단계에 주의 표시",
];
// 변환 중에 AI가 하는 일
const AI_WORK = ["단계 나누기", "쉬운 말 점검", "원문 근거 대조"];

// 매뉴얼 입력 → AI 단계 변환 요청
export function NewGuideForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [manual, setManual] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const length = manual.trim().length;
  const valid = length >= MANUAL_MIN_LENGTH && length <= MANUAL_MAX_LENGTH;

  function fillExample(index: number) {
    const example = EXAMPLE_MANUALS[index];
    setTitle(example.title);
    setWorkplace(example.workplace);
    setManual(example.manual);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const guide = await postJson<GuideResponse>("/api/guides", {
        title: title.trim() || undefined,
        workplace: workplace.trim() || undefined,
        manual,
      });
      router.push(`/coach/guides/${guide.id}`);
    } catch (caught) {
      setError(errorMessage(caught));
      setSubmitting(false);
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <form onSubmit={handleSubmit} className={`flex flex-col gap-6 ${CARD_CLASS}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={LABEL_CLASS}>
            업무 이름 (선택)
            <input
              className={FIELD_CLASS}
              value={title}
              maxLength={60}
              disabled={submitting}
              placeholder="예: 테이블 정리와 소독"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className={LABEL_CLASS}>
            매장·부서 (선택)
            <input
              className={FIELD_CLASS}
              value={workplace}
              maxLength={40}
              disabled={submitting}
              placeholder="예: 카페 차근"
              onChange={(event) => setWorkplace(event.target.value)}
            />
          </label>
        </div>

        <label className={LABEL_CLASS}>
          업무 매뉴얼
          <textarea
            className={`${FIELD_CLASS} min-h-80 leading-relaxed`}
            value={manual}
            maxLength={MANUAL_MAX_LENGTH}
            disabled={submitting}
            placeholder="매장에서 실제로 쓰는 업무 순서를 그대로 붙여 넣어 주세요"
            onChange={(event) => setManual(event.target.value)}
            aria-describedby="manual-help"
          />
          <span id="manual-help" className="flex justify-between font-normal text-stone-600">
            <span>{MANUAL_MIN_LENGTH}자 이상, 순서가 있는 업무 내용</span>
            <span className="tabular-nums">
              {length.toLocaleString()} / {MANUAL_MAX_LENGTH.toLocaleString()}자
            </span>
          </span>
        </label>

        <p className="flex items-start gap-3 rounded-2xl bg-stone-100 p-4 text-base leading-relaxed text-stone-700">
          <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-700" />
          전화번호·이메일처럼 개인정보로 보이는 값은 AI에 보내기 전에 자동으로 가립니다. 실제
          개인정보는 넣지 말아 주세요.
        </p>

        {error && (
          <p
            role="alert"
            className="rounded-2xl bg-red-50 p-4 text-base text-red-900 ring-1 ring-red-200"
          >
            {error}
          </p>
        )}

        {submitting ? (
          <div
            role="status"
            className="flex flex-col gap-3 rounded-2xl bg-violet-50 p-5 ring-1 ring-violet-200"
          >
            <p className="flex items-center gap-2.5 text-lg font-bold text-violet-950">
              <LoaderCircle aria-hidden className="size-6 animate-spin" />
              AI가 단계를 만들고 있어요
            </p>
            <ul className="flex flex-wrap gap-2">
              {AI_WORK.map((work) => (
                <li
                  key={work}
                  className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-violet-800 ring-1 ring-violet-200"
                >
                  {work}
                </li>
              ))}
            </ul>
            <p className="text-base text-violet-950/80">
              기준에 못 미치면 스스로 다시 씁니다. 보통 1분 안에 끝나요.
            </p>
          </div>
        ) : (
          <Button type="submit" size="lg" disabled={!valid}>
            <Sparkles aria-hidden className="size-6" />
            AI로 쉬운 단계 만들기
          </Button>
        )}
      </form>

      <aside className="flex flex-col gap-4">
        <section className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-card ring-1 ring-stone-900/5">
          <h2 className="text-base font-extrabold">처음이라면 예시로 시작해 보세요</h2>
          <ul className="flex flex-col gap-2">
            {EXAMPLE_MANUALS.map((example, index) => (
              <li key={example.title}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => fillExample(index)}
                  className="flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ring-stone-200 transition-colors hover:bg-stone-50 hover:ring-stone-300 disabled:opacity-50"
                >
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
                  >
                    <FileText className="size-5" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-base font-bold">{example.title}</span>
                    <span className="text-sm text-stone-600">{example.workplace}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 rounded-3xl bg-brand-50 p-5 ring-1 ring-brand-200/70">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-brand-900">
            <Sparkles aria-hidden className="size-5" />
            AI가 이렇게 바꿔요
          </h2>
          <ul className="flex flex-col gap-2 text-base text-brand-950">
            {AI_RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <Check
                  aria-hidden
                  strokeWidth={3}
                  className="mt-1 size-4 shrink-0 text-brand-600"
                />
                {rule}
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-brand-900/80">
            만든 단계는 코치가 확인하고 승인해야 근로자에게 보여요.
          </p>
        </section>
      </aside>
    </div>
  );
}
