import { HiSparkles } from "react-icons/hi2";
import { FaCheck } from "react-icons/fa6";
import { FaArrowsRotate } from "react-icons/fa6";

export default function Analyzing() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-white">
      <div className="relative flex h-full max-w-96 mx-auto flex-col items-center justify-center gap-16">
        {/* circle 1 */}
        <div className="absolute bg-[#D8C7F2]/40 size-52 rounded-full -top-20 -right-20 blur-xl"></div>

        {/* circle 2 */}
        <div className="absolute bg-[#EFA48B]/40 size-48 rounded-full blur-xl top-1/3  -left-32"></div>

        {/* circle 3 */}
        <div className="absolute bg-[#FFF6DE] size-96 rounded-full blur-xl -bottom-32 -right-32"></div>

        {/* icon-part */}
        <section className="flex flex-col gap-16 items-center justify-center z-10">
          <div className="relative size-40 bg-[#EFA48B]/20 rounded-full flex justify-center items-center">
            <svg className="size-36" viewBox="0 0 144 144">
              <circle
                cx="72"
                cy="72"
                r="71"
                fill="none"
                stroke="#F7C7A3"
                strokeOpacity="0.5"
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="4 6"
              />
            </svg>
            <HiSparkles className="absolute size-14 text-[#FFA789] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
          </div>

          <span className="text-center text-brown-300">
            빛, 색감, 피부 톤 데이터를 확인하는 중 이에요. <br />
            잠시만 기다려주세요.
          </span>
        </section>

        {/* chart-part */}
        <section className="relative flex flex-col gap-6 w-80 bg-white/40 rounded-2xl shadow-xl p-6">
          {/* stick-progress-bar */}
          <div className="absolute top-1/2 -translate-y-1/2 left-10 -translate-x-1/2 w-1 h-2/3 bg-[#EFA48B] z-0"></div>

          <div className="flex flex-row items-center gap-4 z-10">
            <div className="size-8 bg-[#E0EEE6] border border-[#6FAE8C]/30 rounded-full flex justify-center items-center">
              <FaCheck className="size-3 text-[#6FAE8C]" />
            </div>
            <span className="text-sm">사진 밝기 확인</span>
          </div>

          <div className="flex flex-row items-center gap-4 z-10">
            <div className="size-8 bg-[#E0EEE6] border border-[#6FAE8C]/30 rounded-full flex justify-center items-center">
              <FaCheck className="size-3 text-[#6FAE8C]" />
            </div>
            <span className="text-sm">피부 영역 분석</span>
          </div>

          <div className="flex flex-row items-center gap-4 z-10">
            <div className="size-8 bg-[#EFA48B] rounded-full flex justify-center items-center">
              <FaArrowsRotate className="text-white rotate-90 size-3" />
            </div>
            <span className="text-sm">톤 매칭 중</span>
          </div>

          <div className="flex flex-row items-center gap-4 z-10">
            <div className="size-8 bg-[#E8E1E0] rounded-full flex justify-center items-center"></div>
            <span className="text-sm">맞춤 제품 찾는 중</span>
          </div>
        </section>
      </div>
    </main>
  );
}
