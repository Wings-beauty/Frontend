import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiArrowPath, HiCheck, HiSparkles } from "react-icons/hi2";
import type { MockUploadResponse } from "../api/mockUploadPhoto";
import { completeDiagnosis } from "../api/diagnosis";

const timelineSteps = [
  {
    title: "사진 밝기 확인",
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
}

export default function Analyzing() {
  const navigate = useNavigate();
  const location = useLocation();
  const upload = useMemo(
    () => (location.state as MockUploadResponse | null) ?? getStoredUpload(),
    [location.state],
  );
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  useEffect(() => {
    if (!upload) {
      navigate("/photo", { replace: true });
      return;
    }

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

  if (!upload) {
    return null;
  }

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

      <section className="relative flex min-h-dvh w-full flex-col items-center px-8 pb-8 pt-28">
        <div className="relative flex size-32 items-center justify-center rounded-full bg-[#ffefd7] shadow-lg">
          <div
            className="absolute inset-3 rounded-full border border-dashed border-[#f6cda9]"
            aria-hidden="true"
          />
          <HiSparkles
            className="size-14 animate-pulse text-[#ff9f82]"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-20 text-center text-lg font-normal leading-9 text-[#9a817b]">
          빛, 색감, 피부 톤 데이터를 확인하는 중 이에요.
          <br />
          잠시만 기다려주세요.
        </h1>

        <div className="mt-20 w-full rounded-2xl bg-white/90 px-6 py-8 shadow-lg backdrop-blur">
          <div className="relative flex flex-col gap-8">
            <div
              className="absolute bottom-6 left-6 top-6 w-0.5 bg-[#f2d9bf]"
              aria-hidden="true"
            />
            <div
              className="absolute left-6 top-6 h-32 w-0.5 bg-[#f39d86]"
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
                    {isPending && <span className="size-3 rounded-full bg-[#cfc7c5]" />}
                  </div>

                  <div className="flex min-w-0 flex-col justify-center pt-1">
                    <p
                      className={`text-lg font-normal leading-7 ${
                        isPending ? "text-[#b9adaa]" : "text-[#3a2527]"
                      }`}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="mt-1.5 max-w-xs text-base font-normal leading-7 text-[#7a625c]">
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
          </div>
        </div>
      </section>
    </main>
  );
}
