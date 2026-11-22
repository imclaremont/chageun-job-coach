import type { ReactNode } from "react";

export type BadgeTone = "brand" | "neutral" | "amber" | "red" | "violet" | "sky";

const TONES: Record<BadgeTone, string> = {
  brand: "bg-brand-100 text-brand-800",
  neutral: "bg-stone-200/70 text-stone-700",
  amber: "bg-amber-100 text-amber-900",
  red: "bg-red-100 text-red-800",
  violet: "bg-violet-100 text-violet-800",
  sky: "bg-sky-100 text-sky-800",
};

// 상태 표시: 색만으로 전달하지 않도록 글자와 아이콘을 함께 사용
export function Badge({
  tone = "neutral",
  icon,
  children,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold whitespace-nowrap ${TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
