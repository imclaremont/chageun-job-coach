"use client";

import { LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { errorMessage, postJson } from "@/shared/util/api-client";
import { EXAMPLE_MANUALS } from "../examples";
import { MANUAL_MAX_LENGTH, MANUAL_MIN_LENGTH, type GuideResponse } from "../schema";

const INPUT_CLASS =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base placeholder:text-stone-400";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base text-stone-600">처음이라면 예시로 시작해 보세요</span>
        {EXAMPLE_MANUALS.map((example, index) => (
          <Button
            key={example.title}
            variant="secondary"
            size="sm"
            disabled={submitting}
            onClick={() => fillExample(index)}
          >
            예시: {example.title}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-base font-medium">
          업무 이름 (선택)
          <input
            className={INPUT_CLASS}
            value={title}
            maxLength={60}
            placeholder="예: 테이블 정리와 소독"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-base font-medium">
          매장·부서 (선택)
          <input
            className={INPUT_CLASS}
            value={workplace}
            maxLength={40}
            placeholder="예: 카페 차근"
            onChange={(event) => setWorkplace(event.target.value)}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-base font-medium">
        업무 매뉴얼
        <textarea
          className={`${INPUT_CLASS} min-h-72 leading-relaxed`}
          value={manual}
          maxLength={MANUAL_MAX_LENGTH}
          placeholder="매장에서 실제로 쓰는 업무 순서를 그대로 붙여 넣어 주세요"
          onChange={(event) => setManual(event.target.value)}
          aria-describedby="manual-help"
        />
        <span id="manual-help" className="flex justify-between text-sm font-normal text-stone-600">
          <span>{MANUAL_MIN_LENGTH}자 이상, 순서가 있는 업무 내용</span>
          <span>
            {length.toLocaleString()} / {MANUAL_MAX_LENGTH.toLocaleString()}자
          </span>
        </span>
      </label>

      <p className="flex items-start gap-3 rounded-2xl bg-stone-100 p-4 text-base leading-relaxed text-stone-700">
        <ShieldCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-teal-700" />
        전화번호·이메일처럼 개인정보로 보이는 값은 AI에 보내기 전에 자동으로 가립니다. 실제
        개인정보는 넣지 말아 주세요.
      </p>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-base text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" disabled={!valid || submitting}>
          {submitting ? (
            <LoaderCircle aria-hidden className="size-6 animate-spin" />
          ) : (
            <Sparkles aria-hidden className="size-6" />
          )}
          {submitting ? "AI가 단계를 만들고 있어요" : "AI로 쉬운 단계 만들기"}
        </Button>
        {submitting && (
          <p role="status" className="text-center text-base text-stone-600">
            단계를 나눈 뒤 쉬운 말과 원문 근거를 스스로 점검합니다. 보통 1분 안에 끝나요.
          </p>
        )}
      </div>
    </form>
  );
}
