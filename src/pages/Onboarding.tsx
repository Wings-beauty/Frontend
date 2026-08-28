import { Link, useLocation } from "react-router-dom";
import { HiArrowRight, HiSparkles } from "react-icons/hi2";
import { boothRoute, isBoothPath } from "../utils/booth";

export default function Onboarding() {
  const { pathname } = useLocation();
  const booth = isBoothPath(pathname);
  return (
    <main className="flex min-h-[100svh] w-full items-center justify-center bg-white sm:px-6 sm:py-6">
      <section className="relative flex min-h-[100svh] w-full max-w-md flex-col items-center justify-between overflow-hidden bg-white sm:min-h-[46rem] sm:rounded-[2rem] sm:border sm:border-ivory/50 sm:shadow-[0_24px_80px_rgb(80_52_43_/_0.14)]">
        <div
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-white/0"
          aria-hidden="true"
        />
        <div
          className="absolute -right-20 -top-20 size-64 rounded-full bg-slate-100 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -left-10 top-1/3 size-48 rounded-full bg-slate-100 blur-3xl"
          aria-hidden="true"
        />

        <header className="relative flex w-full items-center justify-between px-6 pb-2 pt-[calc(1.5rem+env(safe-area-inset-top))]">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-brown-400">
            <HiSparkles className="size-3.5" aria-hidden="true" />
            WINGS POP-UP
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-brown-600">
            WINGS
          </h1>
        </header>

        <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-6">
          <div className="relative mb-7 size-52 shrink-0 sm:mb-10 sm:size-64">
            <div
              className="absolute -inset-5 -rotate-6 rounded-full bg-white/60 shadow-lg"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-1.5 rotate-3 rounded-3xl bg-pink/10 shadow-inner"
              aria-hidden="true"
            />

            <div className="relative size-full overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-[0_18px_44px_rgb(107_74_63_/_0.18)]">
              <img
                src="/illustration.png"
                className="size-full object-cover"
                alt="onboarding_illustration"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-brown-600/10 to-brown-600/0 mix-blend-multiply"
                aria-hidden="true"
              />
            </div>

            <div className="absolute -right-2 top-10 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
              <div className="size-8 rounded-full border border-pink/60 bg-pink/40" />
            </div>
            <div className="absolute bottom-8 -left-1 flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
              <div className="size-6 rounded-full border border-purple/60 bg-purple/40" />
            </div>
          </div>

          <div className="relative flex max-w-80 flex-col items-center gap-3 text-center">
            <p className="text-sm font-semibold tracking-[0.08em] text-[#c77769]">나만의 컬러 찾기</p>
            <h2 className="text-[1.8rem] font-semibold leading-[1.25] tracking-[-0.04em] text-brown-600 sm:text-3xl">
              사진 한 장으로
              <br />
              내 퍼스널 톤을 찾아보세요
            </h2>
            <p className="text-[0.95rem] leading-6 text-[#7a625c] sm:text-base sm:leading-7">
              AI가 피부 톤을 분석하고
              <br />
              나에게 어울리는 화장품을 추천해드려요.
            </p>
          </div>
        </div>

        <footer className="relative w-full px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-6">
          <div className="mb-3 grid grid-cols-2 gap-2 text-center text-xs text-[#7a625c]">
            <p className="rounded-xl bg-cream-50 px-2 py-2">로그인 없이 바로 시작</p>
            <p className="rounded-xl bg-cream-50 px-2 py-2">약 1분이면 결과 확인</p>
          </div>
          <Link
            to={boothRoute("/photo", booth)}
            className="flex h-[3.75rem] w-full items-center justify-center gap-2 rounded-2xl bg-brown-600 text-lg font-semibold text-white shadow-[0_12px_24px_rgb(58_37_39_/_0.22)] transition-transform active:scale-[0.98]"
          >
            내 톤 진단하기
            <HiArrowRight className="size-4.5" aria-hidden="true" />
          </Link>
        </footer>
      </section>
    </main>
  );
}
