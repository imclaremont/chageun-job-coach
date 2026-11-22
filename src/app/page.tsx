import { ArrowRight, ClipboardCheck, Footprints, ShieldCheck } from "lucide-react";
import Link from "next/link";

const entries = [
  {
    href: "/work",
    icon: Footprints,
    label: "일하러 가기",
    description: "오늘 할 일을 한 단계씩 따라 해요",
    audience: "일하는 사람",
    tone: "bg-teal-700 text-white hover:bg-teal-800",
    sub: "text-teal-50",
  },
  {
    href: "/coach",
    icon: ClipboardCheck,
    label: "코치 화면",
    description: "매뉴얼을 쉬운 단계로 만들고 진행 상황을 봅니다",
    audience: "관리자·직무지도원",
    tone: "bg-white text-stone-900 ring-1 ring-stone-300 hover:bg-stone-100",
    sub: "text-stone-600",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-lg font-semibold text-teal-800">AI 직무 코치</p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">차근</h1>
        <p className="text-2xl leading-relaxed text-stone-700">
          처음 하는 일도 한 단계씩.
          <br />
          막히면 곁에서 쉬운 말로 알려 줘요.
        </p>
      </header>

      <nav aria-label="시작하기" className="grid gap-4 sm:grid-cols-2">
        {entries.map(({ href, icon: Icon, label, description, audience, tone, sub }) => (
          <Link
            key={href}
            href={href}
            className={`flex min-h-44 flex-col justify-between gap-6 rounded-3xl p-6 shadow-sm transition-colors ${tone}`}
          >
            <span className="flex items-center justify-between">
              <Icon aria-hidden className="size-10" />
              <span className={`text-base font-medium ${sub}`}>{audience}</span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-3xl font-bold">
                {label}
                <ArrowRight aria-hidden className="size-7" />
              </span>
              <span className={`text-lg ${sub}`}>{description}</span>
            </span>
          </Link>
        ))}
      </nav>

      <p className="flex items-start gap-3 rounded-2xl bg-stone-100 p-4 text-base leading-relaxed text-stone-700">
        <ShieldCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-teal-700" />
        AI가 만든 안내는 코치가 확인하고 승인한 뒤에만 보여 줍니다. 화면의 예시는 모두 가상
        데이터입니다.
      </p>
    </main>
  );
}
