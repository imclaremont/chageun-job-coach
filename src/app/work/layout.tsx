import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/shared/ui/logo";

export const metadata: Metadata = { title: "일하기" };

// 근로자 화면 틀: 방해 요소 없이 로고만 표시
export default function WorkLayout({ children }: LayoutProps<"/work">) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-5 pb-6 sm:px-6">
      <Link href="/" aria-label="차근 처음 화면으로" className="self-start">
        <Logo />
      </Link>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
