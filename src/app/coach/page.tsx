import { Plus } from "lucide-react";
import { GuideList } from "@/features/guide/components";
import { CoachDashboard } from "@/features/progress/components";
import { LinkButton } from "@/shared/ui/button";

export default function CoachHomePage() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">안녕하세요, 코치님</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-stone-600">
            매장의 업무 매뉴얼을 넣으면 AI가 쉬운 단계로 바꿔 드려요. 승인한 가이드만 근로자에게
            보입니다.
          </p>
        </div>
        <LinkButton href="/coach/guides/new" size="lg">
          <Plus aria-hidden className="size-6" />새 가이드 만들기
        </LinkButton>
      </div>
      <CoachDashboard />
      <GuideList />
    </div>
  );
}
