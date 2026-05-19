import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowRight, HiCheck, HiHome, HiMiniUser } from "react-icons/hi2";
import {
  fetchProfile,
  getCurrentUser,
  setAuthReturnTo,
} from "../api/auth";
import {
  getStoredDiagnosisFeedback,
  getStoredFinalDiagnosisResult,
  setStoredDiagnosisFeedback,
} from "../api/diagnosisUpload";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
  type PersonalColorSeason,
} from "../constants/personalColor";
import type { DiagnosisFeedback } from "../types/diagnosis";

type ProfileView = {
  profileImageUrl: string | null;
};

export default function Result() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [feedback, setFeedback] = useState<DiagnosisFeedback | null>(
    getStoredDiagnosisFeedback(),
  );
  const finalResult = getStoredFinalDiagnosisResult();
  const season = finalResult?.finalSeason ?? getStoredPersonalColorSeason();
  const result = personalColorResults[season];
  const confidence = finalResult
    ? Math.round(finalResult.finalConfidence * 100)
    : null;
  const isAdjusted = Boolean(finalResult?.userAnswers);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then((user) => {
      if (!user) {
        navigate("/login");
      }
    });

    const loadProfile = async () => {
      const user = await getCurrentUser();
      setIsLoggedIn(Boolean(user));

      if (!user) {
        return;
      }

      const profileFromDb = await fetchProfile(user);

      if (isMounted) {
        setProfile({ profileImageUrl: profileFromDb.profileImageUrl });
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

  const saveFeedback = (nextFeedback: DiagnosisFeedback) => {
    setFeedback(nextFeedback);
    setStoredDiagnosisFeedback(nextFeedback);
    // TODO: 피드백 저장 API 연결 필요
  };

  const selectMatchStatus = (matchStatus: DiagnosisFeedback["matchStatus"]) => {
    saveFeedback({
      matchStatus,
      userSelectedSeason:
        matchStatus === "match" ? undefined : feedback?.userSelectedSeason,
    });
  };

  const selectFeedbackSeason = (
    userSelectedSeason: PersonalColorSeason | "unknown",
  ) => {
    if (!feedback || feedback.matchStatus === "match") {
      return;
    }

    saveFeedback({
      ...feedback,
      userSelectedSeason,
    });
  };

  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-white px-5 pb-6 pt-5">
      <div
        className={`absolute -right-24 top-80 size-80 rounded-full ${result.accentSoftClassName} blur-3xl`}
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 top-96 size-80 rounded-full bg-cream-100 blur-3xl"
        aria-hidden="true"
      />

      <header className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="홈으로 이동"
          onClick={handleHomeClick}
        >
          <HiHome className="size-7" aria-hidden="true" />
        </button>

        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50 shadow-[0_4px_14px_rgb(58_37_39/0.12)]">
          {profile?.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              className="size-full object-cover"
              alt="프로필"
            />
          ) : (
            <HiMiniUser className="size-7 text-brown-400" aria-hidden="true" />
          )}
        </div>
      </header>

      <div className="relative flex flex-1 flex-col justify-between gap-5 overflow-y-auto pt-8">
        <section className="text-center">
          <div className="mx-auto mb-4 flex h-8 w-24 items-center justify-center rounded-full bg-cream-100 text-sm font-normal leading-5 text-[#7a625c] shadow-inner">
            분석 완료
          </div>

          <h2 className="text-3xl font-normal leading-10 text-brown-600">
            {isAdjusted ? "답변을 반영해" : "AI 퍼스널컬러 진단 결과"}
            <br />
            {isAdjusted ? "최종 결과를 조정했어요" : result.title}
          </h2>
          <p className="mt-3 text-sm font-normal leading-6 text-[#7a625c]">
            {isAdjusted
              ? "사진 분석 결과에 사용자의 답변을 더해 최종 톤을 정리했어요."
              : result.description}
          </p>
        </section>

        <section className="rounded-2xl border border-ivory/70 bg-white/85 px-5 py-6 text-center shadow-lg backdrop-blur">
          <div
            className={`mx-auto mb-5 flex size-24 items-center justify-center overflow-hidden rounded-full ${result.accentClassName} p-2 shadow-md`}
          >
            <img
              src={result.imageUrl}
              className="size-full rounded-full object-cover"
              alt={`${result.seasonLabel} 퍼스널 컬러`}
            />
          </div>

          <h3 className="text-lg font-normal leading-8 text-brown-600">
            {finalResult?.finalSeasonKr ?? result.detailTitle}
          </h3>
          <p className="mt-3 text-sm font-normal leading-6 text-[#7a625c]">
            {result.detailDescription}
          </p>
          {confidence !== null ? (
            <p className="mt-4 text-sm font-normal leading-6 text-brown-300">
              최종 일치도 {confidence}%
            </p>
          ) : null}
          {finalResult?.correctionApplied ? (
            <p className="mt-3 rounded-2xl bg-cream-100 px-4 py-3 text-sm font-normal leading-6 text-[#7a625c]">
              AI 분석 결과와 답변을 함께 반영한 결과예요.
            </p>
          ) : null}
        </section>

        <section>
          <h3 className="text-lg font-normal leading-8 text-brown-600">
            가장 잘 어울리는 베스트 컬러
          </h3>

          <div className="mt-4 flex justify-between gap-3">
            {result.bestColors.map((color) => (
              <div
                key={color}
                className="aspect-square flex-1 rounded-full shadow-sm"
                style={{ backgroundColor: color }}
                aria-label={`${color} 컬러`}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-ivory/70 bg-cream-50 px-5 py-5 shadow-sm">
          <h3 className="text-lg font-normal leading-7 text-brown-600">
            결과가 잘 맞는 것 같나요?
          </h3>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { value: "match", label: "맞아요" },
              { value: "unclear", label: "애매해요" },
              { value: "not_match", label: "아닌 것 같아요" },
            ].map((option) => {
              const isSelected = feedback?.matchStatus === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`flex min-h-12 items-center justify-center rounded-2xl border px-2 text-sm font-normal leading-5 ${
                    isSelected
                      ? "border-brown-400 bg-brown-400 text-white"
                      : "border-ivory bg-white text-[#7a625c]"
                  }`}
                  onClick={() =>
                    selectMatchStatus(
                      option.value as DiagnosisFeedback["matchStatus"],
                    )
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {feedback?.matchStatus === "unclear" ||
          feedback?.matchStatus === "not_match" ? (
            <div className="mt-5">
              <p className="text-sm font-normal leading-6 text-[#7a625c]">
                생각하는 톤이 있다면 알려주세요.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { value: "spring", label: "봄 웜톤" },
                  { value: "summer", label: "여름 쿨톤" },
                  { value: "autumn", label: "가을 웜톤" },
                  { value: "winter", label: "겨울 쿨톤" },
                  { value: "unknown", label: "잘 모르겠음" },
                ].map((option) => {
                  const isSelected =
                    feedback.userSelectedSeason === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`flex min-h-11 items-center justify-center gap-1 rounded-2xl border px-3 text-sm font-normal leading-5 ${
                        isSelected
                          ? "border-green bg-green/10 text-green"
                          : "border-ivory bg-white text-[#7a625c]"
                      } ${option.value === "unknown" ? "col-span-2" : ""}`}
                      onClick={() =>
                        selectFeedbackSeason(
                          option.value as PersonalColorSeason | "unknown",
                        )
                      }
                    >
                      {isSelected ? (
                        <HiCheck className="size-4" aria-hidden="true" />
                      ) : null}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        <footer className="pt-2">
          <button
            type="button"
            onClick={isLoggedIn ? () => navigate("/recommendation") : goToLoginForSave}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white shadow-lg"
          >
            {isLoggedIn
              ? "나에게 맞는 제품 보기"
              : "로그인하고 진단결과 저장하기"}
            <HiArrowRight className="size-5" aria-hidden="true" />
          </button>
        </footer>
      </div>
    </main>
  );
}
