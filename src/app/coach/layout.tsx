import { Smartphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LinkButton } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";
import { CoachNav, CoachNavLinks } from "./coach-nav";

export const metadata: Metadata = { title: "코치 화면" };

export default function CoachLayout({ children }: LayoutProps<"/coach">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-stone-900/10 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-5 py-3 sm:gap-6 sm:px-8">
          <Link href="/coach" aria-label="차근 코치 화면">
            <span className="sm:hidden">
              <Logo />
            </span>
            <span className="max-sm:hidden">
              <Logo label="코치" />
            </span>
          </Link>
          {/* 현재 경로는 요청 시점에 정해지므로 Suspense 안에서 해석 */}
          <Suspense fallback={<CoachNavLinks pathname={null} />}>
            <CoachNav />
          </Suspense>
          <LinkButton
            href="/work"
            variant="secondary"
            size="sm"
            className="ml-auto"
            aria-label="근로자 화면 열기"
          >
            <Smartphone aria-hidden className="size-4" />
            <span className="max-sm:hidden">근로자 화면</span>
          </LinkButton>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
