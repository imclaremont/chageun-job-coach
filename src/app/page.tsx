import {
  ArrowRight,
  Bandage,
  BadgeCheck,
  Check,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Footprints,
  Quote,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { LinkButton } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";

const FLOW: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: FileText,
    title: "매뉴얼을 넣어요",
    description: "코치가 매장에서 쓰는 업무 매뉴얼을 그대로 붙여 넣어요.",
  },
  {
    icon: Sparkles,
    title: "AI가 쉬운 단계로 바꿔요",
    description: "한 단계에 한 가지 행동만 담고, 쉬운 말과 원문 근거를 스스로 점검해요.",
  },
  {
    icon: ClipboardCheck,
    title: "코치가 확인하고 승인해요",
    description: "고칠 곳을 고친 뒤 승인해요. 승인한 단계만 근로자에게 보여요.",
  },
  {
    icon: Footprints,
    title: "한 단계씩 따라 해요",
    description: "막히면 '잘 모르겠어요'를 눌러요. AI가 더 쉬운 말로 다시 알려 줘요.",
  },
];

const PROMISES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ShieldCheck,
    title: "사람이 승인한 안내만",
    description: "AI가 만든 단계는 코치가 승인하기 전에는 근로자 화면에 나오지 않아요.",
  },
  {
    icon: Quote,
    title: "근거가 있는 말만",
    description: "단계마다 원문 매뉴얼의 근거를 붙여요. 모르는 것은 지어내지 않고 사람을 불러요.",
  },
  {
    icon: Bandage,
    title: "다치면 바로 사람을",
    description: "'다쳤어요' 버튼과 다쳤다는 말은 AI를 기다리지 않고 바로 코치를 불러요.",
  },
];

