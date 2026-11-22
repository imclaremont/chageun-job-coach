import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { NewGuideForm } from "@/features/guide";

export const metadata: Metadata = { title: "새 가이드 만들기" };

export default function NewGuidePage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/coach"
        className="inline-flex items-center gap-1 self-start text-base text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft aria-hidden className="size-5" />
        가이드 목록
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">새 가이드 만들기</h1>
        <p className="text-lg text-stone-600">
          매뉴얼을 그대로 붙여 넣어 주세요. AI가 한 단계에 한 가지 행동만 담아 쉬운 말로 나눕니다.
        </p>
      </div>
      <NewGuideForm />
    </div>
  );
}
