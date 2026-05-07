import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiBell,
  HiHeart,
  HiHome,
  HiMiniUser,
  HiPaintBrush,
} from "react-icons/hi2";
import {
  fetchProfile,
  getCurrentUser,
  saveCurrentDiagnosisToUser,
} from "../api/auth";
import {
  fetchRecommendedProducts,
  fetchSavedProductsForUser,
  saveSavedProduct,
  removeSavedProduct,
} from "../api/products";
import type { RecommendedProduct } from "../api/products";
import { addToLaunchWaitlist } from "../api/waitlist";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
} from "../constants/personalColor";

type ProfileView = {
  profileImageUrl: string | null;
};

function ProductCard({
  product,
  isLiked,
  onToggleLike,
}: {
  product: RecommendedProduct;
  isLiked: boolean;
  onToggleLike: (productId: number) => void;
}) {
  // 상품 URL이 있는지 여부를 미리 계산해서 클릭 가능 상태를 판단한다.
  const hasProductUrl = Boolean(product.productUrl);

  // 상품 카드를 클릭했을 때 실행되는 함수다.
  const handleProductClick = () => {
    // 상품 URL이 없으면 아무 동작도 하지 않는다.
    if (!product.productUrl) {
      return;
    }

    // 상품 URL이 있으면 해당 주소로 이동한다.
    window.location.href = product.productUrl;
  };

  // 키보드 접근성을 위해 Enter 또는 Space 입력 시에도 이동하게 처리한다.
  const handleProductKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    // Enter 또는 Space 키가 아닌 경우에는 아무 동작도 하지 않는다.
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    // Space 키 입력 시 페이지 스크롤이 발생하지 않도록 기본 동작을 막는다.
    event.preventDefault();

    // 키보드 입력으로도 상품 URL 이동을 실행한다.
    handleProductClick();
  };

  return (
    <article
      onClick={handleProductClick}
      onKeyDown={handleProductKeyDown}
      role={hasProductUrl ? "button" : undefined}
      tabIndex={hasProductUrl ? 0 : undefined}
      className={`overflow-hidden rounded-2xl border border-cream-200 bg-white p-3 shadow-sm ${
        hasProductUrl ? "cursor-pointer transition hover:-translate-y-1 hover:shadow-md" : ""
      }`}
    >
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
          className={`absolute right-2 top-2 flex size-10 items-center justify-center rounded-full shadow-sm transition-colors ${
            isLiked ? "bg-[#df7e8b] text-white" : "bg-white/90 text-brown-600 hover:text-[#df7e8b]"
          }`}
          aria-label={`${product.productName} 찜하기`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLike(product.id);
          }}
        >
          <HiHeart className={`size-6 ${isLiked ? "fill-current" : ""}`} aria-hidden="true" />
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
  const season = getStoredPersonalColorSeason();
  const result = personalColorResults[season];
  const [recommendedProducts, setRecommendedProducts] = useState<
    RecommendedProduct[]
  >([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [savedProductIds, setSavedProductIds] = useState<Set<number>>(new Set());
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [resultSaveError, setResultSaveError] = useState("");
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isWaitlistSuccess, setIsWaitlistSuccess] = useState(false);
  const [profile, setProfile] = useState<ProfileView | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [productsFromDb, user] = await Promise.all([
          fetchRecommendedProducts(season),
          getCurrentUser(),
        ]);

        if (!isMounted) return;

        setRecommendedProducts(productsFromDb);
        setIsLoggedIn(Boolean(user));
        
        if (user) {
          setUserId(user.id);
          const [savedProducts, profileFromDb] = await Promise.all([
            fetchSavedProductsForUser(user.id),
            fetchProfile(user),
          ]);
          if (isMounted) {
            setSavedProductIds(new Set(savedProducts.map((p) => p.id)));
            setProfile({ profileImageUrl: profileFromDb.profileImageUrl });
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Failed to load recommendation data:", error);
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [season]);

  useEffect(() => {
    let isMounted = true;

    const saveDiagnosisForCurrentUser = async () => {
      try {
        const user = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setIsLoggedIn(Boolean(user));

        if (!user) {
          return;
        }

        setIsSavingResult(true);

        await saveCurrentDiagnosisToUser(user);

        if (isMounted) {
          setResultSaveError("");
        }
      } catch {
        if (isMounted) {
          setResultSaveError("진단 결과 자동 저장에 실패했습니다. 잠시 후 다시 확인해주세요.");
        }
      } finally {
        if (isMounted) {
          setIsSavingResult(false);
        }
      }
    };

    void saveDiagnosisForCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleWaitlistSubmit = async () => {
    setIsSubmittingWaitlist(true);

    try {
      await addToLaunchWaitlist("recommendation_special_offer");
      setIsWaitlistSuccess(true);
      setIsWaitlistModalOpen(true);
    } catch (error) {
      console.error("Failed to add to waitlist:", error);
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  const handleCloseWaitlistModal = () => {
    setIsWaitlistModalOpen(false);
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

        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50 shadow-sm">
          {profile?.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              className="size-full object-cover"
              alt="프로필"
            />
          ) : (
            <HiMiniUser className="size-7 text-brown-400" aria-hidden="true" />
          )}
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
      </section>

      <section className="mt-8 rounded-3xl bg-cream-50 px-5 py-5 text-center">
        <p className="text-base font-normal leading-[25.6px] text-[#7a625c]">
          {isSavingResult
            ? "진단 결과를 계정에 자동으로 저장하는 중입니다."
            : resultSaveError
              ? resultSaveError
              : isLoggedIn
              ? "진단 결과가 계정에 자동으로 저장되었습니다."
              : "로그인하면 진단 결과와 추천 상품을 다시 확인할 수 있습니다."}
        </p>
        <button
          type="button"
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39/0.15)]"
          onClick={() => navigate("/home")}
        >
          홈으로 이동
          <HiHome className="size-5" aria-hidden="true" />
        </button>
      </section>

      {isLoadingProducts ? (
        <section className="mt-8 rounded-3xl border border-cream-200 bg-white px-5 py-8 text-center shadow-sm">
          <p className="text-base leading-7 text-[#7a625c]">추천 상품을 불러오는 중입니다.</p>
        </section>
      ) : null}

      {!isLoadingProducts && recommendedProducts.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-cream-200 bg-white px-5 py-8 text-center shadow-sm">
          <p className="text-base leading-7 text-[#7a625c]">
            현재 톤과 일치하는 상품이 `products` 테이블에 없습니다.
          </p>
        </section>
      ) : null}

      {!isLoadingProducts && recommendedProducts.length > 0 ? (
        <section className="mt-8 grid grid-cols-2 gap-4">
          {recommendedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isLiked={savedProductIds.has(product.id)}
              onToggleLike={handleToggleLike}
            />
          ))}
        </section>
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 bg-linear-to-t from-white via-white/95 to-white/0 px-5 pb-5 pt-10">
        <button
          type="button"
          className="pointer-events-auto flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39/0.15)] transition-transform active:scale-95"
          disabled={isSubmittingWaitlist}
          onClick={handleWaitlistSubmit}
        >
          <HiBell className="size-6" aria-hidden="true" />
          {isSubmittingWaitlist ? "신청 중" : "WINGS 특가 알림 받기"}
        </button>
      </div>

      {isWaitlistModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-modal-title"
        >
          <div className="w-full max-w-97.5 rounded-3xl bg-white px-8 pb-8 pt-9 text-center shadow-[0_24px_70px_rgb(0_0_0/0.18)]">
            <h2
              id="waitlist-modal-title"
              className="text-[28px] font-normal leading-9.5 text-[#111]"
            >
              {isWaitlistSuccess ? "신청 완료!" : "신청 실패"}
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
                  알림 신청 중 오류가 발생했습니다.
                  <br />
                  잠시 후 다시 시도해주세요.
                </>
              )}
            </p>

            <div className="mt-8">
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#92766e] text-base font-normal leading-6 text-white"
                onClick={handleCloseWaitlistModal}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