// 근로자 화면을 작게 옮긴 그림, 장식용
function PhonePreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[20rem] select-none">
      <div className="absolute -inset-x-10 -inset-y-6 -z-10 rounded-[3rem] bg-brand-100/70" />
      <div className="rounded-[2.75rem] bg-stone-900 p-2.5 shadow-raised">
        <div className="flex flex-col gap-3 rounded-[2.2rem] bg-paper px-4 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-extrabold tabular-nums">
              3<span className="font-bold text-stone-500"> / 13</span>
            </span>
            <div className="flex flex-1 gap-0.5">
              {Array.from({ length: 13 }, (_, position) => (
                <span
                  key={position}
                  className={`h-1.5 flex-1 rounded-full ${
                    position < 2
                      ? "bg-brand-600"
                      : position === 2
                        ? "bg-brand-300"
                        : "bg-stone-300/70"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-card ring-1 ring-stone-900/5">
            <div className="flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-4xl">
                🧊
              </span>
              <span className="text-sm font-bold text-brand-700">지금 할 일</span>
            </div>
            <p className="text-2xl leading-snug font-extrabold">컵에 얼음을 채워요</p>
            <p className="text-base leading-relaxed text-stone-700">
              얼음 스쿱으로 얼음을 떠요. 컵 끝까지 채워요.
            </p>
            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-xs font-bold text-stone-600">이렇게 되면 끝이에요</p>
              <p className="flex items-center gap-1.5 text-base">
                <Check strokeWidth={3} className="size-4 text-brand-600" />
                얼음이 컵 끝까지 찼어요
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-semibold text-red-700 ring-1 ring-red-300 ring-inset">
              <Bandage className="size-4" />
              다쳤어요
            </span>
            <div className="grid grid-cols-2 gap-2">
              <span className="flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl bg-white text-sm font-semibold ring-1 ring-stone-300 ring-inset">
                <CircleHelp className="size-5" />잘 모르겠어요
              </span>
              <span className="flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl bg-brand-700 text-sm font-semibold text-white">
                <Check strokeWidth={3} className="size-5" />다 했어요
              </span>
            </div>
          </div>
        </div>
      </div>

      <span className="absolute top-16 -left-6 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-bold text-violet-800 shadow-raised ring-1 ring-stone-900/5 sm:-left-12">
        <Sparkles className="size-4" />
        AI가 쉬운 말로 바꿨어요
      </span>
      <span className="absolute -right-4 bottom-36 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-bold text-brand-800 shadow-raised ring-1 ring-stone-900/5 sm:-right-10">
        <BadgeCheck className="size-4" />
        코치가 승인했어요
      </span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <LinkButton href="/coach" variant="ghost">
          코치 화면
        </LinkButton>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-16 px-5 pt-6 pb-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-14">
          <div className="flex animate-rise flex-col gap-7">
            <div className="self-start">
              <Badge tone="brand">발달장애·경계선지능 청년의 첫 직장을 돕는 AI 직무 코치</Badge>
            </div>
            <h1 className="text-5xl leading-[1.15] font-extrabold sm:text-6xl">
              처음 하는 일도,
              <br />
              <span className="text-brand-700">한 단계씩.</span>
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-stone-700">
              매장의 업무 매뉴얼을 쉬운 단계 카드로 바꿔요. 일하다 막히면 곁에서 쉬운 말로 다시 알려
              주고, 사람이 필요한 순간에는 바로 사람을 불러요.
            </p>

            <nav aria-label="시작하기" className="grid max-w-xl gap-3 sm:grid-cols-2">
              <Link
                href="/work"
                className="group flex min-h-44 flex-col justify-between gap-6 rounded-[1.75rem] bg-brand-700 p-6 text-white shadow-raised transition-[background-color,transform] duration-150 hover:bg-brand-800 active:scale-[0.99]"
              >
                <span className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
                    <Footprints aria-hidden className="size-7" />
                  </span>
                  <span className="text-base font-semibold text-brand-100">일하는 사람</span>
                </span>
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-3xl font-extrabold">
                    일하러 가기
                    <ArrowRight
                      aria-hidden
                      className="size-7 transition-transform duration-150 group-hover:translate-x-1"
                    />
                  </span>
                  <span className="text-lg text-brand-50">오늘 할 일을 한 단계씩 따라 해요</span>
                </span>
              </Link>
              <Link
                href="/coach"
                className="group flex min-h-44 flex-col justify-between gap-6 rounded-[1.75rem] bg-white p-6 shadow-card ring-1 ring-stone-900/5 transition-[box-shadow,transform] duration-150 hover:shadow-raised active:scale-[0.99]"
              >
                <span className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <ClipboardCheck aria-hidden className="size-7" />
                  </span>
                  <span className="text-base font-semibold text-stone-600">관리자·직무지도원</span>
                </span>
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-3xl font-extrabold">
                    코치 화면
                    <ArrowRight
                      aria-hidden
                      className="size-7 transition-transform duration-150 group-hover:translate-x-1"
                    />
                  </span>
                  <span className="text-lg text-stone-600">가이드를 만들고 진행 상황을 봐요</span>
                </span>
              </Link>
            </nav>
          </div>

          <PhonePreview />
        </section>

        <section
          aria-labelledby="flow-title"
          className="border-y border-stone-900/5 bg-white py-16 sm:py-20"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 sm:px-8">
            <div className="flex flex-col gap-3">
              <p className="text-base font-bold text-brand-700">일하는 순서</p>
              <h2 id="flow-title" className="text-3xl font-extrabold sm:text-4xl">
                매뉴얼 한 장이 쉬운 단계가 되기까지
              </h2>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FLOW.map(({ icon: Icon, title, description }, index) => (
                <li
                  key={title}
                  className="flex flex-col gap-4 rounded-3xl bg-paper p-6 ring-1 ring-stone-900/5"
                >
                  <span className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-card ring-1 ring-stone-900/5">
                      <Icon aria-hidden className="size-6" />
                    </span>
                    <span className="text-4xl font-extrabold text-stone-300 tabular-nums">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="text-xl font-extrabold">{title}</h3>
                  <p className="text-base leading-relaxed text-stone-700">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="promise-title"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="flex flex-col gap-3">
            <p className="text-base font-bold text-brand-700">지키는 것</p>
            <h2 id="promise-title" className="text-3xl font-extrabold sm:text-4xl">
              틀린 안내가 나가지 않도록
            </h2>
          </div>
          <ul className="grid gap-4 lg:grid-cols-3">
            {PROMISES.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="flex gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-900/5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon aria-hidden className="size-6" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-xl font-extrabold">{title}</span>
                  <span className="text-base leading-relaxed text-stone-700">{description}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-stone-900/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-stone-600 sm:px-8">
          <span className="font-semibold">차근 — AI 직무 코치</span>
          <span>화면의 예시는 모두 가상 데이터예요.</span>
        </div>
      </footer>
    </div>
  );
}
