import { Suspense } from "react";
import { WorkRunner } from "@/features/progress/components";
import { LoadingBlock } from "@/shared/ui/feedback";

type Props = PageProps<"/work/[guideId]">;

// 경로 값은 요청 시점에 정해지므로 Suspense 안에서 해석
async function RunnerLoader({ params }: Pick<Props, "params">) {
  const { guideId } = await params;
  return <WorkRunner guideId={guideId} />;
}

export default function WorkRunPage({ params }: Props) {
  return (
    <Suspense fallback={<LoadingBlock label="준비하고 있어요" />}>
      <RunnerLoader params={params} />
    </Suspense>
  );
}
