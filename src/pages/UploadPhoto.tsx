import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiArrowRight,
  HiCamera,
  HiPhoto,
  HiXMark,
} from "react-icons/hi2";
import { getCurrentUser, setAuthReturnTo } from "../api/auth";
import { uploadDiagnosisPhoto } from "../api/diagnosis";
import {
  clearStoredDiagnosis,
  setStoredDiagnosisUpload,
} from "../api/diagnosisUpload";

export default function UploadPhoto() {
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");


  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const uploadAndNavigate = async (file: File) => {
    if (isUploading) {
      return;
    }

    setIsUploading(true);
    setUploadError("");
    clearStoredDiagnosis();

    const user = await getCurrentUser();

    if (!user) {
      setAuthReturnTo("/photo");
      navigate("/login");
      setIsUploading(false);
      return;
    }

    try {
      const uploadResult = await uploadDiagnosisPhoto(file);

      setStoredDiagnosisUpload(uploadResult);
      navigate("/analyzing", { state: uploadResult });
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

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-white px-8 py-4">
      <section className="relative flex h-[calc(100dvh-32px)] max-h-screen min-h-96 w-full max-w-md flex-col overflow-hidden rounded-3xl border border-ivory/50 bg-white shadow-lg">
        <div
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-white/0"
          aria-hidden="true"
        />
        <div
          className="absolute -right-20 -top-20 size-64 rounded-full bg-[#fff6de] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-14 size-48 rounded-full bg-[#fff6de] blur-3xl"
          aria-hidden="true"
        />

        <header className="relative flex items-center justify-between px-6 pt-8">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full bg-white text-brown-600 shadow-sm"
            aria-label="이전 페이지로 이동"
            onClick={() => navigate(-1)}
          >
            <HiArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-normal leading-7 text-brown-600">
            사진 선택
          </h1>
          <div className="size-11" aria-hidden="true" />
        </header>

        <div className="relative flex flex-1 h-full flex-col justify-center px-5 ">
          <div className="mx-auto flex w-full h-full max-w-[320px] flex-col items-center text-center">
            <div className="relative mt-4 mb-8 h-full flex-1 flex aspect-video w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-[#fff9e8] shadow-lg">
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

            <h2 className="text-xl font-normal leading-9 text-brown-600">
              분석할 사진을
              <br />
              선택해주세요
            </h2>
            <p className="mt-4 text-base font-normal leading-7 text-[#7a625c]">
              카메라로 바로 찍거나
              <br />
              앨범에서 사진을 업로드할 수 있어요.
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

        <footer className="relative flex w-full flex-col gap-3 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex h-14 items-center justify-center gap-2 rounded-full border border-ivory/80 bg-white text-base font-normal leading-6 text-brown-600 shadow-[0_8px_20px_rgb(107_74_63_/_0.06)]"
              onClick={() => cameraInputRef.current?.click()}
            >
              <HiCamera className="size-5" aria-hidden="true" />
              촬영하기
            </button>
            <button
              type="button"
              className="flex h-14 items-center justify-center gap-2 rounded-full border border-ivory/80 bg-white text-base font-normal leading-6 text-brown-600 shadow-[0_8px_20px_rgb(107_74_63_/_0.06)]"
              onClick={() => galleryInputRef.current?.click()}
            >
              <HiPhoto className="size-5" aria-hidden="true" />
              업로드
            </button>
          </div>

          <button
            type="button"
            className="flex h-[60px] w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39_/_0.15)] disabled:bg-brown-600/30 disabled:drop-shadow-none"
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
    </main>
  );
}
