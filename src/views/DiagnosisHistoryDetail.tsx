"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "../lib/router";
import { HiArrowLeft, HiMiniUser } from "react-icons/hi2";
import { fetchProfile, getCurrentUser, setAuthReturnTo } from "../api/auth";
import {
  fetchDiagnosisHistoryDetailForUser,
  type DiagnosisHistoryDetail as DiagnosisHistoryDetailItem,
} from "../api/diagnosis";
import { personalColorResults, type PersonalColorSeason } from "../constants/personalColor";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

type ProfileView = {
  profileImageUrl: string | null;
  skinTone: PersonalColorSeason | null;
};

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

export default function DiagnosisHistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const diagnosisId = Number(id);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [historyItem, setHistoryItem] = useState<DiagnosisHistoryDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      if (!Number.isFinite(diagnosisId)) {
        navigate("/diagnosis-history", { replace: true });
        return;
      }

      const user = await getCurrentUser();

      if (!user) {
        setAuthReturnTo(`/diagnosis-history/${diagnosisId}`);
        navigate("/login", { replace: true });
        return;
      }

      const [profileFromDb, detailFromDb] = await Promise.all([
        fetchProfile(user),
        fetchDiagnosisHistoryDetailForUser(user.id, diagnosisId),
      ]);

      if (!isMounted) {
        return;
      }

      setProfile({
        profileImageUrl: profileFromDb.profileImageUrl,
        skinTone: profileFromDb.skinTone,
      });
      setHistoryItem(detailFromDb);
      setIsLoading(false);
    };

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [diagnosisId, navigate]);

  const season = historyItem?.season ?? profile?.skinTone ?? "summer";
  const result = personalColorResults[season];
  const confidence =
    historyItem?.confidence !== null && historyItem?.confidence !== undefined
      ? Math.round(historyItem.confidence * 100)
      : null;

  return (
    <main className="min-h-dvh bg-white px-5 pb-6 pt-5">
      <header className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="진단 기록으로 이동"
          onClick={() => navigate("/diagnosis-history")}
        >
          <HiArrowLeft className="size-6" aria-hidden="true" />
        </Button>

        <h1 className="text-2xl leading-7.5 text-[#1f1b1b]">진단 결과</h1>

        <Avatar className="size-10 shadow-[0_4px_14px_rgb(58_37_39/0.12)]">
          {profile?.profileImageUrl ? (
            <AvatarImage src={profile.profileImageUrl} alt="프로필" />
          ) : (
            <AvatarFallback>
              <HiMiniUser className="size-7" aria-hidden="true" />
            </AvatarFallback>
          )}
        </Avatar>
      </header>

      <div className="flex flex-1 flex-col gap-5 pt-8">
        {isLoading ? (
          <Card className="border-none bg-cream-50 shadow-none">
            <CardContent className="p-6 text-center text-[#7a625c]">
              진단 결과를 불러오는 중입니다.
            </CardContent>
          </Card>
        ) : !historyItem ? (
          <Card className="border-none bg-cream-50 shadow-none">
            <CardContent className="p-6 text-center text-[#7a625c]">
              진단 결과를 찾을 수 없습니다.
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="text-center">
              <Badge className="mx-auto mb-4 w-fit">분석 완료</Badge>
              <h2 className="text-3xl leading-10 text-brown-600">
                AI 퍼스널컬러 진단 결과
                <br />
                {result.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#7a625c]">
                {formatDate(historyItem.createdAt)}
              </p>
            </section>

            <Card className="overflow-hidden border-none">
              <CardHeader className="items-center pb-2 text-center">
                <div className={`mb-3 flex size-24 items-center justify-center rounded-full ${result.accentClassName} p-2 shadow-md`}>
                  <img
                    src={result.imageUrl}
                    className="size-full rounded-full object-cover"
                    alt={`${result.seasonLabel} 퍼스널 컬러`}
                  />
                </div>
                <CardTitle>{result.detailTitle}</CardTitle>
                <CardDescription>{result.detailDescription}</CardDescription>
              </CardHeader>
              <CardContent className="pt-3 text-center">
                <p className="text-lg leading-7 text-brown-600">{historyItem.toneLabel}</p>
                {confidence !== null ? (
                  <p className="mt-2 text-sm leading-6 text-brown-300">
                    진단 신뢰도 {confidence}%
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-none bg-cream-50 shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">가장 잘 어울리는 베스트 컬러</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between gap-3">
                  {result.bestColors.map((color) => (
                    <div
                      key={color}
                      className="aspect-square flex-1 rounded-full shadow-sm"
                      style={{ backgroundColor: color }}
                      aria-label={`${color} 컬러`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => navigate("/recommendation")}
            >
              추천 상품 보기
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
