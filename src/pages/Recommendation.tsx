import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowRight,
  HiBell,
  HiHeart,
  HiHome,
  HiLockClosed,
  HiPaintBrush,
} from "react-icons/hi2";
import type { MockUploadResponse } from "../api/mockUploadPhoto";
import {
  getCurrentUser,
  saveCurrentDiagnosisToUser,
} from "../api/auth";
import { fetchRecommendedProducts } from "../api/products";
import type { RecommendedProduct } from "../api/products";
import { addToLaunchWaitlist } from "../api/waitlist";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
} from "../constants/personalColor";

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

function ProductCard({ product }: { product: RecommendedProduct }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-cream-200 bg-white p-3 shadow-sm">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-cream-50">
        {product.productImageUrl ? (
          <img
            src={product.productImageUrl}
            className="size-full object-cover"
            alt={product.productName}
          />
        ) : (
          <div
            className="size-full"
            style={{ backgroundColor: product.colorHex ?? "#fff9e6" }}
          />
        )}
        <button
          type="button"
          className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-full bg-white/90 text-brown-600 shadow-sm"
          aria-label={`${product.productName} 찜하기`}
        >
          <HiHeart className="size-6" aria-hidden="true" />
        </button>
      </div>

      <div className="pt-5">
        <p className="text-base font-normal leading-6 text-[#7a625c]">
          {product.brandName}
        </p>
        <h3 className="mt-3 min-h-12 text-base font-normal leading-6 text-brown-600">
          {product.productName}
        </h3>
        <p className="mt-4 text-sm font-normal leading-6 text-[#7a625c]">
          {product.productColor || product.category || product.toneType}
        </p>
      </div>
    </article>
  );
}

export default function Recommendation() {
  const navigate = useNavigate();
  const upload = getStoredUpload();
  const season = getStoredPersonalColorSeason();
  const result = personalColorResults[season];
  const [recommendedProducts, setRecommendedProducts] = useState<
    RecommendedProduct[]
  >([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchRecommendedProducts(season)
      .then((productsFromDb) => {
        if (isMounted) {
          setRecommendedProducts(productsFromDb);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [season]);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then((user) => {
      if (isMounted) {
        setIsLoggedIn(Boolean(user));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleResultSave = async () => {
    const user = await getCurrentUser();

    if (!user) {
      navigate("/login");
      return;
    }

    setIsSavingResult(true);

    try {
      await saveCurrentDiagnosisToUser(user);
      setIsLoggedIn(true);
    } finally {
      setIsSavingResult(false);
    }
  };

  const handleWaitlistSubmit = async () => {
    setIsSubmittingWaitlist(true);

    try {
      await addToLaunchWaitlist("recommendation_special_offer");
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  return (
    <main className="relative min-h-dvh w-full bg-white px-5 pb-28 pt-6">
      <header className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="홈으로 이동"
          onClick={() => navigate("/home")}
        >
          <HiHome className="size-7" aria-hidden="true" />
        </button>

        <h1 className="text-2xl font-normal leading-[30px] text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="size-10 overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50 shadow-sm">
          <img
            src={upload?.imageUrl ?? "/illustration.png"}
            className="size-full object-cover"
            alt="분석 프로필"
          />
        </div>
      </header>

      <section className="mt-16">
        <div
          className={`mb-5 inline-flex h-11 items-center gap-2 rounded-full px-5 text-base font-normal leading-6 text-brown-600 ${result.accentClassName}`}
        >
          <HiPaintBrush className="size-5" aria-hidden="true" />
          {result.toneLabel}
        </div>

        <h2 className="text-3xl font-normal leading-10 tracking-tight text-brown-600">
          {result.seasonLabel} 톤에 어울리는
          <br />
          추천 상품입니다
        </h2>
        <p className="mt-5 text-base font-normal leading-7 text-[#7a625c]">
          실제 Supabase `products` 테이블에서 `tone_type`에 현재 계절이 포함된 상품만
          가져옵니다.
        </p>
      </section>

      <section className="mt-8 rounded-[24px] bg-cream-50 px-5 py-5 text-center">
        <p className="text-base font-normal leading-[25.6px] text-[#7a625c]">
          {isLoggedIn
            ? "진단 결과를 계정에 저장할 수 있습니다."
            : "로그인하면 진단 결과와 추천 상품을 다시 확인할 수 있습니다."}
        </p>
        <button
          type="button"
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39_/_0.15)]"
          disabled={isSavingResult}
          onClick={handleResultSave}
        >
          {isSavingResult
            ? "저장 중"
            : isLoggedIn
              ? "결과 저장하기"
              : "로그인하고 결과 저장하기"}
          {isLoggedIn ? (
            <HiArrowRight className="size-5" aria-hidden="true" />
          ) : (
            <HiLockClosed className="size-5" aria-hidden="true" />
          )}
        </button>
      </section>

      {isLoadingProducts ? (
        <section className="mt-8 rounded-[24px] border border-cream-200 bg-white px-5 py-8 text-center shadow-sm">
          <p className="text-base leading-7 text-[#7a625c]">추천 상품을 불러오는 중입니다.</p>
        </section>
      ) : null}

      {!isLoadingProducts && recommendedProducts.length === 0 ? (
        <section className="mt-8 rounded-[24px] border border-cream-200 bg-white px-5 py-8 text-center shadow-sm">
          <p className="text-base leading-7 text-[#7a625c]">
            현재 톤과 일치하는 상품이 `products` 테이블에 없습니다.
          </p>
        </section>
      ) : null}

      {!isLoadingProducts && recommendedProducts.length > 0 ? (
        <section className="mt-8 grid grid-cols-2 gap-4">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[480px] bg-gradient-to-t from-white via-white/95 to-white/0 px-5 pb-5 pt-10">
        <button
          type="button"
          className="pointer-events-auto flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39_/_0.15)]"
          disabled={isSubmittingWaitlist}
          onClick={handleWaitlistSubmit}
        >
          <HiBell className="size-6" aria-hidden="true" />
          {isSubmittingWaitlist ? "신청 중" : "WINGS 특가 알림 받기"}
        </button>
      </div>
    </main>
  );
}
