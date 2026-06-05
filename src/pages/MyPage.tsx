<<<<<<< Updated upstream
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowRightOnRectangle, HiChevronRight, HiHeart, HiHome, HiMegaphone, HiMiniUser, HiPencil, HiQuestionMarkCircle, HiShieldCheck, HiSparkles } from "react-icons/hi2";
import { deleteMyAccount, fetchProfile, getCurrentUser, signOut, updateProfileNickname } from "../api/auth";
import { fetchDiagnosisHistoryForUser, type DiagnosisHistoryItem } from "../api/diagnosis";
import { fetchSavedProductsForUser, removeSavedProduct, type RecommendedProduct } from "../api/products";
import { personalColorResults, type PersonalColorSeason } from "../constants/personalColor";
import type { ProfileRole } from "../constants/inquiries";
import ProductDetailModal from "../components/ProductDetailModal";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { DialogShell } from "../components/ui/dialog-shell";
import { Input } from "../components/ui/input";

type ProfileView = {
  nickname: string;
  email: string;
  profileImageUrl: string | null;
  skinTone: PersonalColorSeason | null;
  role: ProfileRole;
};

const baseMenuItems = [
  {
    label: "공지사항",
    icon: HiMegaphone,
    path: "https://enchanting-season-dd0.notion.site/36586389f99c807fb0d7eb849fb85bee?pvs=73",
  },
] as const;

const userSupportMenuItem = {
  label: "1:1 문의",
  icon: HiQuestionMarkCircle,
  path: "/inquiries",
} as const;

const adminMenuItem = {
  label: "관리자 화면",
  icon: HiShieldCheck,
  path: "/admin",
} as const;

function getMenuItems(role: ProfileRole | undefined) {
  return [...baseMenuItems, role === "admin" ? adminMenuItem : userSupportMenuItem];
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
=======
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
>>>>>>> Stashed changes
}

