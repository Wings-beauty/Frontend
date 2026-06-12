"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import { HiChevronLeft, HiHome, HiHeart } from "react-icons/hi2";
import { getCurrentUser } from "../api/auth";
import { fetchSavedProductsForUser, toggleSavedProduct, type RecommendedProduct } from "../api/products";
import ProductDetailModal from "../components/ProductDetailModal";
import { getProductCategoryLabel } from "../constants/products";

function ProductCard({ product, onRemove, onOpenDetails }: { product: RecommendedProduct; onRemove: (productId: number) => void; onOpenDetails: (product: RecommendedProduct) => void }) {
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
        <p className="text-xs font-medium text-[#A66555]">{product.brandName}</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-brown-600">{product.productName}</h3>
        <p className="mt-2 text-sm text-[#756861]">{product.productColor || getProductCategoryLabel(product.category) || product.toneType}</p>
      </div>
    </article>
  );
}

export default function SavedProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);

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
        const savedProducts = await fetchSavedProductsForUser();

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
      await toggleSavedProduct(productId);
      const fresh = await fetchSavedProductsForUser();
      setProducts(fresh);
      setSelectedProduct((currentProduct) => (currentProduct?.id === productId ? null : currentProduct));
    } catch (error) {
      console.error("Failed to remove saved product:", error);
    }
  };

  return (
    <main className="app-page px-5 pb-12 pt-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">
      <header className="app-panel flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full bg-white text-brown-600 transition-transform active:scale-90">
          <HiChevronLeft className="size-6" />
        </button>
        <h1 className="text-lg font-medium text-brown-600">저장한 상품</h1>
        <button onClick={() => navigate("/home")} className="flex size-10 items-center justify-center rounded-full bg-white text-brown-600 transition-transform active:scale-90">
          <HiHome className="size-6" />
        </button>
      </header>

      <section className="mt-10">
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-brown-600">다시 보고 싶은 상품</h2>
          <p className="mt-2 text-sm text-[#756861]">{products.length > 0 ? `총 ${products.length}개의 상품을 저장했어요.` : "아직 저장한 상품이 없어요."}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-cream-100" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {products.map((product, index) => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                <ProductCard product={product} onRemove={handleRemove} onOpenDetails={setSelectedProduct} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-24 rounded-2xl border border-cream-200 bg-white px-6 py-10 text-center">
            <div className="mx-auto size-16 flex items-center justify-center rounded-full bg-white text-[#df7e8b] mb-4">
              <HiHeart className="size-8 opacity-40" />
            </div>
            <p className="text-lg font-medium text-brown-600">저장한 상품이 없어요</p>
            <p className="mt-2 text-sm text-[#756861]">
              상품 페이지에서 마음에 드는
              <br />
              상품을 찜해보세요!
            </p>
            <button onClick={() => navigate("/products")} className="mt-8 rounded-full bg-brown-600 px-8 py-3 font-medium text-white transition-transform active:scale-95">
              상품 보러가기
            </button>
          </div>
        )}
      </section>
      {selectedProduct ? <ProductDetailModal product={selectedProduct} isLiked onClose={() => setSelectedProduct(null)} onToggleLike={handleRemove} /> : null}
      </div>
    </main>
  );
}
