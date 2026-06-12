"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { HiArrowRight, HiChatBubbleBottomCenterText, HiChatBubbleLeftRight, HiEye, HiHeart, HiNewspaper, HiSparkles } from "react-icons/hi2";
import { fetchHomeDashboard } from "../api/home";
import { fetchRecommendedProducts, fetchSavedProductsForUser, toggleSavedProduct, type RecommendedProduct } from "../api/products";
import { fetchCommunityPosts, getBoardMeta, POST_CATEGORY_LABELS } from "../api/community";
import { fetchPublishedNews } from "../api/news";
import ProductDetailModal from "../components/ProductDetailModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "../components/ui/carousel";
import { useNavigate } from "../lib/router";
import Image from "next/image";

const heroSlides = [
  {
    eyebrow: "AI Personal Color",
    title: "내 톤에 맞는 뷰티 선택.",
    description: "사진 한 장으로 퍼스널 컬러를 확인하고, 같은 톤의 리뷰와 제품을 함께 살펴보세요.",
    cta: "톤 진단 시작",
    mode: "diagnosis",
    visualTitle: "Tone Scan",
    visualMeta: "AI 진단 결과를 기준으로 리뷰와 추천을 연결합니다.",
    imageUrl: "/banner/banner3.png",
  },
  {
    eyebrow: "Tone Community",
    title: "같은 톤의 선택을 먼저 봅니다.",
    description: "발색 후기, 저장한 제품, 실패 경험까지 톤별로 모아 더 빠르게 비교할 수 있어요.",
    cta: "리뷰 보기",
    mode: "community",
    visualTitle: "Same Tone Reviews",
    visualMeta: "같은 톤 사용자의 후기와 발색 경험을 먼저 봅니다.",
    imageUrl: "/banner/banner2.png",
  },
  {
    eyebrow: "Tone Based Recommendation",
    title: "추천은 내 톤에서 시작됩니다.",
    description: "진단 결과와 커뮤니티 반응을 함께 보고 어울리는 제품만 깔끔하게 좁혀보세요.",
    cta: "상품 보기",
    mode: "recommendation",
    visualTitle: "Curated For Your Tone",
    visualMeta: "제품은 마지막 단계입니다. 먼저 내 톤과 실제 리뷰를 확인합니다.",
    imageUrl: "/banner/banner1.png",
  },
] as const;

const toneCategories = ["톤 진단", "톤별 후기", "컬러 리포트", "추천 상품"];
const HERO_CAROUSEL_INTERVAL_MS = 8000;

function HomeSkeleton() {
  return (
    <main className="min-h-dvh px-5 py-5 lg:px-10">
      <div className="mx-auto flex max-w-360 flex-col gap-5">
        <div className="h-14 rounded-2xl border border-cream-200 bg-white" />
        <div className="h-130 rounded-2xl border border-cream-200 bg-white" />
      </div>
    </main>
  );
}

