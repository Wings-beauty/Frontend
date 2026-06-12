"use client";

import { useEffect, useMemo, useState } from "react";
import { HiArrowLeft, HiArrowRight, HiCheck, HiSparkles } from "react-icons/hi2";
import { finalizeDiagnosisWithSurvey } from "../api/diagnosis";
import { clearPendingDiagnosisSurvey, getPendingDiagnosisSurvey, type PendingDiagnosisSurvey } from "../api/diagnosisUpload";
import { personalColorResults } from "../constants/personalColor";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "../lib/router";
import type { SurveyAnswers } from "../types/diagnosis";

type AnswerDraft = Partial<Record<keyof SurveyAnswers, string>>;

type SurveyQuestion = {
  key: keyof SurveyAnswers;
  label: string;
  description: string;
  options: {
    value: string;
    title: string;
    description: string;
  }[];
};

const surveyQuestions: SurveyQuestion[] = [
  {
    key: "warmcool_preference",
    label: "피부가 더 편안해 보이는 쪽",
    description: "평소 얼굴빛이 자연스럽게 정돈돼 보였던 컬러감을 골라주세요.",
    options: [
      { value: "warm", title: "따뜻한 색", description: "피치, 코랄, 크림, 브라운 계열" },
      { value: "cool", title: "차가운 색", description: "로즈, 라벤더, 블루, 버건디 계열" },
      { value: "unknown", title: "잘 모르겠어요", description: "기억나는 차이가 뚜렷하지 않아요" },
    ],
  },
  {
    key: "brightness_preference",
    label: "잘 어울렸던 색의 무게감",
    description: "밝고 가벼운 색과 깊고 진한 색 중 더 자주 칭찬받은 쪽을 선택해주세요.",
    options: [
      { value: "light", title: "밝고 가벼운 색", description: "라이트 핑크, 아이보리, 소프트 블루" },
      { value: "deep", title: "깊고 진한 색", description: "브릭, 플럼, 네이비, 초콜릿 브라운" },
      { value: "unknown", title: "잘 모르겠어요", description: "둘 다 비슷하거나 판단이 어려워요" },
    ],
  },
  {
    key: "clarity_preference",
    label: "인상이 더 살아나는 채도",
    description: "선명한 색과 부드럽게 톤다운된 색 중 얼굴이 더 생기 있어 보이는 쪽을 골라주세요.",
    options: [
      { value: "clear", title: "맑고 선명한 색", description: "또렷한 코랄, 체리, 푸시아, 클리어 블루" },
      { value: "muted", title: "부드럽고 차분한 색", description: "말린 장미, 모브, 세이지, 더스티 핑크" },
      { value: "unknown", title: "잘 모르겠어요", description: "채도 차이를 크게 느끼지 못했어요" },
    ],
  },
];

function getPercent(value: number) {
  const normalized = value > 1 ? value / 100 : value;
  return Math.round(normalized * 100);
}

