import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiChevronRight,
  HiHome,
  HiSparkles,
  HiStar,
} from "react-icons/hi2";
import type { MockUploadResponse } from "../api/mockUploadPhoto";

const lifeItems = [
  {
    name: "차분한 로즈 립",
    tag: "BEST",
    visual: "lip",
  },
  {
    name: "쿨 핑크 블러셔",
    tag: "NEW",
    visual: "blush",
  },
  {
    name: "뮤트 브라운 아이",
    tag: "TIP",
    visual: "eye",
  },
] as const;

const reviews = [
  {
    name: "민지님",
    tone: "여름 쿨 뮤트",
    text: "평소 안 어울리던 색을 피하고 나니까 메이크업이 훨씬 자연스러워졌어요.",
    layout: "wide",
  },
  {
    name: "수아님",
    tone: "봄 웜 라이트",
    text: "추천 컬러를 기준으로 립을 고르니 얼굴이 밝아 보여요.",
    layout: "small",
  },
  {
    name: "지윤님",
    tone: "겨울 쿨 브라이트",
    text: "사진 한 장으로 빠르게 확인할 수 있어서 편했어요.",
    layout: "small",
  },
] as const;

function getStoredUpload(): MockUploadResponse | null {
  const storedUpload = sessionStorage.getItem("wings_uploaded_photo");

  if (!storedUpload) {
    return null;
  }

  try {
    return JSON.parse(storedUpload) as MockUploadResponse;
  } catch {
    return null;
  }
}