function OutlineButton({ children, onClick, className = "", disabled }: { children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-cream-200 bg-white px-5 text-sm text-brown-600 transition hover:border-cream-400 hover:bg-cream-50 disabled:opacity-50 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SectionHeader({ eyebrow, title, actionLabel, onAction }: { eyebrow: string; title: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="app-eyebrow">{eyebrow}</p>
        <h2 className="text-2xl font-medium text-brown-600">{title}</h2>
      </div>
      <button type="button" className="shrink-0 text-sm text-brown-300 transition hover:text-brown-600" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}

function HeroBanner({ slide, onPrimaryAction }: { slide: (typeof heroSlides)[number]; onPrimaryAction: () => void }) {
  return (
    <article className="flex min-h-110 flex-col lg:flex-row">
      <div className="home-hero-image-shell relative min-h-72 flex-1 overflow-hidden lg:min-h-110">
        <Image src={slide.imageUrl} alt="" fill sizes="(min-width: 756px) 25vw, 50vw" priority={slide.mode === "diagnosis"} className="object-contain" />
      </div>

      <div className="flex flex-1 flex-col justify-center px-0 py-8 lg:px-14 lg:py-12">
        <p className="app-eyebrow">{slide.eyebrow}</p>
        <h1 className="mt-5 max-w-2xl text-3xl font-medium leading-[1.12] text-brown-600 md:text-5xl">{slide.title}</h1>
        <p className="app-copy mt-6 max-w-xl text-base md:text-lg">{slide.description}</p>
        <div className="mt-7">
          <OutlineButton onClick={onPrimaryAction}>
            {slide.cta}
            <HiArrowRight className="size-5" aria-hidden="true" />
          </OutlineButton>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);

  const homeQuery = useQuery({
    queryKey: ["home-dashboard"],
    queryFn: fetchHomeDashboard,
  });

  const dashboard = homeQuery.data ?? null;
  const season = dashboard?.profile.skinTone ?? dashboard?.latestDiagnosis?.season ?? null;
  const hasTone = Boolean(season);
  const userId = dashboard?.user.id ?? null;

  const productsQuery = useQuery({
    queryKey: ["home-products", season, userId],
    queryFn: async () => {
      if (!season || !userId) {
        return { products: [] as RecommendedProduct[], savedProductIds: [] as number[] };
      }

      const [recommendedProducts, savedProducts] = await Promise.all([fetchRecommendedProducts(season), fetchSavedProductsForUser()]);

      return {
        products: recommendedProducts.slice(0, 4),
        savedProductIds: savedProducts.map((product) => product.id),
      };
    },
    enabled: Boolean(season && userId),
  });

  const products = productsQuery.data?.products ?? [];
  const savedProductIds = useMemo(() => new Set(productsQuery.data?.savedProductIds ?? []), [productsQuery.data?.savedProductIds]);

  const communityQuery = useQuery({
    queryKey: ["home-community"],
    queryFn: () => fetchCommunityPosts({ pageSize: 3 }),
    staleTime: 2 * 60_000,
  });

  const newsQuery = useQuery({
    queryKey: ["home-news"],
    queryFn: fetchPublishedNews,
    staleTime: 5 * 60_000,
    select: (data) => data.slice(0, 3),
  });

  const communityPosts = communityQuery.data ?? [];
  const newsList = newsQuery.data ?? [];

  useEffect(() => {
    if (!carouselApi) return;

    const updateActiveSlide = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };

    updateActiveSlide();
    carouselApi.on("select", updateActiveSlide);
    carouselApi.on("reInit", updateActiveSlide);

    return () => {
      carouselApi.off("select", updateActiveSlide);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;

    const carouselTimer = window.setInterval(() => {
      carouselApi.scrollNext();
    }, HERO_CAROUSEL_INTERVAL_MS);

    return () => {
      window.clearInterval(carouselTimer);
    };
  }, [carouselApi]);

  const selectSlide = (index: number) => {
    if (index === activeSlide) return;
    carouselApi?.scrollTo(index);
  };

  const likeMutation = useMutation({
    mutationFn: async ({ productId, wasLiked }: { productId: number; wasLiked: boolean }) => {
      if (!userId) throw new Error("Login required");
      await toggleSavedProduct(productId);
    },
    onMutate: async ({ productId, wasLiked }) => {
      const queryKey = ["home-products", season, userId];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<{ products: RecommendedProduct[]; savedProductIds: number[] }>(queryKey);

      queryClient.setQueryData<{ products: RecommendedProduct[]; savedProductIds: number[] }>(queryKey, (currentData) => {
        if (!currentData) return currentData;
        const nextIds = new Set(currentData.savedProductIds);
        if (wasLiked) nextIds.delete(productId);
        else nextIds.add(productId);
        return { ...currentData, savedProductIds: Array.from(nextIds) };
      });

      return { previousData, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) queryClient.setQueryData(context.queryKey, context.previousData);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["home-products", season, userId] });
    },
  });

  const handleToggleLike = (productId: number) => {
    if (!userId) {
      navigate("/login?returnTo=/home");
      return;
    }

    likeMutation.mutate({ productId, wasLiked: savedProductIds.has(productId) });
  };

  if (homeQuery.isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <main className="app-page pb-24 lg:pb-12">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-10 px-5 pt-5 lg:px-10 lg:pt-8">
        <section className="app-panel relative flex flex-col justify-between overflow-hidden rounded-2xl">
          <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: true, duration: 60 }} className="flex flex-1 flex-col p-4">
            <CarouselPrevious className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 lg:flex" aria-label="이전 배너 보기" />
            <CarouselNext className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:flex" aria-label="다음 배너 보기" />
            <CarouselContent className="flex-1">
              {heroSlides.map((slide) => (
                <CarouselItem key={slide.eyebrow}>
                  <HeroBanner slide={slide} onPrimaryAction={slide.mode === "community" ? () => navigate("/community") : slide.mode === "recommendation" ? () => navigate("/products") : () => navigate("/photo")} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-10 flex items-center justify-center gap-4">
              <CarouselPrevious className="size-10 lg:hidden" aria-label="이전 배너 보기" />
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.eyebrow}
                  type="button"
                  className={`h-2 rounded-full border border-brown-600 transition-all ${index === activeSlide ? "w-10 bg-brown-600" : "w-2 bg-white"}`}
                  aria-label={`${index + 1}번 배너 보기`}
                  onClick={() => selectSlide(index)}
                />
              ))}
              <CarouselNext className="size-10 lg:hidden" aria-label="다음 배너 보기" />
            </div>
          </Carousel>
        </section>

        <section className="flex flex-col gap-4 border-y border-cream-200 py-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="app-eyebrow">Curated paths</p>
          <div className="flex flex-wrap gap-3">
            {toneCategories.map((category) => (
              <button
                key={category}
                type="button"
                className="rounded-full border border-cream-200 bg-white px-5 py-2 text-sm text-brown-300 transition hover:border-cream-400 hover:text-brown-600"
                onClick={
                  category === "톤 진단"
                    ? () => navigate("/photo")
                    : category === "톤별 후기"
                      ? () => navigate("/community")
                      : category === "컬러 리포트"
                        ? () => navigate("/news")
                        : () => navigate("/products")
                }
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 md:flex-row">
          {[
            {
              icon: HiSparkles,
              title: "AI 톤 진단",
              description: "사진 한 장으로 내 톤 기준 만들기",
              action: () => navigate("/photo"),
            },
            {
              icon: HiChatBubbleBottomCenterText,
              title: "같은 톤 리뷰",
              description: "나와 비슷한 톤의 발색 후기 보기",
              action: () => navigate("/community"),
            },
            {
              icon: HiHeart,
              title: "톤 기반 추천",
              description: "추천 이유가 있는 제품만 확인하기",
              action: () => navigate(hasTone ? "/products" : "/photo"),
            },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              className="app-card flex flex-1 items-start justify-between gap-4 px-5 py-5 text-left text-brown-600 transition hover:-translate-y-0.5"
              onClick={item.action}
            >
              <span className="flex items-start gap-3">
                <item.icon className="mt-0.5 size-5 shrink-0 text-[#A66555]" aria-hidden="true" />
                <span>
                  <strong className="block text-base font-normal">{item.title}</strong>
                  <span className="mt-1 block text-sm leading-5 text-[#756861]">{item.description}</span>
                </span>
              </span>
              <HiArrowRight className="mt-1 size-4 shrink-0 text-[#756861]" aria-hidden="true" />
            </button>
          ))}
        </section>

        <section className="flex flex-col gap-8 lg:flex-row">
          <div className="flex flex-1 flex-col">
            <SectionHeader eyebrow="Community" title="최근 톤 이야기" actionLabel="더 보기" onAction={() => navigate("/community")} />
            <div className="mt-4 flex flex-col gap-3">
              {communityQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl border border-cream-200 bg-white" />
                ))
              ) : communityPosts.length === 0 ? (
                <article className="rounded-2xl border border-dashed border-cream-200 bg-white p-5">
                  <p className="text-base leading-7 text-brown-600">아직 게시글이 없어요.</p>
                </article>
              ) : (
                communityPosts.map((post) => {
                  const board = getBoardMeta(post.category);
                  return (
                    <button
                      key={post.id}
                      type="button"
                      className="app-card p-5 text-left transition hover:-translate-y-0.5"
                      onClick={() => navigate(`/community/${post.id}`)}
                    >
                      <span
                        className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        style={{ backgroundColor: board.bgColor, color: board.textColor, border: `1px solid ${board.borderColor}` }}
                      >
                        {POST_CATEGORY_LABELS[post.category]}
                      </span>
                      <p className="line-clamp-2 text-base leading-7 text-brown-600">{post.title}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-brown-300">
                        <span>{post.authorName}</span>
                        <span className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><HiHeart className="size-3.5" />{post.likeCount}</span>
                          <span className="flex items-center gap-1"><HiChatBubbleLeftRight className="size-3.5" />{post.commentCount}</span>
                          <span className="flex items-center gap-1"><HiEye className="size-3.5" />{post.viewCount}</span>
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <SectionHeader eyebrow="Products" title="톤 기반 상품" actionLabel="전체 보기" onAction={() => navigate(hasTone ? "/products" : "/photo")} />
            <div className="mt-4 flex flex-col gap-3">
              {products.length > 0 ? (
                products.slice(0, 2).map((product) => (
                  <article key={product.id} className="app-card flex items-center justify-between gap-4 p-5">
                    <button type="button" className="min-w-0 text-left" onClick={() => setSelectedProduct(product)}>
                      <p className="truncate text-sm text-[#756861]">{product.brandName}</p>
                      <h3 className="mt-1 truncate text-base text-brown-600">{product.productName}</h3>
                    </button>
                    <button type="button" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-cream-200 bg-white" onClick={() => handleToggleLike(product.id)}>
                      {savedProductIds.has(product.id) ? "♥" : "♡"}
                    </button>
                  </article>
                ))
              ) : (
                <article className="rounded-2xl border border-dashed border-cream-200 bg-white p-5">
                  <p className="text-base leading-7 text-brown-600">진단 후 내 톤에 맞는 추천 제품이 여기에 연결됩니다.</p>
                </article>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader eyebrow="WINGS News" title="뷰티 뉴스와 톤 리포트" actionLabel="전체 보기" onAction={() => navigate("/news")} />
          {newsQuery.isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
                  <div className="aspect-[4/5] animate-pulse bg-cream-100" />
                  <div className="space-y-2 p-3">
                    <div className="h-3 w-3/4 animate-pulse rounded-full bg-cream-100" />
                    <div className="h-3 animate-pulse rounded-full bg-cream-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : newsList.length === 0 ? (
            <div className="app-panel flex items-center justify-between p-6">
              <div>
                <p className="app-eyebrow">WINGS News</p>
                <h2 className="mt-1 text-2xl font-medium text-brown-600">뷰티 뉴스와 톤 리포트</h2>
                <p className="mt-2 text-sm leading-6 text-[#756861]">컬러와 제품 이야기를 짧은 카드 뉴스로 읽어보세요.</p>
              </div>
              <HiNewspaper className="size-7 shrink-0 text-[#A66555]" aria-hidden="true" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {newsList.map((news) => (
                <button
                  key={news.id}
                  type="button"
                  className="app-card overflow-hidden text-left transition hover:-translate-y-0.5"
                  onClick={() => navigate(`/news/${news.id}`)}
                >
                  <div className="relative aspect-[4/5] bg-cream-100">
                    {news.thumbnailUrl ? (
                      <img src={news.thumbnailUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-brown-200">
                        <HiNewspaper className="size-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium leading-5 text-brown-600">{news.title}</p>
                    <p className="mt-1.5 text-xs text-brown-300">{news.authorName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedProduct ? (
        <ProductDetailModal product={selectedProduct} isLiked={savedProductIds.has(selectedProduct.id)} onClose={() => setSelectedProduct(null)} onToggleLike={handleToggleLike} />
      ) : null}
    </main>
  );
}
