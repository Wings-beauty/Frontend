<<<<<<< Updated upstream
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowRight, HiCheck, HiHome, HiMiniUser } from "react-icons/hi2";
import { fetchProfile, getCurrentUser, setAuthReturnTo, updateProfileSkinTone } from "../api/auth";
import { getStoredDiagnosisFeedback, getStoredDiagnosisUpload, getStoredFinalDiagnosisResult, setStoredDiagnosisFeedback } from "../api/diagnosisUpload";
import { saveResultPageFeedback } from "../api/feedback";
import { personalColorResults, type PersonalColorSeason } from "../constants/personalColor";
import type { DiagnosisFeedback } from "../types/diagnosis";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

type ProfileView = {
  profileImageUrl: string | null;
  skinTone: PersonalColorSeason | null;
};

export default function Result() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [feedback, setFeedback] = useState<DiagnosisFeedback | null>(getStoredDiagnosisFeedback());
  const [feedbackSaveError, setFeedbackSaveError] = useState("");
  const [currentSeason, setCurrentSeason] = useState<PersonalColorSeason | null>(null);
  const finalResult = getStoredFinalDiagnosisResult();
  const diagnosisUpload = getStoredDiagnosisUpload();
  const season = currentSeason ?? "summer";
  const sessionResultMatchesProfile = finalResult?.finalSeason === currentSeason;
  const result = personalColorResults[season];
  const confidence = sessionResultMatchesProfile ? Math.round(finalResult.finalConfidence * 100) : null;
  const isAdjusted = Boolean(sessionResultMatchesProfile && finalResult?.userAnswers);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const user = await getCurrentUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setIsLoggedIn(true);
      const profileFromDb = await fetchProfile(user);

      if (isMounted) {
        setProfile({
          profileImageUrl: profileFromDb.profileImageUrl,
          skinTone: profileFromDb.skinTone,
        });
        setCurrentSeason(profileFromDb.skinTone);
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const goToLoginForSave = () => {
    setAuthReturnTo("/recommendation");
    navigate("/login");
  };

  const handleHomeClick = () => {
    if (!isLoggedIn) {
      setAuthReturnTo("/home");
      navigate("/login");
      return;
    }

    navigate("/home");
  };

  const getFeedbackRating = (matchStatus: DiagnosisFeedback["matchStatus"]) => {
    if (matchStatus === "match") return 5;
    if (matchStatus === "unclear") return 3;
    return 1;
  };

  const saveResultFeedbackToDb = async (nextFeedback: DiagnosisFeedback) => {
    const user = await getCurrentUser();
    const diagnosisResultId = diagnosisUpload?.diagnosisResultId;

    if (!user || !diagnosisResultId) {
      return;
    }

    await saveResultPageFeedback({
      userId: user.id,
      diagnosisResultId,
      rating: getFeedbackRating(nextFeedback.matchStatus),
      isMatch: nextFeedback.matchStatus === "match",
      comment: "result page feedback",
    });
  };

  const saveFeedback = (nextFeedback: DiagnosisFeedback) => {
    setFeedback(nextFeedback);
    setStoredDiagnosisFeedback(nextFeedback);
    setFeedbackSaveError("");

    void saveResultFeedbackToDb(nextFeedback).catch(() => {
      setFeedbackSaveError("피드백 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    });
  };

  const selectMatchStatus = (matchStatus: DiagnosisFeedback["matchStatus"]) => {
    if (matchStatus === "match" && currentSeason) {
      void getCurrentUser().then((user) => {
        if (user) {
          void updateProfileSkinTone(user.id, currentSeason);
        }
      });
    }

    saveFeedback({
      matchStatus,
      userSelectedSeason: matchStatus === "match" ? undefined : feedback?.userSelectedSeason,
    });
  };

  const selectFeedbackSeason = (userSelectedSeason: PersonalColorSeason | "unknown") => {
    if (!feedback || feedback.matchStatus === "match") {
      return;
    }

    saveFeedback({
      ...feedback,
      userSelectedSeason,
    });

    if (userSelectedSeason !== "unknown") {
      setCurrentSeason(userSelectedSeason);
      void getCurrentUser().then((user) => {
        if (user) {
          void updateProfileSkinTone(user.id, userSelectedSeason);
        }
      });
    }
  };

  return (
    <main className="min-h-dvh bg-white px-5 pb-6 pt-5">
      <header className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" aria-label="홈으로 이동" onClick={handleHomeClick}>
          <HiHome className="size-7" aria-hidden="true" />
        </Button>

        <h1 className="text-2xl leading-7.5 text-[#1f1b1b]">WINGS</h1>

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
        {!currentSeason ? (
          <Card className="border-none bg-cream-50 shadow-none">
            <CardContent className="p-6 text-center text-[#7a625c]">저장된 톤 정보를 불러오는 중입니다.</CardContent>
          </Card>
        ) : (
          <>
            <section className="text-center">
              <Badge className="mx-auto mb-4 w-fit">분석 완료</Badge>
              <h2 className="text-3xl leading-10 text-brown-600">
                {isAdjusted ? "답변을 반영한" : "AI 퍼스널컬러 진단 결과"}
                <br />
                {isAdjusted ? "최종 결과를 정리했어요" : result.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#7a625c]">{isAdjusted ? "사진 분석 결과에 사용자의 답변을 더해 최종 톤을 정리했어요." : result.description}</p>
            </section>

            <Card className="overflow-hidden border-none">
              <CardHeader className="items-center pb-2 text-center">
                <div className={`mb-3 flex size-24 items-center justify-center rounded-full ${result.accentClassName} p-2 shadow-md`}>
                  <img src={result.imageUrl} className="size-full rounded-full object-cover" alt={`${result.seasonLabel} 퍼스널 컬러`} />
                </div>
                <CardTitle>{result.detailTitle}</CardTitle>
                <CardDescription>{result.detailDescription}</CardDescription>
              </CardHeader>
              <CardContent className="pt-3 text-center">
                {confidence !== null ? <p className="text-sm leading-6 text-brown-300">최종 일치도 {confidence}%</p> : null}
                {sessionResultMatchesProfile && finalResult?.correctionApplied ? (
                  <div className="mt-4 rounded-2xl bg-cream-50 px-4 py-3 text-sm leading-6 text-[#7a625c]">AI 분석 결과에 설문 답변을 반영한 결과입니다.</div>
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
                    <div key={color} className="aspect-square flex-1 rounded-full shadow-sm" style={{ backgroundColor: color }} aria-label={`${color} 컬러`} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">결과가 잘 맞는 편인가요?</CardTitle>
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
                        className="min-h-12"
                        onClick={() => selectMatchStatus(option.value as DiagnosisFeedback["matchStatus"])}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>

                {feedback?.matchStatus === "unclear" || feedback?.matchStatus === "not_match" ? (
                  <div className="mt-5">
                    <p className="text-sm leading-6 text-[#7a625c]">더 가깝게 느껴지는 톤이 있다면 알려주세요.</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {[
                        { value: "spring", label: "봄 웜톤" },
                        { value: "summer", label: "여름 쿨톤" },
                        { value: "autumn", label: "가을 웜톤" },
                        { value: "winter", label: "겨울 쿨톤" },
                      ].map((option) => {
                        const isSelected = feedback.userSelectedSeason === option.value;

                        return (
                          <Button
                            key={option.value}
                            type="button"
                            variant={isSelected ? "secondary" : "outline"}
                            className={option.value === "unknown" ? "col-span-2" : ""}
                            onClick={() => selectFeedbackSeason(option.value as PersonalColorSeason | "unknown")}
                          >
                            {isSelected ? <HiCheck className="size-4" aria-hidden="true" /> : null}
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {feedbackSaveError ? <p className="mt-4 text-sm leading-5 text-red">{feedbackSaveError}</p> : null}
              </CardContent>
            </Card>

            <Button type="button" size="lg" className="w-full" onClick={isLoggedIn ? () => navigate("/recommendation") : goToLoginForSave}>
              {isLoggedIn ? "내게 맞는 상품 보기" : "로그인하고 진단결과 저장하기"}
              <HiArrowRight className="size-5" aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
=======
import { Link, useNavigate } from "react-router-dom";
import { HiArrowRight, HiHome } from "react-icons/hi2";
import type { MockUploadResponse } from "../api/mockUploadPhoto";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
} from "../constants/personalColor";

function getStoredUpload(): MockUploadResponse | null {
  const storedUpload = sessionStorage.getItem("wings_uploaded_photo");

  if (!storedUpload) {
    return null;
  }

  try {
    return JSON.parse(storedUpload) as MockUploadResponse;
  } catch {
    return null;
  }
}

export default function Result() {
  const navigate = useNavigate();
  const upload = getStoredUpload();
  const result = personalColorResults[getStoredPersonalColorSeason()];

  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-white px-5 pb-5 pt-5">
      <div
        className={`absolute -right-24 top-[320px] size-72 rounded-full ${result.accentSoftClassName} blur-[70px]`}
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 top-[430px] size-72 rounded-full bg-cream-100 blur-[80px]"
        aria-hidden="true"
      />

      <header className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="홈으로 이동"
          onClick={() => navigate("/onboarding")}
        >
          <HiHome className="size-7" aria-hidden="true" />
        </button>

        <h1 className="text-2xl font-normal leading-[30px] text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="size-10 overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50 shadow-[0_4px_14px_rgb(58_37_39_/_0.12)]">
          <img
            src={upload?.imageUrl ?? "/illustration.png"}
            className="size-full object-cover"
            alt="분석한 프로필"
          />
        </div>
      </header>

      <section className="relative pt-12 text-center">
        <div className="mx-auto mb-4 flex h-9 w-24 items-center justify-center rounded-full bg-cream-100 text-sm font-normal leading-5 text-[#7a625c] shadow-[inset_0_0_0_1px_rgb(255_229_138_/_0.4)]">
          분석 완료
        </div>

        <h2 className="text-2xl font-normal leading-[32px] text-brown-600">
          당신은
          <br />
          {result.title}
        </h2>
        <p className="mt-3 text-sm font-normal leading-[22.4px] text-[#7a625c]">
          {result.description}
        </p>
      </section>

      <section className="relative mt-7 rounded-[22px] border border-ivory/70 bg-white/85 px-5 pb-6 pt-6 text-center shadow-[0_22px_55px_rgb(107_74_63_/_0.08)] backdrop-blur">
        <div className={`mx-auto mb-5 flex size-28 items-center justify-center overflow-hidden rounded-full ${result.accentClassName} p-2 shadow-[0_3px_12px_rgb(58_37_39_/_0.12)]`}>
          <img
            src={result.imageUrl}
            className="size-full rounded-full object-cover"
            alt={`${result.seasonLabel} 퍼스널 컬러`}
          />
        </div>

        <h3 className="text-xl font-normal leading-7 text-brown-600">
          {result.detailTitle}
        </h3>
        <p className="mt-3 text-sm font-normal leading-[22.4px] text-[#7a625c]">
          {result.detailDescription}
        </p>
      </section>

      <section className="relative mt-7">
        <h3 className="text-lg font-normal leading-[25px] text-brown-600">
          잘 어울리는 베스트 컬러
        </h3>

        <div className="mt-4 flex justify-between gap-3">
          {result.bestColors.map((color) => (
            <div
              key={color}
              className="aspect-square flex-1 rounded-full shadow-[inset_0_0_0_2px_rgb(255_255_255_/_0.5),0_2px_8px_rgb(58_37_39_/_0.18)]"
              style={{ backgroundColor: color }}
              aria-label={`${color} 컬러`}
            />
          ))}
        </div>
      </section>

      <footer className="relative mt-auto pt-5">
        <Link
          to="/recommendation"
          className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39_/_0.15)]"
        >
          내 톤에 맞는 제품 보기
          <HiArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </footer>
>>>>>>> Stashed changes
    </main>
  );
}
