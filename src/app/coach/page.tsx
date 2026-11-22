import { GuideList } from "@/features/guide/components";
import { CoachDashboard } from "@/features/progress/components";

export default function CoachHomePage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">안녕하세요, 코치님</h1>
        <p className="text-lg text-stone-600">
          매장의 업무 매뉴얼을 넣으면 AI가 쉬운 단계로 바꿔 드려요. 승인한 가이드만 근로자에게
          보입니다.
        </p>
      </div>
      <CoachDashboard />
      <GuideList />
    </div>
  );
}
