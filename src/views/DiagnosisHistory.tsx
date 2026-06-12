"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import { HiArrowLeft, HiChevronRight, HiSparkles } from "react-icons/hi2";
import { fetchDiagnosisHistoryForUser, type DiagnosisHistoryItem } from "../api/diagnosis";
import { getCurrentUser, setAuthReturnTo } from "../api/auth";
import { personalColorResults } from "../constants/personalColor";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

function formatDate(value: string | null) {
  if (!value) return "날짜 정보 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatConfidence(value: number | null) {
  if (value === null) return null;
  return `${Math.round(value * 100)}%`;
}

function HistoryCard({ item, index, onClick }: { item: DiagnosisHistoryItem; index: number; onClick: () => void }) {
  const result = personalColorResults[item.season];
  const isLatest = index === 0;
  const confidence = formatConfidence(item.confidence);

  return (
    <article
      onClick={onClick}
      className="app-card group cursor-pointer overflow-hidden transition hover:-translate-y-0.5"
    >
      {/* 컬러 배너 */}
      <div className={`relative h-24 ${result.accentClassName} flex items-center justify-center`}>
        <img src={result.imageUrl} className="size-14 rounded-full object-cover shadow-md" alt={result.toneLabel} />
        {isLatest && (
          <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-brown-600 backdrop-blur">
            <HiSparkles className="size-3" />
            최근 진단
          </span>
        )}
      </div>

      {/* 본문 */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-brown-300">{formatDate(item.createdAt)}</p>
            <h3 className="mt-1 text-lg font-medium leading-7 text-brown-600">{result.toneLabel}</h3>
            <p className="mt-0.5 text-sm leading-5 text-[#756861]">{result.detailTitle}</p>
          </div>
          <HiChevronRight className="mt-1 size-5 shrink-0 text-brown-300 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </div>

        {confidence && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-brown-300">
              <span>신뢰도</span>
              <span className="font-medium text-brown-500">{confidence}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-100">
              <div
                className={`h-full rounded-full ${result.accentClassName}`}
                style={{ width: confidence }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-cream-200 bg-white">
      <div className="h-24 animate-pulse bg-cream-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-cream-100" />
        <div className="h-6 w-32 animate-pulse rounded-full bg-cream-100" />
        <div className="h-4 w-48 animate-pulse rounded-full bg-cream-100" />
      </div>
    </div>
  );
}

export default function DiagnosisHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) {
          setAuthReturnTo("/diagnosis-history");
          navigate("/login", { replace: true });
          return;
        }

        const nextHistory = await fetchDiagnosisHistoryForUser(user.id);
        if (isMounted) setHistory(nextHistory);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadHistory();
    return () => { isMounted = false; };
  }, [navigate]);

  return (
    <main className="app-page px-5 py-5 lg:px-8 lg:py-7">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">

        {/* 헤더 */}
        <section className="app-panel px-5 py-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-brown-300">
                <HiSparkles className="size-5" aria-hidden="true" />
                Diagnosis History
              </div>
              <h1 className="mt-2 text-3xl font-medium leading-10 text-brown-600">진단 기록</h1>
              <p className="app-copy mt-2 text-base">지금까지의 퍼스널 컬러 진단 결과를 확인하세요.</p>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="마이페이지로 이동" onClick={() => navigate("/mypage")} className="shrink-0">
              <HiArrowLeft className="size-6" aria-hidden="true" />
            </Button>
          </div>
        </section>

        {/* 목록 */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : history.length === 0 ? (
          <div className="app-panel flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <HiSparkles className="size-10 text-brown-200" />
            <p className="text-base text-brown-400">아직 저장된 진단 기록이 없어요.</p>
            <Button variant="outline" onClick={() => navigate("/photo")}>진단 시작하기</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {history.map((item, index) => (
              <HistoryCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => navigate(`/diagnosis-history/${item.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
