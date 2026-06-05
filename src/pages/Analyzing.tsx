import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiArrowPath, HiCheck, HiSparkles } from "react-icons/hi2";
<<<<<<< Updated upstream
import { completeDiagnosis } from "../api/diagnosis";
import { clearStoredDiagnosis, getStoredAiDiagnosisResult, getStoredDiagnosisUpload, type DiagnosisUpload } from "../api/diagnosisUpload";

const MIN_ANALYSIS_DURATION_MS = 5000;
const MAX_ANALYSIS_DURATION_MS = 10000;
=======
import type { MockUploadResponse } from "../api/mockUploadPhoto";
import { completeDiagnosis } from "../api/diagnosis";
>>>>>>> Stashed changes

const timelineSteps = [
  {
    title: "사진 밝기 확인",
<<<<<<< Updated upstream
    description: "사진의 밝기와 색 균형을 먼저 확인하고 있어요.",
  },
  {
    title: "피부 영역 분석",
    description: "피부 영역을 분리해 톤 데이터를 정리하고 있어요.",
  },
  {
    title: "톤 매칭 중",
    description: "퍼스널 컬러 데이터를 비교하고 있어요.",
  },
  {
    title: "맞춤 제품 찾는 중",
    description: "분석 결과와 어울리는 추천 제품을 준비하고 있어요.",
  },
] as const;

type FloatingDot = {
  id: string;
  size: number;
  color: string;
  left: number;
  top: number;
  duration: number;
  delay: number;
};

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
    (aiResult ? aiResult.confidence < 50 || (typeof aiResult.top1_top2_gap === "number" && aiResult.top1_top2_gap < 12) || (aiResult.season === "autumn" && aiResult.confidence < 60) : false)
  );
}

function getRandomDurationMs() {
  return Math.floor(Math.random() * (MAX_ANALYSIS_DURATION_MS - MIN_ANALYSIS_DURATION_MS + 1)) + MIN_ANALYSIS_DURATION_MS;
}

function createRandomDot(id: string): FloatingDot {
  return {
    id,
    size: 10 + Math.floor(Math.random() * 12),
    color: Math.random() > 0.5 ? "#f7c7a3" : "#efa48b",
    left: 24 + Math.random() * 52,
    top: 24 + Math.random() * 52,
    duration: 900 + Math.floor(Math.random() * 700),
    delay: Math.floor(Math.random() * 140),
  };
}

function moveDot(dot: FloatingDot): FloatingDot {
  return {
    ...dot,
    left: 24 + Math.random() * 52,
    top: 24 + Math.random() * 52,
    duration: 900 + Math.floor(Math.random() * 700),
    delay: Math.floor(Math.random() * 140),
  };
=======
    description: "",
    status: "done",
  },
  {
    title: "피부 영역 분석",
    description: "",
    status: "done",
  },
  {
    title: "톤 매칭 중",
    description: "퍼스널 컬러 데이터를 비교하고 있어요",
    status: "active",
  },
  {
    title: "맞춤 제품 찾는 중",
    description: "",
    status: "pending",
  },
] as const;

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
>>>>>>> Stashed changes
}

export default function Analyzing() {
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< Updated upstream
  const upload = useMemo(() => (location.state as DiagnosisUpload | null) ?? getStoredDiagnosisUpload(), [location.state]);
  const [progress, setProgress] = useState(0);
  const [analysisDurationMs] = useState(getRandomDurationMs);
  const [floatingDots, setFloatingDots] = useState<FloatingDot[]>(() => [createRandomDot("dot-1"), createRandomDot("dot-2"), createRandomDot("dot-3")]);
=======
  const upload = useMemo(
    () => (location.state as MockUploadResponse | null) ?? getStoredUpload(),
    [location.state],
  );
  const [activeTextIndex, setActiveTextIndex] = useState(0);
>>>>>>> Stashed changes

  useEffect(() => {
    if (!upload) {
      navigate("/photo", { replace: true });
      return;
    }

<<<<<<< Updated upstream
    const startedAt = performance.now();

    const progressInterval = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / analysisDurationMs) * 100));

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
    }, analysisDurationMs);

    return () => {
      window.clearInterval(progressInterval);
      window.clearTimeout(resultTimer);
    };
  }, [analysisDurationMs, navigate, upload]);

  useEffect(() => {
    const dotInterval = window.setInterval(() => {
      setFloatingDots((current) => current.map(moveDot));
    }, 950);

    return () => {
      window.clearInterval(dotInterval);
    };
  }, []);
