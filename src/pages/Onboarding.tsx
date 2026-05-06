import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";

export default function Onboarding() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-white px-8 py-4">
      <section className="relative flex h-[calc(100dvh-32px)] max-h-screen min-h-96 w-full max-w-md flex-col items-center justify-between overflow-hidden rounded-3xl border border-ivory/50 bg-white shadow-lg">
        <div
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-white/0"
          aria-hidden="true"
        />
        <div
          className="absolute -right-20 -top-20 size-64 rounded-full bg-[#fff6de] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -left-10 top-1/3 size-48 rounded-full bg-[#fff6de] blur-3xl"
          aria-hidden="true"
        />

        <header className="relative flex w-full justify-center px-5 pt-12">
          <h1 className="text-4xl font-normal leading-10 tracking-tight text-brown-600">
            WINGS
          </h1>
        </header>

        <div className="relative flex flex-1 flex-col items-center justify-center px-5 pt-10">
          <div className="relative mb-10 size-64 shrink-0">
            <div
              className="absolute -inset-5 -rotate-6 rounded-full bg-white/60 shadow-lg"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-1.5 rotate-3 rounded-3xl bg-pink/10 shadow-inner"
              aria-hidden="true"
            />

            <div className="relative size-64 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg">
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

          <div className="relative flex max-w-80 flex-col items-center gap-3.5 text-center">
            <h2 className="text-3xl font-normal leading-9 text-brown-600">
              사진 한 장으로
              <br />
              내 퍼스널 톤을 찾아보세요
            </h2>
            <p className="text-base font-normal leading-7 text-[#7a625c]">
              AI가 피부 톤을 분석하고
              <br />
              나에게 어울리는 화장품을 추천해드려요.
            </p>
          </div>
        </div>

        <footer className="relative w-full px-5 py-4">
          <Link
            to="/photo"
            className="flex h-16 w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white shadow-lg"
          >
            내 톤 진단하기
            <HiArrowRight className="size-[18px]" aria-hidden="true" />
          </Link>
        </footer>
      </section>
    </main>
  );
}
