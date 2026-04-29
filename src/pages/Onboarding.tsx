import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";

export default function Onboarding() {
  return (
    <>
      <div className="bg-cream w-full h-screen p-8 flex justify-center">
        {/* card  */}
        <div className="relative bg-cream-200/70 w-full max-w-97.5 max-h-233 h-full boreder border-ivory border rounded-[40px] flex flex-col justify-between items-center p-8 shadow-xl overflow-hidden">
          <h1 className="text-4xl font-light">WINGS</h1>

          {/* top circle */}
          <div className="absolute -top-12 -right-12 size-64 bg-pink/20 rounded-full blur-lg" />

          {/* bottom circle */}
          <div className="absolute top-1/3 -left-12 size-48 bg-purple/20 rounded-full blur-lg z-0" />

          <div className="flex-1 flex flex-col items-center justify-center gap-8 z-10">
            {/* illustration */}
            <div className="relative size-64 bg-white rounded-[40px] flex items-center justify-center shadow-md z-10">
              <img
                src="/illustration.png"
                className="size-61 rounded-[40px] z-10"
                alt="onboarding_illustration"
              />

              {/* center circle */}
              <div className="absolute size-72 bg-white/40 rounded-full top-1/2 -translate-y-1/2 z-0"></div>

              {/* left circle */}
              <div className="absolute size-10 bg-white rounded-full -left-2 bottom-14 flex items-center justify-center z-10">
                <div className="size-6 bg-purple/40 border border-purple/60 rounded-full"></div>
              </div>

              {/* right circle */}
              <div className="absolute size-12 bg-white rounded-full -right-2 top-6 flex items-center justify-center z-10">
                <div className="size-8 bg-pink/40 border border-pink/60 rounded-full"></div>
              </div>
            </div>

            <div className="flex flex-col items-center text-2xl">
              <span>사진 한 장으로</span>
              <span>내 퍼스널 톤을 찾아보세요</span>
            </div>

            <div className="flex flex-col items-center">
              <span>AI가 피부 톤을 분석하고</span>
              <span>나에게 어울리는 화장품을 추천해드려요.</span>
            </div>
          </div>

          <Link
            to="/photo"
            className="flex items-center justify-center bg-brown-600 text-white text-xl w-full h-14 rounded-full"
          >
            내 톤 진단하기
            <HiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </>
  );
}
