"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import { HiArrowLeft, HiCheck, HiFaceSmile, HiMiniUser, HiStar } from "react-icons/hi2";
import { fetchLatestDiagnosisForUser } from "../api/diagnosis";
import type { LatestDiagnosis } from "../api/diagnosis";
import { fetchFeedbackForDiagnosis, saveDiagnosisFeedback } from "../api/feedback";
import { fetchProfile, getCurrentUser, setAuthReturnTo } from "../api/auth";
import { personalColorResults } from "../constants/personalColor";

type ProfileView = {
  nickname: string;
  profileImageUrl: string | null;
};

export default function Feedback() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [latestDiagnosis, setLatestDiagnosis] = useState<LatestDiagnosis | null>(null);
  const [rating, setRating] = useState(5);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const result = latestDiagnosis ? personalColorResults[latestDiagnosis.season] : null;

  useEffect(() => {
    let isMounted = true;

    const loadFeedbackContext = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) {
          setAuthReturnTo("/feedback");
          navigate("/login", { replace: true });
          return;
        }

        const [profileFromDb, diagnosisFromDb] = await Promise.all([fetchProfile(user), fetchLatestDiagnosisForUser(user.id)]);

        if (!isMounted) {
          return;
        }

        setUserId(user.id);
        setProfile({
          nickname: profileFromDb.nickname,
          profileImageUrl: profileFromDb.profileImageUrl,
        });
        setLatestDiagnosis(diagnosisFromDb);

        if (diagnosisFromDb) {
          const savedFeedback = await fetchFeedbackForDiagnosis(user.id, diagnosisFromDb.id);

          if (!isMounted) {
            return;
          }

          if (savedFeedback) {
            setRating(savedFeedback.rating ?? 5);
            setIsMatch(savedFeedback.is_match ?? null);
            setComment(savedFeedback.comment ?? "");
            setIsSaved(true);
          }
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "설문 정보를 불러오지 못했어요.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadFeedbackContext();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSaveFeedback = async () => {
    if (!userId || !latestDiagnosis || isMatch === null) {
      setErrorMessage("만족도와 진단 결과 일치 여부를 선택해주세요.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await saveDiagnosisFeedback({
        userId,
        diagnosisResultId: latestDiagnosis.id,
        rating,
        isMatch,
        comment,
      });
      setIsSaved(true);
      navigate("/home", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "피드백 저장에 실패했어요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="app-page px-5 pb-10 pt-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">
      <header className="app-panel relative flex items-center justify-between px-4 py-3">
        <button type="button" className="flex size-10 items-center justify-center text-brown-600" aria-label="이전 페이지로 이동" onClick={() => navigate(-1)}>
          <HiArrowLeft className="size-6" aria-hidden="true" />
        </button>

        <h1 className="text-xl font-medium leading-7 text-brown-600">피드백</h1>

        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-cream-200 bg-white">
          {profile?.profileImageUrl ? <img src={profile.profileImageUrl} className="size-full object-cover" alt="프로필" /> : <HiMiniUser className="size-7 text-brown-400" aria-hidden="true" />}
        </div>
      </header>

      <section className="mt-12">
        <div className="inline-flex h-11 items-center gap-2 rounded-full bg-cream-100 px-5 text-base font-normal leading-6 text-brown-600">
          <HiFaceSmile className="size-5" aria-hidden="true" />
          진단 피드백
        </div>

        <h2 className="mt-7 text-3xl font-medium leading-10 text-brown-600">
          진단 결과가
          <br />
          얼마나 잘 맞았나요?
        </h2>
        <p className="mt-5 text-base font-normal leading-7 text-[#756861]">{profile?.nickname ?? "사용자"}님의 의견은 추천 정확도를 높이는 데 사용됩니다.</p>
      </section>

      {isLoading ? (
        <section className="app-card mt-12 px-6 py-8">
          <p className="text-base font-normal leading-7 text-[#756861]">설문 정보를 불러오는 중입니다.</p>
        </section>
      ) : !latestDiagnosis || !result ? (
        <section className="app-card mt-12 px-6 py-8">
          <p className="text-base font-normal leading-7 text-[#756861]">저장된 진단 결과가 없습니다. 먼저 AI 톤 진단을 완료해주세요.</p>
          <button type="button" className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-brown-600 text-lg font-normal leading-7 text-white" onClick={() => navigate("/photo")}>
            AI 톤 진단 시작하기
          </button>
        </section>
      ) : (
        <section className="mt-10 space-y-6">
          <article className={`rounded-2xl border border-cream-200 px-6 py-6 ${result.accentSoftClassName}`}>
            <p className="text-sm font-normal leading-5 text-[#756861]">최근 진단 결과</p>
            <h3 className="mt-3 text-2xl font-normal leading-8 text-brown-600">{latestDiagnosis.toneLabel}</h3>
            <p className="mt-3 text-base font-normal leading-7 text-[#756861]">{result.description}</p>
          </article>

          <article className="app-card px-6 py-7">
            <h3 className="text-lg font-normal leading-7 text-brown-600">만족도</h3>
            <div className="mt-5 flex justify-between">
              {Array.from({ length: 5 }).map((_, index) => {
                const score = index + 1;
                const isActive = score <= rating;

                return (
                  <button
                    key={score}
                    type="button"
                    className={`flex size-12 items-center justify-center rounded-full ${isActive ? "bg-[#ecad43] text-white" : "bg-cream-100 text-[#c9b7ad]"}`}
                    aria-label={`${score}점`}
                    onClick={() => {
                      setRating(score);
                      setIsSaved(false);
                    }}
                  >
                    <HiStar className={`size-7 ${isActive ? "fill-current" : ""}`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </article>

          <article className="app-card px-6 py-7">
            <h3 className="text-lg font-normal leading-7 text-brown-600">진단 결과가 실제 톤과 맞나요?</h3>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "잘 맞아요", value: true },
                { label: "조금 달라요", value: false },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={`flex h-14 items-center justify-center gap-2 rounded-full text-base font-normal leading-6 ${
                    isMatch === option.value ? "bg-brown-600 text-white" : "bg-cream-100 text-brown-600"
                  }`}
                  onClick={() => {
                    setIsMatch(option.value);
                    setIsSaved(false);
                  }}
                >
                  {isMatch === option.value ? <HiCheck className="size-5" aria-hidden="true" /> : null}
                  {option.label}
                </button>
              ))}
            </div>
          </article>

          <article className="app-card px-6 py-7">
            <label htmlFor="feedback-comment" className="text-lg font-normal leading-7 text-brown-600">
              남기고 싶은 의견
            </label>
            <textarea
              id="feedback-comment"
              className="app-input mt-5 min-h-32 w-full resize-none px-4 py-4 text-base font-normal leading-7 placeholder:text-[#b9aaa4]"
              placeholder="예: 가을 웜톤은 맞는데 조금 더 차분한 색이 잘 맞는 것 같아요."
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                setIsSaved(false);
              }}
            />
          </article>

          {errorMessage ? <p className="text-center text-sm font-normal leading-5 text-[#c4544a]">{errorMessage}</p> : null}

          {isSaved ? <p className="text-center text-sm font-normal leading-5 text-[#6bb594]">이미 저장된 피드백이 있습니다. 다시 제출하면 새 의견으로 추가됩니다.</p> : null}

          <button
            type="button"
            className="flex h-14 w-full items-center justify-center rounded-full bg-brown-600 text-lg font-normal leading-7 text-white shadow-[0_8px_20px_rgb(43_33_31/0.14)] disabled:opacity-60"
            disabled={isSaving}
            onClick={handleSaveFeedback}
          >
            {isSaving ? "저장 중" : "피드백 저장하기"}
          </button>
        </section>
      )}
      </div>
    </main>
  );
}
