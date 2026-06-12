"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiArrowLeft, HiChevronLeft, HiChevronRight, HiHeart, HiNewspaper, HiTrash } from "react-icons/hi2";
import {
  fetchPublishedNewsDetail,
  fetchNewsComments,
  createNewsComment,
  deleteNewsComment,
  toggleNewsLike,
  getNewsLikeStatus,
  increaseNewsViewCount,
  type NewsItem,
  type NewsComment,
} from "../api/news";
import { getAnonymousId } from "../lib/anonymousId";
import { getCurrentUserProfile } from "../api/auth";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useNavigate, useParams } from "../lib/router";

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

function formatRelativeDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) return <img src={imageUrl} alt={name} className="size-8 rounded-full object-cover" />;
  return <div className="size-8 rounded-full bg-cream-200 flex items-center justify-center text-brown-400 text-sm font-medium">{name.charAt(0)}</div>;
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

function NewsCarousel({ news }: { news: NewsItem }) {
  const totalSlides = 1 + news.document.slides.length; // cover + content
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goPrev = () => setCurrent((s) => Math.max(0, s - 1));
  const goNext = () => setCurrent((s) => Math.min(totalSlides - 1, s + 1));

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) diff > 0 ? goNext() : goPrev();
    setTouchStartX(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Slide viewport */}
      <div className="relative overflow-hidden rounded-[32px] shadow-[0_18px_50px_rgb(58_37_39/0.08)] select-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Track */}
        <div className="flex transition-transform duration-300 ease-out will-change-transform" style={{ transform: `translateX(-${current * 100}%)` }}>
          {/* Slide 0 — Cover */}
          <div className="w-full shrink-0">
            <div className="relative aspect-[4/5] bg-cream-100 flex flex-col">
              {news.thumbnailUrl ? (
                <img src={news.thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brown-200">
                  <HiNewspaper className="size-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative mt-auto px-7 pb-10 pt-24 text-white">
                {news.category ? <Badge className="mb-4 bg-white/90 text-brown-600">{news.category}</Badge> : null}
                <h2 className="break-keep text-3xl leading-[2.6rem] font-bold">{news.title}</h2>
                <p className="mt-3 text-sm leading-5 text-white/75">
                  {news.authorName} · {formatDate(news.publishedAt)}
                </p>
                {news.document.summary ? <p className="mt-4 text-sm leading-6 text-white/80 break-keep">{news.document.summary}</p> : null}
              </div>
            </div>
          </div>

          {/* Slides 1..n — Content */}
          {news.document.slides.map((slide, index) => (
            <div key={slide.id} className="w-full shrink-0 bg-white">
              {slide.imageUrl ? (
                <div className="aspect-4/5 bg-cream-100">
                  <img src={slide.imageUrl} alt="" className="size-full object-cover" />
                </div>
              ) : null}
              {/* <div className="flex min-h-[52dvh] flex-col px-7 py-9">
                <p className="text-xs font-medium text-brown-300 tracking-widest">
                  {index + 1} / {news.document.slides.length}
                </p>
                {slide.title ? <h3 className="mt-7 break-keep text-[1.75rem] leading-[2.5rem] font-bold text-brown-600">{slide.title}</h3> : null}
                {slide.body ? <p className="mt-5 whitespace-pre-line break-keep text-lg leading-[1.9] text-brown-500">{slide.body}</p> : null}
              </div> */}
            </div>
          ))}
        </div>

        {/* Arrow buttons (데스크탑) */}
        {current > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex size-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition hover:bg-white"
            aria-label="이전 슬라이드"
          >
            <HiChevronLeft className="size-5 text-brown-600" />
          </button>
        )}
        {current < totalSlides - 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex size-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition hover:bg-white"
            aria-label="다음 슬라이드"
          >
            <HiChevronRight className="size-5 text-brown-600" />
          </button>
        )}
      </div>

      {/* Dots + 모바일 prev/next */}
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={goPrev} disabled={current === 0} className="flex size-8 items-center justify-center rounded-full transition disabled:opacity-20 sm:hidden" aria-label="이전">
          <HiChevronLeft className="size-5 text-brown-400" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`슬라이드 ${i + 1}`}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                backgroundColor: i === current ? "#2b211f" : "#d9cfc9",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={current === totalSlides - 1}
          className="flex size-8 items-center justify-center rounded-full transition disabled:opacity-20 sm:hidden"
          aria-label="다음"
        >
          <HiChevronRight className="size-5 text-brown-400" />
        </button>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function NewsDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const newsId = Number(id);
  const queryClient = useQueryClient();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const viewMutation = useMutation({
    mutationFn: ({ contentId, anonymousId }: { contentId: number; anonymousId: string }) => increaseNewsViewCount(contentId, anonymousId),
    onSuccess: (result) => {
      if (!result.counted) return;
      void queryClient.invalidateQueries({ queryKey: ["news-list"] });
    },
  });

  useEffect(() => {
    if (!Number.isFinite(newsId)) return;
    const timer = setTimeout(() => {
      viewMutation.mutate({ contentId: newsId, anonymousId: getAnonymousId() });
    }, 3000);
    return () => clearTimeout(timer);
  }, [newsId]);

  const likeQuery = useQuery({
    queryKey: ["news-like", newsId],
    queryFn: () => getNewsLikeStatus(newsId),
    enabled: Number.isFinite(newsId),
    staleTime: Infinity,
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleNewsLike(newsId),
    onSuccess: (result) => {
      if (result.reason === "login_required") {
        navigate("/login");
        return;
      }
      if (!result.changed) return;
      queryClient.setQueryData(["news-like", newsId], { liked: result.liked });
      if (result.likeCount !== null) {
        const nextLikeCount = result.likeCount as number;
        setNews((prev) => (prev ? { ...prev, likeCount: nextLikeCount } : prev));
        queryClient.setQueriesData<NewsItem[]>({ queryKey: ["news-list"] }, (prev) => prev?.map((n) => (n.id === newsId ? { ...n, likeCount: nextLikeCount } : n)));
      }
    },
  });

  const isLiked = likeQuery.data?.liked ?? false;

  const handleSubmitComment = async () => {
    const text = commentInput.trim();
    if (!text || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createNewsComment(newsId, text);
      setCommentInput("");
      setComments(await fetchNewsComments(newsId));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "댓글을 작성하지 못했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteNewsComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "댓글을 삭제하지 못했어요.");
    }
  };

  useEffect(() => {
    let alive = true;
    if (!Number.isFinite(newsId)) {
      navigate("/news", { replace: true });
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    void Promise.all([fetchPublishedNewsDetail(newsId), fetchNewsComments(newsId), getCurrentUserProfile()])
      .then(([item, commentsData, profile]) => {
        if (!alive) return;
        setNews(item);
        setComments(commentsData);
        setCurrentUserId(profile?.id ?? null);
      })
      .catch((err) => {
        if (alive) setErrorMessage(err instanceof Error ? err.message : "뉴스를 불러오지 못했어요.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [navigate, newsId]);

  return (
    <main className="min-h-dvh app-page px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">
        <header className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" aria-label="뉴스 목록으로 이동" onClick={() => navigate("/news")}>
            <HiArrowLeft className="size-6" aria-hidden="true" />
          </Button>
          <h1 className="text-xl leading-7 text-brown-600">News</h1>
          <div className="size-10" aria-hidden="true" />
        </header>

        {isLoading ? <div className="h-[72dvh] animate-pulse rounded-[32px] bg-white sm:mx-auto sm:w-full sm:max-w-sm" /> : null}
        {errorMessage ? <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm leading-6 text-red">{errorMessage}</p> : null}
        {!isLoading && !news && !errorMessage ? (
          <section className="flex min-h-96 flex-col items-center justify-center rounded-[32px] bg-white p-8 text-center">
            <HiNewspaper className="size-10 text-brown-300" aria-hidden="true" />
            <p className="mt-4 text-lg leading-7 text-brown-600">뉴스를 찾을 수 없어요.</p>
          </section>
        ) : null}

        {news ? (
          <div className="mx-auto w-full sm:max-w-md md:max-w-xl">
            <NewsCarousel news={news} />

            <div className="mt-6 flex items-center justify-center">
              <button
                type="button"
                disabled={likeMutation.isPending}
                onClick={() => likeMutation.mutate()}
                className="flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition disabled:opacity-40 active:scale-95"
                style={isLiked ? { backgroundColor: "#fff0f0", borderColor: "#e05c5c", color: "#e05c5c" } : { backgroundColor: "white", borderColor: "#eadfd2", color: "#b8a99f" }}
                aria-label={isLiked ? "좋아요 취소" : "좋아요"}
              >
                <HiHeart className="size-5" style={{ fill: isLiked ? "#e05c5c" : "none", stroke: isLiked ? "#e05c5c" : "#b8a99f", strokeWidth: 1.5 }} />
                {news.likeCount}
              </button>
            </div>

            <section className="overflow-hidden rounded-[32px] bg-white px-7 py-6 shadow-[0_18px_50px_rgb(58_37_39/0.08)]">
              <h3 className="mb-4 text-base font-medium text-brown-600">댓글 {comments.length}개</h3>

              {comments.length === 0 ? (
                <p className="py-4 text-center text-sm text-brown-300">첫 댓글을 남겨보세요.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-cream-100">
                  {comments.map((comment) => (
                    <li key={comment.id} className="flex items-start gap-3 py-4">
                      <Avatar name={comment.authorName} imageUrl={comment.authorImageUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-brown-600">{comment.authorName}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-brown-300">{formatRelativeDate(comment.createdAt)}</p>
                            {comment.isOwner ? (
                              <button type="button" className="text-brown-300 transition hover:text-red" onClick={() => void handleDeleteComment(comment.id)}>
                                <HiTrash className="size-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-1 whitespace-pre-line text-sm text-brown-500">{comment.content}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {currentUserId ? (
                <div className="mt-4 flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-brown-600 placeholder:text-brown-300 focus:outline-none focus:ring-2 focus:ring-brown-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSubmitComment();
                    }}
                  />
                  <Button type="button" size="sm" disabled={!commentInput.trim() || isSubmitting} onClick={() => void handleSubmitComment()} className="self-end">
                    등록
                  </Button>
                </div>
              ) : (
                <p className="mt-4 text-center text-sm text-brown-300">
                  댓글을 작성하려면{" "}
                  <button type="button" className="text-brown-600 underline" onClick={() => navigate("/login")}>
                    로그인
                  </button>
                  하세요.
                </p>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
