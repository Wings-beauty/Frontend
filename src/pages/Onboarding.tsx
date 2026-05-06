import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";

export default function Onboarding() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-white px-8 py-4">
      <section className="relative flex h-[calc(100dvh-32px)] max-h-[900px] min-h-[700px] w-full max-w-[430px] flex-col items-center justify-between overflow-hidden rounded-[40px] border border-ivory/50 bg-white shadow-[0_25px_50px_-12px_rgb(107_74_63_/_0.1)]">
        <div
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-white/0"
          aria-hidden="true"
        />
        <div
          className="absolute -right-20 -top-20 size-64 rounded-full bg-[#fff6de] blur-[32px]"
          aria-hidden="true"
        />
        <div
          className="absolute left-[-40px] top-1/3 h-48 w-48 rounded-full bg-[#fff6de] blur-[32px]"
          aria-hidden="true"
        />

        <header className="relative flex w-full justify-center px-5 pt-12">
          <h1 className="text-[32px] font-normal leading-[38.4px] tracking-[-1.6px] text-brown-600">
            WINGS
          </h1>
        </header>

        <div className="relative flex flex-1 flex-col items-center justify-center px-5 pt-10">
          <div className="relative mb-10 size-64 shrink-0">
            <div
              className="absolute inset-[-20px] -rotate-6 rounded-full bg-white/60 shadow-[0_10px_40px_rgb(107_74_63_/_0.08)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-[-7px] rotate-3 rounded-[48px] bg-pink/10 shadow-[inset_0_2px_4px_rgb(0_0_0_/_0.05)]"
              aria-hidden="true"
            />

            <div className="relative size-64 overflow-hidden rounded-[40px] border-4 border-white bg-white shadow-[0_10px_15px_-3px_rgb(107_74_63_/_0.05),0_4px_6px_-4px_rgb(107_74_63_/_0.05)]">
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

            <div className="absolute right-[-16px] top-10 flex size-12 items-center justify-center rounded-full bg-white drop-shadow-[0_1px_1px_rgb(107_74_63_/_0.1)]">
              <div className="size-8 rounded-full border border-pink/60 bg-pink/40" />
            </div>
            <div className="absolute bottom-8 left-[-8px] flex size-10 items-center justify-center rounded-full bg-white drop-shadow-[0_1px_1px_rgb(107_74_63_/_0.1)]">
              <div className="size-6 rounded-full border border-purple/60 bg-purple/40" />
            </div>
          </div>

          <div className="relative flex max-w-80 flex-col items-center gap-[15px] text-center">
            <h2 className="text-2xl font-normal leading-[30px] text-brown-600">
              사진 한 장으로
              <br />
              내 퍼스널 톤을 찾아보세요
            </h2>
            <p className="text-base font-normal leading-[25.6px] text-[#7a625c]">
              AI가 피부 톤을 분석하고
              <br />
              나에게 어울리는 화장품을 추천해드려요.
            </p>
          </div>
        </div>

        <footer className="relative w-full px-5 py-4">
          <Link
            to="/photo"
            className="flex h-[60px] w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39_/_0.15)]"
          >
            내 톤 진단하기
            <HiArrowRight className="size-[18px]" aria-hidden="true" />
          </Link>
        </footer>
      </section>
    </main>
  );
}
