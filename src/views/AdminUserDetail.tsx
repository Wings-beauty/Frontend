"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "../lib/router";
import { HiArrowLeft, HiChatBubbleLeftRight, HiChevronRight, HiEye, HiMiniUser } from "react-icons/hi2";
import { POST_CATEGORY_LABELS, type PostCategory } from "../api/community";
import { requireAdmin } from "../api/auth";
import { fetchAdminUserDetail, type AdminUserDetail as AdminUserDetailData } from "../api/adminUsers";
import { getInquiryCategoryLabel, getInquiryStatusLabel, profileRoleLabels } from "../constants/inquiries";
import { Button } from "../components/ui/button";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatPrice(value: number | null) {
  if (value === null) return "-";
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(value);
}

function formatConfidence(value: number | null) {
  if (value === null) return "-";
  return `${Math.round(value * 100)}%`;
}

export default function AdminUserDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const userIdentifier = id ? decodeURIComponent(id) : "";
  const [userDetail, setUserDetail] = useState<AdminUserDetailData | null>(null);
  const [expandedRaw, setExpandedRaw] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!userIdentifier) { setErrorMessage("회원 정보를 찾을 수 없습니다."); setIsLoading(false); return; }
      try {
        await requireAdmin();
        const data = await fetchAdminUserDetail(userIdentifier);
        if (isMounted) setUserDetail(data);
      } catch (err) {
        if (isMounted) setErrorMessage(err instanceof Error ? err.message : "회원 상세를 불러오지 못했어요.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void load();
    return () => { isMounted = false; };
  }, [userIdentifier]);

  const toggleRaw = (id: number) => setExpandedRaw((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/admin/users")}>
          <HiArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-medium text-brown-600">회원 상세</h1>
          {userDetail ? <p className="mt-0.5 text-sm text-brown-400">{userDetail.email ?? userDetail.displayId}</p> : null}
        </div>
      </header>

      {isLoading ? <div className="h-48 rounded-2xl bg-white animate-pulse" /> : null}
      {errorMessage ? <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm text-red">{errorMessage}</p> : null}
      {!isLoading && !errorMessage && !userDetail ? (
        <p className="rounded-2xl bg-cream-50 px-4 py-3 text-sm text-brown-400">회원을 찾을 수 없습니다.</p>
      ) : null}

      {userDetail ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          {/* 왼쪽 프로필 */}
          <aside className="flex flex-col gap-4">
            <div className="app-panel p-5">
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream-100">
                  {userDetail.profileImageUrl ? (
                    <img src={userDetail.profileImageUrl} className="size-full object-cover" alt="프로필" />
                  ) : (
                    <HiMiniUser className="size-9 text-brown-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-medium text-brown-600 truncate">{userDetail.nickname ?? "닉네임 없음"}</p>
                  <p className="text-sm text-brown-400 truncate">{userDetail.email ?? "-"}</p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-brown-400">역할</dt>
                  <dd className="mt-0.5 font-medium text-brown-600">{profileRoleLabels[userDetail.role]}</dd>
                </div>
                <div>
                  <dt className="text-xs text-brown-400">대기자</dt>
                  <dd className="mt-0.5 font-medium text-brown-600">{userDetail.hasWaitlist ? "신청" : "미신청"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-brown-400">퍼스널컬러</dt>
                  <dd className="mt-0.5 font-medium text-brown-600">{userDetail.skinTone ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-brown-400">출생연도</dt>
                  <dd className="mt-0.5 font-medium text-brown-600">{userDetail.birthYear ?? "-"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-brown-400">가입일</dt>
                  <dd className="mt-0.5 text-brown-600">{formatDate(userDetail.createdAt)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-brown-400">User ID</dt>
                  <dd className="mt-0.5 break-all text-xs text-brown-400">{userDetail.id}</dd>
                </div>
              </dl>

              {userDetail.skinNote ? (
                <div className="mt-4 rounded-xl bg-cream-50 px-3 py-2.5">
                  <p className="text-xs text-brown-400">피부 메모</p>
                  <p className="mt-1 text-sm text-brown-600">{userDetail.skinNote}</p>
                </div>
              ) : null}
            </div>
          </aside>

          {/* 오른쪽 상세 */}
          <div className="flex flex-col gap-5">
            {/* 진단 이력 */}
            <section className="app-panel overflow-hidden">
              <h3 className="px-5 py-4 text-base font-medium text-brown-600 border-b border-cream-100">
                진단 이력 ({userDetail.diagnosisResults.length})
              </h3>
              {userDetail.diagnosisResults.length === 0 ? (
                <p className="px-5 py-6 text-sm text-brown-400">진단 이력이 없습니다.</p>
              ) : (
                <div className="divide-y divide-cream-100">
                  {userDetail.diagnosisResults.map((d) => (
                    <div key={d.id} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-brown-600">{d.toneLabel ?? d.toneCode ?? "-"}</p>
                          <p className="text-xs text-brown-400">{formatDate(d.createdAt)} · 신뢰도 {formatConfidence(d.confidence)}</p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 rounded-lg border border-cream-200 px-3 py-1.5 text-xs text-brown-400 transition hover:bg-cream-50"
                          onClick={() => toggleRaw(d.id)}
                        >
                          {expandedRaw.has(d.id) ? "접기" : "raw 보기"}
                        </button>
                      </div>
                      {expandedRaw.has(d.id) ? (
                        <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-[#2f2523] p-4 text-xs leading-5 text-white">
                          {JSON.stringify(d.rawResult, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 찜한 상품 */}
            <section className="app-panel overflow-hidden">
              <h3 className="px-5 py-4 text-base font-medium text-brown-600 border-b border-cream-100">
                찜한 상품 ({userDetail.savedProducts.length})
              </h3>
              {userDetail.savedProducts.length === 0 ? (
                <p className="px-5 py-6 text-sm text-brown-400">찜한 상품이 없습니다.</p>
              ) : (
                <div className="divide-y divide-cream-100">
                  {userDetail.savedProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                        {p.productImageUrl ? <img src={p.productImageUrl} className="size-full object-cover" alt={p.productName ?? ""} /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-brown-400">{p.brandName ?? "-"}</p>
                        <p className="mt-0.5 truncate text-sm font-medium text-brown-600">{p.productName ?? "상품명 없음"}</p>
                        <p className="text-xs text-brown-400">{p.productColor ?? p.category ?? "-"} · {formatPrice(p.price)}</p>
                      </div>
                      {p.productUrl ? (
                        <a href={p.productUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg border border-cream-200 px-3 py-1.5 text-xs text-brown-400 transition hover:bg-cream-50">
                          열기
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 문의 내역 */}
            <section className="app-panel overflow-hidden">
              <h3 className="px-5 py-4 text-base font-medium text-brown-600 border-b border-cream-100">
                문의 내역 ({userDetail.inquiries.length})
              </h3>
              {userDetail.inquiries.length === 0 ? (
                <p className="px-5 py-6 text-sm text-brown-400">문의 내역이 없습니다.</p>
              ) : (
                <div className="divide-y divide-cream-100">
                  {userDetail.inquiries.map((inq) => (
                    <button
                      key={inq.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-cream-50"
                      onClick={() => navigate(`/admin/inquiries/${inq.id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-brown-400">{getInquiryCategoryLabel(inq.category)} · {getInquiryStatusLabel(inq.status)}</p>
                        <p className="mt-0.5 truncate text-sm font-medium text-brown-600">{inq.title}</p>
                        <p className="text-xs text-brown-400">{formatDate(inq.createdAt)}</p>
                      </div>
                      <HiChevronRight className="size-4 shrink-0 text-brown-300" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* 커뮤니티 게시글 */}
            <section className="app-panel overflow-hidden">
              <h3 className="px-5 py-4 text-base font-medium text-brown-600 border-b border-cream-100">
                커뮤니티 게시글 ({userDetail.communityPosts.length})
              </h3>
              {userDetail.communityPosts.length === 0 ? (
                <p className="px-5 py-6 text-sm text-brown-400">작성한 게시글이 없습니다.</p>
              ) : (
                <div className="divide-y divide-cream-100">
                  {userDetail.communityPosts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-cream-50"
                      onClick={() => navigate(`/community/${post.id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-brown-400">
                          {POST_CATEGORY_LABELS[post.category as PostCategory] ?? post.category}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-medium text-brown-600">{post.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-brown-300">{post.content}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-brown-300">
                          <span>{formatDate(post.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <HiEye className="size-3" />
                            {post.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <HiChatBubbleLeftRight className="size-3" />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                      <HiChevronRight className="size-4 shrink-0 text-brown-300" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
