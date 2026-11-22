import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg" | "xl";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-teal-700 text-white hover:bg-teal-800",
  secondary: "bg-white text-stone-900 ring-1 ring-stone-300 hover:bg-stone-100",
  danger: "bg-white text-red-700 ring-1 ring-red-300 hover:bg-red-50",
  ghost: "text-stone-700 hover:bg-stone-200",
};

// 터치 영역 48px 이상, 근로자 화면은 xl 사용
const SIZES: Record<Size, string> = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-12 px-4 text-base",
  lg: "min-h-14 px-6 text-lg",
  xl: "min-h-20 px-6 text-2xl",
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
