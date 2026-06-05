"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { HiArrowRight, HiBell, HiChatBubbleBottomCenterText, HiHeart, HiHome, HiMiniUser, HiNewspaper, HiSparkles, HiUserGroup } from "react-icons/hi2";
import { fetchHomeDashboard, joinLaunchWaitlist } from "../api/home";
import { fetchRecommendedProducts, fetchSavedProductsForUser, removeSavedProduct, saveSavedProduct, type RecommendedProduct } from "../api/products";
import ProductDetailModal from "../components/ProductDetailModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "../components/ui/carousel";
import { useNavigate } from "../lib/router";
import Image from "next/image";

const heroSlides = [
  {
    eyebrow: "AI Personal Color",
    title: "내 톤을 알면, 리뷰도 제품도 다르게 보입니다.",
    description: "WINGS는 사진 한 장으로 퍼스널컬러를 진단하고, 같은 톤 사람들이 검증한 리뷰와 추천 제품까지 연결합니다.",
    cta: "AI 톤 진단 시작하기",
    mode: "diagnosis",
    visualTitle: "Tone Scan",
    visualMeta: "AI 진단 결과를 기준으로 리뷰와 추천을 연결합니다.",
    imageUrl: "/banner/banner3.png",
  },
  {
    eyebrow: "Tone Community",
    title: "나와 같은 톤의 사람들이 고른 이유를 먼저 봅니다.",
    description: "인기순이 아니라 비슷한 톤 사용자들의 발색 후기, 저장, 실패 경험을 기준으로 선택을 도와줍니다.",
    cta: "톤별 리뷰 보기",
    mode: "community",
    visualTitle: "Same Tone Reviews",
    visualMeta: "같은 톤 사용자의 후기와 발색 경험을 먼저 봅니다.",
    imageUrl: "/banner/banner2.png",
  },
  {
    eyebrow: "Tone Based Recommendation",
    title: "추천은 상품 목록이 아니라, 내 톤에서 시작됩니다.",
    description: "진단 결과와 커뮤니티 반응을 함께 보고 내 톤에 맞는 제품만 좁혀서 확인하세요.",
    cta: "추천 흐름 보기",
    mode: "recommendation",
    visualTitle: "Curated For Your Tone",
    visualMeta: "제품은 마지막 단계입니다. 먼저 내 톤과 실제 리뷰를 확인합니다.",
    imageUrl: "/banner/banner1.png",
  },
] as const;

const communityPreview = ["여름 쿨 유저들이 저장한 로즈 립 후기", "봄 웜이 실패 적었다고 말한 코랄 블러셔", "가을 웜 파우치에서 자주 언급된 로즈 브라운"];
const toneCategories = ["AI 진단", "같은 톤 후기", "톤 리포트", "추천 제품"];
const HERO_CAROUSEL_INTERVAL_MS = 8000;

function HomeSkeleton() {
  return (
    <main className="min-h-dvh px-5 py-5 lg:px-10">
      <div className="mx-auto flex max-w-360 flex-col gap-5">
        <div className="h-14 rounded-full border border-[#E8D7B2]" />
        <div className="h-130 rounded-4xl border border-[#E8D7B2]" />
      </div>
    </main>
  );
}

