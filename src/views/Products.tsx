"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { HiArrowUp, HiHeart, HiHome, HiMagnifyingGlass, HiMiniUser, HiShoppingBag } from "react-icons/hi2";
import { getCurrentUser } from "../api/auth";
import { fetchHomeDashboard } from "../api/home";
import { fetchProductsPage, fetchSavedProductsForUser, toggleSavedProduct, type RecommendedProduct } from "../api/products";
import ProductDetailModal from "../components/ProductDetailModal";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { getProductCategoryLabel } from "../constants/products";
import { personalColorResults, type PersonalColorSeason } from "../constants/personalColor";
import { useNavigate } from "../lib/router";

type ToneFilter = "all" | PersonalColorSeason;

const EMPTY_PRODUCTS: RecommendedProduct[] = [];
const PRODUCT_PAGE_SIZE = 24;

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
    <article className="app-card group overflow-hidden transition hover:-translate-y-0.5">
      <button type="button" className="block w-full text-left" onClick={() => onOpenDetails(product)}>
        <div className="relative aspect-square">
          {product.productImageUrl ? (
            <img src={product.productImageUrl} className="size-full object-cover" alt={product.productName} />
          ) : (
            <div className="size-full" style={{ backgroundColor: product.colorHex ?? "#fff9e6" }} />
          )}
          <Badge className="absolute left-3 top-3 bg-white/90 text-brown-300 backdrop-blur">{getProductCategoryLabel(product.category) || "상품"}</Badge>
        </div>
      </button>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpenDetails(product)}>
            <p className="truncate text-sm leading-5 text-[#756861]">{product.brandName}</p>
            <h3 className="mt-1 line-clamp-2 min-h-14 text-base leading-7 text-brown-600">{product.productName}</h3>
          </button>
          <button
            type="button"
            className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-cream-200 transition ${
              isLiked ? "bg-pink text-white" : "bg-white text-brown-300 hover:bg-cream-50"
            }`}
            aria-label={isLiked ? `${product.productName} 찜 해제` : `${product.productName} 찜하기`}
            onClick={() => onToggleLike(product.id)}
          >
            <HiHeart className={`size-5 ${isLiked ? "fill-current" : ""}`} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="size-4 shrink-0 rounded-full border border-brown-600/10" style={{ backgroundColor: product.colorHex ?? "#fff9e6" }} />
          <p className="min-w-0 truncate text-sm leading-5 text-brown-300">{product.productColor || product.toneType || "컬러 정보 없음"}</p>
        </div>
        {product.price ? <p className="mt-3 text-base leading-6 text-brown-600">{formatPrice(product.price)}</p> : null}
      </div>
    </article>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
          <div className="aspect-square bg-cream-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-20 rounded-full bg-cream-100" />
            <div className="h-6 rounded-full bg-cream-100" />
            <div className="h-6 w-3/4 rounded-full bg-cream-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toneFilter, setToneFilter] = useState<ToneFilter>("all");
  const [search, setSearch] = useState("");
  const [likeError, setLikeError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);

  const homeQuery = useQuery({
    queryKey: ["home-dashboard"],
    queryFn: fetchHomeDashboard,
  });
  const userQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });
  const userId = userQuery.data?.id ?? null;
  const savedProductsQuery = useQuery({
    queryKey: ["saved-products", userId],
    queryFn: () => (userId ? fetchSavedProductsForUser() : Promise.resolve([])),
    enabled: userQuery.isFetched,
  });

  const personalSeason = homeQuery.data?.profile.skinTone ?? homeQuery.data?.latestDiagnosis?.season ?? null;

  useEffect(() => {
    if (!initializedRef.current && personalSeason) {
      initializedRef.current = true;
      setToneFilter(personalSeason);
    }
  }, [personalSeason]);

  const querySeason: PersonalColorSeason | null = toneFilter === "all" ? null : toneFilter;
  const normalizedSearch = search.trim();
  const productsQuery = useInfiniteQuery({
    queryKey: ["products", querySeason, categoryFilter, normalizedSearch],
    queryFn: ({ pageParam }) =>
      fetchProductsPage({
        page: pageParam,
        pageSize: PRODUCT_PAGE_SIZE,
        season: querySeason,
        category: categoryFilter,
        search: normalizedSearch,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
  const products = productsQuery.data?.pages.flatMap((page) => page.products) ?? EMPTY_PRODUCTS;
  const categories = productsQuery.data?.pages[0]?.categories ?? [];
  const totalCount = productsQuery.data?.pages[0]?.totalCount ?? 0;
  const savedProductIds = useMemo(() => new Set((savedProductsQuery.data ?? []).map((product) => product.id)), [savedProductsQuery.data]);
  const isLoading = homeQuery.isLoading || productsQuery.isLoading;
  const hasNextPage = productsQuery.hasNextPage;
  const isFetchingNextPage = productsQuery.isFetchingNextPage;

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 560);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void productsQuery.fetchNextPage();
        }
      },
      { rootMargin: "420px 0px" },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, productsQuery]);

  const handleToggleLike = async (productId: number) => {
    if (!userId) {
      navigate("/login?returnTo=/products");
      return;
    }

    const wasLiked = savedProductIds.has(productId);
    setLikeError("");

    try {
      await toggleSavedProduct(productId);

      void savedProductsQuery.refetch();
    } catch {
      setLikeError("찜 상태를 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <main className="app-page px-5 py-5 lg:px-8 lg:py-7">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">
        <section className="app-panel px-5 py-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm leading-5 text-brown-300">
                <HiShoppingBag className="size-5" aria-hidden="true" />
                Product Library
              </div>
              <h2 className="mt-2 text-3xl font-medium leading-10 text-brown-600">내 톤에 맞는 상품부터.</h2>
              <p className="app-copy mt-3 text-base">진단 결과를 기준으로 상품을 먼저 좁히고, 브랜드와 컬러명으로 빠르게 찾아보세요.</p>
            </div>

            <div className="rounded-2xl border border-cream-200 bg-cream-50 px-5 py-4">
              <p className="text-sm leading-5 text-brown-300">현재 필터</p>
              <p className="mt-1 text-xl leading-7 text-brown-600">{toneFilter === "all" ? "전체 톤 상품" : `${personalColorResults[toneFilter].toneLabel} 상품`}</p>
              <p className="mt-1 text-sm leading-5 text-[#756861]">
                표시 {products.length}개 · 전체 {totalCount}개
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          {/* 필터 바 */}
          <div className="app-panel px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* 왼쪽: 톤 드롭다운 + 카테고리 칩 */}
              <div className="flex flex-row items-center gap-2">
                <Select value={toneFilter} onValueChange={(v) => setToneFilter(v as ToneFilter)}>
                  <SelectTrigger className="w-36!">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 톤</SelectItem>
                    {(["spring", "summer", "autumn", "winter"] as PersonalColorSeason[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {personalColorResults[s].toneLabel}
                        {s === personalSeason ? " (내 톤)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40!">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {getProductCategoryLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 오른쪽: 검색 */}
              <label className="relative block w-full sm:w-64">
                <HiMagnifyingGlass className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brown-300" aria-hidden="true" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="app-input h-10 w-full pl-10 pr-4 text-sm" placeholder="브랜드, 상품명 검색" />
              </label>
            </div>
            {likeError ? <p className="mt-2 text-sm leading-5 text-red">{likeError}</p> : null}
          </div>

          <section className="min-w-0">
            {isLoading ? <ProductSkeletonGrid /> : null}

            {!isLoading && products.length === 0 ? (
              <Card className="border-none bg-white shadow-none">
                <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                  <p className="text-lg leading-7 text-brown-600">조건에 맞는 상품이 없어요.</p>
                  <p className="mt-3 text-sm leading-6 text-[#756861]">전체 톤이나 다른 카테고리로 넓혀서 확인해보세요.</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5"
                    onClick={() => {
                      setToneFilter("all");
                      setCategoryFilter("all");
                      setSearch("");
                    }}
                  >
                    필터 초기화
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {!isLoading && products.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} isLiked={savedProductIds.has(product.id)} onOpenDetails={setSelectedProduct} onToggleLike={handleToggleLike} />
                ))}
              </div>
            ) : null}

            <div ref={loadMoreRef} className="h-8" aria-hidden="true" />

            {!isLoading && isFetchingNextPage ? (
              <div className="mt-4">
                <ProductSkeletonGrid />
              </div>
            ) : null}

            {!isLoading && products.length > 0 && !hasNextPage ? <p className="py-8 text-center text-sm leading-6 text-brown-300">마지막 상품까지 모두 확인했어요.</p> : null}
          </section>
        </section>
      </div>

      {showScrollTop ? (
        <button
          type="button"
          className="fixed bottom-6 right-5 z-40 flex size-12 items-center justify-center rounded-full border border-cream-200 bg-white text-brown-600 shadow-[0_12px_32px_rgb(58_37_39/0.16)] transition hover:bg-white lg:bottom-8 lg:right-8"
          aria-label="맨 위로 이동"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <HiArrowUp className="size-5" aria-hidden="true" />
        </button>
      ) : null}

      {selectedProduct ? (
        <ProductDetailModal product={selectedProduct} isLiked={savedProductIds.has(selectedProduct.id)} onClose={() => setSelectedProduct(null)} onToggleLike={handleToggleLike} />
      ) : null}
    </main>
  );
}