=======
    const intervalId = window.setInterval(() => {
      setActiveTextIndex((currentIndex) => (currentIndex + 1) % 3);
    }, 1200);

    const resultTimer = window.setTimeout(() => {
      void completeDiagnosis(upload).finally(() => {
        navigate("/result", { replace: true });
      });
    }, 4200);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(resultTimer);
    };
  }, [navigate, upload]);
>>>>>>> Stashed changes

  if (!upload) {
    return null;
  }

<<<<<<< Updated upstream
  const activeStepIndex = Math.min(timelineSteps.length - 1, Math.floor((progress / 100) * timelineSteps.length));

  return (
    <main className="relative flex min-h-dvh w-full items-start justify-center md:overflow-visible overflow-hidden bg-white">
      <div className="absolute -right-12 -top-48 h-[25rem] w-[12.5rem] rounded-full bg-purple/20 blur-[40px]" aria-hidden="true" />
      <div className="absolute -left-20 top-48 h-[14.875rem] w-[12.125rem] rounded-[6rem] bg-[#efa48b]/40 blur-[50px]" aria-hidden="true" />
      <div className="absolute bottom-[-6rem] right-[-5rem] h-[21.875rem] w-[21.875rem] rounded-full bg-[#fff6de] blur-[30px]" aria-hidden="true" />

      <section className="relative flex min-h-dvh w-full max-w-[26.875rem] flex-col items-center px-5 pb-10 pt-[6.5rem]">
        <div className="relative flex w-full flex-col items-center pb-12">
          <div className="relative flex size-40 items-center justify-center rounded-full bg-cream-100 shadow-[0_10px_20px_rgba(107,74,63,0.1)]">
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-[#efa48b]/10 to-pink/10 blur-md" aria-hidden="true" />
            <div className="absolute inset-2 rounded-full border border-dashed border-pink/60" aria-hidden="true" />
            <div className="absolute inset-5 overflow-hidden rounded-full">
              {floatingDots.map((dot) => (
                <span
                  key={dot.id}
                  className="absolute rounded-full opacity-70 blur-[1px]"
                  style={{
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    backgroundColor: dot.color,
                    left: `${dot.left}%`,
                    top: `${dot.top}%`,
                    transform: "translate(-50%, -50%)",
                    transitionProperty: "left, top, transform",
                    transitionDuration: `${dot.duration}ms`,
                    transitionTimingFunction: "ease-in-out",
                    transitionDelay: `${dot.delay}ms`,
                    boxShadow: `0 0 18px ${dot.color}`,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <HiSparkles className="relative z-10 size-[3.35rem] animate-pulse text-[#ff9f82]" aria-hidden="true" />
          </div>

          <h1 className="mt-8 text-center text-[1.5rem] leading-[1.3] font-normal text-brown-600">피부 톤을 분석하고 있어요</h1>

          <p className="mt-10 max-w-[18.6rem] text-center text-base leading-[1.6] font-normal text-[#7a625c]">
            빛, 색감, 피부 톤 데이터를 확인하는 중 이에요.
            <br />
            잠시만 기다려주세요.
          </p>
        </div>

        <div className="w-full max-w-[20rem] rounded-2xl border border-white/40 bg-white/40 px-[1.56rem] py-[1.56rem] shadow-[0_8px_32px_rgba(107,74,63,0.05)] backdrop-blur-[6px]">
          <div className="relative">
            <div className="absolute bottom-[2.2rem] left-[0.9rem] top-[0.95rem] w-0.5 bg-[#e8d7b2]" aria-hidden="true" />
            <div
              className="absolute left-[0.9rem] top-[0.95rem] w-0.5 bg-[#efa48b] transition-[height] duration-200 ease-linear"
              style={{ height: `calc((100% - 3.2rem) * ${progress / 100})` }}
              aria-hidden="true"
            />

            <div className="flex flex-col gap-6">
              {timelineSteps.map((step, index) => {
                const status = getStepStatus(index, activeStepIndex);
                const isDone = status === "done";
                const isActive = status === "active";
                const isPending = status === "pending";

                return (
                  <div key={step.title} className={`relative flex items-start gap-4 ${isPending ? "opacity-40" : ""}`}>
                    <div
                      className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${isDone ? "border border-[#6fae8c]/30 bg-[#e0eee6] text-[#6fae8c]" : ""} ${
                        isActive ? "bg-[#efa48b] text-white shadow-[0_4px_6px_rgba(239,164,139,0.4)]" : ""
                      } ${isPending ? "bg-[#e8e1e0] text-[#817475]" : ""}`}
                    >
                      {isDone ? <HiCheck className="size-4" aria-hidden="true" /> : null}
                      {isActive ? <HiArrowPath className="size-4 animate-spin" aria-hidden="true" /> : null}
                      {isPending ? <span className="size-2 rounded-full bg-[#817475]" /> : null}
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <p className={`text-[0.8125rem] leading-[1.4] font-normal ${isPending ? "text-[#817475]" : "text-brown-600"}`}>{step.title}</p>
                      {isActive ? <p className="mt-1 text-xs leading-[1.4] font-normal text-[#7a625c]">{step.description}</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
=======
  return (
    <main className="relative flex min-h-dvh w-full overflow-hidden bg-white">
      <div
        className="absolute -right-28 top-0 h-[360px] w-[260px] rounded-full bg-purple/20 blur-[80px]"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 top-[260px] h-[360px] w-[230px] rounded-full bg-pink/20 blur-[80px]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-120px] right-[-80px] size-[340px] rounded-full bg-cream-100 blur-[70px]"
        aria-hidden="true"
      />

      <section className="relative flex min-h-dvh w-full flex-col items-center px-8 pb-8 pt-[112px]">
        <div className="relative flex size-32 items-center justify-center rounded-full bg-[#ffefd7] shadow-[0_18px_60px_rgb(255_193_130_/_0.28)]">
          <div
            className="absolute inset-3 rounded-full border border-dashed border-[#f6cda9]"
            aria-hidden="true"
          />
          <HiSparkles
            className="size-14 animate-pulse text-[#ff9f82]"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-20 text-center text-[22px] font-normal leading-[35.2px] text-[#9a817b]">
          빛, 색감, 피부 톤 데이터를 확인하는 중 이에요.
          <br />
          잠시만 기다려주세요.
        </h1>

        <div className="mt-20 w-full rounded-[24px] bg-white/90 px-6 py-8 shadow-[0_24px_70px_rgb(107_74_63_/_0.08)] backdrop-blur">
          <div className="relative flex flex-col gap-8">
            <div
              className="absolute bottom-6 left-6 top-6 w-0.5 bg-[#f2d9bf]"
              aria-hidden="true"
            />
            <div
              className="absolute left-6 top-6 h-[140px] w-0.5 bg-[#f39d86]"
              aria-hidden="true"
            />

            {timelineSteps.map((step) => {
              const isDone = step.status === "done";
              const isActive = step.status === "active";
              const isPending = step.status === "pending";

              return (
                <div key={step.title} className="relative flex min-h-10 gap-6">
                  <div
                    className={`z-10 flex size-12 shrink-0 items-center justify-center rounded-full ${
                      isDone
                        ? "border-2 border-[#b7ddcb] bg-[#e0f3e9] text-[#6bb594]"
                        : ""
                    } ${
                      isActive
                        ? "bg-[#ffa58d] text-white shadow-[0_10px_24px_rgb(255_165_141_/_0.45)]"
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
                    {isPending && <span className="size-3 rounded-full bg-[#cfc7c5]" />}
                  </div>

                  <div className="flex min-w-0 flex-col justify-center pt-1">
                    <p
                      className={`text-lg font-normal leading-[25.2px] ${
                        isPending ? "text-[#b9adaa]" : "text-[#3a2527]"
                      }`}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="mt-1.5 max-w-[170px] text-base font-normal leading-[25.6px] text-[#7a625c]">
                        {activeTextIndex === 0
                          ? step.description
                          : activeTextIndex === 1
                            ? "컬러 균형을 세밀하게 맞추고 있어요"
                            : "피부 톤과 어울림을 확인하고 있어요"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
>>>>>>> Stashed changes
          </div>
        </div>
      </section>
    </main>
  );
}
