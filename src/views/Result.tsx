"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "../lib/router";
import { HiArrowRight, HiCheck, HiHome, HiMiniUser } from "react-icons/hi2";
import { getAuthorizationHeader } from "../api/home";
import { personalColorResults, type PersonalColorSeason } from "../constants/personalColor";
import type { DiagnosisFeedback, FinalDiagnosisResult } from "../types/diagnosis";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

function ResultSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="border border-[#e5e7eb] bg-white shadow-none">
        <CardContent className="p-7">
          <div className="h-6 w-28 rounded-full bg-[#e5e7eb]" />
          <div className="mt-6 h-11 w-72 max-w-full rounded-2xl bg-[#e5e7eb]" />
          <div className="mt-4 h-5 w-full max-w-xl rounded-full bg-[#e5e7eb]" />
          <div className="mt-2 h-5 w-4/5 rounded-full bg-[#e5e7eb]" />
          <div className="mt-10 flex items-center gap-6">
            <div className="size-32 rounded-full bg-[#e5e7eb]" />
            <div className="flex-1 space-y-3">
              <div className="h-5 rounded-full bg-[#e5e7eb]" />
              <div className="h-5 rounded-full bg-[#e5e7eb]" />
              <div className="h-5 w-2/3 rounded-full bg-[#e5e7eb]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5">
        <Card className="border border-[#e5e7eb] bg-white shadow-none">
          <CardContent className="grid grid-cols-5 gap-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="aspect-square rounded-full bg-[#e5e7eb]" />
            ))}
          </CardContent>
        </Card>
        <Card className="border border-[#e5e7eb] bg-white shadow-none">
          <CardContent className="space-y-3 p-6">
            <div className="h-12 rounded-2xl bg-[#e5e7eb]" />
            <div className="h-12 rounded-2xl bg-[#e5e7eb]" />
            <div className="h-12 rounded-2xl bg-[#e5e7eb]" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Result() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<DiagnosisFeedback | null>(null);
  const diagnosisQuery = useQuery({
    queryKey: ["diagnosis-latest"],
    queryFn: async () => {
      const response = await fetch("/api/diagnosis/latest", {
        headers: await getAuthorizationHeader(),
      });

      if (response.status === 401) {
        navigate("/login?returnTo=/result", { replace: true });
        return null;
      }

      if (!response.ok) {
        throw new Error("진단 결과를 불러오지 못했습니다.");
      }

      return (await response.json()) as {
        result: {
          id: number;
          createdAt: string | null;
          finalResult: FinalDiagnosisResult;
        } | null;
      };
    },
  });
  const latestDiagnosis = diagnosisQuery.data?.result ?? null;
  const finalResult = latestDiagnosis?.finalResult ?? null;
  const [feedbackSeasonOverride, setFeedbackSeasonOverride] = useState<PersonalColorSeason | null>(null);
  const currentSeason = feedbackSeasonOverride ?? finalResult?.finalSeason ?? null;
  const season = currentSeason ?? "summer";
  const result = personalColorResults[season];
  const confidence = finalResult ? Math.round(finalResult.finalConfidence * 100) : null;
  const isAdjusted = Boolean(finalResult?.userAnswers);

  const feedbackMutation = useMutation({
    mutationFn: async (nextFeedback: DiagnosisFeedback) => {
      if (!latestDiagnosis) {
        return;
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthorizationHeader()),
        },
        body: JSON.stringify({
          diagnosisResultId: latestDiagnosis.id,
          rating: nextFeedback.matchStatus === "match" ? 5 : nextFeedback.matchStatus === "unclear" ? 3 : 1,
          isMatch: nextFeedback.matchStatus === "match",
          comment: nextFeedback.userSelectedSeason ? `selected:${nextFeedback.userSelectedSeason}` : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("피드백을 저장하지 못했습니다.");
      }
    },
  });

  const saveFeedback = (nextFeedback: DiagnosisFeedback) => {
    setFeedback(nextFeedback);
    feedbackMutation.mutate(nextFeedback);
  };

  const selectMatchStatus = (matchStatus: DiagnosisFeedback["matchStatus"]) => {
    saveFeedback({
      matchStatus,
      userSelectedSeason: matchStatus === "match" ? undefined : feedback?.userSelectedSeason,
    });
  };

  const selectFeedbackSeason = (userSelectedSeason: PersonalColorSeason) => {
    if (!feedback || feedback.matchStatus === "match") {
      return;
    }

    saveFeedback({
      ...feedback,
      userSelectedSeason,
    });
    setFeedbackSeasonOverride(userSelectedSeason);
  };

  return (
    <main className="app-page px-5 py-5 lg:px-8 lg:py-7">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">
        <header className="app-panel flex items-center justify-between px-4 py-3 lg:px-6">
          <Button type="button" variant="ghost" size="icon" aria-label="홈으로 이동" onClick={() => navigate("/home")}>
            <HiHome className="size-6" aria-hidden="true" />
          </Button>

          <h1 className="text-xl font-medium leading-7 text-brown-600">진단 결과</h1>

          <Avatar className="size-10 shadow-[0_4px_14px_rgb(58_37_39/0.12)]">
            <AvatarFallback>
              <HiMiniUser className="size-7" aria-hidden="true" />
            </AvatarFallback>
          </Avatar>
        </header>

        {diagnosisQuery.isLoading ? (
          <ResultSkeleton />
        ) : !currentSeason || !finalResult ? (
          <Card className="mx-auto w-full max-w-xl shadow-none">
            <CardContent className="space-y-4 p-8 text-center text-[#756861]">
              <p>진단 결과를 찾지 못했어요.</p>
              <Button type="button" onClick={() => navigate("/photo")}>
                다시 진단하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <Card className="overflow-hidden">
              <CardHeader className="p-7 pb-4 lg:p-9 lg:pb-5">
                <Badge className="mb-4 w-fit">분석 완료</Badge>
                <CardTitle className="text-3xl leading-10 text-brown-600 lg:text-4xl lg:leading-[3rem]">{isAdjusted ? "답변을 반영한 최종 톤" : result.title}</CardTitle>
                <CardDescription className="mt-3 max-w-2xl text-base leading-7">{isAdjusted ? "사진 분석과 설문 답변을 함께 반영했습니다." : result.description}</CardDescription>
              </CardHeader>

              <CardContent className="grid gap-8 p-7 pt-3 lg:grid-cols-[13rem_1fr] lg:p-9 lg:pt-4">
                <div className="flex flex-col items-center text-center">
                  <div className={`flex size-40 items-center justify-center rounded-full ${result.accentClassName} p-3 shadow-[0_6px_18px_rgb(43_33_31/0.05)]`}>
                    <img src={result.imageUrl} className="size-full rounded-full object-cover" alt={`${result.seasonLabel} 퍼스널 컬러`} />
                  </div>
                  {confidence !== null ? <div className="mt-5 rounded-full border border-cream-200 bg-white px-5 py-2 text-sm leading-5 text-brown-300">최종 일치도 {confidence}%</div> : null}
                </div>

                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl leading-8 text-brown-600">{result.detailTitle}</h2>
                  <p className="mt-4 text-base leading-8 text-[#756861]">{result.detailDescription}</p>
                  {finalResult.correctionApplied ? <div className="mt-5 rounded-2xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm leading-6 text-[#756861]">AI 분석 결과에 설문 답변을 반영한 결과입니다.</div> : null}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">베스트 컬러</CardTitle>
                  <CardDescription>{result.toneLabel}에 잘 어울리는 대표 컬러입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {result.bestColors.map((color) => (
                      <div key={color} className="aspect-square rounded-full shadow-sm ring-1 ring-brown-600/5" style={{ backgroundColor: color }} aria-label={`${color} 컬러`} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">결과 피드백</CardTitle>
                  <CardDescription>결과가 체감과 맞는지 선택해주세요.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "match", label: "잘 맞아요" },
                      { value: "unclear", label: "애매해요" },
                      { value: "not_match", label: "아니에요" },
                    ].map((option) => {
                      const isSelected = feedback?.matchStatus === option.value;

                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className="min-h-12 px-2"
                          onClick={() => selectMatchStatus(option.value as DiagnosisFeedback["matchStatus"])}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>

                  {feedback?.matchStatus === "unclear" || feedback?.matchStatus === "not_match" ? (
                    <div className="mt-5">
                      <p className="text-sm leading-6 text-[#756861]">더 가깝게 느껴지는 톤을 선택해주세요.</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {[
                          { value: "spring", label: "봄 웜톤" },
                          { value: "summer", label: "여름 쿨톤" },
                          { value: "autumn", label: "가을 웜톤" },
                          { value: "winter", label: "겨울 쿨톤" },
                        ].map((option) => {
                          const isSelected = feedback.userSelectedSeason === option.value;

                          return (
                            <Button key={option.value} type="button" variant={isSelected ? "secondary" : "outline"} onClick={() => selectFeedbackSeason(option.value as PersonalColorSeason)}>
                              {isSelected ? <HiCheck className="size-4" aria-hidden="true" /> : null}
                              {option.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Button type="button" size="lg" className="w-full rounded-full" onClick={() => navigate("/products")}>
                내게 맞는 상품 보기
                <HiArrowRight className="size-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
