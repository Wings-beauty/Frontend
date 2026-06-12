"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import { HiArrowRight, HiHome, HiMiniUser, HiPaintBrush, HiShoppingBag } from "react-icons/hi2";
import { getCurrentUser } from "../api/auth";
import { fetchHomeDashboard } from "../api/home";
import { fetchRecommendedProducts, fetchSavedProductsForUser, toggleSavedProduct, type RecommendedProduct } from "../api/products";
import { personalColorResults, type PersonalColorSeason } from "../constants/personalColor";
import { getProductCategoryLabel } from "../constants/products";
import ProductDetailModal from "../components/ProductDetailModal";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

function formatPrice(price: number | null) {
  if (typeof price !== "number") {
    return "";
  }

  return `${price.toLocaleString("ko-KR")}원`;
}

function ProductCard({
  product,
  isLiked,
  onOpenDetails,
  onToggleLike,
}: {
  product: RecommendedProduct;
  isLiked: boolean;
  onOpenDetails: (product: RecommendedProduct) => void;
  onToggleLike: (productId: number) => void;
}) {
  return (
    <article
      className="app-card group grid cursor-pointer grid-cols-[7.5rem_1fr] gap-4 p-4 transition hover:-translate-y-0.5"
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails(product);
        }
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        {product.productImageUrl ? (
          <img src={product.productImageUrl} className="size-full object-cover" alt={product.productName} />
        ) : (
          <div className="size-full" style={{ backgroundColor: product.colorHex ?? "#fff9e6" }} />
        )}

        <button
          type="button"
          className={`absolute right-2 top-1 flex items-center justify-center text-xl transition ${isLiked ? "text-[#df7e8b]" : "text-white hover:text-[#df7e8b]"}`}
          aria-label={isLiked ? `${product.productName} 찜 해제` : `${product.productName} 찜하기`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLike(product.id);
          }}
        >
          {isLiked ? "♥" : "♡"}
        </button>
      </div>

      <div className="min-w-0 py-1 pr-1">
        <p className="truncate text-sm leading-5 text-[#756861]">{product.brandName}</p>
        <h3 className="mt-2 line-clamp-2 text-lg leading-7 text-brown-600">{product.productName}</h3>
        <p className="mt-2 truncate text-sm leading-5 text-brown-300">{product.productColor || getProductCategoryLabel(product.category) || product.toneType}</p>
        {product.price ? <p className="mt-3 text-base leading-6 text-brown-600">{formatPrice(product.price)}</p> : null}
      </div>
    </article>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[7.5rem_1fr] gap-4 rounded-3xl border border-[#e5e7eb] bg-white p-4">
          <div className="aspect-square rounded-2xl bg-[#e5e7eb]" />
          <div className="space-y-3 py-2">
            <div className="h-4 w-24 rounded-full bg-[#e5e7eb]" />
            <div className="h-6 rounded-full bg-[#e5e7eb]" />
            <div className="h-6 w-4/5 rounded-full bg-[#e5e7eb]" />
            <div className="h-5 w-20 rounded-full bg-[#e5e7eb]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Recommendation() {
  const navigate = useNavigate();
  const [personalSeason, setPersonalSeason] = useState<PersonalColorSeason>("summer");
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<Set<number>>(new Set());
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [likeError, setLikeError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);
  const result = personalColorResults[personalSeason];
  const homeQuery = useQuery({
    queryKey: ["home-dashboard"],
    queryFn: fetchHomeDashboard,
  });

  useEffect(() => {
    let isMounted = true;
    const season = homeQuery.data?.profile.skinTone ?? homeQuery.data?.latestDiagnosis?.season;

    if (!season) {
      if (homeQuery.isFetched) {
        setIsLoadingProducts(false);
      }
      return;
    }

    setPersonalSeason(season);
    setIsLoadingProducts(true);

    const loadRecommendation = async () => {
      const user = await getCurrentUser();

      if (isMounted) {
        setUserId(user?.id ?? null);
      }

      const [products, savedProducts] = await Promise.all([fetchRecommendedProducts(season), user ? fetchSavedProductsForUser() : Promise.resolve([])]);

      if (isMounted) {
        setRecommendedProducts(products);
        setSavedProductIds(new Set(savedProducts.map((product) => product.id)));
      }
    };

    void loadRecommendation()
      .catch(() => {
        if (isMounted) {
          setRecommendedProducts([]);
          setSavedProductIds(new Set());
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
  }, [homeQuery.data?.latestDiagnosis?.season, homeQuery.data?.profile.skinTone, homeQuery.isFetched]);

  const handleToggleLike = async (productId: number) => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const wasLiked = savedProductIds.has(productId);
    setLikeError("");
    setSavedProductIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (wasLiked) {
        nextIds.delete(productId);
      } else {
        nextIds.add(productId);
      }

      return nextIds;
    });

    try {
      await toggleSavedProduct(productId);
      if (userId) {
        const fresh = await fetchSavedProductsForUser();
        setSavedProductIds(new Set(fresh.map((p) => p.id)));
      }
    } catch {
      setSavedProductIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (wasLiked) {
          nextIds.add(productId);
        } else {
          nextIds.delete(productId);
        }

        return nextIds;
      });
      setLikeError("찜 상태를 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <main className="app-page px-5 py-5 lg:px-8 lg:py-7">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">
        <header className="app-panel flex items-center justify-between px-4 py-3 lg:px-6">
          <Button type="button" variant="ghost" size="icon" aria-label="홈으로 이동" onClick={() => navigate("/home")}>
            <HiHome className="size-6" aria-hidden="true" />
          </Button>

          <h1 className="text-xl font-medium leading-7 text-brown-600">추천</h1>

          <Avatar className="size-10 shadow-[0_4px_14px_rgb(58_37_39/0.12)]">
            <AvatarFallback>
              <HiMiniUser className="size-7" aria-hidden="true" />
            </AvatarFallback>
          </Avatar>
        </header>

        <div className="grid gap-6 lg:grid-cols-[22rem_1fr] xl:grid-cols-[24rem_1fr]">
          <aside className="lg:sticky lg:top-7 lg:self-start">
            <Card>
              <CardHeader className="p-7">
                <Badge className={`mb-4 w-fit ${result.accentClassName}`}>
                  <HiPaintBrush className="size-4" aria-hidden="true" />
                  {result.toneLabel}
                </Badge>
                <CardTitle className="text-3xl leading-10 text-brown-600">내 톤에 맞는 상품</CardTitle>
                <CardDescription className="mt-3 text-base leading-7">진단 결과와 컬러 정보를 기준으로 어울리는 상품만 모았습니다.</CardDescription>
              </CardHeader>
              <CardContent className="p-7 pt-0">
                <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
                  <p className="text-sm leading-6 text-brown-300">추천 기준</p>
                  <p className="mt-2 text-xl leading-7 text-brown-600">{result.detailTitle}</p>
                  <div className="mt-5 grid grid-cols-5 gap-2">
                    {result.bestColors.map((color) => (
                      <div key={color} className="aspect-square rounded-full ring-1 ring-brown-600/5" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                <Button type="button" variant="outline" className="mt-5 w-full rounded-full" onClick={() => navigate("/result")}>
                  진단 결과 다시 보기
                </Button>
              </CardContent>
            </Card>
          </aside>

          <section className="min-w-0">
            <div className="app-panel mb-5 flex flex-col justify-between gap-3 px-6 py-5 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2 text-sm leading-5 text-brown-300">
                  <HiShoppingBag className="size-5" aria-hidden="true" />
                  추천 상품
                </div>
                <h2 className="mt-2 text-2xl leading-8 text-brown-600">
                  {result.toneLabel} 상품 {recommendedProducts.length}개
                </h2>
                {likeError ? <p className="mt-2 text-sm leading-5 text-red">{likeError}</p> : null}
              </div>
              <Button type="button" className="rounded-full" onClick={() => navigate("/tone-products")}>
                전체 상품 보기
                <HiArrowRight className="size-5" aria-hidden="true" />
              </Button>
            </div>

            {isLoadingProducts ? <ProductSkeletonGrid /> : null}

            {!isLoadingProducts && recommendedProducts.length === 0 ? (
              <Card className="shadow-none">
                <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                  <p className="text-lg leading-7 text-brown-600">현재 이 톤과 일치하는 상품이 없습니다.</p>
                  <p className="mt-3 text-sm leading-6 text-[#756861]">상품 데이터가 추가되면 이 화면에 자동으로 표시됩니다.</p>
                </CardContent>
              </Card>
            ) : null}

            {!isLoadingProducts && recommendedProducts.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} isLiked={savedProductIds.has(product.id)} onOpenDetails={setSelectedProduct} onToggleLike={handleToggleLike} />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {selectedProduct ? (
        <ProductDetailModal product={selectedProduct} isLiked={savedProductIds.has(selectedProduct.id)} onClose={() => setSelectedProduct(null)} onToggleLike={handleToggleLike} />
      ) : null}
    </main>
  );
}
