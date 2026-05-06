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
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-white px-5 pb-5 pt-5">
      <div
        className={`absolute -right-24 top-[320px] size-72 rounded-full ${result.accentSoftClassName} blur-[70px]`}
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 top-[430px] size-72 rounded-full bg-cream-100 blur-[80px]"
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
            alt="분석한 프로필"
          />
        </div>
      </header>

      <section className="relative pt-12 text-center">
        <div className="mx-auto mb-4 flex h-9 w-24 items-center justify-center rounded-full bg-cream-100 text-sm font-normal leading-5 text-[#7a625c] shadow-[inset_0_0_0_1px_rgb(255_229_138_/_0.4)]">
          분석 완료
        </div>

        <h2 className="text-2xl font-normal leading-[32px] text-brown-600">
          당신은
          <br />
          {result.title}
        </h2>
        <p className="mt-3 text-sm font-normal leading-[22.4px] text-[#7a625c]">
          {result.description}
        </p>
      </section>

      <section className="relative mt-7 rounded-[22px] border border-ivory/70 bg-white/85 px-5 pb-6 pt-6 text-center shadow-[0_22px_55px_rgb(107_74_63_/_0.08)] backdrop-blur">
        <div className={`mx-auto mb-5 flex size-28 items-center justify-center overflow-hidden rounded-full ${result.accentClassName} p-2 shadow-[0_3px_12px_rgb(58_37_39_/_0.12)]`}>
          <img
            src={result.imageUrl}
            className="size-full rounded-full object-cover"
            alt={`${result.seasonLabel} 퍼스널 컬러`}
          />
        </div>

        <h3 className="text-xl font-normal leading-7 text-brown-600">
          {result.detailTitle}
        </h3>
        <p className="mt-3 text-sm font-normal leading-[22.4px] text-[#7a625c]">
          {result.detailDescription}
        </p>
      </section>

      <section className="relative mt-7">
        <h3 className="text-lg font-normal leading-[25px] text-brown-600">
          잘 어울리는 베스트 컬러
        </h3>

        <div className="mt-4 flex justify-between gap-3">
          {result.bestColors.map((color) => (
            <div
              key={color}
              className="aspect-square flex-1 rounded-full shadow-[inset_0_0_0_2px_rgb(255_255_255_/_0.5),0_2px_8px_rgb(58_37_39_/_0.18)]"
              style={{ backgroundColor: color }}
              aria-label={`${color} 컬러`}
            />
          ))}
        </div>
      </section>

      <footer className="relative mt-auto pt-5">
        <Link
          to="/recommendation"
          className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-lg font-normal leading-7 text-white drop-shadow-[0_8px_12px_rgb(58_37_39_/_0.15)]"
        >
          내 톤에 맞는 제품 보기
          <HiArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </footer>
    </main>
  );
}
