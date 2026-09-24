import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowRight, HiOutlineCalendarDays, HiOutlineGift, HiOutlineMapPin } from "react-icons/hi2";
import { SiInstagram, SiKakaotalk } from "react-icons/si";
import { ensurePopupSession, fetchMyWishlist, logProductView, setWishlist, submitQuiz } from "../api/popup";
import { POPUP_BRANDS, POPUP_BRAND_LOGOS, POPUP_EVENT, POPUP_INFO_NEED_TIPS, POPUP_QUESTIONS, getPopupProduct, type PopupAnswers } from "../constants/popup";
import { useInView, useScrollProgress, useWideLayout } from "../hooks/usePopupMotion";
import { recommendPopupProducts, type PopupRecommendation } from "../utils/popupRecommend";
import { Doodle } from "../components/popup/Doodle";
import { PopupAllProducts } from "../components/popup/PopupAllProducts";
import { PopupHero } from "../components/popup/PopupHero";
import { PopupProductCard } from "../components/popup/PopupProductCard";
import { PopupProductSheet } from "../components/popup/PopupProductSheet";
import { PopupQuiz, type PopupQuestionId } from "../components/popup/PopupQuiz";
import { PopupSection } from "../components/popup/PopupSection";
import { PopupVisit } from "../components/popup/PopupVisit";
import { Reveal } from "../components/popup/Reveal";

const ANSWERS_KEY = "popup:answers";
const RECOMMENDATIONS_KEY = "popup:recommendations";
const TOAST_DURATION_MS = 2600;

const BRAND_STYLES: Record<string, string> = {
  꽃빵: "text-[1.5rem] font-semibold",
  클라시보: "text-[1.5rem] font-semibold",
  미니어: "text-[1.4rem] font-semibold",
  이뎃: "text-[1.5rem] font-semibold",
  더아본: "text-[1.5rem] font-semibold",
  테라케어: "text-[1.4rem] font-semibold",
  지솔브: "text-[1.5rem] font-semibold",
  희요: "text-[1.6rem] font-semibold",
};

