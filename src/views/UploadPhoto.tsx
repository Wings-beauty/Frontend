"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "../lib/router";
import { HiArrowLeft, HiArrowRight, HiCamera, HiCheckCircle, HiExclamationTriangle, HiPhoto, HiXMark } from "react-icons/hi2";
import { getCurrentUser } from "../api/auth";
import {
  clearStoredDiagnosis,
  setPendingDiagnosisPhoto,
} from "../api/diagnosisUpload";
import { validateDiagnosisImage } from "../utils/diagnosisImageValidation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const INVALID_PHOTO_MESSAGE = "정확한 진단을 위해 얼굴이 정면으로 선명하게 보이는 사진을 다시 선택해주세요.";
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

type PrepareDiagnosisPayload = {
  file: File;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

function prepareDiagnosisApiPayload(file: File): PrepareDiagnosisPayload {
  return {
    file,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

export default function UploadPhoto() {
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "validating" | "ready">("idle");
  const [prepareMessage, setPrepareMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isInvalidPhotoModalOpen, setIsInvalidPhotoModalOpen] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) {
        navigate("/login?returnTo=/photo");
      }
    });
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetInputs = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const validateAndPrepare = async (file: File) => {
    setStatus("validating");
    setUploadError("");
    setPrepareMessage("");
    clearStoredDiagnosis();

    const user = await getCurrentUser();

    if (!user) {
      navigate("/login?returnTo=/photo");
      setStatus("idle");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("이미지 파일만 선택할 수 있어요.");
      setStatus("idle");
      resetInputs();
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError(`사진은 ${MAX_IMAGE_SIZE_MB}MB 이하로 선택해주세요.`);
      setStatus("idle");
      resetInputs();
      return;
    }

    try {
      const isValidImage = await validateDiagnosisImage(file);

      if (!isValidImage) {
        setIsInvalidPhotoModalOpen(true);
        setStatus("idle");
        resetInputs();
        return;
      }

      prepareDiagnosisApiPayload(file);
      setStatus("ready");
      setPrepareMessage("사진이 준비되었어요.");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "사진을 확인하는 중 문제가 발생했어요.");
      setStatus("idle");
    } finally {
      resetInputs();
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return URL.createObjectURL(file);
    });
    setSelectedFile(file);
    setFileName(file.name);
    setUploadError("");
    void validateAndPrepare(file);
  };

  const resetImage = () => {
    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return null;
    });
    setSelectedFile(null);
    setFileName("");
    setStatus("idle");
    setPrepareMessage("");
    setUploadError("");
    setIsInvalidPhotoModalOpen(false);
    resetInputs();
  };

  const prepareSelectedImage = () => {
    if (!selectedFile) {
      return;
    }

    if (status === "ready") {
      setPendingDiagnosisPhoto({
        file: selectedFile,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        previewUrl: previewUrl ?? undefined,
      });
      navigate("/analyzing");
      return;
    }

    void validateAndPrepare(selectedFile);
  };

  const closeInvalidPhotoModal = () => {
    setIsInvalidPhotoModalOpen(false);
    resetImage();
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-4 py-4 sm:px-8">
      <section className="relative flex min-h-[calc(100dvh-32px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-ivory/60 bg-white shadow-lg lg:min-h-[720px]">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/70 to-white/0" aria-hidden="true" />

        <header className="relative flex items-center justify-between px-5 pt-6 sm:px-8">
          <button type="button" className="flex size-11 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm" aria-label="이전 페이지로 이동" onClick={() => navigate(-1)}>
            <HiArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-base font-medium leading-7 text-brown-600 sm:text-lg">퍼스널 컬러 진단</h1>
          <div className="size-11" aria-hidden="true" />
        </header>

        <div className="flex flex-col justify-center items-center">
          <p className="mb-3 text-sm font-medium leading-6 text-brown-300">Step 1</p>
          <h2 className="text-2xl text-center font-medium leading-9 text-brown-600 sm:text-3xl sm:leading-10">
            얼굴이 잘 보이는 사진을&nbsp;
            <br className="sm:hidden" />
            선택해주세요
          </h2>
        </div>

        <div className="relative grid flex-1 gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:py-10">
          <div className="mx-auto flex w-full flex-col items-center text-center lg:max-w-none">
            <div className="relative flex aspect-4/5 w-full items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-cream-100 shadow-lg lg:max-w-md">
              {previewUrl ? (
                <>
                  <img src={previewUrl} className="size-full object-cover" alt="선택한 진단 사진" />
                  <button
                    type="button"
                    className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-brown-600 shadow-sm backdrop-blur"
                    aria-label="선택한 사진 삭제"
                    onClick={resetImage}
                  >
                    <HiXMark className="size-5" aria-hidden="true" />
                  </button>
                  <div className="absolute inset-0 bg-linear-to-t from-brown-600/15 to-brown-600/0 mix-blend-multiply" aria-hidden="true" />
                </>
              ) : (
                <div className="flex flex-col items-center px-8 text-[#7a625c]">
                  <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-white shadow-md">
                    <HiCamera className="size-9 text-brown-600" aria-hidden="true" />
                  </div>
                  <p className="text-base leading-7">정면 얼굴이 선명하게 보이는 자연광 사진을 선택해주세요.</p>
                </div>
              )}

              <div className="absolute -right-1 top-12 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                <div className="size-8 rounded-full border border-pink/60 bg-pink/40" />
              </div>
              <div className="absolute bottom-12 -left-0.5 flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                <div className="size-6 rounded-full border border-purple/60 bg-purple/40" />
              </div>
            </div>

            {fileName && <p className="mt-3 max-w-full truncate text-sm leading-5 text-[#9b8179]">{fileName}</p>}
            {uploadError && <p className="mt-3 text-sm leading-5 text-[#c4544a]">{uploadError}</p>}
            {prepareMessage && (
              <p className="mt-3 flex items-center gap-2 text-sm leading-5 text-green">
                <HiCheckCircle className="size-5" aria-hidden="true" />
                {prepareMessage}
              </p>
            )}
          </div>

          <div className="flex w-full h-full flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>사진 선택</CardTitle>
                <CardDescription>카메라로 바로 촬영하거나 앨범에서 사진을 불러올 수 있어요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => cameraInputRef.current?.click()}>
                    <HiCamera className="size-5" aria-hidden="true" />
                    촬영
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => galleryInputRef.current?.click()}>
                    <HiPhoto className="size-5" aria-hidden="true" />
                    업로드
                  </Button>
                </div>

                <Button type="button" size="lg" className="w-full rounded-full" disabled={!selectedFile || status === "validating"} onClick={prepareSelectedImage}>
                  {status === "validating" ? "사진 확인 중" : status === "ready" ? "AI 진단 시작" : "사진 확인하기"}
                  <HiArrowRight className="size-4.5" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-cream-50/70 shadow-none">
              <CardContent className="space-y-3 pt-6">
                <div className="flex gap-3 text-sm leading-6 text-[#7a625c]">
                  <HiCheckCircle className="mt-0.5 size-5 shrink-0 text-green" aria-hidden="true" />
                  <span>얼굴이 잘 보이는 정면 사진을 올려주세요.</span>
                </div>

                <div className="flex gap-3 text-sm leading-6 text-[#7a625c]">
                  <HiCheckCircle className="mt-0.5 size-5 shrink-0 text-green" aria-hidden="true" />
                  <span>자연광에 가까운 밝은 환경에서 찍은 사진이 좋아요.</span>
                </div>

                <div className="flex gap-3 text-sm leading-6 text-[#7a625c]">
                  <HiExclamationTriangle className="mt-0.5 size-5 shrink-0 text-pink" aria-hidden="true" />
                  <span>필터, 진한 메이크업, 과한 보정은 진단 정확도를 낮출 수 있어요.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleImageChange} />
        <input ref={galleryInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
      </section>

      {isInvalidPhotoModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-600/35 px-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="invalid-photo-modal-title">
          <div className="w-full max-w-sm rounded-3xl bg-white px-6 py-7 text-center shadow-2xl">
            <h2 id="invalid-photo-modal-title" className="text-lg font-normal leading-7 text-brown-600">
              사진을 다시 선택해주세요
            </h2>
            <p className="mt-4 text-base font-normal leading-7 text-[#7a625c]">{INVALID_PHOTO_MESSAGE}</p>
            <button type="button" className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-brown-600 text-base font-normal leading-6 text-white" onClick={closeInvalidPhotoModal}>
              다시 업로드하기
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
