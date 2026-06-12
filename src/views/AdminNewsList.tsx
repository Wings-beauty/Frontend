"use client";

import { useEffect, useState } from "react";
import { HiNewspaper, HiPencilSquare, HiPlus } from "react-icons/hi2";
import { fetchPublishedNews, type NewsItem } from "../api/news";
import { requireAdmin } from "../api/auth";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useNavigate } from "../lib/router";

function formatDate(value: string | null) {
  if (!value) return "게시 예정";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

export default function AdminNewsList() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        await requireAdmin();
        const items = await fetchPublishedNews();
        if (isMounted) setNewsList(items);
      } catch (err) {
        if (isMounted) setErrorMessage(err instanceof Error ? err.message : "뉴스를 불러오지 못했어요.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void load();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-brown-600">뉴스 관리</h1>
          <p className="mt-1 text-sm text-brown-400">발행된 뉴스 {isLoading ? "..." : newsList.length}건</p>
        </div>
        <Button type="button" onClick={() => navigate("/admin/news/new")}>
          <HiPlus className="size-4" />
          새 뉴스 작성
        </Button>
      </header>

      {errorMessage ? <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm text-red">{errorMessage}</p> : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-60 rounded-2xl bg-white animate-pulse border border-cream-200" />
          ))}
        </div>
      ) : newsList.length === 0 ? (
        <div className="app-panel flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center">
          <HiNewspaper className="size-10 text-brown-300" />
          <p className="text-brown-400">발행된 뉴스가 없습니다.</p>
          <Button type="button" onClick={() => navigate("/admin/news/new")}>첫 뉴스 작성하기</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((news) => (
            <article key={news.id} className="app-card overflow-hidden">
              <div className="relative aspect-[4/5] bg-cream-100">
                {news.thumbnailUrl ? (
                  <img src={news.thumbnailUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-brown-300">
                    <HiNewspaper className="size-10" />
                  </div>
                )}
                {news.category ? (
                  <Badge className="absolute left-3 top-3 bg-white/90 text-brown-400">{news.category}</Badge>
                ) : null}
              </div>
              <div className="p-4">
                <p className="text-xs text-brown-400">{news.authorName} · {formatDate(news.publishedAt)}</p>
                <h2 className="mt-1.5 line-clamp-2 text-base font-medium leading-6 text-brown-600">{news.title}</h2>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-brown-400">{news.preview}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/admin/news/${news.id}`)}
                  >
                    <HiPencilSquare className="size-3.5" />
                    수정
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/news/${news.id}`)}
                  >
                    미리보기
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