function readSession<T>(key: string): T | null {
  try {
    const stored = sessionStorage.getItem(key);

    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

function writeSession(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 새로고침 복원만 못 할 뿐이므로 무시한다.
  }
}

function loadAnswers(): Partial<PopupAnswers> {
  const stored = readSession<Record<string, string>>(ANSWERS_KEY) ?? {};
  const answers: Partial<PopupAnswers> = {};

  for (const question of POPUP_QUESTIONS) {
    const value = stored[question.id];

    if (question.options.some((option) => option.value === value)) {
      (answers as Record<string, string>)[question.id] = value;
    }
  }

  return answers;
}

function loadRecommendations(): PopupRecommendation[] {
  const stored = readSession<{ key: string; reason: string }[]>(RECOMMENDATIONS_KEY) ?? [];

  return stored.flatMap(({ key, reason }) => {
    const product = getPopupProduct(key);

    return product ? [{ product, reason }] : [];
  });
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Popup() {
  useWideLayout();

  const scrollProgress = useScrollProgress(500);
  const [quizRef, quizInView] = useInView<HTMLDivElement>();
  const [recommendRef, recommendInView] = useInView<HTMLDivElement>();

  const [answers, setAnswers] = useState<Partial<PopupAnswers>>(loadAnswers);
  const [recommendations, setRecommendations] = useState<PopupRecommendation[]>(loadRecommendations);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [wished, setWished] = useState<Set<string>>(() => new Set());
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  const shouldScrollToResults = useRef(false);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    let isMounted = true;

    ensurePopupSession()
      .then(fetchMyWishlist)
      .then((keys) => {
        if (isMounted) setWished(new Set(keys));
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (recommendations.length > 0 && shouldScrollToResults.current) {
      shouldScrollToResults.current = false;
      scrollToId("recommend");
    }
  }, [recommendations]);

  const handleAnswer = (id: PopupQuestionId, value: string) => {
    const next = { ...answers, [id]: value } as Partial<PopupAnswers>;

    setAnswers(next);
    writeSession(ANSWERS_KEY, next);
  };

  const handleSubmit = async () => {
    const { category, criteria, texture, budget, infoNeed } = answers;

    if (!category || !criteria || !texture || !budget || !infoNeed) {
      return;
    }

    const fullAnswers: PopupAnswers = { category, criteria, texture, budget, infoNeed };
    const result = recommendPopupProducts(fullAnswers);

    setIsSubmitting(true);
    setQuizError("");

    try {
      await submitQuiz(
        fullAnswers,
        result.map(({ product }) => product.key),
      );
      writeSession(
        RECOMMENDATIONS_KEY,
        result.map(({ product, reason }) => ({ key: product.key, reason })),
      );
      shouldScrollToResults.current = true;
      setRecommendations(result);
    } catch (error) {
      setQuizError(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleWish = async (productKey: string) => {
    const next = !wished.has(productKey);
    const apply = (isWished: boolean) =>
      setWished((current) => {
        const updated = new Set(current);

        if (isWished) updated.add(productKey);
        else updated.delete(productKey);

        return updated;
      });

    apply(next);
    showToast(next ? "찜 목록에 담겼어요" : "찜을 해제했어요");

    try {
      await setWishlist(productKey, next);
    } catch (error) {
      apply(!next);
      showToast(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  const handleSaveRecommendations = async () => {
    const keysToSave = recommendations.map(({ product }) => product.key).filter((key) => !wished.has(key));

    if (keysToSave.length === 0) {
      showToast("이미 찜 목록에 저장돼 있어요");
      return;
    }

    setWished((current) => {
      const updated = new Set(current);
      for (const key of keysToSave) updated.add(key);
      return updated;
    });
    showToast("추천 결과를 찜 목록에 저장했어요!");

    try {
      await Promise.all(keysToSave.map((key) => setWishlist(key, true)));
    } catch (error) {
      setWished((current) => {
        const updated = new Set(current);
        for (const key of keysToSave) updated.delete(key);
        return updated;
      });
      showToast(error instanceof Error ? error.message : "저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleOpen = (productKey: string) => {
    setOpenKey(productKey);
    void logProductView(productKey);
  };

  const handleCloseSheet = useCallback(() => setOpenKey(null), []);

  const openRecommendation = recommendations.find(({ product }) => product.key === openKey);
  const openProduct = openRecommendation?.product ?? (openKey ? getPopupProduct(openKey) : undefined);
  const openReason = openRecommendation?.reason ?? openProduct?.reason ?? "";
  const hasResults = recommendations.length > 0;
  const showStickyCta = scrollProgress >= 1 && !quizInView && !(hasResults && recommendInView);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[2560px] overflow-x-clip bg-white text-brown-600">
      <PopupHero progress={scrollProgress} onStart={() => scrollToId("quiz")} onNavigate={scrollToId} />

      <PopupSection id="about" eyebrow="More than a pop-up" title={"좋아하는 뷰티가\n더 특별해지는 공간"} align="left" className="bg-white">
        <Reveal className="flex flex-col items-start gap-6">
          <p className="max-w-lg text-[0.95rem] leading-7 text-[#7a625c]">WINGS가 엄선한 브랜드와 제품을 직접 보고, 테스트하고, 나에게 맞는 뷰티를 발견할 수 있는 단 하루의 팝업 스토어예요.</p>
          <button type="button" onClick={() => scrollToId("info")} className="pu-btn flex h-12 items-center gap-2 rounded-full bg-brown-600 px-6 text-[0.9rem] text-white">
            팝업 자세히 보기
            <HiArrowRight className="pu-arrow size-4" aria-hidden="true" />
          </button>
        </Reveal>
      </PopupSection>

      <PopupSection id="brands" eyebrow="Special brands" title="WINGS와 함께하는 브랜드를 만나보세요" className="bg-white !py-10 md:!py-14">
        <div className="pu-marquee relative -mx-5 overflow-hidden sm:-mx-8" aria-label="참여 브랜드">
          <div className="pu-marquee-track">
            {[0, 1, 2, 3].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center gap-14 pr-14 md:gap-20 md:pr-20" aria-hidden={copy > 0}>
                {POPUP_BRANDS.map((brand) => {
                  const logo = POPUP_BRAND_LOGOS[brand];

                  return (
                    <li key={brand} className="flex shrink-0 items-center">
                      {logo ? <img src={logo} alt={brand} className="h-8 w-auto object-contain md:h-9" /> : <span className={`whitespace-nowrap text-brown-600 ${BRAND_STYLES[brand]}`}>{brand}</span>}
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
      </PopupSection>

      <PopupSection id="products" eyebrow="All products" title="이번 팝업의 모든 제품" description="퀴즈 없이도 카테고리별로 전체 제품을 바로 둘러볼 수 있어요." className="bg-white">
        <PopupAllProducts wished={wished} onOpen={handleOpen} onToggleWish={handleToggleWish} />
      </PopupSection>

      <div ref={quizRef}>
        <PopupSection
          id="quiz"
          eyebrow="Just 5 questions"
          title={"5가지 질문으로\n당신의 POP-UP PICK을 찾아드려요"}
          description="간단한 취향 선택만으로, WINGS가 엄선한 제품을 추천해드려요."
          className="bg-gradient-to-b from-white to-blush-100"
        >
          <div className="relative mx-auto max-w-lg">
            <Doodle text="1분이면 충분해요!" className="absolute -right-4 -top-8 sm:right-0" />
            <PopupQuiz answers={answers} onAnswer={handleAnswer} onSubmit={handleSubmit} isSubmitting={isSubmitting} error={quizError} />
          </div>
        </PopupSection>
      </div>

      <div ref={recommendRef}>
        {hasResults ? (
          <PopupSection id="recommend" eyebrow="Recommend for you" title="이런 제품을 만날 수 있어요" description="당신의 취향에 맞춰, 이런 제품들을 추천해드릴게요." className="bg-blush-100">
            <div className="relative">
              <Doodle text="팝업에서 직접 만나보세요!" className="absolute right-[4%] top-[-2.5rem]" />
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 pt-1 pu-no-scrollbar sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:justify-center md:gap-6 md:overflow-visible md:px-0">
                {recommendations.map(({ product, reason }, index) => (
                  <div key={product.key} className="w-[78%] shrink-0 snap-center sm:w-[60%] md:w-[19rem] xl:w-[22rem] 3xl:w-[26rem]">
                    <PopupProductCard
                      product={product}
                      reason={reason}
                      index={index}
                      wished={wished.has(product.key)}
                      onOpen={() => handleOpen(product.key)}
                      onToggleWish={() => handleToggleWish(product.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
            {answers.infoNeed ? (
              <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-blush-200 bg-white px-5 py-4 text-center">
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-brown-200">행사에서 체험하는 방법</p>
                <p className="mt-1.5 text-[0.9rem] leading-6 text-brown-400">{POPUP_INFO_NEED_TIPS[answers.infoNeed]}</p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => void handleSaveRecommendations()}
                className="pu-btn flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brown-600 px-6 text-[0.9rem] text-white sm:w-auto"
              >
                추천 결과 저장하기
              </button>
              <button
                type="button"
                onClick={() => scrollToId("info")}
                className="pu-btn flex h-12 w-full items-center justify-center gap-2 rounded-full border border-blush-300 bg-white px-6 text-[0.9rem] text-brown-400 sm:w-auto"
              >
                {POPUP_EVENT.dateShortLabel} 행사정보 확인하기
                <HiArrowRight className="pu-arrow size-4" aria-hidden="true" />
              </button>
            </div>
          </PopupSection>
        ) : null}
      </div>

      <PopupSection id="visit" eyebrow="See you there" title="언제 방문 예정이신가요?" description="방문 시간을 선택해주시면 더 좋은 경험을 준비할 수 있어요!" className="bg-blush-100">
        <div className="relative">
          <PopupVisit onToast={showToast} />
        </div>
      </PopupSection>

      <PopupSection id="info" eyebrow="Event information" title="팝업 행사 안내" align="left" className="bg-gradient-to-b from-blush-100 to-white">
        <div className="flex max-w-xl flex-col gap-7">
          <Reveal className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-rose">
              <HiOutlineCalendarDays className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-brown-600">일시</p>
              <p className="mt-2 text-[0.9rem] leading-6 text-[#7a625c]">
                {POPUP_EVENT.dateLabel}
                <br />
                {POPUP_EVENT.timeLabel}
              </p>
            </div>
          </Reveal>
          <Reveal delay={120} className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-rose">
              <HiOutlineMapPin className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-brown-600">장소</p>
              <p className="mt-2 text-[0.9rem] leading-6 text-[#7a625c]">
                {POPUP_EVENT.place}
                <br />({POPUP_EVENT.address})
              </p>
              <a href={POPUP_EVENT.mapUrl} target="_blank" rel="noreferrer" className="pu-btn mt-3 inline-flex items-center gap-1.5 rounded-full bg-brown-600 px-4 py-2 text-[0.8rem] text-white">
                지도 보기
                <HiArrowRight className="pu-arrow size-3.5" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
          <Reveal delay={240} className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-rose">
              <HiOutlineGift className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-brown-600">현장 혜택</p>
              <ul className="mt-2 flex flex-col gap-1 text-[0.9rem] leading-6 text-[#7a625c]">
                {POPUP_EVENT.benefits.map((benefit) => (
                  <li key={benefit}>· {benefit}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <p className="mt-8 text-[0.85rem] text-[#9b8179]">
          행사 당일 제품을 구매하셨나요?{" "}
          <Link to="/popup/survey" className="font-semibold text-rose underline underline-offset-4">
            구매 설문 참여하기
          </Link>
        </p>
      </PopupSection>

      <footer className="border-t border-blush-200 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-[1.3rem] tracking-[0.06em]">WINGS</span>
            <span className="text-[0.75rem] text-[#9b8179]">Find Your Tone, Meet Your Beauty</span>
          </div>
          <div className="flex items-center gap-5 text-[0.75rem] text-[#9b8179]">
            <span>개인정보처리방침</span>
            <span>이용약관</span>
            <span className="flex items-center gap-3 text-brown-300">
              <SiKakaotalk className="size-4" aria-hidden="true" />
              <SiInstagram className="size-4" aria-hidden="true" />
            </span>
          </div>
        </div>
        <p className="mx-auto mt-4 w-full max-w-6xl text-[0.7rem] text-[#b9aaa4]">이 페이지는 팝업 참여 안내용이며 온라인 결제는 제공하지 않아요.</p>
      </footer>

      {showStickyCta ? (
        <div className="pu-sticky-cta fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-white via-white/90 to-transparent p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden">
          <button
            type="button"
            onClick={() => scrollToId(hasResults ? "recommend" : "quiz")}
            className="pu-btn flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-[1rem] font-medium text-white shadow-[0_14px_32px_rgb(58_37_39/0.28)]"
          >
            {hasResults ? "내 PICK 다시 보기" : "내 취향 제품 찾기"}
            <HiArrowRight className="pu-arrow size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {toast ? (
        <div
          key={toast.id}
          role="status"
          className="pu-toast fixed bottom-24 left-1/2 z-[60] max-w-[calc(100vw-2rem)] rounded-full bg-brown-600 px-5 py-3 text-[0.88rem] text-white shadow-[0_14px_32px_rgb(58_37_39/0.3)]"
        >
          {toast.message}
        </div>
      ) : null}

      {openProduct ? (
        <PopupProductSheet product={openProduct} reason={openReason} wished={wished.has(openProduct.key)} onToggleWish={() => handleToggleWish(openProduct.key)} onClose={handleCloseSheet} />
      ) : null}
    </div>
  );
}
