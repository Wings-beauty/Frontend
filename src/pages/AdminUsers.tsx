import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronRight, HiHome, HiMagnifyingGlass, HiShieldCheck } from "react-icons/hi2";
import { getCurrentUser, requireAdmin, setAuthReturnTo } from "../api/auth";
import { fetchAdminUsers, type AdminUserSummary } from "../api/adminUsers";
import { profileRoleLabels, profileRoles, toneCodeLabels, toneCodes, type ProfileRole, type ToneCode } from "../constants/inquiries";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatConfidence(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${Math.round(value * 100)}%`;
}

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

    const loadUsers = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const user = await getCurrentUser();

        if (!user) {
          setAuthReturnTo("/admin/users");
          navigate("/login", { replace: true });
          return;
        }

        await requireAdmin();
        const nextUsers = await fetchAdminUsers({
          role: roleFilter,
          tone: toneFilter,
          waitlist: waitlistFilter,
          search,
        });

        if (isMounted) {
          setUsers(nextUsers);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "회원 목록을 불러오지 못했어요.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timerId = window.setTimeout(() => {
      void loadUsers();
    }, 250);

    return () => {
      isMounted = false;
      window.clearTimeout(timerId);
    };
  }, [navigate, roleFilter, search, toneFilter, waitlistFilter]);

  return (
    <main className="min-h-dvh bg-white px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <button type="button" className="flex size-10 items-center justify-center text-brown-600" aria-label="홈으로 이동" onClick={() => navigate("/home")}>
          <HiHome className="size-7" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">관리자</h1>
        <div className="flex size-10 items-center justify-center rounded-full bg-cream-100 text-brown-600">
          <HiShieldCheck className="size-6" aria-hidden="true" />
        </div>
      </header>

      <section className="mt-10 rounded-3xl bg-cream-50 px-5 py-5">
        <h2 className="text-3xl font-normal leading-10 text-brown-600">회원 관리</h2>
        <div className="mt-5 grid grid-cols-2 gap-2 text-sm font-normal leading-5">
          <button className="rounded-full bg-brown-600 px-4 py-2 text-white">회원 관리</button>
          <button type="button" className="rounded-full bg-white px-4 py-2 text-brown-600" onClick={() => navigate("/admin/inquiries")}>
            문의 관리
          </button>
          {["제품 관리", "진단 로그", "피드백 관리", "런칭 대기자"].map((item) => (
            <button key={item} type="button" className="rounded-full bg-white px-4 py-2 text-[#b2a19b]" disabled>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9b8179]" aria-hidden="true" />
          <input
            className="h-13 w-full rounded-2xl border border-cream-200 bg-white pl-12 pr-4 text-base font-normal leading-6 text-brown-600 outline-none placeholder:text-[#b9aaa4]"
            value={search}
            placeholder="닉네임, 이메일, user id 검색"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <select
            className="h-13 min-w-0 rounded-2xl border border-cream-200 bg-white px-2 text-sm font-normal leading-5 text-brown-600 outline-none"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as ProfileRole | "all")}
          >
            <option value="all">전체</option>
            {profileRoles.map((role) => (
              <option key={role} value={role}>
                {profileRoleLabels[role]}
              </option>
            ))}
          </select>
          <select
            className="h-13 min-w-0 rounded-2xl border border-cream-200 bg-white px-2 text-sm font-normal leading-5 text-brown-600 outline-none"
            value={toneFilter}
            onChange={(event) => setToneFilter(event.target.value as ToneCode | "all")}
          >
            <option value="all">톤 전체</option>
            {toneCodes.map((tone) => (
              <option key={tone} value={tone}>
                {toneCodeLabels[tone]}
              </option>
            ))}
          </select>
          <select
            className="h-13 min-w-0 rounded-2xl border border-cream-200 bg-white px-2 text-sm font-normal leading-5 text-brown-600 outline-none"
            value={waitlistFilter}
            onChange={(event) => setWaitlistFilter(event.target.value as "all" | "joined" | "not_joined")}
          >
            <option value="all">알림 전체</option>
            <option value="joined">신청</option>
            <option value="not_joined">미신청</option>
          </select>
        </div>
      </section>

      <section className="mt-6">
        {isLoading ? (
          <article className="rounded-3xl bg-cream-50 px-6 py-8">
            <p className="text-base font-normal leading-7 text-[#7a625c]">회원 목록을 불러오는 중입니다.</p>
          </article>
        ) : null}

        {errorMessage ? (
          <article className="rounded-3xl bg-cream-50 px-6 py-8">
            <p className="text-base font-normal leading-7 text-[#c4544a]">{errorMessage}</p>
          </article>
        ) : null}

        {!isLoading && !errorMessage && users.length === 0 ? (
          <article className="rounded-3xl bg-cream-50 px-6 py-8 text-center">
            <p className="text-base font-normal leading-7 text-[#7a625c]">조건에 맞는 회원이 없습니다.</p>
          </article>
        ) : null}

        <div className="space-y-4">
          {users.map((user) => (
            <button key={user.id} type="button" className="w-full rounded-3xl bg-white px-5 py-5 text-left shadow-md" onClick={() => navigate(`/admin/users/${encodeURIComponent(user.displayId)}`)}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-normal leading-5 text-[#df7e8b]">
                    {profileRoleLabels[user.role]} · {user.hasWaitlist ? "알림 신청" : "알림 미신청"}
                  </p>
                  <h3 className="mt-2 truncate text-xl font-normal leading-7 text-brown-600">{user.nickname ?? "닉네임 없음"}</h3>
                  <p className="mt-2 truncate text-sm font-normal leading-5 text-[#7a625c]">{user.email ?? "이메일 없음"}</p>
                  <p className="mt-1 truncate text-xs font-normal leading-5 text-[#9b8179]">{user.displayId}</p>
                  <p className="mt-3 text-sm font-normal leading-5 text-[#7a625c]">
                    가입 {formatDate(user.createdAt)} · 찜 {user.savedProductCount}개
                  </p>
                  <p className="mt-1 text-sm font-normal leading-5 text-[#7a625c]">
                    최근 톤 {user.latestToneLabel ?? user.latestToneCode ?? "진단 없음"} · {formatConfidence(user.latestConfidence)}
                  </p>
                </div>
                <HiChevronRight className="mt-2 size-5 shrink-0 text-[#9b8179]" aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
