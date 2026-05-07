import { useEffect, useState } from "react";
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
import {
  fetchProfile,
  getCurrentUser,
  signOut,
  updateProfileNickname,
} from "../api/auth";
import {
  fetchDiagnosisHistoryForUser,
  type DiagnosisHistoryItem,
} from "../api/diagnosis";
import type { MockUploadResponse } from "../api/mockUploadPhoto";
import {
  fetchSavedProductsForUser,
  removeSavedProduct,
  type RecommendedProduct,
} from "../api/products";
import {
  getStoredPersonalColorSeason,
  personalColorResults,
} from "../constants/personalColor";

type ProfileView = {
  nickname: string;
  email: string;
  profileImageUrl: string | null;
};

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

function formatDate(value: string | null) {
  if (!value) {
    return "날짜 정보 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default function MyPage() {
  const navigate = useNavigate();
  const upload = getStoredUpload();
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<
    DiagnosisHistoryItem[]
  >([]);
  const [savedProducts, setSavedProducts] = useState<RecommendedProduct[]>([]);
  const [authError, setAuthError] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const latestDiagnosis = diagnosisHistory[0] ?? null;
  const result =
    personalColorResults[
      latestDiagnosis?.season ?? getStoredPersonalColorSeason()
    ];

  useEffect(() => {
    let isMounted = true;

    const loadMyPage = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        setUserId(user.id);

        const [profileFromDb, historyFromDb, savedProductsFromDb] =
          await Promise.all([
            fetchProfile(user),
            fetchDiagnosisHistoryForUser(user.id),
            fetchSavedProductsForUser(user.id),
          ]);

        if (!isMounted) {
          return;
        }

        setProfile(profileFromDb);
        setNicknameDraft(profileFromDb.nickname);
        setDiagnosisHistory(historyFromDb);
        setSavedProducts(savedProductsFromDb);
      } catch (error) {
        if (isMounted) {
          setAuthError(
            error instanceof Error
              ? error.message
              : "마이페이지 정보를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadMyPage();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  const handleProfileSave = async () => {
    if (!userId) {
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");

    try {
      const updatedProfile = await updateProfileNickname(userId, nicknameDraft);

      setProfile((currentProfile) => ({
        nickname: updatedProfile.nickname ?? nicknameDraft.trim(),
        email: currentProfile?.email ?? "",
        profileImageUrl:
          updatedProfile.profile_image_url ??
          currentProfile?.profileImageUrl ??
          null,
      }));
      setIsProfileModalOpen(false);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "프로필 저장에 실패했어요.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavedProductRemove = async (productId: number) => {
    if (!userId) {
      return;
    }

    await removeSavedProduct(userId, productId);
    setSavedProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    );
  };

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

        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="size-10" aria-hidden="true" />
      </header>

      {authError ? (
        <section className="mt-12 rounded-3xl border border-cream-200 bg-white px-6 py-8 text-center shadow-sm">
          <p className="text-base font-normal leading-7 text-[#8a716b]">
            {authError}
          </p>
        </section>
      ) : null}

      <section
        className={`relative mt-16 rounded-3xl bg-linear-to-br from-white via-white px-6 pb-8 pt-12 shadow-lg ${result.accentSoftClassName}`}
      >
        <div className="flex items-center gap-5">
          <div
            className={`size-24 shrink-0 overflow-hidden rounded-full border-2 border-white ${result.accentClassName} p-1 shadow-md`}
          >
            <img
              src={
                profile?.profileImageUrl ??
                upload?.imageUrl ??
                "/illustration.png"
              }
              className="size-full rounded-full object-cover"
              alt="프로필"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-normal leading-8 text-brown-600">
                {isLoading
                  ? "불러오는 중"
                  : (profile?.nickname ?? "WINGS 사용자")}
              </h2>
              {latestDiagnosis ? (
                <span
                  className={`rounded-full px-5 py-1.5 text-base font-normal leading-6 text-brown-600 ${result.accentClassName}`}
                >
                  {latestDiagnosis.toneLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-3 truncate text-base font-normal leading-6 text-[#8a716b]">
              {profile?.email || "이메일 정보 없음"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white shadow-lg"
          onClick={() => {
            setNicknameDraft(profile?.nickname ?? "");
            setProfileError("");
            setIsProfileModalOpen(true);
          }}
        >
          <HiPencil className="size-6" aria-hidden="true" />
          프로필 편집
        </button>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-3xl font-normal leading-8 text-brown-600">
            나의 진단 기록
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 text-base font-normal leading-6 text-[#8a716b]"
            onClick={() => navigate("/result")}
          >
            전체보기
            <HiChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        {isLoading ? (
          <article className="rounded-2xl bg-white px-7 py-7 shadow-lg">
            <p className="text-base font-normal leading-7 text-[#8a716b]">
              진단 기록을 불러오는 중입니다.
            </p>
          </article>
        ) : latestDiagnosis ? (
          <article className="relative overflow-hidden rounded-2xl bg-white px-7 py-7 shadow-lg">
            <div
              className={`absolute inset-y-8 left-0 w-1 ${result.accentClassName}`}
            />
            <div
              className={`absolute right-7 top-7 size-12 overflow-hidden rounded-full ${result.accentClassName} p-1`}
            >
              <img
                src={result.imageUrl}
                className="size-full rounded-full object-cover"
                alt=""
              />
            </div>
            <p className="text-sm font-normal leading-5 text-[#8a716b]">
              최근 진단일
            </p>
            <p className="mt-3 text-2xl font-normal leading-8 text-brown-600">
              {formatDate(latestDiagnosis.createdAt)}
            </p>
            <p className="mt-7 pr-2 text-lg font-normal leading-8 text-brown-600">
              {result.detailDescription} {result.description}
            </p>
          </article>
        ) : (
          <article className="rounded-2xl bg-white px-7 py-7 shadow-lg">
            <p className="text-base font-normal leading-7 text-[#8a716b]">
              아직 저장된 진단 기록이 없습니다.
            </p>
          </article>
        )}

        <button
          type="button"
          className="mt-6 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white shadow-lg"
          onClick={() => navigate("/photo")}
        >
          <HiSparkles className="size-7" aria-hidden="true" />
          AI 톤 진단 시작하기
        </button>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-3xl font-normal leading-8 text-brown-600">
            찜한 제품
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 text-base font-normal leading-6 text-[#8a716b] hover:text-brown-600 transition-colors"
            onClick={() => navigate("/saved-products")}
          >
            {savedProducts.length}개
            <HiChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="-mx-5 overflow-x-auto px-5 pb-3">
          <div className="flex gap-5">
            {isLoading ? (
              <p className="py-7 text-base font-normal leading-7 text-[#8a716b]">
                찜한 제품을 불러오는 중입니다.
              </p>
            ) : null}

            {!isLoading && savedProducts.length === 0 ? (
              <p className="py-7 text-base font-normal leading-7 text-[#8a716b]">
                아직 찜한 제품이 없습니다.
              </p>
            ) : null}

            {!isLoading
              ? savedProducts.map((product) => (
                  <article
                    key={product.id}
                    className="w-36 shrink-0 overflow-hidden rounded-3xl bg-white pb-5 shadow-[0_14px_36px_rgb(107_74_63/0.08)]"
                    onClick={() => {
                      if (product.productUrl) {
                        window.location.href = product.productUrl;
                      }
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-cream-50">
                      {product.productImageUrl ? (
                        <img
                          src={product.productImageUrl}
                          className="size-full object-cover"
                          alt={product.productName}
                        />
                      ) : (
                        <div
                          className="size-full"
                          style={{
                            backgroundColor: product.colorHex ?? "#fff9e6",
                          }}
                        />
                      )}
                      <button
                        type="button"
                        className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#df7e8b] shadow-[0_3px_10px_rgb(58_37_39/0.08)]"
                        aria-label={`${product.productName} 찜하기`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleSavedProductRemove(product.id);
                        }}
                      >
                        <HiHeart className="size-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="px-3 pt-4">
                      <p className="truncate text-sm font-normal leading-5 text-[#8a716b]">
                        {product.brandName}
                      </p>
                      <h3 className="mt-2 line-clamp-2 text-base font-normal leading-6 text-brown-600">
                        {product.productName}
                      </h3>
                    </div>
                  </article>
                ))
              : null}
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
              <Icon
                className="ml-5 size-6 shrink-0 text-[#8a716b]"
                aria-hidden="true"
              />
              <span className="ml-5 text-xl font-normal leading-7">
                {item.label}
              </span>
              <HiChevronRight
                className="ml-auto mr-5 size-6 text-[#8a716b]"
                aria-hidden="true"
              />
            </button>
          );
        })}

        <button
          type="button"
          className="flex h-20 w-full items-center text-[#f08c8c]"
          onClick={handleSignOut}
        >
          <HiArrowRightOnRectangle
            className="ml-5 size-6 shrink-0"
            aria-hidden="true"
          />
          <span className="ml-5 text-xl font-normal leading-7">로그아웃</span>
        </button>
      </nav>

      {isProfileModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
        >
          <div className="w-full max-w-97.5 rounded-3xl bg-white px-7 pb-7 pt-8 shadow-[0_24px_70px_rgb(0_0_0/0.18)]">
            <h2
              id="profile-modal-title"
              className="text-2xl font-normal leading-8 text-brown-600"
            >
              프로필 편집
            </h2>

            <label className="mt-6 block text-sm font-normal leading-5 text-[#8a716b]">
              닉네임
              <input
                className="mt-3 h-14 w-full rounded-2xl border border-cream-200 px-4 text-base font-normal leading-6 text-brown-600 outline-none focus:border-brown-600"
                value={nicknameDraft}
                onChange={(event) => setNicknameDraft(event.target.value)}
              />
            </label>

            {profileError ? (
              <p className="mt-4 text-sm font-normal leading-5 text-[#f08c8c]">
                {profileError}
              </p>
            ) : null}

            <div className="mt-7 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex h-12 items-center justify-center rounded-full bg-cream-100 text-base font-normal leading-6 text-brown-600"
                onClick={() => setIsProfileModalOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="flex h-12 items-center justify-center rounded-full bg-brown-600 text-base font-normal leading-6 text-white disabled:opacity-60"
                disabled={isSavingProfile}
                onClick={handleProfileSave}
              >
                {isSavingProfile ? "저장 중" : "저장"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
