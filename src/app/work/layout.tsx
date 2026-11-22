import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "일하기" };

// 근로자 화면 틀: 방해 요소 없이 로고만 표시
export default function WorkLayout({ children }: LayoutProps<"/work">) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
      <Link href="/" className="self-start text-2xl font-bold text-teal-800">
        차근
      </Link>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
