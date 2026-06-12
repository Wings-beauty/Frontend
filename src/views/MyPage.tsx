"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import {
  HiArrowRightOnRectangle,
  HiChevronRight,
  HiHeart,
  HiMegaphone,
  HiMiniUser,
  HiPencil,
  HiPhoto,
  HiQuestionMarkCircle,
  HiShieldCheck,
  HiSparkles,
} from "react-icons/hi2";
import { deleteMyAccount, fetchProfile, getCurrentUser, signOut, updateProfileNickname, uploadProfileAvatar } from "../api/auth";
import { fetchDiagnosisHistoryForUser, type DiagnosisHistoryItem } from "../api/diagnosis";
import { fetchSavedProductsForUser, toggleSavedProduct, type RecommendedProduct } from "../api/products";
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

function formatDate(value: string | null) {
  if (!value) return "날짜 정보 없음";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

export default function MyPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [savedProducts, setSavedProducts] = useState<RecommendedProduct[]>([]);
  const [authError, setAuthError] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");

  const latestDiagnosis = diagnosisHistory[0] ?? null;
  const result = profile?.skinTone ? personalColorResults[profile.skinTone] : personalColorResults.summer;
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) { navigate("/login", { replace: true }); return; }
        setUserId(user.id);
        const [profileFromDb, historyFromDb, savedProductsFromDb] = await Promise.all([
          fetchProfile(user),
          fetchDiagnosisHistoryForUser(user.id),
          fetchSavedProductsForUser(),
        ]);
        if (!isMounted) return;
        setProfile({ ...profileFromDb, role: profileFromDb.role === "admin" ? "admin" : "user" });
        setNicknameDraft(profileFromDb.nickname);
        setDiagnosisHistory(historyFromDb);
        setSavedProducts(savedProductsFromDb);
      } catch (error) {
        if (isMounted) setAuthError(error instanceof Error ? error.message : "마이페이지 정보를 불러오지 못했습니다.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void load();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    if (!userId) return;
    setIsSavingProfile(true);
    setProfileError("");
    try {
      let newAvatarUrl: string | undefined;
      if (avatarFile) {
        newAvatarUrl = await uploadProfileAvatar(avatarFile, userId);
      }
      const updatedProfile = await updateProfileNickname(userId, nicknameDraft);
      setProfile((p) => ({
        nickname: updatedProfile.nickname ?? nicknameDraft.trim(),
        email: p?.email ?? "",
        profileImageUrl: newAvatarUrl ?? updatedProfile.profile_image_url ?? p?.profileImageUrl ?? null,
        skinTone: p?.skinTone ?? null,
        role: p?.role ?? "user",
      }));
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsProfileModalOpen(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "프로필 저장에 실패했습니다.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavedProductRemove = async (productId: number) => {
    if (!userId) return;
    await toggleSavedProduct(productId);
    const fresh = await fetchSavedProductsForUser();
    setSavedProducts(fresh);
    setSelectedProduct((p) => (p?.id === productId ? null : p));
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
      setDeleteAccountError("회원탈퇴 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <main className="app-page px-5 py-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">

        {/* 페이지 헤더 */}
        <header className="app-panel flex items-center justify-between px-5 py-3 lg:px-6">
          <h1 className="text-xl font-medium text-brown-600">마이페이지</h1>
          {isAdmin ? (
            <Badge className="cursor-pointer bg-brown-600 px-3 py-1 text-white hover:bg-brown-500" onClick={() => navigate("/admin")}>
              관리자
            </Badge>
          ) : null}
        </header>

        {authError ? (
          <Card className="border-red/20 bg-red/5 shadow-none">
            <CardContent className="p-6 text-center text-sm leading-7 text-red">{authError}</CardContent>
          </Card>
        ) : null}

        {/* 2컬럼 그리드 (데스크탑) */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-8">

          {/* ── 왼쪽 사이드바 ── */}
          <aside className="flex flex-col gap-5">

            {/* 프로필 카드 */}
            <Card className={`overflow-hidden ${result.accentSoftClassName}`}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
                  <Avatar className={`size-20 border-2 border-white ${result.accentClassName}`}>
                    {profile?.profileImageUrl ? (
                      <AvatarImage src={profile.profileImageUrl} alt="프로필" />
                    ) : (
                      <AvatarFallback>
                        <HiMiniUser className="size-12" aria-hidden="true" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0 w-full">
                    <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                      <h2 className="text-2xl font-medium text-brown-600">
                        {isLoading ? "불러오는 중" : (profile?.nickname ?? "WINGS 사용자")}
                      </h2>
                      {(profile?.skinTone || latestDiagnosis) ? (
                        <Badge className={`${result.accentClassName} bg-opacity-90`}>
                          {result.toneLabel ?? latestDiagnosis?.toneLabel}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-[#756861]">{profile?.email ?? ""}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="mt-5 w-full"
                  onClick={() => { setNicknameDraft(profile?.nickname ?? ""); setProfileError(""); setAvatarFile(null); setAvatarPreview(null); setIsProfileModalOpen(true); }}
                >
                  <HiPencil className="size-4" aria-hidden="true" />
                  프로필 편집
                </Button>
              </CardContent>
            </Card>

            {/* 메뉴 */}
            <Card className="overflow-hidden shadow-none">
              <nav>
                {/* 어드민 전용 */}
                {isAdmin ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 border-b border-cream-200 bg-brown-600/5 px-5 py-4 text-left transition hover:bg-brown-600/10"
                    onClick={() => navigate("/admin")}
                  >
                    <HiShieldCheck className="size-5 shrink-0 text-brown-600" aria-hidden="true" />
                    <span className="flex-1 text-base font-medium text-brown-600">관리자 대시보드</span>
                    <HiChevronRight className="size-4 text-brown-400" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 border-b border-cream-200 px-5 py-4 text-left transition hover:bg-cream-50"
                    onClick={() => navigate("/inquiries")}
                  >
                    <HiQuestionMarkCircle className="size-5 shrink-0 text-[#8a716b]" aria-hidden="true" />
                    <span className="flex-1 text-base text-brown-600">1:1 문의</span>
                    <HiChevronRight className="size-4 text-brown-300" aria-hidden="true" />
                  </button>
                )}

                <button
                  type="button"
                  className="flex w-full items-center gap-3 border-b border-cream-200 px-5 py-4 text-left transition hover:bg-cream-50"
                  onClick={() => window.open("https://enchanting-season-dd0.notion.site/36586389f99c807fb0d7eb849fb85bee?pvs=73", "_blank", "noopener,noreferrer")}
                >
                  <HiMegaphone className="size-5 shrink-0 text-[#8a716b]" aria-hidden="true" />
                  <span className="flex-1 text-base text-brown-600">공지사항</span>
                  <HiChevronRight className="size-4 text-brown-300" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-5 py-4 text-left text-red transition hover:bg-red/5"
                  onClick={handleSignOut}
                >
                  <HiArrowRightOnRectangle className="size-5 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-base">로그아웃</span>
                </button>
              </nav>
            </Card>

            {/* 회원탈퇴 — 데스크탑에서만 사이드바 하단 */}
            {userId ? (
              <Card className="hidden border-red/15 bg-red/5 shadow-none lg:block">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-red">회원탈퇴</CardTitle>
                  <CardDescription className="text-xs leading-5">탈퇴하면 계정 정보와 개인 활동 내역이 삭제되고 되돌릴 수 없어요.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-red/30 text-red hover:bg-red/10 hover:text-red"
                    onClick={() => { setDeleteAccountError(""); setIsDeleteAccountModalOpen(true); }}
                  >
                    회원탈퇴
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </aside>

          {/* ── 오른쪽 메인 ── */}
          <div className="flex flex-col gap-6">

            {/* 진단 기록 */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-medium text-brown-600">진단 기록</h2>
                <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/diagnosis-history")}>
                  전체보기
                  <HiChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </div>

              {isLoading ? (
                <div className="h-36 rounded-2xl bg-white border border-cream-200 animate-pulse" />
              ) : latestDiagnosis ? (
                <Card
                  className="cursor-pointer transition hover:-translate-y-0.5"
                  onClick={() => navigate(`/diagnosis-history/${latestDiagnosis.id}`)}
                >
                  <CardHeader className="pb-3">
                    <Badge className="w-fit bg-white text-brown-300">최근 진단일</Badge>
                    <CardTitle className="text-xl">{formatDate(latestDiagnosis.createdAt)}</CardTitle>
                    <CardDescription>{latestDiagnosis.toneLabel}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-brown-600">{personalColorResults[latestDiagnosis.season]?.description}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-sm text-[#8a716b]">아직 저장된 진단 기록이 없습니다.</CardContent>
                </Card>
              )}

              <Button type="button" size="lg" className="mt-4 w-full" onClick={() => navigate("/photo")}>
                <HiSparkles className="size-5" aria-hidden="true" />
                AI 톤 진단 시작하기
              </Button>
            </section>

            {/* 찜한 상품 */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-medium text-brown-600">찜한 상품</h2>
                <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/saved-products")}>
                  {savedProducts.length}개
                  <HiChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </div>

              {isLoading ? (
                <div className="h-44 rounded-2xl bg-white border border-cream-200 animate-pulse" />
              ) : savedProducts.length === 0 ? (
                <p className="py-6 text-sm text-[#8a716b]">아직 찜한 상품이 없습니다.</p>
              ) : (
                <div className="-mx-5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0">
                  <div className="flex gap-4">
                    {savedProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="w-36 shrink-0 cursor-pointer overflow-hidden rounded-[28px]"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="relative aspect-square bg-white">
                          {product.productImageUrl ? (
                            <img src={product.productImageUrl} className="size-full object-cover" alt={product.productName} />
                          ) : (
                            <div className="size-full" style={{ backgroundColor: product.colorHex ?? "#fff9e6" }} />
                          )}
                          <button
                            type="button"
                            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-[#df7e8b] text-white shadow-sm transition-opacity hover:opacity-80"
                            aria-label={`${product.productName} 찜 해제`}
                            onClick={(e) => { e.stopPropagation(); void handleSavedProductRemove(product.id); }}
                          >
                            <HiHeart className="size-5 fill-current" />
                          </button>
                        </div>
                        <CardContent className="p-3">
                          <p className="truncate text-xs text-[#8a716b]">{product.brandName}</p>
                          <h3 className="mt-1 line-clamp-2 text-sm leading-5 text-brown-600">{product.productName}</h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 회원탈퇴 — 모바일에서만 하단 표시 */}
            {userId ? (
              <Card className="border-red/15 bg-red/5 shadow-none lg:hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-red">회원탈퇴</CardTitle>
                  <CardDescription className="text-sm leading-6 text-[#8a716b]">탈퇴하면 계정 정보와 개인 활동 내역이 삭제되고 되돌릴 수 없어요.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-red/30 text-red hover:bg-red/10 hover:text-red"
                    onClick={() => { setDeleteAccountError(""); setIsDeleteAccountModalOpen(true); }}
                  >
                    회원탈퇴
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      {/* 프로필 편집 모달 */}
      {isProfileModalOpen ? (
        <DialogShell onClose={() => { if (!isSavingProfile) setIsProfileModalOpen(false); }}>
          <div className="p-6">
            <h2 className="text-2xl leading-8 text-brown-600">프로필 편집</h2>

            {/* 아바타 */}
            <div className="mt-5 flex flex-col items-center gap-3">
              <div className="relative size-24">
                <div className="size-24 overflow-hidden rounded-full bg-cream-100 border-2 border-cream-200">
                  {avatarPreview ?? profile?.profileImageUrl ? (
                    <img
                      src={avatarPreview ?? profile?.profileImageUrl ?? ""}
                      className="size-full object-cover"
                      alt="프로필 미리보기"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <HiMiniUser className="size-12 text-brown-300" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-brown-600 text-white shadow-md transition hover:bg-brown-500"
                  aria-label="사진 변경"
                >
                  <HiPhoto className="size-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                    disabled={isSavingProfile}
                  />
                </label>
              </div>
              {avatarFile ? (
                <p className="text-xs text-brown-400">{avatarFile.name}</p>
              ) : null}
            </div>

            <label className="mt-5 block text-sm leading-5 text-[#8a716b]">
              닉네임
              <Input className="mt-3" value={nicknameDraft} onChange={(e) => setNicknameDraft(e.target.value)} disabled={isSavingProfile} />
            </label>
            {profileError ? <p className="mt-4 text-sm leading-5 text-red">{profileError}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" disabled={isSavingProfile} onClick={() => setIsProfileModalOpen(false)}>취소</Button>
              <Button type="button" disabled={isSavingProfile} onClick={handleProfileSave}>
                {isSavingProfile ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </DialogShell>
      ) : null}

      {/* 회원탈퇴 확인 모달 */}
      {isDeleteAccountModalOpen ? (
        <DialogShell onClose={() => { if (!isDeletingAccount) setIsDeleteAccountModalOpen(false); }}>
          <div className="p-6">
            <h2 className="text-2xl leading-8 text-brown-600">회원탈퇴</h2>
            <p className="mt-5 text-sm leading-6 text-[#756861]">
              탈퇴하면 계정 정보, 찜한 상품, 문의 내역이 삭제됩니다. 진단 결과와 피드백은 개인을 식별할 수 없도록 익명화되어 통계 목적으로만 보관됩니다. 정말 탈퇴하시겠어요?
            </p>
            {deleteAccountError ? <p className="mt-4 text-sm leading-5 text-red">{deleteAccountError}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" disabled={isDeletingAccount} onClick={() => setIsDeleteAccountModalOpen(false)}>취소</Button>
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
          onToggleLike={(productId) => { void handleSavedProductRemove(productId); }}
        />
      ) : null}
    </main>
  );
}
