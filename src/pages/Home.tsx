<<<<<<< Updated upstream
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronRight, HiHome, HiSparkles, HiStar, HiMiniUser, HiChatBubbleBottomCenterText } from "react-icons/hi2";
import { fetchProfile, getCurrentUser, setAuthReturnTo } from "../api/auth";
import { fetchLatestDiagnosisForUser, type LatestDiagnosis } from "../api/diagnosis";
import { fetchRecommendedProducts, fetchSavedProductsForUser, saveSavedProduct, removeSavedProduct, type RecommendedProduct } from "../api/products";
import { addToLaunchWaitlist } from "../api/waitlist";
import { HiHeart } from "react-icons/hi2";
import { getStoredPersonalColorSeason, personalColorResults, type PersonalColorSeason } from "../constants/personalColor";
import ProductDetailModal from "../components/ProductDetailModal";

type ProfileView = {
  nickname: string;
  email: string;
  profileImageUrl: string | null;
  skinTone: PersonalColorSeason | null;
};
=======
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
>>>>>>> Stashed changes

const reviews = [
  {
    name: "민지님",
<<<<<<< Updated upstream
    tone: "여름 쿨",
=======
    tone: "여름 쿨 뮤트",
>>>>>>> Stashed changes
    text: "평소 안 어울리던 색을 피하고 나니까 메이크업이 훨씬 자연스러워졌어요.",
    layout: "wide",
  },
  {
    name: "수아님",
<<<<<<< Updated upstream
    tone: "봄 웜",
    text: "요즘 이 제품 써보셨어요? 완전 좋아요!",
=======
    tone: "봄 웜 라이트",
    text: "추천 컬러를 기준으로 립을 고르니 얼굴이 밝아 보여요.",
>>>>>>> Stashed changes
    layout: "small",
  },
  {
    name: "지윤님",
<<<<<<< Updated upstream
    tone: "겨울 쿨",
    text: "겨울 쿨톤님들! 이 제품만은 피하세요!",
=======
    tone: "겨울 쿨 브라이트",
    text: "사진 한 장으로 빠르게 확인할 수 있어서 편했어요.",
>>>>>>> Stashed changes
    layout: "small",
  },
] as const;

<<<<<<< Updated upstream
const FEEDBACK_AUTO_HIDE_MS = 5000;

function hasStoredPersonalColorResult() {
  return Boolean(sessionStorage.getItem("wings_personal_color_season") ?? sessionStorage.getItem("wings_personal_color_result"));
=======
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
>>>>>>> Stashed changes
}