export default function DiagnosisSurvey() {
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<PendingDiagnosisSurvey | null>(null);
  const [answers, setAnswers] = useState<AnswerDraft>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const pendingSurvey = getPendingDiagnosisSurvey();

    if (!pendingSurvey) {
      navigate("/result", { replace: true });
      return;
    }

    setSurvey(pendingSurvey);
  }, [navigate]);

  const answeredCount = surveyQuestions.filter((question) => answers[question.key]).length;
  const isComplete = answeredCount === surveyQuestions.length;
  const progress = Math.round((answeredCount / surveyQuestions.length) * 100);

  const initialTone = useMemo(() => {
    if (!survey) {
      return null;
    }

    return personalColorResults[survey.aiResult.season];
  }, [survey]);

  const handleSubmit = async () => {
    if (!survey || !isComplete) {
      return;
    }

    const finalAnswers: SurveyAnswers = {
      warmcool_preference: answers.warmcool_preference as SurveyAnswers["warmcool_preference"],
      brightness_preference: answers.brightness_preference as SurveyAnswers["brightness_preference"],
      clarity_preference: answers.clarity_preference as SurveyAnswers["clarity_preference"],
    };

    setIsSaving(true);
    setErrorMessage("");

    try {
      await finalizeDiagnosisWithSurvey(survey.diagnosisResultId, survey.aiResult, finalAnswers);
      clearPendingDiagnosisSurvey();
      navigate("/result", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "설문 결과를 저장하지 못했어요.");
    } finally {
      setIsSaving(false);
    }
  };

  const skipSurvey = () => {
    clearPendingDiagnosisSurvey();
    navigate("/result", { replace: true });
  };

  if (!survey || !initialTone) {
    return null;
  }

  return (
    <main className="app-page flex min-h-dvh w-full items-center justify-center px-4 py-4 sm:px-8">
      <section className="app-panel flex min-h-[calc(100dvh-32px)] w-full max-w-5xl flex-col overflow-hidden lg:min-h-[720px]">
        <header className="flex items-center justify-between px-5 pt-6 sm:px-8">
          <button type="button" className="flex size-11 items-center justify-center rounded-full border border-cream-200 bg-white text-brown-600" aria-label="결과로 이동" onClick={skipSurvey} disabled={isSaving}>
            <HiArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-base font-medium leading-7 text-brown-600 sm:text-lg">추가 설문</h1>
          <div className="size-11" aria-hidden="true" />
        </header>

        <div className="grid flex-1 gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-10 lg:py-10">
          <div className="mx-auto flex w-full max-w-md flex-col gap-5 lg:max-w-none">
            <div className="rounded-2xl border border-cream-200 bg-cream-100 px-6 py-7">
              <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm">
                <HiSparkles className="size-7" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium leading-6 text-brown-300">AI가 비슷한 톤을 함께 감지했어요</p>
              <h2 className="mt-2 text-3xl font-medium leading-10 text-brown-600">{initialTone.toneLabel} 보완 진단</h2>
              <p className="mt-4 text-base leading-7 text-[#756861]">사진만으로 애매한 부분을 평소 컬러 경험으로 한 번 더 확인합니다.</p>
            </div>

            <Card className="shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm leading-5 text-brown-300">AI 신뢰도</p>
                    <p className="mt-1 text-2xl leading-8 text-brown-600">{getPercent(survey.aiResult.confidence)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm leading-5 text-brown-300">답변 진행</p>
                    <p className="mt-1 text-2xl leading-8 text-brown-600">
                      {answeredCount}/{surveyQuestions.length}
                    </p>
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-cream-200">
                  <div className="h-full rounded-full bg-brown-400 transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
                {survey.aiResult.question_reason ? <p className="mt-4 text-sm leading-6 text-[#756861]">{survey.aiResult.question_reason}</p> : null}
              </CardContent>
            </Card>
          </div>

          <div className="flex w-full flex-col gap-4">
            {surveyQuestions.map((question, questionIndex) => (
              <Card key={question.key} className="shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream-100 text-sm leading-5 text-brown-600">{questionIndex + 1}</div>
                    <div>
                      <CardTitle className="text-lg leading-7">{question.label}</CardTitle>
                      <CardDescription>{question.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {question.options.map((option) => {
                      const isSelected = answers[question.key] === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`min-h-28 rounded-2xl border px-4 py-3 text-left transition-colors ${
                            isSelected ? "border-brown-600 bg-cream-100 text-brown-600" : "border-cream-200 bg-white text-[#756861] hover:bg-cream-50"
                          }`}
                          onClick={() =>
                            setAnswers((currentAnswers) => ({
                              ...currentAnswers,
                              [question.key]: option.value,
                            }))
                          }
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span className="text-sm font-medium leading-6 text-brown-600">{option.title}</span>
                            {isSelected ? <HiCheck className="mt-1 size-4 shrink-0 text-green" aria-hidden="true" /> : null}
                          </span>
                          <span className="mt-2 block text-sm leading-5">{option.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {errorMessage ? <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm leading-6 text-red">{errorMessage}</p> : null}

            <div className="grid gap-3 sm:grid-cols-[0.42fr_0.58fr]">
              <Button type="button" variant="outline" size="lg" onClick={skipSurvey} disabled={isSaving}>
                AI 결과만 보기
              </Button>
              <Button type="button" size="lg" onClick={handleSubmit} disabled={!isComplete || isSaving}>
                {isSaving ? "저장 중" : "보완 결과 보기"}
                <HiArrowRight className="size-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
