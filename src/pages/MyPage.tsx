import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowRightOnRectangle,
  HiChevronRight,
  HiHeart,
  HiHome,
  HiMegaphone,
  HiMiniUser,
  HiPencil,
  HiQuestionMarkCircle,
  HiShieldCheck,
  HiSparkles,
} from "react-icons/hi2";
import {
  deleteMyAccount,
  fetchProfile,
  getCurrentUser,
  signOut,
  updateProfileNickname,
} from "../api/auth";
import {
  fetchDiagnosisHistoryForUser,
  type DiagnosisHistoryItem,
} from "../api/diagnosis";
import {
  fetchSavedProductsForUser,
  removeSavedProduct,
  type RecommendedProduct,
} from "../api/products";
import {
  personalColorResults,
  type PersonalColorSeason,
} from "../constants/personalColor";
import type { ProfileRole } from "../constants/inquiries";
import ProductDetailModal from "../components/ProductDetailModal";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
  return [
    ...baseMenuItems,
    role === "admin" ? adminMenuItem : userSupportMenuItem,
  ];
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
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<
    DiagnosisHistoryItem[]
  >([]);
  const [savedProducts, setSavedProducts] = useState<RecommendedProduct[]>([]);
  const [authError, setAuthError] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<RecommendedProduct | null>(null);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");

  const latestDiagnosis = diagnosisHistory[0] ?? null;
  const menuItems = getMenuItems(profile?.role);
  const result =
    latestDiagnosis
      ? personalColorResults[latestDiagnosis.season]
      : profile?.skinTone
        ? personalColorResults[profile.skinTone]
        : personalColorResults.summer;

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

        setProfile({
          ...profileFromDb,
          role: profileFromDb.role === "admin" ? "admin" : "user",
        });
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
        skinTone: currentProfile?.skinTone ?? null,
        role: currentProfile?.role ?? "user",
      }));
      setIsProfileModalOpen(false);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "프로필 저장에 실패했습니다.",
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
    setSelectedProduct((currentProduct) =>
      currentProduct?.id === productId ? null : currentProduct,
    );
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
      setDeleteAccountError(
        "회원탈퇴 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <main className="min-h-dvh bg-white px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="홈으로 이동"
          onClick={() => navigate("/home")}
        >
          <HiHome className="size-7" aria-hidden="true" />
        </Button>

        <h1 className="text-2xl leading-7.5 text-[#1f1b1b]">WINGS</h1>
        <div className="size-10" aria-hidden="true" />
      </header>

      {authError ? (
        <Card className="mt-10 border-red/20 bg-red/5 shadow-none">
          <CardContent className="p-6 text-center text-sm leading-7 text-red">
            {authError}
          </CardContent>
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
                <h2 className="text-3xl leading-8 text-brown-600">
                  {isLoading ? "불러오는 중" : profile?.nickname ?? "WINGS 사용자"}
                </h2>
                {latestDiagnosis || profile?.skinTone ? (
                  <Badge className={`${result.accentClassName} bg-opacity-90 px-4 py-1.5`}>
                    {latestDiagnosis?.toneLabel ?? result.toneLabel}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-3 truncate text-base leading-6 text-[#8a716b]">
                {profile?.email || "이메일 정보 없음"}
              </p>
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/result")}
          >
            전체보기
            <HiChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-[#8a716b]">
              진단 기록을 불러오는 중입니다.
            </CardContent>
          </Card>
        ) : latestDiagnosis ? (
          <Card>
            <CardHeader className="pb-3">
              <Badge className="w-fit bg-cream-50 text-brown-300">최근 진단일</Badge>
              <CardTitle className="text-2xl">{formatDate(latestDiagnosis.createdAt)}</CardTitle>
              <CardDescription>
                {latestDiagnosis.toneLabel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7 text-brown-600">
                {result.detailDescription} {result.description}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-[#8a716b]">
              아직 저장된 진단 기록이 없습니다.
            </CardContent>
          </Card>
        )}

        <Button
          type="button"
          size="lg"
          className="mt-5 w-full"
          onClick={() => navigate("/photo")}
        >
          <HiSparkles className="size-5" aria-hidden="true" />
          AI 톤 진단 시작하기
        </Button>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl leading-8 text-brown-600">찜한 상품</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/saved-products")}
          >
            {savedProducts.length}개
            <HiChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="-mx-5 overflow-x-auto px-5 pb-2">
          <div className="flex gap-4">
            {isLoading ? (
              <p className="py-6 text-[#8a716b]">찜한 상품을 불러오는 중입니다.</p>
            ) : null}

            {!isLoading && savedProducts.length === 0 ? (
              <p className="py-6 text-[#8a716b]">아직 찜한 상품이 없습니다.</p>
            ) : null}

            {!isLoading
              ? savedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="w-36 shrink-0 cursor-pointer overflow-hidden rounded-[28px]"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="relative aspect-square bg-cream-50">
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
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-2 text-[#df7e8b]"
                        aria-label={`${product.productName} 찜 해제`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleSavedProductRemove(product.id);
                        }}
                      >
                        <HiHeart className="size-5" aria-hidden="true" />
                      </Button>
                    </div>
                    <CardContent className="p-3">
                      <p className="truncate text-sm leading-5 text-[#8a716b]">
                        {product.brandName}
                      </p>
                      <h3 className="mt-2 line-clamp-2 text-base leading-6 text-brown-600">
                        {product.productName}
                      </h3>
                    </CardContent>
                  </Card>
                ))
              : null}
          </div>
        </div>
      </section>

      <nav className="mt-12">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
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
              <HiChevronRight
                className="ml-auto mr-2 size-5 text-[#8a716b]"
                aria-hidden="true"
              />
            </Button>
          );
        })}

        <Button
          type="button"
          variant="ghost"
          className="h-18 w-full justify-start rounded-none px-0 text-red hover:bg-red/5 hover:text-red"
          onClick={handleSignOut}
        >
          <HiArrowRightOnRectangle className="ml-2 size-6 shrink-0" aria-hidden="true" />
          <span className="ml-4 text-xl leading-7">로그아웃</span>
        </Button>
      </nav>

      {userId ? (
        <Card className="mt-12 border-red/15 bg-red/5 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-red">회원탈퇴</CardTitle>
            <CardDescription className="text-sm leading-6 text-[#8a716b]">
              탈퇴하면 계정 정보와 개인 활동 내역이 삭제되고 되돌릴 수 없어요.
            </CardDescription>
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
              <Input
                className="mt-3"
                value={nicknameDraft}
                onChange={(event) => setNicknameDraft(event.target.value)}
              />
            </label>

            {profileError ? (
              <p className="mt-4 text-sm leading-5 text-red">{profileError}</p>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProfileModalOpen(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                disabled={isSavingProfile}
                onClick={handleProfileSave}
              >
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
              탈퇴하면 계정 정보, 찜한 상품, 문의 내역이 삭제됩니다. 진단
              결과와 피드백은 개인을 식별할 수 없도록 익명화되어 통계
              목적으로만 보관됩니다. 정말 탈퇴하시겠어요?
            </p>

            {deleteAccountError ? (
              <p className="mt-4 text-sm leading-5 text-red">
                {deleteAccountError}
              </p>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isDeletingAccount}
                onClick={() => setIsDeleteAccountModalOpen(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                disabled={isDeletingAccount}
                className="bg-red text-white hover:bg-red/90"
                onClick={handleDeleteAccount}
              >
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
    </main>
  );
}
