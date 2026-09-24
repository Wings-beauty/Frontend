import type { CSSProperties } from "react";
import { HiArrowDown, HiCalendarDays, HiMapPin } from "react-icons/hi2";
import { HiOutlineGift, HiOutlineMagnifyingGlass, HiOutlineSparkles } from "react-icons/hi2";
import { POPUP_EVENT, POPUP_FEATURES } from "../../constants/popup";

const FEATURE_ICONS = [HiOutlineMagnifyingGlass, HiOutlineSparkles, HiOutlineGift];
const NAV_ITEMS = [
  { id: "about", label: "팝업 소개" },
  { id: "products", label: "제품보기" },
  { id: "brands", label: "참여 브랜드" },
  { id: "info", label: "오시는 길" },
];

function delay(ms: number) {
  return { "--d": `${ms}ms` } as CSSProperties;
}

export function PopupHero({ progress, onStart, onNavigate }: { progress: number; onStart: () => void; onNavigate: (id: string) => void }) {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-blush-50 to-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ transform: `translate3d(0, ${Math.round(progress * 70)}px, 0)` }}>
        <div className="pu-float absolute -right-24 -top-20 size-[26rem] rounded-full bg-blush-200 opacity-70 blur-3xl" />
        <div className="pu-float-slow absolute -left-24 top-1/2 size-[22rem] rounded-full bg-[#f6d9cb] opacity-60 blur-3xl" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-5 sm:px-8">
        <span className="text-[1.35rem] tracking-[0.06em] text-brown-600">WINGS</span>
        <nav className="hidden items-center gap-8 text-[0.85rem] text-brown-400 md:flex">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} type="button" onClick={() => onNavigate(item.id)} className="transition-colors hover:text-rose">
              {item.label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={onStart} className="pu-btn rounded-full bg-brown-600 px-4 py-2 text-[0.8rem] text-white">
          내 취향 찾기
        </button>
      </header>

      <div className="relative flex w-full flex-col md:flex-row md:items-center">
        <div className="w-full px-5 pb-14 pt-10 sm:px-8 md:w-[54%] md:shrink-0 md:py-16 md:pl-8 lg:pl-16 3xl:pl-24 3xl:py-24">
          <div className="mx-auto flex max-w-xl flex-col items-start md:mx-0">
            <p className="pu-hero-in text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brown-200 sm:text-[0.78rem]" style={delay(0)}>
              인천대에 열리는 인디뷰티 팝업
            </p>
            <h1 className="mt-4 text-brown-600">
              <span className="pu-hero-in block text-[clamp(1.9rem,1.3rem+2.6vw,3.25rem)] font-semibold leading-[1.3] tracking-[-0.03em]" style={delay(160)}>
                내 취향에 맞는 제품을
              </span>
              <span className="pu-hero-in block text-[clamp(1.9rem,1.3rem+2.6vw,3.25rem)] font-semibold leading-[1.3] tracking-[-0.03em]" style={delay(280)}>
                1분 만에 찾아보세요!
              </span>
            </h1>

            <button
              type="button"
              onClick={onStart}
              className="pu-btn pu-hero-in mt-8 flex h-14 items-center gap-2 rounded-full bg-brown-600 px-8 text-[1rem] font-medium text-white shadow-[0_14px_32px_rgb(58_37_39/0.24)]"
              style={delay(480)}
            >
              내 취향 제품 찾기
              <HiArrowDown className="size-4" aria-hidden="true" />
            </button>

            <div className="pu-hero-in mt-6 flex w-full flex-col gap-1.5 rounded-2xl bg-white/70 px-5 py-4 text-[0.88rem] leading-6 text-brown-400 shadow-sm backdrop-blur-sm" style={delay(600)}>
              <p className="flex items-center gap-2 font-semibold text-brown-600">
                <HiCalendarDays className="size-4 text-rose" aria-hidden="true" />
                {POPUP_EVENT.dateShortLabel} {POPUP_EVENT.timeLabel}
              </p>
              <p className="flex items-center gap-2">
                <HiMapPin className="size-4 shrink-0 text-rose" aria-hidden="true" />
                {POPUP_EVENT.place}
              </p>
              <p className="pl-6 text-rose">{POPUP_EVENT.benefits.slice(0, 2).join(" + ")}</p>
            </div>

            <ul className="pu-hero-in mt-8 flex w-full flex-wrap gap-x-8 gap-y-5" style={delay(760)}>
              {POPUP_FEATURES.map((feature, index) => {
                const Icon = FEATURE_ICONS[index];

                return (
                  <li key={feature.title} className="flex items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-brown-400 shadow-sm">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-[0.75rem] leading-4 text-[#7a625c]">
                      {feature.title}
                      <br />
                      {feature.body}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="relative w-full px-5 sm:px-8 md:w-[46%] md:px-0">
          <div className="pu-scale-in relative mx-auto h-[22rem] w-full max-w-[24rem] md:mx-0 md:h-[32rem] md:max-w-none lg:h-[38rem] 3xl:h-[46rem]" style={delay(300)}>
            <img src="/popup-hero-model.webp" alt="WINGS 팝업 모델 컷" className="absolute inset-0 size-full object-contain object-bottom md:object-right-bottom" />

            {/* <div
              className="pu-hero-in absolute right-2 top-2 hidden flex-col items-end gap-1 rounded-2xl bg-white/70 px-3 py-2 text-right shadow-sm backdrop-blur-sm md:flex"
              style={delay(1000)}
              aria-hidden="true"
            >
              <span className="text-[0.95rem] italic leading-none text-brown-400">
                오늘,
              </span>
              <span className="text-[0.95rem] italic leading-none text-brown-400">
                더 예쁜 나를 만나
              </span>
            </div> */}
          </div>

          <div className="pu-hero-in absolute -bottom-3 left-5 sm:left-4 md:left-0" style={delay(1100)}>
            {/* <p className="text-[1.6rem] italic leading-none text-rose sm:text-[2rem]">Find Your Tone</p> */}
            <svg viewBox="0 0 200 24" className="mt-1 h-5 w-44 text-rose sm:w-52" fill="none" aria-hidden="true">
              <path className="pu-draw" d="M4 16 C 30 4, 52 22, 80 12 S 132 2, 154 12 S 186 18, 196 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white sm:h-32" aria-hidden="true" />
    </section>
  );
}
