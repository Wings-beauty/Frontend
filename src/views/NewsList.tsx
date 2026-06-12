"use client";

import { useQuery } from "@tanstack/react-query";
import { HiEye, HiHeart, HiHome, HiNewspaper, HiPencilSquare } from "react-icons/hi2";
import { fetchPublishedNews, type NewsItem } from "../api/news";
import { getCurrentUserProfile } from "../api/auth";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate } from "../lib/router";

function formatDate(value: string | null) {
  if (!value) {
    return "게시 예정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function NewsCard({ news, isAdmin, onClick, onEdit }: { news: NewsItem; isAdmin: boolean; onClick: () => void; onEdit: () => void }) {
  return (
    <article className="app-card group overflow-hidden text-left transition hover:-translate-y-0.5">
      <button type="button" className="block w-full text-left" onClick={onClick}>
        <div className="relative aspect-[4/5] bg-cream-100">
          {news.thumbnailUrl ? (
            <img src={news.thumbnailUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-brown-300">
              <HiNewspaper className="size-10" aria-hidden="true" />
            </div>
          )}
          {news.category ? <Badge className="absolute left-3 top-3 bg-white/90 text-brown-300 backdrop-blur">{news.category}</Badge> : null}
        </div>
      </button>
      <div className="p-5">
        <p className="text-sm leading-5 text-brown-300">
          {news.authorName} · {formatDate(news.publishedAt)}
        </p>
        <button type="button" className="mt-2 block w-full text-left" onClick={onClick}>
          <h2 className="line-clamp-2 text-xl leading-7 text-brown-600">{news.title}</h2>
        </button>
        {news.summary ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#756861]">{news.summary}</p> : null}
        <div className="mt-3 flex items-center justify-between">
          {isAdmin ? (
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              수정
            </Button>
          ) : <span />}
          <span className="flex items-center gap-3 text-xs text-brown-300">
            <span className="flex items-center gap-1">
              <HiHeart className="size-3.5" />
              {news.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <HiEye className="size-3.5" />
              {news.viewCount}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

export default function NewsList() {
  const navigate = useNavigate();

  const newsQuery = useQuery({
    queryKey: ["news-list"],
    queryFn: fetchPublishedNews,
  });

  const profileQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUserProfile,
    staleTime: Infinity,
  });

  const newsList = newsQuery.data ?? [];
  const isAdmin = profileQuery.data?.role === "admin";
  const isLoading = newsQuery.isLoading;
  const errorMessage = newsQuery.error instanceof Error ? newsQuery.error.message : newsQuery.isError ? "뉴스를 불러오지 못했어요." : "";

  return (
    <main className="app-page px-5 py-5 lg:px-8 lg:py-7">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">
        <section className="app-panel px-5 py-6 lg:px-8">
          <p className="app-eyebrow">WINGS News</p>
          <h2 className="mt-2 text-3xl font-medium leading-10 text-brown-600">뷰티 뉴스와 톤 리포트</h2>
          <p className="app-copy mt-3 text-base">컬러와 제품 이야기를 짧게 읽고, 내 선택에 필요한 기준만 가져가세요.</p>
        </section>

        {errorMessage ? <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm leading-6 text-red">{errorMessage}</p> : null}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
                <div className="aspect-[4/5] bg-cream-100" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-28 rounded-full bg-cream-100" />
                  <div className="h-6 rounded-full bg-cream-100" />
                  <div className="h-6 w-3/4 rounded-full bg-cream-100" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && newsList.length === 0 ? (
          <Card className="shadow-none">
            <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <HiNewspaper className="size-10 text-brown-300" aria-hidden="true" />
              <p className="mt-4 text-lg leading-7 text-brown-600">아직 공개된 뉴스가 없어요.</p>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && newsList.length > 0 ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsList.map((news) => (
              <NewsCard key={news.id} news={news} isAdmin={isAdmin} onClick={() => navigate(`/news/${news.id}`)} onEdit={() => navigate(`/admin/news/${news.id}`)} />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
