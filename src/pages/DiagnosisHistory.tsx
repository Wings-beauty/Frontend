import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiChevronRight } from "react-icons/hi2";
import { fetchDiagnosisHistoryForUser, type DiagnosisHistoryItem } from "../api/diagnosis";
import { getCurrentUser, setAuthReturnTo } from "../api/auth";
import { personalColorResults } from "../constants/personalColor";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

function formatDate(value: string | null) {
  if (!value) {
    return "날짜 정보 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatConfidence(value: number | null) {
  if (value === null) {
    return null;
  }

  return `${Math.round(value * 100)}%`;
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

        if (isMounted) {
          setHistory(nextHistory);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <main className="min-h-dvh bg-white px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="마이페이지로 이동"
          onClick={() => navigate("/mypage")}
        >
          <HiArrowLeft className="size-6" aria-hidden="true" />
        </Button>
        <h1 className="text-2xl leading-7.5 text-[#1f1b1b]">진단 기록</h1>
        <div className="size-10" aria-hidden="true" />
      </header>

      <section className="mt-10 space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-[#8a716b]">
              진단 기록을 불러오는 중입니다.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && history.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-[#8a716b]">
              아직 저장된 진단 기록이 없습니다.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading
          ? history.map((item, index) => {
              const result = personalColorResults[item.season];

              return (
                <Card
                  key={item.id}
                  className="cursor-pointer border-none"
                  onClick={() => navigate(`/diagnosis-history/${item.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge className={index === 0 ? "w-fit" : "w-fit bg-cream-50 text-brown-300"}>
                          {index === 0 ? "가장 최근 진단" : "진단 기록"}
                        </Badge>
                        <CardTitle className="mt-3">{formatDate(item.createdAt)}</CardTitle>
                        <CardDescription className="mt-2">
                          {item.toneLabel}
                        </CardDescription>
                      </div>
                      <div
                        className={`flex size-14 shrink-0 items-center justify-center rounded-full ${result.accentClassName}`}
                      >
                        <img
                          src={result.imageUrl}
                          className="size-10 rounded-full object-cover"
                          alt={result.toneLabel}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between pt-0">
                    <div>
                      <p className="text-base leading-6 text-brown-600">
                        {result.detailTitle}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-[#8a716b]">
                        {formatConfidence(item.confidence) ?? "신뢰도 정보 없음"}
                      </p>
                    </div>
                    <HiChevronRight className="size-5 text-[#8a716b]" aria-hidden="true" />
                  </CardContent>
                </Card>
              );
            })
          : null}
      </section>
    </main>
  );
}
