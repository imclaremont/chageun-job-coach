import { CircleAlert, LoaderCircle, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

export function LoadingBlock({ label = "불러오는 중이에요" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 p-10 text-lg text-stone-600"
    >
      <LoaderCircle aria-hidden className="size-6 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-2xl bg-red-50 p-8 text-center text-lg text-red-800"
    >
      <CircleAlert aria-hidden className="size-8" />
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
    <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-lg text-stone-600">
      {children}
    </div>
  );
}

// AI가 만든 내용 표시
export function AiBadge({ label = "AI가 만든 내용" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-sm font-medium text-violet-800">
      <Sparkles aria-hidden className="size-4" />
      {label}
    </span>
  );
}
