import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg" | "xl";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold select-none transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(8_32_26/0.35)] hover:bg-brand-800",
  secondary:
    "bg-white text-stone-900 ring-1 ring-inset ring-stone-300 shadow-[0_1px_2px_rgb(28_25_23/0.05)] hover:bg-stone-50 hover:ring-stone-400",
  danger:
    "bg-white text-red-700 ring-1 ring-inset ring-red-300 shadow-[0_1px_2px_rgb(28_25_23/0.05)] hover:bg-red-50",
  ghost: "text-stone-700 hover:bg-stone-900/5",
};

// 터치 영역 48px 이상, 근로자 화면은 lg 이상 사용
const SIZES: Record<Size, string> = {
  sm: "min-h-10 rounded-xl px-3.5 text-sm",
  md: "min-h-12 rounded-xl px-4 text-base",
  lg: "min-h-14 rounded-2xl px-6 text-lg",
  xl: "min-h-20 rounded-3xl px-6 text-2xl",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
