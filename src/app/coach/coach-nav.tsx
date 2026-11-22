"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/coach", label: "홈", exact: true },
  { href: "/coach/guides/new", label: "새 가이드", exact: false },
];

// 코치 메뉴, pathname이 없으면 강조 없이 표시
export function CoachNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="코치 메뉴" className="flex items-center gap-1">
      {ITEMS.map(({ href, label, exact }) => {
        const active = pathname !== null && (exact ? pathname === href : pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-xl px-3.5 py-2 text-base font-semibold transition-colors ${
              active ? "bg-stone-900/8 text-stone-900" : "text-stone-600 hover:bg-stone-900/5"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function CoachNav() {
  return <CoachNavLinks pathname={usePathname()} />;
}
