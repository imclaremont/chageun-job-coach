// 서비스 표시: 한 칸씩 오르는 계단
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect width="64" height="64" rx="18" className="fill-brand-700" />
      <path
        d="M15 45h11V34h11V23h12"
        fill="none"
        stroke="#fff"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="text-2xl font-extrabold tracking-tight text-stone-900">차근</span>
      {label && (
        <span className="border-l border-stone-300 pl-2.5 text-sm font-medium text-stone-600">
          {label}
        </span>
      )}
    </span>
  );
}
