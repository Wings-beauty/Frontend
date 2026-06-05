"use client";

import { useEffect, useRef, useState } from "react";
import { HiArrowLeft, HiArrowPath, HiCheck, HiExclamationTriangle, HiSparkles } from "react-icons/hi2";
import { analyzeDiagnosisPhoto } from "../api/diagnosis";
import { clearPendingDiagnosisPhoto, getPendingDiagnosisPhoto, type PendingDiagnosisPhoto } from "../api/diagnosisUpload";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "../lib/router";

const MIN_VISIBLE_PROGRESS = 18;
const PROGRESS_WHILE_WAITING_LIMIT = 88;

type AnalysisStatus = "idle" | "analyzing" | "success" | "error";

const timelineSteps = [
  { title: "사진 품질 확인", description: "얼굴 방향과 밝기를 확인하고 있어요." },
  { title: "피부 영역 분석", description: "진단에 필요한 피부 색상 데이터를 분리하고 있어요." },
  { title: "톤 매칭", description: "퍼스널 컬러 기준과 비교하고 있어요." },
  { title: "결과 저장", description: "진단 결과를 DB에 저장하고 있어요." },
] as const;

function getStepStatus(stepIndex: number, activeStepIndex: number) {
  if (stepIndex < activeStepIndex) return "done";
  if (stepIndex === activeStepIndex) return "active";
  return "pending";
}

function getFileSizeLabel(fileSize: number) {
  if (fileSize < 1024 * 1024) {
    return `${Math.max(1, Math.round(fileSize / 1024))}KB`;
  }

  return `${(fileSize / 1024 / 1024).toFixed(1)}MB`;
}

