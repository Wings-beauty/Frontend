"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import { HiChevronLeft, HiHome, HiHeart } from "react-icons/hi2";
import { getCurrentUser } from "../api/auth";
import { fetchLatestDiagnosisSeasonForUser } from "../api/diagnosis";
import { fetchRecommendedProducts, fetchSavedProductsForUser, toggleSavedProduct, type RecommendedProduct } from "../api/products";
import { personalColorResults, type PersonalColorSeason } from "../constants/personalColor";
import ProductDetailModal from "../components/ProductDetailModal";

function ProductCard({
  product,
  toneLabel,
  isLiked,
  onToggleLike,
  onOpenDetails,
}: {
  product: RecommendedProduct;
  toneLabel: string;
  isLiked: boolean;
  onToggleLike: (productId: number) => void;
  onOpenDetails: (product: RecommendedProduct) => void;
}) {
  const handleProductClick = () => {
    onOpenDetails(product);
  };

  return (
    <article
      onClick={handleProductClick}
      className="app-card group relative cursor-pointer overflow-hidden p-4 transition-all duration-300 active:scale-[0.99]"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        {product.productImageUrl ? (
          <img src={product.productImageUrl} className="size-full object-cover transition-transform duration-500 group-hover:scale-110" alt={product.productName} />
        ) : (
          <div className="size-full" style={{ backgroundColor: product.colorHex ?? "#fff9e6" }} />
        )}
        <button
          type="button"
          className={`absolute right-3 top-3 flex size-10 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all ${
            isLiked ? "bg-[#df7e8b] text-white" : "bg-white/80 text-brown-600 hover:bg-white hover:text-[#df7e8b]"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(product.id);
          }}
        >
          <HiHeart className={`size-6 ${isLiked ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-4 px-1">
        <p className="text-xs font-medium text-[#A66555]">{product.toneType || toneLabel}</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-brown-600">{product.productName}</h3>
        <p className="mt-2 text-sm text-[#756861]">{product.brandName}</p>
      </div>
    </article>
  );
}

export default function ToneProducts() {
  const navigate = useNavigate();
  const [personalSeason, setPersonalSeason] = useState<PersonalColorSeason>("summer");
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);
  const result = personalColorResults[personalSeason];

  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then((user) => {
      if (!user) {
        navigate("/login");
      }
    });

    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;

        let season: PersonalColorSeason | null = null;
        if (user) {
          setUserId(user.id);
          const [latestSeason, savedProducts] = await Promise.all([fetchLatestDiagnosisSeasonForUser(user.id), fetchSavedProductsForUser()]);
          if (latestSeason) season = latestSeason;
          setSavedProductIds(new Set(savedProducts.map((p) => p.id)));
        }

        if (!season) {
          setProducts([]);
          return;
        }

        setPersonalSeason(season);
        const fetchedProducts = await fetchRecommendedProducts(season);

        if (isMounted) {
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Failed to load tone products:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleToggleLike = async (productId: number) => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const isLiked = savedProductIds.has(productId);

    try {
      await toggleSavedProduct(productId);
      if (userId) {
        const fresh = await fetchSavedProductsForUser();
        setSavedProductIds(new Set(fresh.map((p) => p.id)));
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return (
    <main className="app-page px-5 pb-12 pt-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">
      <header className="app-panel flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full bg-white text-brown-600">
          <HiChevronLeft className="size-6" />
        </button>
        <h1 className="text-lg font-medium text-brown-600">톤별 상품</h1>
        <button onClick={() => navigate("/home")} className="flex size-10 items-center justify-center rounded-full bg-white text-brown-600">
          <HiHome className="size-6" />
        </button>
      </header>

      <section className="mt-10">
        <div className={`mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${result.accentClassName} shadow-sm`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
          {result.toneLabel}
        </div>

        <h2 className="text-2xl font-medium leading-tight text-brown-600">{result.seasonLabel} 톤에 어울리는 상품</h2>
        <p className="mt-2 text-sm leading-6 text-[#756861]">컬러 정보와 진단 결과를 기준으로 추천 상품을 정리했습니다.</p>

        {isLoading ? (
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-cream-100" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6">
            {products.map((product, index) => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                <ProductCard product={product} toneLabel={result.toneLabel} isLiked={savedProductIds.has(product.id)} onToggleLike={handleToggleLike} onOpenDetails={setSelectedProduct} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <p className="text-brown-600">아직 추천 제품이 없어요.</p>
          </div>
        )}
      </section>
      {selectedProduct ? (
        <ProductDetailModal product={selectedProduct} isLiked={savedProductIds.has(selectedProduct.id)} onClose={() => setSelectedProduct(null)} onToggleLike={handleToggleLike} />
      ) : null}
      </div>
    </main>
  );
}