function LifeItemVisual({ type }: { type: (typeof lifeItems)[number]["visual"] }) {
  if (type === "lip") {
    return (
      <div className="relative size-full overflow-hidden rounded-[18px] bg-[#161819]">
        <div className="absolute bottom-4 left-1/2 h-20 w-8 -translate-x-1/2 rounded-b-lg bg-gradient-to-r from-[#111] via-[#5b5b5b] to-[#111]" />
        <div className="absolute bottom-[84px] left-1/2 h-16 w-7 -translate-x-1/2 rounded-t-full bg-gradient-to-br from-[#db5053] to-[#9d2b38]" />
      </div>
    );
  }

  if (type === "blush") {
    return (
      <div className="relative size-full overflow-hidden rounded-[18px] bg-gradient-to-br from-[#ffd7dc] to-[#ff777f]">
        <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb3bd] blur-sm" />
      </div>
    );
  }

  return (
    <div className="relative size-full overflow-hidden rounded-[18px] bg-[#f1c8ad]">
      <div className="absolute inset-x-4 top-8 h-20 rounded-full bg-[#5f3b31] blur-sm" />
      <div className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6f8f8f]" />
      <div className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2c2424]" />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const upload = getStoredUpload();
  const isLoggedIn = Boolean(upload);
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false);

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-white px-5 pb-10 pt-6">
      <header className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="홈"
          onClick={() => navigate("/home")}
        >
          <HiHome className="size-7" aria-hidden="true" />
        </button>

        <h1 className="text-2xl font-normal leading-[30px] text-[#1f1b1b]">
          WINGS
        </h1>

        <button
          type="button"
          className="size-10 overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50 shadow-[0_4px_14px_rgb(58_37_39_/_0.12)]"
          aria-label="마이페이지로 이동"
          onClick={() => navigate("/mypage")}
        >
          <img
            src={upload?.imageUrl ?? "/illustration.png"}
            className="size-full object-cover"
            alt="프로필"
          />
        </button>
      </header>

      <section className="relative mt-16 overflow-hidden rounded-[42px] bg-gradient-to-br from-white via-cream-50 to-cream-100 px-6 py-8 shadow-[0_24px_70px_rgb(107_74_63_/_0.08)]">
        <div className="mb-8 inline-flex h-11 items-center rounded-full bg-white/85 px-5 text-base font-normal leading-6 text-[#7a625c] shadow-[0_4px_12px_rgb(107_74_63_/_0.06)]">
          AI Personal Color
        </div>

        <h2 className="text-[28px] font-normal leading-[39px] tracking-[-0.5px] text-brown-600">
          오늘의 내 톤은?
          <br />
          사진 한 장으로 바로 확인해보세요.
        </h2>
        <p className="mt-7 text-base font-normal leading-[27px] text-[#7a625c]">
          간단한 셀카 촬영으로 나에게 가장 잘 어울리는 컬러와 메이크업을 찾아드려요.
        </p>

        <button
          type="button"
          className="mt-10 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white shadow-[0_14px_24px_rgb(58_37_39_/_0.2)]"
          onClick={() => navigate("/photo")}
        >
          <HiSparkles className="size-7" aria-hidden="true" />
          AI 톤 진단 시작하기
        </button>
      </section>

      <div className="relative">
        <div className={isLoggedIn ? "" : "pointer-events-none select-none blur-[6px]"}>
          <section className="relative mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-normal leading-[30px] text-brown-600">
                나와 같은 톤의 인생템
              </h2>
              <button
                type="button"
                className="flex items-center gap-1 text-base font-normal leading-6 text-[#7a625c]"
                onClick={() => setIsPreparingModalOpen(true)}
              >
                더보기
                <HiChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative -mx-5 overflow-hidden px-5">
              <div className="flex gap-4 overflow-x-auto pb-3">
                {lifeItems.map((item) => (
                  <article key={item.name} className="w-36 shrink-0">
                    <div className="relative aspect-square overflow-hidden rounded-[18px] bg-cream-50 shadow-[0_8px_24px_rgb(107_74_63_/_0.08)]">
                      <LifeItemVisual type={item.visual} />
                      <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-normal text-[#df7e8b]">
                        {item.tag}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-normal leading-5 text-[#df7e8b]">
                      Summer mute
                    </p>
                    <h3 className="mt-1 text-base font-normal leading-6 text-brown-600">
                      {item.name}
                    </h3>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="relative mt-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-normal leading-[30px] text-brown-600">
                나와 비슷한 사람들이 사용하는 제품은?
              </h2>
              <button
                type="button"
                className="flex size-8 items-center justify-center text-[#7a625c]"
                aria-label="후기 더보기"
              >
                <HiChevronRight className="size-7" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {reviews.map((review) => (
                <article
                  key={review.name}
                  className={`rounded-[22px] bg-white p-5 shadow-[0_10px_28px_rgb(107_74_63_/_0.08)] ${
                    review.layout === "wide" ? "col-span-2 flex gap-4" : ""
                  }`}
                >
                  <div
                    className={`shrink-0 overflow-hidden rounded-full bg-cream-100 ${
                      review.layout === "wide" ? "size-16" : "mb-4 size-12"
                    }`}
                  >
                    <img
                      src="/illustration.png"
                      className="size-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-normal leading-5 text-brown-600">
                        {review.name}
                      </p>
                      <div className="flex text-cream-600" aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <HiStar key={index} className="size-3.5" />
                        ))}
                      </div>
                    </div>
                    <p className="mb-2 text-xs font-normal leading-4 text-[#df7e8b]">
                      {review.tone}
                    </p>
                    <p className="text-sm font-normal leading-[22px] text-[#7a625c]">
                      {review.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {!isLoggedIn && (
          <div className="absolute inset-x-0 top-[160px] z-10 flex justify-center">
            <button
              type="button"
              className="flex h-16 w-[260px] items-center justify-center rounded-full bg-[#92766e] text-base font-normal leading-6 text-white shadow-[0_12px_24px_rgb(58_37_39_/_0.2)]"
              onClick={() => navigate("/photo")}
            >
              퍼스널 컬러 진단하고 확인하기
            </button>
          </div>
        )}
      </div>

      {isLoggedIn && isPreparingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preparing-modal-title"
        >
          <div className="w-full max-w-[390px] rounded-[24px] bg-white px-8 pb-8 pt-9 text-center shadow-[0_24px_70px_rgb(0_0_0_/_0.18)]">
            <h2
              id="preparing-modal-title"
              className="text-[28px] font-normal leading-[38px] text-[#111]"
            >
              아직 준비 중이에요
            </h2>
            <p className="mt-7 text-base font-normal leading-[27px] text-[#111]">
              윙즈 커뮤니티에서는
              <br />
              나와 같은 톤의 사용자 리뷰와 추천 제품 정보를 볼 수 있어요.
              <br />
              서비스가 열리면 바로 알려드릴게요.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5">
              <button
                type="button"
                className="flex h-12 items-center justify-center rounded-full bg-[#92766e] text-base font-normal leading-6 text-white"
                onClick={() => setIsPreparingModalOpen(false)}
              >
                확인
              </button>
              <button
                type="button"
                className="flex h-12 items-center justify-center rounded-full bg-[#ecad43] text-base font-normal leading-6 text-white"
                onClick={() => setIsPreparingModalOpen(false)}
              >
                알림 받기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
