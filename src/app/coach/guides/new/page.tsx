import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { NewGuideForm } from "@/features/guide/components";

export const metadata: Metadata = { title: "새 가이드 만들기" };

export default function NewGuidePage() {
  return (
    <div className="flex flex-col gap-7">
      <Link
        href="/coach"
        className="inline-flex items-center gap-1.5 self-start rounded-lg text-base font-semibold text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft aria-hidden className="size-5" />
        코치 홈
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">새 가이드 만들기</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-stone-600">
          매뉴얼을 그대로 붙여 넣어 주세요. AI가 한 단계에 한 가지 행동만 담아 쉬운 말로 나눕니다.
        </p>
      </div>
      <NewGuideForm />
    </div>
  );
}