export default function Analyzing() {
  const navigate = useNavigate();
  const startedRef = useRef(false);
  const [photo, setPhoto] = useState<PendingDiagnosisPhoto | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [progress, setProgress] = useState(MIN_VISIBLE_PROGRESS);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const pendingPhoto = getPendingDiagnosisPhoto();

    if (!pendingPhoto) {
      navigate("/photo", { replace: true });
      return;
    }

    setPhoto(pendingPhoto);
    const objectUrl = URL.createObjectURL(pendingPhoto.file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [navigate]);

  useEffect(() => {
    if (!photo || startedRef.current) {
      return;
    }

    startedRef.current = true;
    setStatus("analyzing");
    setErrorMessage("");
    setProgress(MIN_VISIBLE_PROGRESS);

    const progressTimer = window.setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= PROGRESS_WHILE_WAITING_LIMIT) {
          return currentProgress;
        }

        return Math.min(PROGRESS_WHILE_WAITING_LIMIT, currentProgress + Math.max(1, Math.round((100 - currentProgress) / 18)));
      });
    }, 220);

    void analyzeDiagnosisPhoto(photo.file)
      .then(() => {
        window.clearInterval(progressTimer);
        clearPendingDiagnosisPhoto();
        setProgress(100);
        setStatus("success");
        window.setTimeout(() => {
          navigate("/result", { replace: true });
        }, 650);
      })
      .catch((error) => {
        window.clearInterval(progressTimer);
        setProgress(100);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "AI 진단 중 문제가 발생했어요.");
      });

    return () => {
      window.clearInterval(progressTimer);
    };
  }, [navigate, photo]);

  const activeStepIndex = status === "success" || status === "error" ? timelineSteps.length : Math.min(timelineSteps.length - 1, Math.floor((progress / 100) * timelineSteps.length));
  const fileName = photo?.fileName ?? "선택한 사진";
  const fileSize = photo?.fileSize ?? 0;

  const retryAnalysis = () => {
    if (!photo) {
      navigate("/photo", { replace: true });
      return;
    }

    startedRef.current = false;
    setStatus("idle");
  };

  if (!photo) {
    return null;
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-cream-50 px-4 py-4 sm:px-8">
      <section className="flex min-h-[calc(100dvh-32px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-ivory/60 bg-white shadow-lg lg:min-h-[720px]">
        <header className="flex items-center justify-between px-5 pt-6 sm:px-8">
          <button type="button" className="flex size-11 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm" aria-label="사진 선택으로 돌아가기" onClick={() => navigate("/photo")} disabled={status === "analyzing"}>
            <HiArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-base font-medium leading-7 text-brown-600 sm:text-lg">AI 진단</h1>
          <div className="size-11" aria-hidden="true" />
        </header>

        <div className="grid flex-1 gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-10 lg:py-10">
          <div className="mx-auto flex w-full max-w-md flex-col items-center text-center lg:max-w-none">
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border-4 border-white bg-cream-100 shadow-lg lg:max-w-md">
              {previewUrl ? <img src={previewUrl} className="size-full object-cover" alt="AI 진단 중인 사진" /> : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brown-600/50 to-transparent px-5 pb-5 pt-16 text-left text-white">
                <p className="truncate text-sm leading-5">{fileName}</p>
                {fileSize ? <p className="mt-1 text-xs leading-4 text-white/80">{getFileSizeLabel(fileSize)}</p> : null}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <Card>
              <CardHeader>
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-cream-100 text-brown-600">
                  {status === "success" ? <HiCheck className="size-7 text-green" aria-hidden="true" /> : status === "error" ? <HiExclamationTriangle className="size-7 text-red" aria-hidden="true" /> : <HiSparkles className="size-7" aria-hidden="true" />}
                </div>
                <CardTitle>{status === "success" ? "AI 진단이 완료됐어요" : status === "error" ? "진단을 완료하지 못했어요" : "AI가 퍼스널 컬러를 분석하고 있어요"}</CardTitle>
                <CardDescription>{status === "success" ? "결과 화면으로 이동합니다." : status === "error" ? "사진은 저장하지 않았습니다. 다시 시도하거나 다른 사진을 선택해주세요." : "진단 결과는 DB에 저장되고 결과 화면에서 조회됩니다."}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-2 overflow-hidden rounded-full bg-cream-200">
                  <div className="h-full rounded-full bg-brown-400 transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-right text-sm leading-5 text-brown-300">{progress}%</p>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="pt-6">
                <div className="relative">
                  <div className="absolute bottom-9 left-4 top-4 w-0.5 bg-cream-200" aria-hidden="true" />
                  <div className="flex flex-col gap-5">
                    {timelineSteps.map((step, index) => {
                      const stepStatus = getStepStatus(index, activeStepIndex);
                      const isDone = stepStatus === "done";
                      const isActive = stepStatus === "active";
                      const isPending = stepStatus === "pending";

                      return (
                        <div key={step.title} className={`relative flex gap-4 ${isPending ? "opacity-45" : ""}`}>
                          <div className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${isDone ? "bg-green text-white" : ""} ${isActive ? "bg-brown-600 text-white" : ""} ${isPending ? "bg-cream-200 text-brown-300" : ""}`}>
                            {isDone ? <HiCheck className="size-4" aria-hidden="true" /> : null}
                            {isActive ? <HiArrowPath className="size-4 animate-spin" aria-hidden="true" /> : null}
                            {isPending ? <span className="size-2 rounded-full bg-brown-300" /> : null}
                          </div>
                          <div className="min-w-0 pt-0.5">
                            <p className="text-sm font-medium leading-6 text-brown-600">{step.title}</p>
                            <p className="text-sm leading-6 text-[#7a625c]">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {status === "error" ? (
              <Card className="border-red/30 bg-red/5 shadow-none">
                <CardContent className="space-y-4 pt-6">
                  <p className="text-sm leading-6 text-red">{errorMessage}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" onClick={retryAnalysis}>다시 시도</Button>
                    <Button type="button" onClick={() => navigate("/photo")}>사진 다시 선택</Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
