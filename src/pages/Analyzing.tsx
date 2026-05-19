import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiArrowPath, HiCheck, HiSparkles } from "react-icons/hi2";
import { completeDiagnosis } from "../api/diagnosis";
import {
  clearStoredDiagnosis,
  getStoredAiDiagnosisResult,
  getStoredDiagnosisUpload,
  type DiagnosisUpload,
} from "../api/diagnosisUpload";

const ANALYSIS_DURATION_MS = 5000;

const timelineSteps = [
  {
    title: "사진 밝기 분석",
    description: "사진의 밝기와 그림자 영향을 확인하고 있습니다.",
  },
  {
    title: "피부 영역 분석",
    description: "얼굴과 피부 영역을 분리해 색상 데이터를 정리하고 있습니다.",
  },
  {
    title: "톤 매칭 중",
    description: "퍼스널 컬러 데이터와 비교해 가장 가까운 톤을 찾고 있습니다.",
  },
  {
    title: "맞춤 제품 찾는 중",
    description: "분석 결과와 어울리는 추천 상품을 준비하고 있습니다.",
  },
] as const;

function getStepStatus(stepIndex: number, activeStepIndex: number) {
  if (stepIndex < activeStepIndex) return "done";
  if (stepIndex === activeStepIndex) return "active";
  return "pending";
}

function getNeedsQuestions(upload: DiagnosisUpload) {
  const aiResult = getStoredAiDiagnosisResult();

  return (
    upload.needsQuestions ??
    aiResult?.needs_questions ??
    (aiResult
      ? aiResult.confidence < 50 ||
        (typeof aiResult.top1_top2_gap === "number" &&
          aiResult.top1_top2_gap < 12) ||
        (aiResult.season === "autumn" && aiResult.confidence < 60)
      : false)
  );
}

export default function Analyzing() {
  const navigate = useNavigate();
  const location = useLocation();
  const upload = useMemo(
    () =>
      (location.state as DiagnosisUpload | null) ?? getStoredDiagnosisUpload(),
    [location.state],
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!upload) {
      navigate("/photo", { replace: true });
      return;
    }

    const startedAt = performance.now();

    const progressInterval = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const nextProgress = Math.min(
        100,
        Math.round((elapsed / ANALYSIS_DURATION_MS) * 100),
      );

      setProgress(nextProgress);
    }, 80);

    const resultTimer = window.setTimeout(() => {
      setProgress(100);

      void completeDiagnosis(upload).then((result) => {
        if (result) {
          navigate(getNeedsQuestions(upload) ? "/diagnosis-survey" : "/result", {
            replace: true,
            state: upload,
          });
          return;
        }

        clearStoredDiagnosis();
        navigate("/photo", { replace: true });
      });
    }, ANALYSIS_DURATION_MS);

    return () => {
      window.clearInterval(progressInterval);
      window.clearTimeout(resultTimer);
    };
  }, [navigate, upload]);

  if (!upload) {
    return null;
  }

  const activeStepIndex = Math.min(
    timelineSteps.length - 1,
    Math.floor((progress / 100) * timelineSteps.length),
  );

  return (
    <main className="relative flex min-h-dvh w-full overflow-hidden bg-white">
      <div
        className="absolute -right-28 top-0 h-96 w-72 rounded-full bg-purple/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 top-56 h-96 w-60 rounded-full bg-pink/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-20 size-80 rounded-full bg-cream-100 blur-3xl"
        aria-hidden="true"
      />

      <section className="relative flex min-h-dvh w-full flex-col items-center px-8 pb-8 pt-24">
        <div className="relative flex size-28 items-center justify-center rounded-full bg-[#ffefd7] shadow-lg">
          <div
            className="absolute inset-3 rounded-full border border-dashed border-[#f6cda9]"
            aria-hidden="true"
          />
          <HiSparkles
            className="size-12 animate-pulse text-[#ff9f82]"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-14 text-center text-lg font-normal leading-8 text-[#9a817b]">
          사진과 피부 톤 데이터를 분석하고 있습니다.
          <br />
          잠시만 기다려 주세요.
        </h1>

        <div className="mt-10 w-full rounded-2xl bg-white/90 px-6 py-7 shadow-lg backdrop-blur">
          <div className="relative flex flex-col gap-7">
            <div
              className="absolute bottom-6 left-6 top-6 w-0.5 bg-[#f2d9bf]"
              aria-hidden="true"
            />
            <div
              className="absolute left-6 top-6 w-0.5 bg-[#f39d86] transition-[height] duration-200 ease-linear"
              style={{ height: `calc((100% - 3rem) * ${progress / 100})` }}
              aria-hidden="true"
            />

            {timelineSteps.map((step, index) => {
              const status = getStepStatus(index, activeStepIndex);
              const isDone = status === "done";
              const isActive = status === "active";
              const isPending = status === "pending";

              return (
                <div key={step.title} className="relative flex min-h-10 gap-6">
                  <div
                    className={`z-10 flex size-12 shrink-0 items-center justify-center rounded-full ${
                      isDone
                        ? "border-2 border-[#b7ddcb] bg-[#e0f3e9] text-[#6bb594]"
                        : ""
                    } ${
                      isActive
                        ? "bg-[#ffa58d] text-white shadow-md"
                        : ""
                    } ${isPending ? "bg-[#f1eeee] text-[#c6bebc]" : ""}`}
                  >
                    {isDone && <HiCheck className="size-6" aria-hidden="true" />}
                    {isActive && (
                      <HiArrowPath
                        className="size-6 animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    {isPending && (
                      <span className="size-3 rounded-full bg-[#cfc7c5]" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col justify-center pt-1">
                    <p
                      className={`text-lg font-normal leading-7 ${
                        isPending ? "text-[#b9adaa]" : "text-[#3a2527]"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-1.5 max-w-xs text-sm font-normal leading-6 text-[#7a625c]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
