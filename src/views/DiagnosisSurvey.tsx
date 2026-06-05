"use client";

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "../lib/router";
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
  HiSparkles,
} from "react-icons/hi2";
import {
  createFinalDiagnosisResult,
  finalizeDiagnosisWithSurvey,
} from "../api/diagnosis";
import {
  getStoredAiDiagnosisResult,
  getStoredDiagnosisUpload,
  setStoredFinalDiagnosisResult,
  setStoredSurveyAnswers,
  type DiagnosisUpload,
} from "../api/diagnosisUpload";
import type { SurveyAnswers } from "../types/diagnosis";

type SurveyQuestion = {
  id: keyof SurveyAnswers;
  title: string;
  options: {
    value: SurveyAnswers[keyof SurveyAnswers];
    label: string;
  }[];
};

const surveyQuestions: SurveyQuestion[] = [
  {
    id: "warmcool_preference",
    title:
      "오렌지·코랄·브라운 계열과 핑크·푸시아·버건디 계열 중 어느 쪽이 더 잘 어울린다고 느끼나요?",
    options: [
      { value: "warm", label: "오렌지·코랄·브라운 계열" },
      { value: "cool", label: "핑크·푸시아·버건디 계열" },
      { value: "unknown", label: "잘 모르겠음" },
    ],
  },
  {
    id: "brightness_preference",
    title: "밝고 부드러운 색과 깊고 진한 색 중 어느 쪽이 더 얼굴이 살아 보이나요?",
    options: [
      { value: "light", label: "밝고 부드러운 색" },
      { value: "deep", label: "깊고 진한 색" },
      { value: "unknown", label: "잘 모르겠음" },
    ],
  },
  {
    id: "clarity_preference",
    title: "맑고 선명한 색과 차분하고 부드러운 색 중 어느 쪽이 더 잘 어울리나요?",
    options: [
      { value: "clear", label: "맑고 선명한 색" },
      { value: "muted", label: "차분하고 부드러운 색" },
      { value: "unknown", label: "잘 모르겠음" },
    ],
  },
];

const emptyAnswers: Partial<SurveyAnswers> = {};

export default function DiagnosisSurvey() {
  const navigate = useNavigate();
  const location = useLocation();
  const upload = useMemo(
    () =>
      (location.state as DiagnosisUpload | null) ?? getStoredDiagnosisUpload(),
    [location.state],
  );
  const aiResult = getStoredAiDiagnosisResult();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] =
    useState<Partial<SurveyAnswers>>(emptyAnswers);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const currentQuestion = surveyQuestions[stepIndex];
  const selectedValue = answers[currentQuestion.id];
  const isLastQuestion = stepIndex === surveyQuestions.length - 1;

  const moveToResultWithAiOnly = () => {
    if (aiResult) {
      setStoredFinalDiagnosisResult(createFinalDiagnosisResult(aiResult));
    }

    navigate("/result", { replace: true });
  };

  const submitAnswers = async (nextAnswers: SurveyAnswers) => {
    if (!aiResult || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setStoredSurveyAnswers(nextAnswers);

    try {
      await finalizeDiagnosisWithSurvey(
        upload?.diagnosisResultId,
        aiResult,
        nextAnswers,
      );
      navigate("/result", { replace: true });
    } catch {
      setSaveError("결과를 정리하는 중 문제가 생겼어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectOption = (value: SurveyAnswers[keyof SurveyAnswers]) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const goNext = () => {
    if (!selectedValue) {
      return;
    }

    if (!isLastQuestion) {
      setStepIndex((currentIndex) => currentIndex + 1);
      return;
    }

    void submitAnswers(answers as SurveyAnswers);
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex((currentIndex) => currentIndex - 1);
      return;
    }

    navigate(-1);
  };

  if (!aiResult) {
    navigate("/photo", { replace: true });
    return null;
  }

  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-cream-50 px-5 pb-6 pt-5">
      <div
        className="absolute -right-20 top-20 size-64 rounded-full bg-tone-spring/24 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 bottom-8 size-72 rounded-full bg-tone-summer/28 blur-3xl"
        aria-hidden="true"
      />

      <header className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm"
          aria-label="이전 질문으로 이동"
          onClick={goBack}
          disabled={isSaving}
        >
          <HiArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="text-sm font-normal leading-5 text-brown-300">
          {stepIndex + 1} / {surveyQuestions.length}
        </p>
        <button
          type="button"
          className="text-sm font-normal leading-5 text-brown-300"
          onClick={moveToResultWithAiOnly}
          disabled={isSaving}
        >
          건너뛰기
        </button>
      </header>

      <section className="relative flex flex-1 flex-col pt-10">
        <div className="flex size-14 items-center justify-center rounded-full bg-white text-green shadow-md">
          <HiSparkles className="size-7" aria-hidden="true" />
        </div>

        <p className="mt-7 text-sm font-normal leading-6 text-green">
          결과를 조금 더 정확하게 맞춰볼게요
        </p>
        <h1 className="mt-2 text-2xl font-normal leading-9 text-brown-600">
          조금 더 정확한 결과를 위해
          <br />
          3가지만 확인할게요
        </h1>
        <p className="mt-3 text-sm font-normal leading-6 text-[#7a625c]">
          사진 기준 결과에 평소 잘 맞는 색감을 더해 최종 톤을 정리할게요.
        </p>

        <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-cream-200">
          <div
            className="h-full rounded-full bg-brown-400 transition-[width] duration-200"
            style={{
              width: `${((stepIndex + 1) / surveyQuestions.length) * 100}%`,
            }}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-ivory/70 bg-white/90 px-5 py-6 shadow-lg backdrop-blur">
          <h2 className="text-lg font-normal leading-8 text-brown-600">
            {currentQuestion.title}
          </h2>

          <div className="mt-6 flex flex-col gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedValue === option.value;

              return (
                <button
                  type="button"
                  key={option.value}
                  className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-base font-normal leading-6 transition ${
                    isSelected
                      ? "border-brown-400 bg-cream-100 text-brown-600 shadow-sm"
                      : "border-ivory/70 bg-cream-50 text-[#7a625c]"
                  }`}
                  onClick={() => selectOption(option.value)}
                  disabled={isSaving}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green text-white">
                      <HiCheck className="size-4" aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {saveError ? (
          <p className="mt-4 rounded-2xl bg-red/10 px-4 py-3 text-sm font-normal leading-6 text-red">
            {saveError}
          </p>
        ) : null}

        <footer className="mt-auto pt-6">
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-base font-normal leading-6 text-white shadow-lg disabled:bg-brown-200"
            onClick={() => {
              goNext();
            }}
            disabled={!selectedValue || isSaving}
          >
            {isLastQuestion ? "최종 결과 보기" : "다음"}
            <HiArrowRight className="size-5" aria-hidden="true" />
          </button>
        </footer>
      </section>
    </main>
  );
}
