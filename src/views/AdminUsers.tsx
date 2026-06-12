"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import { HiChevronRight, HiMagnifyingGlass } from "react-icons/hi2";
import { requireAdmin } from "../api/auth";
import { fetchAdminUsers, type AdminUserSummary } from "../api/adminUsers";
import { profileRoleLabels, profileRoles, toneCodeLabels, toneCodes, type ProfileRole, type ToneCode } from "../constants/inquiries";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function formatConfidence(value: number | null) {
  if (value === null) return "-";
  return `${Math.round(value * 100)}%`;
}

const roleBadgeClass: Record<ProfileRole, string> = {
  admin: "bg-brown-600 text-white",
  user: "bg-cream-100 text-brown-400",
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [roleFilter, setRoleFilter] = useState<ProfileRole | "all">("all");
  const [toneFilter, setToneFilter] = useState<ToneCode | "all">("all");
  const [waitlistFilter, setWaitlistFilter] = useState<"all" | "joined" | "not_joined">("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const timerId = window.setTimeout(() => {
      const load = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
          await requireAdmin();
          const data = await fetchAdminUsers({ role: roleFilter, tone: toneFilter, waitlist: waitlistFilter, search });
          if (isMounted) setUsers(data);
        } catch (err) {
          if (isMounted) setErrorMessage(err instanceof Error ? err.message : "회원 목록을 불러오지 못했어요.");
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      void load();
    }, 250);
    return () => { isMounted = false; window.clearTimeout(timerId); };
  }, [navigate, roleFilter, search, toneFilter, waitlistFilter]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-medium text-brown-600">회원 관리</h1>
        <p className="mt-1 text-sm text-brown-400">총 {isLoading ? "..." : users.length}명 표시 중</p>
      </header>

      {/* 필터 */}
      <div className="app-panel flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brown-300" />
          <input
            className="h-10 w-full rounded-xl border border-cream-200 bg-white pl-10 pr-4 text-sm text-brown-600 outline-none placeholder:text-brown-300 focus:ring-2 focus:ring-brown-200"
            value={search}
            placeholder="닉네임, 이메일, user id 검색"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 rounded-xl border border-cream-200 bg-white px-3 text-sm text-brown-600 outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as ProfileRole | "all")}
          >
            <option value="all">역할 전체</option>
            {profileRoles.map((r) => <option key={r} value={r}>{profileRoleLabels[r]}</option>)}
          </select>
          <select
            className="h-10 rounded-xl border border-cream-200 bg-white px-3 text-sm text-brown-600 outline-none"
            value={toneFilter}
            onChange={(e) => setToneFilter(e.target.value as ToneCode | "all")}
          >
            <option value="all">톤 전체</option>
            {toneCodes.map((t) => <option key={t} value={t}>{toneCodeLabels[t]}</option>)}
          </select>
          <select
            className="h-10 rounded-xl border border-cream-200 bg-white px-3 text-sm text-brown-600 outline-none"
            value={waitlistFilter}
            onChange={(e) => setWaitlistFilter(e.target.value as "all" | "joined" | "not_joined")}
          >
            <option value="all">알림 전체</option>
            <option value="joined">신청</option>
            <option value="not_joined">미신청</option>
          </select>
        </div>
      </div>

      {errorMessage ? <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm text-red">{errorMessage}</p> : null}

      {/* 테이블 */}
      <div className="app-panel overflow-hidden">
        {/* 데스크탑 테이블 헤더 */}
        <div className="hidden grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_40px] gap-4 border-b border-cream-100 px-5 py-3 text-xs font-medium text-brown-400 lg:grid">
          <span>닉네임 / 이메일</span>
          <span>ID</span>
          <span>역할</span>
          <span>퍼스널컬러</span>
          <span>찜 / 대기자</span>
          <span>가입일</span>
          <span />
        </div>

        {isLoading ? (
          <div className="flex flex-col divide-y divide-cream-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex h-16 items-center gap-4 px-5">
                <div className="h-4 flex-1 rounded-full bg-cream-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-brown-400">조건에 맞는 회원이 없습니다.</p>
        ) : (
          <div className="flex flex-col divide-y divide-cream-100">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                className="group w-full text-left transition hover:bg-cream-50"
                onClick={() => navigate(`/admin/users/${encodeURIComponent(user.displayId)}`)}
              >
                {/* 데스크탑 행 */}
                <div className="hidden grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_40px] items-center gap-4 px-5 py-3.5 lg:grid">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brown-600">{user.nickname ?? "닉네임 없음"}</p>
                    <p className="truncate text-xs text-brown-400">{user.email ?? "-"}</p>
                  </div>
                  <p className="truncate text-xs text-brown-300">{user.displayId}</p>
                  <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass[user.role]}`}>
                    {profileRoleLabels[user.role]}
                  </span>
                  <p className="text-sm text-brown-500">{user.latestToneLabel ?? "-"}</p>
                  <p className="text-sm text-brown-500">
                    {user.savedProductCount}개 · {user.hasWaitlist ? "신청" : "미신청"}
                  </p>
                  <p className="text-sm text-brown-400">{formatDate(user.createdAt)}</p>
                  <HiChevronRight className="size-4 text-brown-300 group-hover:text-brown-500" />
                </div>

                {/* 모바일 카드 */}
                <div className="flex items-start justify-between gap-3 px-5 py-4 lg:hidden">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${roleBadgeClass[user.role]}`}>
                        {profileRoleLabels[user.role]}
                      </span>
                      {user.hasWaitlist ? <span className="text-xs text-brown-400">대기자</span> : null}
                    </div>
                    <p className="mt-1.5 text-base font-medium text-brown-600">{user.nickname ?? "닉네임 없음"}</p>
                    <p className="truncate text-sm text-brown-400">{user.email ?? "-"}</p>
                    <p className="mt-1 text-xs text-brown-300">
                      가입 {formatDate(user.createdAt)} · 찜 {user.savedProductCount}개 · 톤 {user.latestToneLabel ?? "-"} ({formatConfidence(user.latestConfidence)})
                    </p>
                  </div>
                  <HiChevronRight className="mt-1 size-4 shrink-0 text-brown-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