export default function MyPage() {
  const navigate = useNavigate();
<<<<<<< Updated upstream
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [savedProducts, setSavedProducts] = useState<RecommendedProduct[]>([]);
  const [authError, setAuthError] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");

  const latestDiagnosis = diagnosisHistory[0] ?? null;
  const menuItems = getMenuItems(profile?.role);
  const result = profile?.skinTone ? personalColorResults[profile.skinTone] : personalColorResults.summer;

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

        const [profileFromDb, historyFromDb, savedProductsFromDb] = await Promise.all([fetchProfile(user), fetchDiagnosisHistoryForUser(user.id), fetchSavedProductsForUser(user.id)]);

        if (!isMounted) {
          return;
        }

        setProfile({
          ...profileFromDb,
          role: profileFromDb.role === "admin" ? "admin" : "user",
        });
        setNicknameDraft(profileFromDb.nickname);
        setDiagnosisHistory(historyFromDb);
        setSavedProducts(savedProductsFromDb);
      } catch (error) {
        if (isMounted) {
          setAuthError(error instanceof Error ? error.message : "마이페이지 정보를 불러오지 못했습니다.");
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
        profileImageUrl: updatedProfile.profile_image_url ?? currentProfile?.profileImageUrl ?? null,
        skinTone: currentProfile?.skinTone ?? null,
        role: currentProfile?.role ?? "user",
      }));
      setIsProfileModalOpen(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "프로필 저장에 실패했습니다.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavedProductRemove = async (productId: number) => {
    if (!userId) {
      return;
    }

    await removeSavedProduct(userId, productId);
    setSavedProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
    setSelectedProduct((currentProduct) => (currentProduct?.id === productId ? null : currentProduct));
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError("");

    try {
      await deleteMyAccount();
      setIsDeleteAccountModalOpen(false);
      window.alert("회원탈퇴가 완료되었어요.");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Failed to delete account:", error);
      setDeleteAccountError("회원탈퇴 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <main className="min-h-dvh bg-white px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" aria-label="홈으로 이동" onClick={() => navigate("/home")}>
          <HiHome className="size-7" aria-hidden="true" />
        </Button>

        <h1 className="text-2xl leading-7.5 text-[#1f1b1b]">WINGS</h1>
        <div className="size-10" aria-hidden="true" />
      </header>

      {authError ? (
        <Card className="mt-10 border-red/20 bg-red/5 shadow-none">
          <CardContent className="p-6 text-center text-sm leading-7 text-red">{authError}</CardContent>
        </Card>
      ) : null}

      <Card className={`mt-10 overflow-hidden border-none ${result.accentSoftClassName}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className={`size-24 border-white ${result.accentClassName}`}>
              {profile?.profileImageUrl ? (
                <AvatarImage src={profile.profileImageUrl} alt="프로필" />
              ) : (
                <AvatarFallback>
                  <HiMiniUser className="size-14" aria-hidden="true" />
                </AvatarFallback>
              )}
            </Avatar>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl leading-8 text-brown-600">{isLoading ? "불러오는 중" : (profile?.nickname ?? "WINGS 사용자")}</h2>
                {profile?.skinTone || latestDiagnosis ? <Badge className={`${result.accentClassName} bg-opacity-90 px-4 py-1.5`}>{result.toneLabel ?? latestDiagnosis?.toneLabel}</Badge> : null}
              </div>
              <p className="mt-3 truncate text-base leading-6 text-[#8a716b]">{profile?.email || "이메일 정보 없음"}</p>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-6 w-full"
            onClick={() => {
              setNicknameDraft(profile?.nickname ?? "");
              setProfileError("");
              setIsProfileModalOpen(true);
            }}
          >
            <HiPencil className="size-5" aria-hidden="true" />
            프로필 편집
          </Button>
        </CardContent>
      </Card>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl leading-8 text-brown-600">나의 진단 기록</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/diagnosis-history")}>
            전체보기
            <HiChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {isLoading ? (
          <Card className="cursor-pointer" onClick={() => navigate(`/diagnosis-history/${latestDiagnosis.id}`)}>
            <CardContent className="p-6 text-[#8a716b]">진단 기록을 불러오는 중입니다.</CardContent>
          </Card>
        ) : latestDiagnosis ? (
          <Card>
            <CardHeader className="pb-3">
              <Badge className="w-fit bg-cream-50 text-brown-300">최근 진단일</Badge>
              <CardTitle className="text-2xl">{formatDate(latestDiagnosis.createdAt)}</CardTitle>
              <CardDescription>{latestDiagnosis.toneLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7 text-brown-600">{personalColorResults[latestDiagnosis.season]?.description}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-[#8a716b]">아직 저장된 진단 기록이 없습니다.</CardContent>
          </Card>
        )}

        <Button type="button" size="lg" className="mt-5 w-full" onClick={() => navigate("/photo")}>
          <HiSparkles className="size-5" aria-hidden="true" />
          AI 톤 진단 시작하기
        </Button>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl leading-8 text-brown-600">찜한 상품</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/saved-products")}>
            {savedProducts.length}개
            <HiChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="-mx-5 overflow-x-auto px-5 pb-2">
          <div className="flex gap-4">
            {isLoading ? <p className="py-6 text-[#8a716b]">찜한 상품을 불러오는 중입니다.</p> : null}

            {!isLoading && savedProducts.length === 0 ? <p className="py-6 text-[#8a716b]">아직 찜한 상품이 없습니다.</p> : null}

            {!isLoading
              ? savedProducts.map((product) => (
                  <Card key={product.id} className="w-36 shrink-0 cursor-pointer overflow-hidden rounded-[28px]" onClick={() => setSelectedProduct(product)}>
                    <div className="relative aspect-square bg-cream-50">
                      {product.productImageUrl ? (
                        <img src={product.productImageUrl} className="size-full object-cover" alt={product.productName} />
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
                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full shadow-sm transition-colors ${
                        bg-[#df7e8b] text-white
                        "
                        aria-label={`${product.productName} 찜하기`}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleSavedProductRemove(product.id);
                        }}
                      >
                        <HiHeart className="size-5 fill-current" />
                      </button>
                    </div>
                    <CardContent className="p-3">
                      <p className="truncate text-sm leading-5 text-[#8a716b]">{product.brandName}</p>
                      <h3 className="mt-2 line-clamp-2 text-base leading-6 text-brown-600">{product.productName}</h3>
                    </CardContent>
                  </Card>
                ))
              : null}
=======
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
>>>>>>> Stashed changes
          </div>
        </div>
      </section>

<<<<<<< Updated upstream
      <nav className="mt-12">
=======
      <nav className="mt-14">
>>>>>>> Stashed changes
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
<<<<<<< Updated upstream
            <Button
              key={item.label}
              type="button"
              variant="ghost"
              className="h-18 w-full justify-start rounded-none border-b border-cream-200 px-0"
              onClick={() => {
                if (item.path.startsWith("http")) {
                  window.open(item.path, "_blank", "noopener,noreferrer");
                  return;
                }

                navigate(item.path);
              }}
            >
              <Icon className="ml-2 size-6 shrink-0 text-[#8a716b]" aria-hidden="true" />
              <span className="ml-4 text-xl leading-7">{item.label}</span>
              <HiChevronRight className="ml-auto mr-2 size-5 text-[#8a716b]" aria-hidden="true" />
            </Button>
          );
        })}

        <Button type="button" variant="ghost" className="h-18 w-full justify-start rounded-none px-0 text-red hover:bg-red/5 hover:text-red" onClick={handleSignOut}>
          <HiArrowRightOnRectangle className="ml-2 size-6 shrink-0" aria-hidden="true" />
          <span className="ml-4 text-xl leading-7">로그아웃</span>
        </Button>
      </nav>

      {userId ? (
        <Card className="mt-12 border-red/15 bg-red/5 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-red">회원탈퇴</CardTitle>
            <CardDescription className="text-sm leading-6 text-[#8a716b]">탈퇴하면 계정 정보와 개인 활동 내역이 삭제되고 되돌릴 수 없어요.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              type="button"
              variant="outline"
              className="w-full border-red/30 text-red hover:bg-red/10 hover:text-red"
              onClick={() => {
                setDeleteAccountError("");
                setIsDeleteAccountModalOpen(true);
              }}
            >
              회원탈퇴
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isProfileModalOpen ? (
        <DialogShell onClose={() => setIsProfileModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-2xl leading-8 text-brown-600">프로필 편집</h2>

            <label className="mt-5 block text-sm leading-5 text-[#8a716b]">
              닉네임
              <Input className="mt-3" value={nicknameDraft} onChange={(event) => setNicknameDraft(event.target.value)} />
            </label>

            {profileError ? <p className="mt-4 text-sm leading-5 text-red">{profileError}</p> : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>
                취소
              </Button>
              <Button type="button" disabled={isSavingProfile} onClick={handleProfileSave}>
                {isSavingProfile ? "저장 중" : "저장"}
              </Button>
            </div>
          </div>
        </DialogShell>
      ) : null}

      {isDeleteAccountModalOpen ? (
        <DialogShell
          onClose={() => {
            if (isDeletingAccount) {
              return;
            }

            setIsDeleteAccountModalOpen(false);
          }}
        >
          <div className="p-6">
            <h2 className="text-2xl leading-8 text-brown-600">회원탈퇴</h2>
            <p className="mt-5 text-sm leading-6 text-[#7a625c]">
              탈퇴하면 계정 정보, 찜한 상품, 문의 내역이 삭제됩니다. 진단 결과와 피드백은 개인을 식별할 수 없도록 익명화되어 통계 목적으로만 보관됩니다. 정말 탈퇴하시겠어요?
            </p>

            {deleteAccountError ? <p className="mt-4 text-sm leading-5 text-red">{deleteAccountError}</p> : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" disabled={isDeletingAccount} onClick={() => setIsDeleteAccountModalOpen(false)}>
                취소
              </Button>
              <Button type="button" disabled={isDeletingAccount} className="bg-red text-white hover:bg-red/90" onClick={handleDeleteAccount}>
                {isDeletingAccount ? "탈퇴 처리 중..." : "탈퇴 확인"}
              </Button>
            </div>
          </div>
        </DialogShell>
      ) : null}

      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          isLiked
          onClose={() => setSelectedProduct(null)}
          onToggleLike={(productId) => {
            void handleSavedProductRemove(productId);
          }}
        />
      ) : null}
=======
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
>>>>>>> Stashed changes
    </main>
  );
}
