import { CircleAlert, LoaderCircle, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "./badge";
import { Button } from "./button";

export function LoadingBlock({ label = "불러오는 중이에요" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 p-10 text-lg font-medium text-stone-600"
    >
      <LoaderCircle aria-hidden className="size-6 animate-spin text-brand-600" />
      {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-3xl bg-red-50 p-8 text-center text-lg text-red-900 ring-1 ring-red-200"
    >
      <CircleAlert aria-hidden className="size-8 text-red-700" />
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}

export function EmptyBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white/50 p-8 text-center text-lg text-stone-600">
      {children}
    </div>
  );
}

// AI가 만든 내용 표시
export function AiBadge({ label = "AI가 만든 내용" }: { label?: string }) {
  return (
    <Badge tone="violet" icon={<Sparkles aria-hidden className="size-4" />}>
      {label}
    </Badge>
  );
}

// 코치 화면의 입력 칸 공통 모양
export const FIELD_CLASS =
  "w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-base text-stone-900 shadow-[inset_0_1px_1px_rgb(28_25_23/0.04)] transition-colors placeholder:text-stone-400 hover:border-stone-400 focus:border-brand-600 disabled:bg-stone-100 disabled:text-stone-600";
