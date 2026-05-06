import { Link, useNavigate } from "react-router-dom";
import { HiArrowRight, HiHome } from "react-icons/hi2";
import type { MockUploadResponse } from "../api/mockUploadPhoto";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
} from "../constants/personalColor";

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

export default function Result() {
  const navigate = useNavigate();
  const upload = getStoredUpload();
  const result = personalColorResults[getStoredPersonalColorSeason()];

  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-white px-5 pb-6 pt-5">
      <div
        className={`absolute -right-24 top-80 size-80 rounded-full ${result.accentSoftClassName} blur-3xl`}
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 top-96 size-80 rounded-full bg-cream-100 blur-3xl"
        aria-hidden="true"
      />

      <header className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="홈으로 이동"
          onClick={() => navigate("/onboarding")}
        >
          <HiHome className="size-7" aria-hidden="true" />
        </button>

        <h1 className="text-2xl font-normal leading-[30px] text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="size-10 overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50 shadow-[0_4px_14px_rgb(58_37_39_/_0.12)]">
          <img
            src={upload?.imageUrl ?? "/illustration.png"}
            className="size-full object-cover"
            alt="분석 프로필"
          />
        </div>
      </header>

      <div className="relative flex flex-1 flex-col justify-between gap-5 pt-8">
        <section className="text-center">
          <div className="mx-auto mb-4 flex h-8 w-24 items-center justify-center rounded-full bg-cream-100 text-sm font-normal leading-5 text-[#7a625c] shadow-inner">
            분석 완료
          </div>

          <h2 className="text-3xl font-normal leading-10 text-brown-600">
            당신은
            <br />
            {result.title}
          </h2>
          <p className="mt-3 text-sm font-normal leading-6 text-[#7a625c]">
            {result.description}
          </p>
        </section>

        <section className="rounded-2xl border border-ivory/70 bg-white/85 px-5 py-6 text-center shadow-lg backdrop-blur">
          <div
            className={`mx-auto mb-5 flex size-24 items-center justify-center overflow-hidden rounded-full ${result.accentClassName} p-2 shadow-md`}
          >
            <img
              src={result.imageUrl}
              className="size-full rounded-full object-cover"
              alt={`${result.seasonLabel} 퍼스널 컬러`}
            />
          </div>

          <h3 className="text-lg font-normal leading-8 text-brown-600">
            {result.detailTitle}
          </h3>
          <p className="mt-3 text-sm font-normal leading-6 text-[#7a625c]">
            {result.detailDescription}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-normal leading-8 text-brown-600">
            가장 잘 어울리는 베스트 컬러
          </h3>

          <div className="mt-4 flex justify-between gap-3">
            {result.bestColors.map((color) => (
              <div
                key={color}
                className="aspect-square flex-1 rounded-full shadow-sm"
                style={{ backgroundColor: color }}
                aria-label={`${color} 컬러`}
              />
            ))}
          </div>
        </section>

        <footer className="pt-2">
          <Link
            to="/recommendation"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white shadow-lg"
          >
            나에게 맞는 제품 보기
            <HiArrowRight className="size-5" aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
