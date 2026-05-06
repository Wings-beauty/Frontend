import { useNavigate } from "react-router-dom";
import {
  HiArrowRightOnRectangle,
  HiBell,
  HiChevronRight,
  HiHeart,
  HiHome,
  HiMegaphone,
  HiPencil,
  HiQuestionMarkCircle,
  HiSparkles,
} from "react-icons/hi2";
import type { MockUploadResponse } from "../api/mockUploadPhoto";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
} from "../constants/personalColor";

const likedProducts = [
  {
    brand: "에뛰드",
    name: "픽싱 틴트 더스티베이지",
    liked: true,
    visual: "tint",
  },
  {
    brand: "데이지크",
    name: "섀도우 팔레트 쿨 블렌딩",
    liked: true,
    visual: "palette",
  },
  {
    brand: "롬앤",
    name: "베러 댄 치크 블루베리칩",
    liked: false,
    visual: "cheek",
  },
] as const;

const menuItems = [
  {
    label: "공지사항",
    icon: HiMegaphone,
  },
  {
    label: "1:1 문의",
    icon: HiQuestionMarkCircle,
  },
  {
    label: "알림 설정",
    icon: HiBell,
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

function ProductVisual({ type }: { type: (typeof likedProducts)[number]["visual"] }) {
  if (type === "palette") {
    return (
      <div className="relative size-full overflow-hidden bg-gradient-to-br from-[#eaa0a5] to-[#b63f48] p-5">
        <div className="grid size-full grid-cols-3 gap-2 rounded-xl bg-[#f3b5ad]/70 p-3 shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.28)]">
          {["#d79aa0", "#c47b90", "#b26b87", "#d5a6ba", "#9a6177", "#7a4a60"].map(
            (color) => (
              <span
                key={color}
                className="rounded-full shadow-[inset_0_0_9px_rgb(64_32_32_/_0.16)]"
                style={{ backgroundColor: color }}
              />
            ),
          )}
        </div>
      </div>
    );
  }

  if (type === "cheek") {
    return (
      <div className="relative flex size-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#eecfae] to-[#864f30]">
        <div className="absolute -right-8 -top-5 size-28 rounded-full bg-[#ffdcae]/55 blur-md" />
        <div className="size-24 rounded-full bg-gradient-to-br from-[#e0a097] to-[#9c5c60] shadow-[0_10px_30px_rgb(72_41_35_/_0.28),inset_0_0_16px_rgb(255_255_255_/_0.32)]" />
        <div className="absolute bottom-4 right-5 h-10 w-16 rounded-full bg-[#2b2020]/80 blur-sm" />
      </div>
    );
  }

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#f1d0a3] to-[#c3905c]">
      <div className="absolute inset-x-0 bottom-0 h-16 bg-[#c59662]/50" />
      <div className="absolute bottom-8 h-20 w-20 rounded-full bg-[#e8c491] shadow-[0_10px_24px_rgb(88_52_30_/_0.18)]" />
      <div className="absolute bottom-14 h-24 w-8 rounded-t-lg bg-gradient-to-b from-[#d1904c] to-[#8b5428]" />
      <div className="absolute bottom-[118px] h-16 w-7 rounded-t-full bg-gradient-to-br from-[#e4c1a5] to-[#b78255]" />
    </div>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const upload = getStoredUpload();
  const result = personalColorResults[getStoredPersonalColorSeason()];

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-white px-5 pb-12 pt-6">
      <header className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="홈으로 이동"
          onClick={() => navigate("/home")}
        >
          <HiHome className="size-7" aria-hidden="true" />
        </button>

        <h1 className="text-2xl font-normal leading-[30px] text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="size-10" aria-hidden="true" />
      </header>

      <section className={`relative mt-16 rounded-[38px] bg-gradient-to-br from-white via-white px-6 pb-8 pt-12 shadow-[0_24px_70px_rgb(107_74_63_/_0.08)] ${result.accentSoftClassName}`}>
        <div className="flex items-center gap-5">
          <div className={`size-[92px] shrink-0 overflow-hidden rounded-full border-[3px] border-white ${result.accentClassName} p-1 shadow-[0_6px_18px_rgb(58_37_39_/_0.12)]`}>
            <img
              src={upload?.imageUrl ?? "/illustration.png"}
              className="size-full rounded-full object-cover"
              alt="프로필"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[26px] font-normal leading-8 text-brown-600">
                유지민
              </h2>
              <span className={`rounded-full px-5 py-1.5 text-base font-normal leading-6 text-brown-600 ${result.accentClassName}`}>
                {result.toneLabel}
              </span>
            </div>
            <p className="mt-3 truncate text-base font-normal leading-6 text-[#8a716b]">
              jieun.lee@example.com
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white shadow-[0_12px_20px_rgb(58_37_39_/_0.18)]"
        >
          <HiPencil className="size-6" aria-hidden="true" />
          프로필 편집
        </button>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[26px] font-normal leading-8 text-brown-600">
            나의 진단 기록
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 text-base font-normal leading-6 text-[#8a716b]"
          >
            전체보기
            <HiChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        <article className="relative overflow-hidden rounded-[26px] bg-white px-7 py-7 shadow-[0_18px_48px_rgb(107_74_63_/_0.08)]">
          <div className={`absolute inset-y-8 left-0 w-1 ${result.accentClassName}`} />
          <div className={`absolute right-7 top-7 size-12 overflow-hidden rounded-full ${result.accentClassName} p-1`}>
            <img
              src={result.imageUrl}
              className="size-full rounded-full object-cover"
              alt=""
            />
          </div>
          <p className="text-sm font-normal leading-5 text-[#8a716b]">최근 진단일</p>
          <p className="mt-3 text-[25px] font-normal leading-8 text-brown-600">
            2023년 11월 24일
          </p>
          <p className="mt-7 pr-2 text-xl font-normal leading-8 text-brown-600">
            {result.detailDescription} {result.description}
          </p>
        </article>

        <button
          type="button"
          className="mt-6 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white shadow-[0_12px_20px_rgb(58_37_39_/_0.18)]"
          onClick={() => navigate("/photo")}
        >
          <HiSparkles className="size-7" aria-hidden="true" />
          AI 톤 진단 시작하기
        </button>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[26px] font-normal leading-8 text-brown-600">
            찜한 제품
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 text-base font-normal leading-6 text-[#8a716b]"
          >
            12개
            <HiChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="-mx-5 overflow-x-auto px-5 pb-3">
          <div className="flex gap-5">
            {likedProducts.map((product) => (
              <article
                key={`${product.brand}-${product.name}`}
                className="w-[146px] shrink-0 overflow-hidden rounded-[22px] bg-white pb-5 shadow-[0_14px_36px_rgb(107_74_63_/_0.08)]"
              >
                <div className="relative aspect-square overflow-hidden rounded-[10px] bg-cream-50">
                  <ProductVisual type={product.visual} />
                  <button
                    type="button"
                    className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#df7e8b] shadow-[0_3px_10px_rgb(58_37_39_/_0.08)]"
                    aria-label={`${product.name} 찜하기`}
                  >
                    <HiHeart className="size-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="px-3 pt-4">
                  <p className="truncate text-sm font-normal leading-5 text-[#8a716b]">
                    {product.brand}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-base font-normal leading-6 text-brown-600">
                    {product.name}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <nav className="mt-14">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className="flex h-20 w-full items-center border-b border-cream-200 text-brown-600"
            >
              <Icon className="ml-5 size-6 shrink-0 text-[#8a716b]" aria-hidden="true" />
              <span className="ml-5 text-xl font-normal leading-7">{item.label}</span>
              <HiChevronRight className="ml-auto mr-5 size-6 text-[#8a716b]" aria-hidden="true" />
            </button>
          );
        })}

        <button
          type="button"
          className="flex h-20 w-full items-center text-[#f08c8c]"
        >
          <HiArrowRightOnRectangle className="ml-5 size-6 shrink-0" aria-hidden="true" />
          <span className="ml-5 text-xl font-normal leading-7">로그아웃</span>
        </button>
      </nav>
    </main>
  );
}
