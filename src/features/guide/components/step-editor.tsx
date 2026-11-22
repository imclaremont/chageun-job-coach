"use client";

import { ArrowDown, ArrowUp, Quote, Trash2, TriangleAlert, UserPen } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AiBadge } from "@/shared/ui/feedback";
import { ACTION_MAX_LENGTH } from "../easy-read";
import type { StepIssue } from "../schema";

export type EditableStep = {
  // 화면 전용 식별자
  key: string;
  id: string | null;
  action: string;
  detail: string;
  emoji: string;
  caution: string;
  doneCheck: string;
  sourceQuote: string;
  issues: StepIssue[];
  editedByCoach: boolean;
  // 마지막 저장 이후 수정 여부
  touched: boolean;
};

type Props = {
  step: EditableStep;
  index: number;
  total: number;
  disabled: boolean;
  // AI가 생성한 가이드 여부, 기본 제공 가이드는 false
  aiGenerated: boolean;
  onChange: (patch: Partial<EditableStep>) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
};

const FIELD_CLASS =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base placeholder:text-stone-400";
const LABEL_CLASS = "flex flex-col gap-1.5 text-sm font-medium text-stone-700";

// 검수 화면의 단계 카드: 내용 수정, 원문 근거와 점검 경고 확인
export function StepEditor({
  step,
  index,
  total,
  disabled,
  aiGenerated,
  onChange,
  onMove,
  onRemove,
}: Props) {
  const number = index + 1;
  const noSource = !step.touched && step.issues.some((issue) => issue.code === "NO_SOURCE");
  const tooLong = step.action.trim().length > ACTION_MAX_LENGTH;

  return (
    <li className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-teal-700 text-lg font-bold text-white">
            {number}
          </span>
          <input
            className="w-16 rounded-xl border border-stone-300 bg-white px-2 py-2 text-center text-2xl"
            value={step.emoji}
            maxLength={8}
            disabled={disabled}
            aria-label={`${number}번 단계 그림 기호`}
            onChange={(event) => onChange({ emoji: event.target.value })}
          />
          {step.editedByCoach || step.touched ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-sm font-medium text-sky-800">
              <UserPen aria-hidden className="size-4" />
              코치 수정
            </span>
          ) : aiGenerated ? (
            <AiBadge />
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-900">
              기본 제공
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || index === 0}
            aria-label={`${number}번 단계를 위로`}
            onClick={() => onMove(-1)}
          >
            <ArrowUp aria-hidden className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || index === total - 1}
            aria-label={`${number}번 단계를 아래로`}
            onClick={() => onMove(1)}
          >
            <ArrowDown aria-hidden className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || total === 1}
            aria-label={`${number}번 단계 삭제`}
            onClick={onRemove}
          >
            <Trash2 aria-hidden className="size-5 text-red-700" />
          </Button>
        </div>
      </div>

      <label className={LABEL_CLASS}>
        <span className="flex justify-between">
          지금 할 일
          <span className={tooLong ? "font-semibold text-amber-800" : "font-normal text-stone-500"}>
            {step.action.trim().length} / {ACTION_MAX_LENGTH}자
          </span>
        </span>
        <input
          className={`${FIELD_CLASS} text-lg font-semibold`}
          value={step.action}
          maxLength={80}
          disabled={disabled}
          placeholder="예: 컵에 얼음을 채워요"
          onChange={(event) => onChange({ action: event.target.value })}
        />
      </label>

      <label className={LABEL_CLASS}>
        하는 방법
        <textarea
          className={`${FIELD_CLASS} min-h-20`}
          value={step.detail}
          maxLength={200}
          disabled={disabled}
          placeholder="한두 문장으로 짧게"
          onChange={(event) => onChange({ detail: event.target.value })}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={LABEL_CLASS}>
          주의할 점 (다칠 수 있을 때만)
          <input
            className={FIELD_CLASS}
            value={step.caution}
            maxLength={120}
            disabled={disabled}
            placeholder="없으면 비워 두기"
            onChange={(event) => onChange({ caution: event.target.value })}
          />
        </label>
        <label className={LABEL_CLASS}>
          다 했는지 확인하는 말
          <input
            className={FIELD_CLASS}
            value={step.doneCheck}
            maxLength={80}
            disabled={disabled}
            placeholder="예: 얼음이 컵 끝까지 찼어요"
            onChange={(event) => onChange({ doneCheck: event.target.value })}
          />
        </label>
      </div>

      <label className={LABEL_CLASS}>
        <span className="inline-flex items-center gap-1">
          <Quote aria-hidden className="size-4" />
          원문 근거
        </span>
        <input
          className={`${FIELD_CLASS} ${noSource ? "border-red-400 bg-red-50" : "bg-stone-50"}`}
          value={step.sourceQuote}
          maxLength={300}
          disabled={disabled}
          placeholder="이 단계의 근거가 된 매뉴얼 구절"
          onChange={(event) => onChange({ sourceQuote: event.target.value })}
        />
      </label>

      {step.touched ? (
        <p className="text-sm text-stone-600">수정한 단계예요. 저장하면 다시 점검합니다.</p>
      ) : (
        step.issues.length > 0 && (
          <ul className="flex flex-col gap-2" aria-label={`${number}번 단계 점검 결과`}>
            {step.issues.map((issue, issueIndex) => (
              <li
                key={`${issue.code}-${issue.field}-${issueIndex}`}
                className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-base text-amber-900"
              >
                <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
                {issue.message}
              </li>
            ))}
          </ul>
        )
      )}
    </li>
  );
}
