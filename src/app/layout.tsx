import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "차근 — AI 직무 코치", template: "%s | 차근" },
  description:
    "처음 하는 일도 한 단계씩. 업무 매뉴얼을 쉬운 단계 카드로 바꾸고, 막힐 때 곁에서 알려 주는 AI 직무 코치",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#185846",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-paper text-stone-900">{children}</body>
    </html>
  );
}
