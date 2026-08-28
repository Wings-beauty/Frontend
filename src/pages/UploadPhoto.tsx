import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiArrowRight,
  HiCamera,
  HiPhoto,
  HiXMark,
} from "react-icons/hi2";
import { uploadDiagnosisPhoto } from "../api/diagnosis";
import {
  clearStoredDiagnosis,
  setStoredDiagnosisUpload,
} from "../api/diagnosisUpload";
import { validateDiagnosisImage } from "../utils/diagnosisImageValidation";
import { boothRoute, isBoothPath } from "../utils/booth";

const INVALID_PHOTO_MESSAGE =
  "정확한 진단이 어려운 사진이에요. 정면 얼굴이 잘 보이는 사진을 다시 업로드해주세요.";

export default function UploadPhoto() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const booth = isBoothPath(pathname);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isInvalidPhotoModalOpen, setIsInvalidPhotoModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [navigate, previewUrl]);

  const uploadAndNavigate = async (file: File) => {
    if (isUploading) {
      return;
    }

    setIsUploading(true);
    setUploadError("");
    clearStoredDiagnosis();

    try {
      const isValidImage = await validateDiagnosisImage(file);

      if (!isValidImage) {
        setIsInvalidPhotoModalOpen(true);
        return;
      }

      const uploadResult = await uploadDiagnosisPhoto(file);

      setStoredDiagnosisUpload(uploadResult);
      navigate(boothRoute("/analyzing", booth), { state: uploadResult });
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "사진 업로드 중 문제가 발생했어요.",
      );
    } finally {
      setIsUploading(false);
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
    void uploadAndNavigate(file);
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
    setUploadError("");
    setIsInvalidPhotoModalOpen(false);

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const retryUpload = () => {
    if (selectedFile) {
      void uploadAndNavigate(selectedFile);
    }
  };

  const closeInvalidPhotoModal = () => {
    setIsInvalidPhotoModalOpen(false);
    resetImage();
  };

  return (
    <main className="flex min-h-[100svh] w-full items-center justify-center bg-white sm:px-6 sm:py-6">
      <section className="relative flex min-h-[100svh] w-full max-w-md flex-col overflow-hidden bg-white sm:min-h-[46rem] sm:rounded-[2rem] sm:border sm:border-ivory/50 sm:shadow-[0_24px_80px_rgb(80_52_43_/_0.14)]">
        <div
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-white/0"
          aria-hidden="true"
        />
        <div
          className="absolute -right-20 -top-20 size-64 rounded-full bg-slate-100 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-14 size-48 rounded-full bg-slate-100 blur-3xl"
          aria-hidden="true"
        />

        <header className="relative flex items-center justify-between px-5 pb-2 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 sm:pt-7">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm"
            aria-label="이전 페이지로 이동"
            onClick={() => navigate(-1)}
          >
            <HiArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="text-center">
            <p className="text-[0.68rem] font-semibold tracking-[0.1em] text-[#c77769]">WINGS POP-UP</p>
            <h1 className="mt-0.5 text-lg font-semibold leading-7 text-brown-600">
            사진 선택
            </h1>
          </div>
          <div className="size-11" aria-hidden="true" />
        </header>

        <div className="relative flex flex-1 flex-col justify-center px-5 sm:px-6">
          <div className="mx-auto flex w-full max-w-[360px] flex-col items-center text-center">
            <div className="relative mb-6 mt-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-[0_16px_36px_rgb(107_74_63_/_0.14)] sm:mb-8">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    className="size-full object-cover"
                    alt="선택한 분석 사진"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-brown-600 shadow-sm backdrop-blur"
                    aria-label="선택한 사진 삭제"
                    onClick={resetImage}
                  >
                    <HiXMark className="size-5" aria-hidden="true" />
                  </button>
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-brown-600/15 to-brown-600/0 mix-blend-multiply"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center px-8 text-[#7a625c]">
                  <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-white shadow-md">
                    <HiCamera className="size-9 text-brown-600" aria-hidden="true" />
                  </div>
                  <p className="text-base leading-7">
                    얼굴이 잘 보이는 자연광 사진을 선택해주세요.
                  </p>
                </div>
              )}

              <div className="absolute -right-1 top-12 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                <div className="size-8 rounded-full border border-pink/60 bg-pink/40" />
              </div>
              <div className="absolute bottom-12 -left-0.5 flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                <div className="size-6 rounded-full border border-purple/60 bg-purple/40" />
              </div>
            </div>

            <h2 className="text-[1.4rem] font-semibold leading-8 tracking-[-0.03em] text-brown-600">
              분석할 사진을
              <br />
              선택해주세요
            </h2>
            <p className="mt-3 text-[0.95rem] leading-6 text-[#7a625c]">
              카메라로 바로 찍거나
              <br />
              앨범에서 사진을 업로드할 수 있어요.
            </p>
            <p className="mt-3 rounded-xl bg-cream-50 px-4 py-2 text-sm leading-5 text-brown-400">
              로그인 없이 결과까지 확인 · 사진은 진단에만 사용돼요
            </p>
            {fileName && (
              <p className="mt-3 max-w-full truncate text-sm leading-5 text-[#9b8179]">
                {fileName}
              </p>
            )}
            {uploadError && (
              <p className="mt-3 text-sm leading-5 text-[#c4544a]">
                {uploadError}
              </p>
            )}
          </div>
        </div>

        <footer className="relative flex w-full flex-col gap-3 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-ivory/80 bg-white text-base font-semibold text-brown-600 shadow-[0_8px_20px_rgb(107_74_63_/_0.06)] transition active:scale-[0.98]"
              onClick={() => cameraInputRef.current?.click()}
            >
              <HiCamera className="size-5" aria-hidden="true" />
              촬영하기
            </button>
            <button
              type="button"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-ivory/80 bg-white text-base font-semibold text-brown-600 shadow-[0_8px_20px_rgb(107_74_63_/_0.06)] transition active:scale-[0.98]"
              onClick={() => galleryInputRef.current?.click()}
            >
              <HiPhoto className="size-5" aria-hidden="true" />
              업로드
            </button>
          </div>

          <button
            type="button"
            className="flex h-[3.75rem] w-full items-center justify-center gap-2 rounded-2xl bg-brown-600 text-lg font-semibold text-white shadow-[0_12px_24px_rgb(58_37_39_/_0.22)] transition active:scale-[0.98] disabled:bg-brown-600/30 disabled:shadow-none"
            disabled={!selectedFile || isUploading}
            onClick={retryUpload}
          >
            {isUploading ? "업로드 중" : selectedFile ? "다시 업로드" : "사진을 선택해주세요"}
            <HiArrowRight className="size-[18px]" aria-hidden="true" />
          </button>
        </footer>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleImageChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImageChange}
        />
      </section>

      {isInvalidPhotoModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown-600/35 px-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invalid-photo-modal-title"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white px-6 py-7 text-center shadow-2xl">
            <h2
              id="invalid-photo-modal-title"
              className="text-lg font-normal leading-7 text-brown-600"
            >
              사진을 다시 선택해주세요
            </h2>
            <p className="mt-4 text-base font-normal leading-7 text-[#7a625c]">
              {INVALID_PHOTO_MESSAGE}
            </p>
            <button
              type="button"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-brown-600 text-base font-normal leading-6 text-white"
              onClick={closeInvalidPhotoModal}
            >
              다시 업로드하기
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
