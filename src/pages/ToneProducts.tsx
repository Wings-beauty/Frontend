import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft, HiHome, HiHeart } from "react-icons/hi2";
import { getCurrentUser } from "../api/auth";
import { fetchLatestDiagnosisSeasonForUser } from "../api/diagnosis";
import {
  fetchRecommendedProducts,
  fetchSavedProductsForUser,
  saveSavedProduct,
  removeSavedProduct,
  type RecommendedProduct,
} from "../api/products";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
  type PersonalColorSeason,
} from "../constants/personalColor";

function ProductCard({
  product,
  toneLabel,
  isLiked,
  onToggleLike,
}: {
  product: RecommendedProduct;
  toneLabel: string;
  isLiked: boolean;
  onToggleLike: (productId: number) => void;
}) {
  const hasProductUrl = Boolean(product.productUrl);

  const handleProductClick = () => {
    if (!product.productUrl) return;
    window.location.href = product.productUrl;
  };

  return (
    <article
      onClick={handleProductClick}
      className={`group relative overflow-hidden rounded-[32px] bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] ${hasProductUrl ? "cursor-pointer" : ""
        }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-[24px] bg-cream-50">
        {product.productImageUrl ? (
          <img
            src={product.productImageUrl}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
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
          className={`absolute right-3 top-3 flex size-10 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all ${isLiked
              ? "bg-[#df7e8b] text-white"
              : "bg-white/80 text-brown-600 hover:bg-white hover:text-[#df7e8b]"
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
        <p className="text-xs font-medium text-[#df7e8b] tracking-wider uppercase">
          {product.toneType || toneLabel}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-brown-800">
          {product.productName}
        </h3>
        <p className="mt-2 text-sm text-[#7a625c]">{product.brandName}</p>
      </div>
    </article>
  );
}

export default function ToneProducts() {
  const navigate = useNavigate();
  const [personalSeason, setPersonalSeason] = useState<PersonalColorSeason>(
    getStoredPersonalColorSeason(),
  );
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<Set<number>>(
    new Set(),
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

        let season = getStoredPersonalColorSeason();
        if (user) {
          setUserId(user.id);
          const [latestSeason, savedProducts] = await Promise.all([
            fetchLatestDiagnosisSeasonForUser(user.id),
            fetchSavedProductsForUser(user.id),
          ]);
          if (latestSeason) season = latestSeason;
          setSavedProductIds(new Set(savedProducts.map((p) => p.id)));
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
  }, []);

  const handleToggleLike = async (productId: number) => {
    if (!userId) {
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
    <main className="min-h-screen w-full px-5 pb-12 pt-6">
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm"
        >
          <HiChevronLeft className="size-6" />
        </button>
        <h1 className="text-lg font-bold text-brown-800">나와 맞는 제품들</h1>
        <button
          onClick={() => navigate("/home")}
          className="flex size-10 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm"
        >
          <HiHome className="size-6" />
        </button>
      </header>

      <section className="mt-20">
        <div
          className={`mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${result.accentClassName} shadow-sm`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
          {result.toneLabel}
        </div>

        <h2 className="text-2xl font-bold leading-tight text-brown-900">
          {result.seasonLabel} 톤에 딱 맞는
          <br />
          인생 아이템들을 모아봤어요
        </h2>

        {isLoading ? (
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[32px] bg-cream-100/50 aspect-[3/4]"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  toneLabel={result.toneLabel}
                  isLiked={savedProductIds.has(product.id)}
                  onToggleLike={handleToggleLike}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <p className="text-brown-600">아직 추천 제품이 없어요.</p>
          </div>
        )}
      </section>
    </main>
  );
}
