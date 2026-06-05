import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
<<<<<<< Updated upstream
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
  type PersonalColorSeason,
} from "../constants/personalColor";
import { getProductCategoryLabel } from "../constants/products";
import ProductDetailModal from "../components/ProductDetailModal";

type ProfileView = {
  profileImageUrl: string | null;
};

function formatPrice(price: number | null) {
  if (typeof price !== "number") {
    return "";
  }

  return `${price.toLocaleString("ko-KR")}원`;
}

function ProductCard({
  product,
  isLiked,
  onToggleLike,
  onOpenDetails,
}: {
  product: RecommendedProduct;
  isLiked: boolean;
  onToggleLike: (productId: number) => void;
  onOpenDetails: (product: RecommendedProduct) => void;
}) {
  const handleProductClick = () => {
    onOpenDetails(product);
  };

  const handleProductKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleProductClick();
  };

  return (
    <article
      onClick={handleProductClick}
      onKeyDown={handleProductKeyDown}
      role="button"
      tabIndex={0}
      className="cursor-pointer overflow-hidden rounded-2xl border border-cream-200 bg-white p-3 shadow-sm transition active:scale-[0.99]"
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
          className={`absolute right-2 top-2 flex size-10 items-center justify-center rounded-full shadow-sm transition-colors ${isLiked ? "bg-[#df7e8b] text-white" : "bg-white/90 text-brown-600 hover:text-[#df7e8b]"
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
          {product.productColor ||
            getProductCategoryLabel(product.category) ||
            product.toneType}
        </p>
        {product.price ? (
          <p className="mt-2 text-sm font-normal leading-6 text-brown-600">
            {formatPrice(product.price)}
          </p>
        ) : null}
      </div>
    </article>
=======
  HiArrowRight,
  HiBell,
  HiHeart,
  HiHome,
  HiLockClosed,
  HiPaintBrush,
} from "react-icons/hi2";
import type { MockUploadResponse } from "../api/mockUploadPhoto";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
} from "../constants/personalColor";
import { fetchRecommendedProducts } from "../api/products";
import type { RecommendedProduct } from "../api/products";
import {
  getCurrentUser,
  saveCurrentDiagnosisToUser,
} from "../api/auth";

const categories = ["인기순", "립스틱", "틴트", "치크"];

const products = [
  {
    brand: "HERA",
    name: "센슈얼 파우더 매트 리퀴드",
    copy: '"차분한 로즈 컬러로 피부톤을 맑게 보여줘요"',
    liked: false,
    visual: "lipstick",
  },
  {
    brand: "CLINIQUE",
    name: "치크 팝 - 헤더 팝",
    copy: '"뮤트톤의 정석, 자연스러운 혈색 부여"',
    liked: true,
    visual: "check",
  },
  {
    brand: "ROM&ND",
    name: "쥬시 래스팅 틴트",
    copy: '"라벤더 핑크 무드가 은은하게 올라와요"',
    liked: false,
    visual: "tint",
  },
  {
    brand: "WAKEMAKE",
    name: "소프트 블러링 아이팔레트",
    copy: '"회빛 베이스의 쉬머가 차분하게 어울려요"',
    liked: false,
    visual: "blush",
  },
  {
    brand: "AMUSE",
    name: "듀 틴트 쿨 로즈",
    copy: '"맑은 장미빛으로 입술 온도를 낮춰줘요"',
    liked: true,
    visual: "gloss",
  },
  {
    brand: "DASIQUE",
    name: "블렌딩 무드 치크",
    copy: '"부드러운 라벤더 베일로 생기를 더해요"',
    liked: false,
    visual: "palette",
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

function ProductVisual({ type }: { type: (typeof products)[number]["visual"] }) {
  if (type === "lipstick") {
    return (
      <div className="relative flex size-full items-center justify-center bg-[#fafafa]">
        <div className="absolute bottom-9 h-20 w-11 rounded-b-lg bg-gradient-to-r from-[#111] via-[#454545] to-[#111]" />
        <div className="absolute bottom-[106px] h-20 w-9 rounded-t-full bg-gradient-to-br from-[#df5451] to-[#a9272d]" />
        <div className="absolute bottom-6 left-16 size-11 rounded-full bg-black" />
        <div className="absolute bottom-5 left-24 h-8 w-14 rounded-full bg-[#202020]" />
      </div>
    );
  }

  if (type === "check") {
    return (
      <div className="flex size-full flex-col items-center justify-center bg-[#8d67ab] text-white">
        <span className="text-lg font-normal tracking-[2px] opacity-90">safe work</span>
        <div className="my-4 flex size-24 items-center justify-center rounded-full border-2 border-white/80 text-[32px] font-semibold italic">
          Check
        </div>
        <span className="text-xl font-normal tracking-[1px] opacity-90">safe work</span>
      </div>
    );
  }

  if (type === "tint") {
    return (
      <div className="relative flex size-full items-end justify-center gap-3 bg-gradient-to-br from-[#f35f63] to-[#e5787c] pb-10">
        <div className="h-20 w-8 rounded-md border border-white/35 bg-[#d63e48]/60" />
        <div className="h-28 w-9 rounded-md border border-white/35 bg-[#e04a55]/70" />
        <div className="h-32 w-8 rounded-md bg-gradient-to-b from-[#bf2544] to-[#f18a85]" />
      </div>
    );
  }

  if (type === "blush") {
    return (
      <div className="relative flex size-full items-center justify-center bg-[#1f2220]">
        <div className="flex size-32 items-center justify-center rounded-full bg-black shadow-[0_0_20px_rgb(255_255_255_/_0.1)]">
          <div className="size-24 rounded-full bg-gradient-to-br from-[#d69a88] via-[#c57972] to-[#9d655f] shadow-[inset_0_0_18px_rgb(255_255_255_/_0.25)]" />
        </div>
        <div className="absolute top-8 h-4 w-24 rounded-full bg-white/70 blur-[1px]" />
      </div>
    );
  }

  if (type === "gloss") {
    return (
      <div className="relative flex size-full items-end justify-center gap-4 bg-gradient-to-br from-[#f4d8e4] to-[#d7c3ed] pb-10">
        <div className="h-32 w-8 rounded-full bg-gradient-to-b from-[#e7b6d0] to-[#b77fab]" />
        <div className="h-36 w-9 rounded-full bg-gradient-to-b from-[#f1c0d0] to-[#cc7b91]" />
        <div className="h-24 w-8 rounded-full bg-gradient-to-b from-[#d8c3f2] to-[#9780b7]" />
      </div>
    );
  }

  return (
    <div className="grid size-full grid-cols-2 gap-3 bg-[#f8f3f7] p-7">
      <div className="rounded-2xl bg-[#d7b8d6]" />
      <div className="rounded-2xl bg-[#c8a3b6]" />
      <div className="rounded-2xl bg-[#b6abc8]" />
      <div className="rounded-2xl bg-[#df8794]" />
    </div>
>>>>>>> Stashed changes
  );
}

export default function Recommendation() {
  const navigate = useNavigate();
<<<<<<< Updated upstream
  const [personalSeason, setPersonalSeason] = useState<PersonalColorSeason>(
    getStoredPersonalColorSeason(),
  );
  const result = personalColorResults[personalSeason];
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
  const [selectedProduct, setSelectedProduct] =
    useState<RecommendedProduct | null>(null);
=======
  const upload = getStoredUpload();
  const result = personalColorResults[getStoredPersonalColorSeason()];
  const [recommendedProducts, setRecommendedProducts] = useState<
    RecommendedProduct[]
  >([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchRecommendedProducts(result.toneCode).then((productsFromDb) => {
      if (isMounted) {
        setRecommendedProducts(productsFromDb);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [result.toneCode]);
>>>>>>> Stashed changes

  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then((user) => {
<<<<<<< Updated upstream
      if (!user) {
        navigate("/login");
      }
    });

    const loadData = async () => {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        setIsLoggedIn(Boolean(user));

        if (user) {
          setUserId(user.id);
          const profileFromDb = await fetchProfile(user);
          const profileSeason = profileFromDb.skinTone;

          if (!profileSeason) {
            setRecommendedProducts([]);
            setProfile({ profileImageUrl: profileFromDb.profileImageUrl });
            return;
          }

          setPersonalSeason(profileSeason);

          const [productsFromDb, savedProducts] = await Promise.all([
            fetchRecommendedProducts(profileSeason),
            fetchSavedProductsForUser(user.id),
          ]);
          if (isMounted) {
            setRecommendedProducts(productsFromDb);
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
  }, [navigate]);

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

=======
      if (isMounted) {
        setIsLoggedIn(Boolean(user));
      }
    });

>>>>>>> Stashed changes
    return () => {
      isMounted = false;
    };
  }, []);

<<<<<<< Updated upstream
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
=======
  const handleResultSave = async () => {
    const user = await getCurrentUser();

    if (!user) {
>>>>>>> Stashed changes
      navigate("/login");
      return;
    }

<<<<<<< Updated upstream
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
=======
    setIsSavingResult(true);
    await saveCurrentDiagnosisToUser(user);
    setIsSavingResult(false);
    setIsLoggedIn(true);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
        <h1 className="text-2xl font-normal leading-[30px] text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="size-10 overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50 shadow-[0_4px_14px_rgb(58_37_39_/_0.12)]">
          <img
            src={upload?.imageUrl ?? "/illustration.png"}
            className="size-full object-cover"
            alt="분석한 프로필"
          />
        </div>
      </header>

      <section className="mt-20">
        <div className={`mb-5 inline-flex h-11 items-center gap-2 rounded-full px-5 text-base font-normal leading-6 text-brown-600 ${result.accentClassName}`}>
>>>>>>> Stashed changes
          <HiPaintBrush className="size-5" aria-hidden="true" />
          {result.toneLabel}
        </div>

<<<<<<< Updated upstream
        <h2 className="text-3xl font-normal leading-10 tracking-tight text-brown-600">
          {result.toneLabel} 톤에 어울리는
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
            현재 톤과 일치하는 상품이 존재하지 않습니다.
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
              onOpenDetails={setSelectedProduct}
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

      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          isLiked={savedProductIds.has(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onToggleLike={handleToggleLike}
        />
      ) : null}
=======
        <h2 className="text-[28px] font-normal leading-[38px] tracking-[-0.5px] text-brown-600">
          {result.toneLabel}에게
          <br />
          잘 어울리는 제품이에요
        </h2>
        <p className="mt-7 text-base font-normal leading-[25.6px] text-[#7a625c]">
          퍼스널 컬러 분석을 바탕으로 추천하는 맞춤 뷰티 아이템
        </p>
      </section>

      <nav className="mt-10 flex gap-3 overflow-x-auto pb-1">
        {categories.map((category, index) => (
          <button
            key={category}
            type="button"
            className={`h-12 shrink-0 rounded-full px-7 text-base font-normal leading-6 ${
              index === 0
                ? "bg-brown-600 text-white shadow-[0_8px_16px_rgb(58_37_39_/_0.22)]"
                : "border border-ivory bg-white text-[#7a625c]"
            }`}
          >
            {category}
          </button>
        ))}
      </nav>

      <section className="mt-8 grid grid-cols-2 gap-4">
        {recommendedProducts.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-[22px] border border-cream-200 bg-white p-3 shadow-[0_10px_28px_rgb(107_74_63_/_0.05)]"
          >
            <div className="relative aspect-square overflow-hidden rounded-[18px] bg-cream-50">
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
                className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-full bg-white/90 text-brown-600 shadow-[0_4px_14px_rgb(58_37_39_/_0.1)]"
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
              <p className="mt-4 text-sm font-normal leading-[22.4px] text-[#7a625c]">
                {product.productColor || product.category || "퍼스널 컬러 추천 제품"}
              </p>
            </div>
          </article>
        ))}

        {recommendedProducts.length === 0 && products.map((product) => (
          <article
            key={`${product.brand}-${product.name}`}
            className="overflow-hidden rounded-[22px] border border-cream-200 bg-white p-3 shadow-[0_10px_28px_rgb(107_74_63_/_0.05)]"
          >
            <div className="relative aspect-square overflow-hidden rounded-[18px] bg-cream-50">
              <ProductVisual type={product.visual} />
              <button
                type="button"
                className={`absolute right-2 top-2 flex size-10 items-center justify-center rounded-full shadow-[0_4px_14px_rgb(58_37_39_/_0.1)] ${
                  product.liked
                    ? "bg-[#f7e8ee] text-[#df7e8b]"
                    : "bg-white/90 text-brown-600"
                }`}
                aria-label={`${product.name} 찜하기`}
              >
                <HiHeart className="size-6" aria-hidden="true" />
              </button>
            </div>

            <div className="pt-5">
              <p className="text-base font-normal leading-6 text-[#7a625c]">
                {product.brand}
              </p>
              <h3 className="mt-3 min-h-12 text-base font-normal leading-6 text-brown-600">
                {product.name}
              </h3>
              <p className="mt-4 text-sm font-normal leading-[22.4px] text-[#7a625c]">
                {product.copy}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-[24px] bg-cream-50 px-5 py-6 text-center">
        <p className="text-base font-normal leading-[25.6px] text-[#7a625c]">
          {isLoggedIn
            ? "진단 결과를 계정에 저장할 수 있어요."
            : "로그인하면 진단 결과와 추천 제품을 다시 확인할 수 있어요."}
        </p>
        <button
          type="button"
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39_/_0.15)]"
          disabled={isSavingResult}
          onClick={handleResultSave}
        >
          {isLoggedIn
            ? isSavingResult
              ? "저장 중"
              : "결과 저장하기"
            : "로그인하고 결과 저장하기"}
          {isLoggedIn ? (
            <HiArrowRight className="size-5" aria-hidden="true" />
          ) : (
            <HiLockClosed className="size-5" aria-hidden="true" />
          )}
        </button>
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[480px] bg-gradient-to-t from-white via-white/95 to-white/0 px-5 pb-5 pt-10">
        <button
          type="button"
          className="pointer-events-auto flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39_/_0.15)]"
          disabled={isSavingResult}
          onClick={handleResultSave}
        >
          {isLoggedIn ? (
            <>
              <HiBell className="size-6" aria-hidden="true" />
              {isSavingResult ? "저장 중" : "WINGS 특가 알림 받기"}
            </>
          ) : (
            <>
              <HiLockClosed className="size-6" aria-hidden="true" />
              로그인하고 결과 저장하기
            </>
          )}
        </button>
      </div>
>>>>>>> Stashed changes
    </main>
  );
}
