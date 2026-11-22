import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "코치 화면" };

export default function CoachLayout({ children }: LayoutProps<"/coach">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/coach" className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-800">차근</span>
            <span className="text-base font-medium text-stone-600">코치 화면</span>
          </Link>
          <nav aria-label="코치 메뉴" className="flex items-center gap-4 text-base font-medium">
            <Link href="/coach" className="text-stone-700 hover:text-stone-950">
              가이드
            </Link>
            <Link href="/" className="text-stone-700 hover:text-stone-950">
              처음으로
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
