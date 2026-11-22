import type { Metadata } from "next";
import { Suspense } from "react";
import { GuideReview } from "@/features/guide";
import { LoadingBlock } from "@/shared/ui/feedback";

export const metadata: Metadata = { title: "가이드 검수" };

type Props = PageProps<"/coach/guides/[guideId]">;

// 경로 값은 요청 시점에 정해지므로 Suspense 안에서 해석
async function ReviewLoader({ params }: Pick<Props, "params">) {
  const { guideId } = await params;
  return <GuideReview guideId={guideId} />;
}

export default function GuideReviewPage({ params }: Props) {
  return (
    <Suspense fallback={<LoadingBlock label="가이드를 불러오는 중이에요" />}>
      <ReviewLoader params={params} />
    </Suspense>
  );
}