function OutlineButton({ children, onClick, className = "", disabled }: { children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#E8D7B2] px-5 text-sm text-[#3A2527] transition disabled:opacity-50 ${className}`}
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
        <p className="text-sm text-[#C98F7A]">{eyebrow}</p>
        <h2 className="text-2xl text-[#3A2527]">{title}</h2>
      </div>
      <button type="button" className="shrink-0 text-sm text-[#6B4A3F]" onClick={onAction}>
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
        <p className="text-sm uppercase tracking-[0.22em] text-[#C98F7A]">{slide.eyebrow}</p>
        <h1 className="mt-5 max-w-2xl text-2xl leading-[1.08] text-[#3A2527] md:text-4xl">{slide.title}</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[#7A625C] md:text-lg md:leading-8">{slide.description}</p>
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
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isWaitlistSuccess, setIsWaitlistSuccess] = useState(false);

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

      const [recommendedProducts, savedProducts] = await Promise.all([fetchRecommendedProducts(season), fetchSavedProductsForUser(userId)]);

      return {
        products: recommendedProducts.slice(0, 4),
        savedProductIds: savedProducts.map((product) => product.id),
      };
    },
    enabled: Boolean(season && userId),
  });

  const products = productsQuery.data?.products ?? [];
  const savedProductIds = useMemo(() => new Set(productsQuery.data?.savedProductIds ?? []), [productsQuery.data?.savedProductIds]);

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
      if (wasLiked) await removeSavedProduct(userId, productId);
      else await saveSavedProduct(userId, productId);
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

  const waitlistMutation = useMutation({
    mutationFn: () => joinLaunchWaitlist("home_first_screen"),
    onSuccess: () => setIsWaitlistSuccess(true),
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
    <main className="min-h-dvh pb-24 text-[#3A2527] lg:pb-12">
      <header className="sticky top-0 z-40 border-b border-[#E8D7B2] backdrop-blur">
        <div className="mx-auto flex max-w-360 items-center justify-between px-5 py-5 lg:px-10">
          <button type="button" className="text-2xl tracking-[0.26em] text-[#3A2527]" onClick={() => navigate("/home")}>
            WINGS
          </button>

          <nav className="hidden items-center gap-16 text-sm uppercase tracking-[0.14em] text-[#6B4A3F] lg:flex">
            <button type="button" onClick={() => navigate("/photo")}>
              Diagnose
            </button>
            <button type="button" onClick={() => setIsWaitlistOpen(true)}>
              Community
            </button>
            <button type="button" onClick={() => navigate("/recommendation")}>
              Recommendations
            </button>
            <button type="button" onClick={() => setIsWaitlistOpen(true)}>
              News
            </button>
          </nav>

          <nav className="hidden items-center gap-7 text-sm uppercase tracking-[0.14em] text-[#6B4A3F] md:flex">
            <button type="button" className="flex size-10 items-center justify-center rounded-full border border-[#E8D7B2] text-[#6B4A3F]" aria-label="알림" onClick={() => setIsWaitlistOpen(true)}>
              <HiBell className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-[#E8D7B2] text-[#6B4A3F]"
              aria-label="마이페이지"
              onClick={() => navigate("/mypage")}
            >
              {dashboard?.profile.profileImageUrl ? <img src={dashboard.profile.profileImageUrl} alt="" className="size-full object-cover" /> : <HiMiniUser className="size-5" aria-hidden="true" />}
            </button>
          </nav>
        </div>

        <nav className="mx-auto flex max-w-360 items-center gap-2 overflow-x-auto px-5 pb-4 text-sm md:hidden">
          {[
            { label: "AI 진단", action: () => navigate("/photo") },
            { label: "커뮤니티", action: () => setIsWaitlistOpen(true) },
            { label: "추천", action: () => navigate("/recommendation") },
            { label: "뉴스", action: () => setIsWaitlistOpen(true) },
          ].map((item) => (
            <button key={item.label} type="button" className="shrink-0 rounded-full border border-[#E8D7B2] px-4 py-2 text-[#6B4A3F]" onClick={item.action}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex w-full max-w-360 flex-col gap-10 px-5 pt-5 lg:px-10 lg:pt-8">
        <section className="relative flex flex-col justify-between overflow-hidden border border-[#E8D7B2] rounded-4xl shadow-[0_18px_60px_rgb(58_37_39/0.08)]">
          <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: true, duration: 60 }} className="flex flex-1 flex-col p-4">
            <CarouselPrevious className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 lg:flex" aria-label="이전 배너 보기" />
            <CarouselNext className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:flex" aria-label="다음 배너 보기" />
            <CarouselContent className="flex-1">
              {heroSlides.map((slide) => (
                <CarouselItem key={slide.eyebrow}>
                  <HeroBanner slide={slide} onPrimaryAction={slide.mode === "community" ? () => setIsWaitlistOpen(true) : () => navigate("/photo")} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-10 flex items-center justify-center gap-4">
              <CarouselPrevious className="size-10 lg:hidden" aria-label="이전 배너 보기" />
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.eyebrow}
                  type="button"
                  className={`h-2 rounded-full border border-[#3A2527] transition-all ${index === activeSlide ? "w-10" : "w-2"}`}
                  aria-label={`${index + 1}번 배너 보기`}
                  onClick={() => selectSlide(index)}
                />
              ))}
              <CarouselNext className="size-10 lg:hidden" aria-label="다음 배너 보기" />
            </div>
          </Carousel>
        </section>

        <section className="flex flex-col gap-4 border-y border-[#E8D7B2] py-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm uppercase tracking-[0.2em] text-[#C98F7A]">Curated paths</p>
          <div className="flex flex-wrap gap-3">
            {toneCategories.map((category) => (
              <button
                key={category}
                type="button"
                className="rounded-full border border-[#E8D7B2] px-5 py-2 text-sm text-[#6B4A3F]"
                onClick={category === "AI 진단" ? () => navigate("/photo") : () => setIsWaitlistOpen(true)}
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
              action: () => setIsWaitlistOpen(true),
            },
            {
              icon: HiHeart,
              title: "톤 기반 추천",
              description: "추천 이유가 있는 제품만 확인하기",
              action: () => navigate(hasTone ? "/recommendation" : "/photo"),
            },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              className="flex flex-1 items-start justify-between gap-4 rounded-[24px] border border-[#E8D7B2] px-5 py-5 text-left text-[#3A2527]"
              onClick={item.action}
            >
              <span className="flex items-start gap-3">
                <item.icon className="mt-0.5 size-5 shrink-0 text-[#C98F7A]" aria-hidden="true" />
                <span>
                  <strong className="block text-base font-normal">{item.title}</strong>
                  <span className="mt-1 block text-sm leading-5 text-[#7A625C]">{item.description}</span>
                </span>
              </span>
              <HiArrowRight className="mt-1 size-4 shrink-0 text-[#7A625C]" aria-hidden="true" />
            </button>
          ))}
        </section>

        <section className="flex flex-col gap-8 lg:flex-row">
          <div className="flex flex-1 flex-col">
            <SectionHeader eyebrow="Preview" title="같은 톤 리뷰 미리보기" actionLabel="더 보기" onAction={() => setIsWaitlistOpen(true)} />
            <div className="mt-4 flex flex-col gap-3">
              {communityPreview.map((review) => (
                <article key={review} className="rounded-[24px] border border-[#E8D7B2] p-5">
                  <p className="text-base leading-7 text-[#3A2527]">{review}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <SectionHeader eyebrow="Next" title="톤 기반 추천 제품" actionLabel="전체 보기" onAction={() => navigate(hasTone ? "/recommendation" : "/photo")} />
            <div className="mt-4 flex flex-col gap-3">
              {products.length > 0 ? (
                products.slice(0, 2).map((product) => (
                  <article key={product.id} className="flex items-center justify-between gap-4 rounded-[24px] border border-[#E8D7B2] p-5">
                    <button type="button" className="min-w-0 text-left" onClick={() => setSelectedProduct(product)}>
                      <p className="truncate text-sm text-[#7A625C]">{product.brandName}</p>
                      <h3 className="mt-1 truncate text-base text-[#3A2527]">{product.productName}</h3>
                    </button>
                    <button type="button" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#E8D7B2]" onClick={() => handleToggleLike(product.id)}>
                      {savedProductIds.has(product.id) ? "♥" : "♡"}
                    </button>
                  </article>
                ))
              ) : (
                <article className="rounded-[24px] border border-dashed border-[#E8D7B2] p-5">
                  <p className="text-base leading-7 text-[#3A2527]">진단 후 내 톤에 맞는 추천 제품이 여기에 연결됩니다.</p>
                </article>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-[28px] border border-[#E8D7B2] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-[#C98F7A]">WINGS News</p>
            <h2 className="mt-1 text-2xl text-[#3A2527]">뷰티 뉴스와 톤 리포트는 준비 중입니다.</h2>
            <p className="mt-2 text-sm leading-6 text-[#7A625C]">첫 화면에서는 진단과 커뮤니티 연결을 우선 보여주고, 뉴스는 이후 확장됩니다.</p>
          </div>
          <HiNewspaper className="size-7 text-[#C98F7A]" aria-hidden="true" />
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8D7B2] px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md justify-between text-xs text-[#6B4A3F]">
          {[
            { icon: HiHome, label: "홈", action: () => navigate("/home") },
            { icon: HiUserGroup, label: "후기", action: () => setIsWaitlistOpen(true) },
            { icon: HiSparkles, label: "진단", action: () => navigate("/photo") },
            { icon: HiHeart, label: "상품", action: () => navigate("/recommendation") },
            { icon: HiMiniUser, label: "마이", action: () => navigate("/mypage") },
          ].map((item) => (
            <button key={item.label} type="button" className="flex flex-col items-center gap-1 py-1" onClick={item.action}>
              <span className="flex size-9 items-center justify-center rounded-full border border-[#E8D7B2]">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {isWaitlistOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="waitlist-title">
          <div className="w-full max-w-md rounded-[32px] border border-[#E8D7B2] p-8 shadow-[0_24px_70px_rgb(0_0_0/0.18)]">
            <h2 id="waitlist-title" className="text-2xl text-[#3A2527]">
              {isWaitlistSuccess ? "알림 신청 완료" : "뉴스·커뮤니티 오픈 알림"}
            </h2>
            <p className="mt-4 leading-7 text-[#7A625C]">{isWaitlistSuccess ? "기능이 열리면 등록된 계정 이메일로 안내드릴게요." : "컬러 뉴스, 톤별 후기, 파우치 공유 기능이 열리면 알려드릴게요."}</p>
            <div className="mt-8 flex gap-3">
              <OutlineButton
                className="flex-1"
                onClick={() => {
                  setIsWaitlistOpen(false);
                  setIsWaitlistSuccess(false);
                }}
              >
                닫기
              </OutlineButton>
              <OutlineButton className="flex-1" disabled={waitlistMutation.isPending || isWaitlistSuccess} onClick={() => waitlistMutation.mutate()}>
                {isWaitlistSuccess ? "완료" : waitlistMutation.isPending ? "신청 중" : "알림 받기"}
              </OutlineButton>
            </div>
          </div>
        </div>
      ) : null}

      {selectedProduct ? (
        <ProductDetailModal product={selectedProduct} isLiked={savedProductIds.has(selectedProduct.id)} onClose={() => setSelectedProduct(null)} onToggleLike={handleToggleLike} />
      ) : null}
    </main>
  );
}
