import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft, HiHome, HiHeart } from "react-icons/hi2";
import { getCurrentUser } from "../api/auth";
import {
  fetchSavedProductsForUser,
  removeSavedProduct,
  type RecommendedProduct,
} from "../api/products";
import ProductDetailModal from "../components/ProductDetailModal";
import { getProductCategoryLabel } from "../constants/products";

function ProductCard({
  product,
  onRemove,
  onOpenDetails,
}: {
  product: RecommendedProduct;
  onRemove: (productId: number) => void;
  onOpenDetails: (product: RecommendedProduct) => void;
}) {
  const handleProductClick = () => {
    onOpenDetails(product);
  };

  return (
    <article
      onClick={handleProductClick}
      className="group relative cursor-pointer overflow-hidden rounded-[32px] bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300 active:scale-[0.99]"
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
          className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-[#df7e8b] text-white shadow-sm backdrop-blur-md transition-all hover:bg-[#c96d7a]"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(product.id);
          }}
        >
          <HiHeart className="size-6 fill-current" />
        </button>
      </div>

      <div className="mt-4 px-1">
        <p className="text-xs font-medium text-[#df7e8b] tracking-wider uppercase">
          {product.brandName}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-brown-800">
          {product.productName}
        </h3>
        <p className="mt-2 text-sm text-[#7a625c]">
          {product.productColor ||
            getProductCategoryLabel(product.category) ||
            product.toneType}
        </p>
      </div>
    </article>
  );
}

export default function SavedProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] =
    useState<RecommendedProduct | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;

        if (!user) {
          navigate("/login");
          return;
        }

        setUserId(user.id);
        const savedProducts = await fetchSavedProductsForUser(user.id);
        
        if (isMounted) {
          setProducts(savedProducts);
        }
      } catch (error) {
        console.error("Failed to load saved products:", error);
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

  const handleRemove = async (productId: number) => {
    if (!userId) return;

    try {
      await removeSavedProduct(userId, productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setSelectedProduct((currentProduct) =>
        currentProduct?.id === productId ? null : currentProduct,
      );
    } catch (error) {
      console.error("Failed to remove saved product:", error);
    }
  };

  return (
    <main className="min-h-dvh w-full px-5 pb-12 pt-6 bg-cream-50/30">
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm transition-transform active:scale-90"
        >
          <HiChevronLeft className="size-6" />
        </button>
        <h1 className="text-lg font-bold text-brown-800 tracking-tight">찜한 제품들</h1>
        <button
          onClick={() => navigate("/home")}
          className="flex size-10 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm transition-transform active:scale-90"
        >
          <HiHome className="size-6" />
        </button>
      </header>

      <section className="mt-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brown-900">
            내가 찜한
            <br />
            인생 아이템들이에요
          </h2>
          <p className="mt-2 text-sm text-[#7a625c]">
            {products.length > 0 
              ? `총 ${products.length}개의 상품이 저장되어 있어요.` 
              : "아직 찜한 상품이 없어요."}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[32px] bg-white aspect-[3/4] shadow-sm"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  onRemove={handleRemove}
                  onOpenDetails={setSelectedProduct}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-32 text-center py-10 px-6 rounded-3xl bg-white shadow-sm border border-cream-100">
            <div className="mx-auto size-16 flex items-center justify-center rounded-full bg-cream-50 text-[#df7e8b] mb-4">
              <HiHeart className="size-8 opacity-40" />
            </div>
            <p className="text-brown-600 text-lg font-medium">찜한 상품이 없어요</p>
            <p className="text-[#7a625c] mt-2 text-sm">추천 페이지에서 마음에 드는<br />상품을 찜해보세요!</p>
            <button
              onClick={() => navigate("/home")}
              className="mt-8 px-8 py-3 rounded-full bg-brown-600 text-white font-semibold shadow-md transition-transform active:scale-95"
            >
              추천 제품 보러가기
            </button>
          </div>
        )}
      </section>
      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          isLiked
          onClose={() => setSelectedProduct(null)}
          onToggleLike={handleRemove}
        />
      ) : null}
    </main>
  );
}