export default function Home() {
  const navigate = useNavigate();
<<<<<<< Updated upstream
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [personalSeason, setPersonalSeason] = useState<PersonalColorSeason>(getStoredPersonalColorSeason());
  const [hasPersonalTone, setHasPersonalTone] = useState(hasStoredPersonalColorResult());
  const [lifeProducts, setLifeProducts] = useState<RecommendedProduct[]>([]);
  const [isLoadingLifeProducts, setIsLoadingLifeProducts] = useState(false);
  const [savedProductIds, setSavedProductIds] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false);
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [isWaitlistSuccess, setIsWaitlistSuccess] = useState(false);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [latestDiagnosis, setLatestDiagnosis] = useState<LatestDiagnosis | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);
  const [showDiagnosisFeedbackCard, setShowDiagnosisFeedbackCard] = useState(false);
  const [feedbackCardRemainingMs, setFeedbackCardRemainingMs] = useState(FEEDBACK_AUTO_HIDE_MS);
  const result = personalColorResults[personalSeason];

  useEffect(() => {
    let isMounted = true;

    const loadHomeState = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) {
          return;
        }

        setIsLoggedIn(Boolean(user));

        if (!user) {
          setProfile(null);
          setLifeProducts([]);
          setAuthReturnTo("/home");
          navigate("/login", { replace: true });
          return;
        }

        const fetchProfileData = await fetchProfile(user);
        setProfile(fetchProfileData);
        setIsLoadingLifeProducts(true);

        const latestDiagnosisFromDb = await fetchLatestDiagnosisForUser(user.id);
        const profileSeason = fetchProfileData.skinTone;

        if (!isMounted) {
          return;
        }

        if (!profileSeason) {
          setHasPersonalTone(false);
          setLifeProducts([]);
          setLatestDiagnosis(latestDiagnosisFromDb);
          return;
        }

        setHasPersonalTone(true);
        setPersonalSeason(profileSeason);
        setLatestDiagnosis(latestDiagnosisFromDb);

        const [products, savedProducts] = await Promise.all([fetchRecommendedProducts(profileSeason), fetchSavedProductsForUser(user.id)]);

        if (isMounted) {
          setLifeProducts(products.slice(0, 6));
          setSavedProductIds(new Set(savedProducts.map((p) => p.id)));
          setUserId(user.id);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
          setIsLoadingLifeProducts(false);
        }
      }
    };

    void loadHomeState().catch(() => {
      if (isMounted) {
        setIsCheckingAuth(false);
        setIsLoadingLifeProducts(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!latestDiagnosis) {
      setShowDiagnosisFeedbackCard(false);
      setFeedbackCardRemainingMs(FEEDBACK_AUTO_HIDE_MS);
      return;
    }

    setShowDiagnosisFeedbackCard(true);
    setFeedbackCardRemainingMs(FEEDBACK_AUTO_HIDE_MS);

    const startedAt = Date.now();
    const hideTimeout = window.setTimeout(() => {
      setShowDiagnosisFeedbackCard(false);
      setFeedbackCardRemainingMs(0);
    }, FEEDBACK_AUTO_HIDE_MS);

    const progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(FEEDBACK_AUTO_HIDE_MS - elapsed, 0);
      setFeedbackCardRemainingMs(remaining);
    }, 100);

    return () => {
      window.clearTimeout(hideTimeout);
      window.clearInterval(progressInterval);
    };
  }, [latestDiagnosis]);

  const handleLaunchWaitlist = async () => {
    setIsSubmittingWaitlist(true);

    try {
      await addToLaunchWaitlist("home_preparing_modal");
      setIsWaitlistSuccess(true);
    } catch (error) {
      console.error("Failed to add to waitlist:", error);
      setIsPreparingModalOpen(false);
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  const handleClosePreparingModal = () => {
    setIsPreparingModalOpen(false);
    setIsWaitlistSuccess(false);
  };

  const handleToggleLike = async (productId: number) => {
    if (!isLoggedIn || !userId) {
      navigate("/login");
      return;
    }

    const isLiked = savedProductIds.has(productId);

    try {
      if (isLiked) {
        await removeSavedProduct(userId, productId);
        setSavedProductIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await saveSavedProduct(userId, productId);
        setSavedProductIds((prev) => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };
=======
  const upload = getStoredUpload();
  const isLoggedIn = Boolean(upload);
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false);
>>>>>>> Stashed changes

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-white px-5 pb-10 pt-6">
      <header className="relative flex items-center justify-between">
<<<<<<< Updated upstream
        <button type="button" className="flex size-10 items-center justify-center text-brown-600" aria-label="홈" onClick={() => navigate("/home")}>
          <HiHome className="size-7" aria-hidden="true" />
        </button>

        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">WINGS</h1>

        <button
          type="button"
          className="size-10 overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50 shadow-[0_4px_14px_rgb(58_37_39/0.12)] flex items-center justify-center"
          aria-label="마이페이지로 이동"
          onClick={() => navigate("/mypage")}
        >
          {profile?.profileImageUrl ? <img src={profile.profileImageUrl} className="size-full object-cover" alt="프로필" /> : <HiMiniUser className="size-7 text-brown-400" aria-hidden="true" />}
        </button>
      </header>

      {!isCheckingAuth && !isLoggedIn ? (
        <section className="relative mt-16 overflow-hidden rounded-3xl bg-linear-to-br from-white via-cream-50 to-cream-100 px-6 py-8 shadow-lg">
          <div className="mb-8 inline-flex h-11 items-center rounded-full bg-white/85 px-5 text-base font-normal leading-6 text-[#7a625c] shadow-sm">AI Personal Color</div>

          <h2 className="text-4xl font-normal leading-10 tracking-tight text-brown-600">
            오늘의 내 톤은?
            <br />
            사진 한 장으로 바로 확인해보세요.
          </h2>
          <p className="mt-7 text-base font-normal leading-7 text-[#7a625c]">간단한 셀카 촬영으로 나에게 가장 잘 어울리는 컬러와 메이크업을 찾아드려요.</p>

          <button
            type="button"
            className="mt-10 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white shadow-lg"
            onClick={() => navigate("/photo")}
          >
            <HiSparkles className="size-7" aria-hidden="true" />
            AI 톤 진단 시작하기
          </button>
        </section>
      ) : null}

      <div className="relative">
        <div className={isLoggedIn ? "" : "pointer-events-none select-none blur-[6px]"}>
          {latestDiagnosis && showDiagnosisFeedbackCard ? (
            <section className={`mb-10 mt-8 overflow-hidden rounded-3xl px-6 py-4 shadow-lg ${result.accentSoftClassName}`}>
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm">
                  <HiChatBubbleBottomCenterText className="size-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-normal leading-5 text-[#7a625c]">최근 진단 결과 피드백</p>
                  <h3 className="mt-2 text-xl font-normal leading-7 text-brown-600">{latestDiagnosis.toneLabel} 결과가 잘 맞았나요?</h3>
                  <p className="mt-2 text-sm font-normal leading-6 text-[#7a625c]">짧은 설문으로 추천 정확도를 함께 높여주세요.</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-5 flex h-13 w-full items-center justify-center rounded-full bg-brown-600 text-base font-normal leading-6 text-white shadow-md"
                onClick={() => navigate("/feedback")}
              >
                피드백 남기기
              </button>
              <div>
                <div className="mb-4 flex items-center justify-between gap-3"></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/60">
                  <div
                    className="h-full rounded-full bg-brown-600 transition-[width] duration-100 ease-linear"
                    style={{
                      width: `${(feedbackCardRemainingMs / FEEDBACK_AUTO_HIDE_MS) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </section>
          ) : null}
          <section className="relative mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-normal leading-7.5 text-brown-600">나와 같은 톤의 인생템</h2>
              <button type="button" className="flex items-center gap-1 text-base font-normal leading-6 text-[#7a625c]" onClick={() => navigate("/tone-products")}>
=======
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
>>>>>>> Stashed changes
                더보기
                <HiChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative -mx-5 overflow-hidden px-5">
              <div className="flex gap-4 overflow-x-auto pb-3">
<<<<<<< Updated upstream
                {isLoadingLifeProducts ? <p className="py-8 text-base font-normal leading-7 text-[#7a625c]">내 톤에 맞는 제품을 불러오는 중입니다.</p> : null}

                {!isLoadingLifeProducts && lifeProducts.length === 0 ? (
                  <p className="py-8 text-base font-normal leading-7 text-[#7a625c]">
                    {hasPersonalTone ? `현재 ${result.toneLabel}에 맞는 제품이 없습니다.` : "진단 후 내 톤에 맞는 제품을 확인할 수 있습니다."}
                  </p>
                ) : null}

                {!isLoadingLifeProducts
                  ? lifeProducts.map((product) => (
                      <article key={product.id} className="w-36 shrink-0 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                        <div className="relative aspect-square overflow-hidden rounded-3xl bg-cream-50 shadow-md">
                          {product.productImageUrl ? (
                            <img src={product.productImageUrl} className="size-full object-cover" alt={product.productName} />
                          ) : (
                            <div
                              className="size-full"
                              style={{
                                backgroundColor: product.colorHex ?? "#fff9e6",
                              }}
                            />
                          )}
                          <button
                            type="button"
                            className={`absolute right-2 top-2 flex size-8 items-center justify-center rounded-full shadow-sm transition-colors ${
                              savedProductIds.has(product.id) ? "bg-[#df7e8b] text-white" : "bg-white/90 text-brown-600"
                            }`}
                            aria-label={`${product.productName} 찜하기`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLike(product.id);
                            }}
                          >
                            <HiHeart className={`size-5 ${savedProductIds.has(product.id) ? "fill-current" : ""}`} />
                          </button>
                        </div>
                        <p className="mt-3 text-sm font-normal leading-5 text-[#df7e8b]">{product.toneType || result.toneLabel}</p>
                        <h3 className="mt-1 line-clamp-2 text-base font-normal leading-6 text-brown-600">{product.productName}</h3>
                      </article>
                    ))
                  : null}
=======
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
>>>>>>> Stashed changes
              </div>
            </div>
          </section>

          <section className="relative mt-16">
            <div className="mb-6 flex items-center justify-between">
<<<<<<< Updated upstream
              <h2 className="text-2xl font-normal leading-7.5 text-brown-600">나와 비슷한 사람들이 사용하는 제품은?</h2>
=======
              <h2 className="text-2xl font-normal leading-[30px] text-brown-600">
                나와 비슷한 사람들이 사용하는 제품은?
              </h2>
>>>>>>> Stashed changes
              <button
                type="button"
                className="flex size-8 items-center justify-center text-[#7a625c]"
                aria-label="후기 더보기"
<<<<<<< Updated upstream
                onClick={() => {
                  setIsWaitlistSuccess(false);
                  setIsPreparingModalOpen(true);
                }}
=======
>>>>>>> Stashed changes
              >
                <HiChevronRight className="size-7" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {reviews.map((review) => (
<<<<<<< Updated upstream
                <article key={review.name} className={`rounded-2xl bg-white p-5 shadow-md ${review.layout === "wide" ? "col-span-2 flex gap-4" : ""}`}>
                  <div className={`shrink-0 overflow-hidden rounded-full bg-cream-100 ${review.layout === "wide" ? "size-16" : "mb-4 size-12"} flex items-center justify-center`}>
                    <HiMiniUser className="size-8 text-brown-400" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-normal leading-5 text-brown-600">{review.name}</p>
=======
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
>>>>>>> Stashed changes
                      <div className="flex text-cream-600" aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <HiStar key={index} className="size-3.5" />
                        ))}
                      </div>
                    </div>
<<<<<<< Updated upstream
                    <p className="mb-2 text-xs font-normal leading-4 text-[#df7e8b]">{review.tone}</p>
                    <p className="text-sm font-normal leading-6 text-[#7a625c]">{review.text}</p>
=======
                    <p className="mb-2 text-xs font-normal leading-4 text-[#df7e8b]">
                      {review.tone}
                    </p>
                    <p className="text-sm font-normal leading-[22px] text-[#7a625c]">
                      {review.text}
                    </p>
>>>>>>> Stashed changes
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

<<<<<<< Updated upstream
        {!isCheckingAuth && !isLoggedIn && (
          <div className="absolute inset-x-0 top-40 z-10 flex justify-center">
            <button
              type="button"
              className="flex h-16 w-65 items-center justify-center rounded-full bg-[#92766e] text-base font-normal leading-6 text-white shadow-[0_12px_24px_rgb(58_37_39/0.2)]"
=======
        {!isLoggedIn && (
          <div className="absolute inset-x-0 top-[160px] z-10 flex justify-center">
            <button
              type="button"
              className="flex h-16 w-[260px] items-center justify-center rounded-full bg-[#92766e] text-base font-normal leading-6 text-white shadow-[0_12px_24px_rgb(58_37_39_/_0.2)]"
>>>>>>> Stashed changes
              onClick={() => navigate("/photo")}
            >
              퍼스널 컬러 진단하고 확인하기
            </button>
          </div>
        )}
      </div>

      {isLoggedIn && isPreparingModalOpen && (
<<<<<<< Updated upstream
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="preparing-modal-title">
          <div className="w-full max-w-97.5 rounded-3xl bg-white px-8 pb-8 pt-9 text-center shadow-[0_24px_70px_rgb(0_0_0/0.18)]">
            <h2 id="preparing-modal-title" className="text-[28px] font-normal leading-9.5 text-[#111]">
              {isWaitlistSuccess ? "신청 완료!" : "아직 준비 중이에요"}
            </h2>
            <p className="mt-7 text-base font-normal leading-6.75 text-[#111]">
              {isWaitlistSuccess ? (
                <>
                  감사합니다!
                  <br />
                  서비스가 업데이트 되는대로 알려드리겠습니다!
                </>
              ) : (
                <>
                  윙즈 커뮤니티에서는
                  <br />
                  나와 같은 톤의 사용자 리뷰와 추천 제품 정보를 볼 수 있어요.
                  <br />
                  서비스가 열리면 바로 알려드릴게요.
                </>
              )}
            </p>

            <div className="mt-8">
              {isWaitlistSuccess ? (
                <button type="button" className="flex h-12 w-full items-center justify-center rounded-full bg-[#92766e] text-base font-normal leading-6 text-white" onClick={handleClosePreparingModal}>
                  확인
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  <button type="button" className="flex h-12 items-center justify-center rounded-full bg-cream-100 text-base font-normal leading-6 text-brown-600" onClick={handleClosePreparingModal}>
                    취소
                  </button>
                  <button
                    type="button"
                    className="flex h-12 items-center justify-center rounded-full bg-[#ecad43] text-base font-normal leading-6 text-white shadow-md transition-transform active:scale-95"
                    disabled={isSubmittingWaitlist}
                    onClick={handleLaunchWaitlist}
                  >
                    {isSubmittingWaitlist ? "신청 중" : "알림 받기"}
                  </button>
                </div>
              )}
=======
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
>>>>>>> Stashed changes
            </div>
          </div>
        </div>
      )}
<<<<<<< Updated upstream

      {selectedProduct ? (
        <ProductDetailModal product={selectedProduct} isLiked={savedProductIds.has(selectedProduct.id)} onClose={() => setSelectedProduct(null)} onToggleLike={handleToggleLike} />
      ) : null}
=======
>>>>>>> Stashed changes
    </main>
  );
}
