import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiHeart,
  HiHome,
  HiMiniUser,
  HiPaintBrush,
} from "react-icons/hi2";
import {
  fetchProfile,
  getCurrentUser,
} from "../api/auth";
import {
  fetchRecommendedProducts,
  fetchSavedProductsForUser,
  saveSavedProduct,
  removeSavedProduct,
} from "../api/products";
import type { RecommendedProduct } from "../api/products";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
  type PersonalColorSeason,
} from "../constants/personalColor";
import { getProductCategoryLabel } from "../constants/products";
import ProductDetailModal from "../components/ProductDetailModal";
import { isBoothPath } from "../utils/booth";

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
  showLike,
}: {
  product: RecommendedProduct;
  isLiked: boolean;
  onToggleLike: (productId: number) => void;
  onOpenDetails: (product: RecommendedProduct) => void;
  showLike: boolean;
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
      className="cursor-pointer border-b border-cream-200 pb-5 transition active:opacity-70"
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
            style={{ backgroundColor: product.colorHex ?? "#f3f4f6" }}
          />
        )}

        {showLike ? <button
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
        </button> : null}
      </div>

      <div className="pt-4">
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
  );
}

export default function Recommendation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const booth = isBoothPath(pathname);
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
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<RecommendedProduct | null>(null);

  useEffect(() => {
    let isMounted = true;

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
          const productsFromDb = await fetchRecommendedProducts(personalSeason);

          if (isMounted) {
            setRecommendedProducts(productsFromDb);
          }
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
  }, [personalSeason]);

  const handleToggleLike = async (productId: number) => {
    if (booth) {
      return;
    }
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
    <main className="relative min-h-[100svh] w-full bg-white px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6">
      <header className="relative flex items-center justify-between">
        {booth ? <div className="size-10" aria-hidden="true" /> : <>
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="홈으로 이동"
          onClick={() => navigate("/home")}
        >
          <HiHome className="size-7" aria-hidden="true" />
        </button>
        </>}

        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">
          WINGS
        </h1>

        {booth ? <div className="size-10" aria-hidden="true" /> : <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50 shadow-sm">
          {profile?.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              className="size-full object-cover"
              alt="프로필"
            />
          ) : (
            <HiMiniUser className="size-7 text-brown-400" aria-hidden="true" />
          )}
        </div>}
      </header>

      <section className="mt-10 px-1">
        <div
          className={`mb-5 inline-flex h-11 items-center gap-2 rounded-full px-5 text-base font-normal leading-6 text-brown-600 ${result.accentClassName}`}
        >
          <HiPaintBrush className="size-5" aria-hidden="true" />
          {result.toneLabel}
        </div>

        <h2 className="text-[1.75rem] font-semibold leading-[1.25] tracking-[-0.04em] text-brown-600">
          {result.toneLabel} 톤에 어울리는
          <br />
          추천 상품입니다
        </h2>
      </section>

      {isLoadingProducts ? (
        <section className="mt-8 border-y border-cream-200 px-5 py-8 text-center">
          <p className="text-base leading-7 text-[#7a625c]">추천 상품을 불러오는 중입니다.</p>
        </section>
      ) : null}

      {!isLoadingProducts && recommendedProducts.length === 0 ? (
        <section className="mt-8 border-y border-cream-200 px-5 py-8 text-center">
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
              showLike={!booth}
            />
          ))}
        </section>
      ) : null}

      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          isLiked={savedProductIds.has(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onToggleLike={handleToggleLike}
        />
      ) : null}
    </main>
  );
}
