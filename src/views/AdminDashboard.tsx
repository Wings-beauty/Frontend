"use client";

import { useEffect, useState } from "react";
import {
  HiChatBubbleLeftRight,
  HiChartBar,
  HiClock,
  HiNewspaper,
  HiSparkles,
  HiStar,
  HiUsers,
  HiUserGroup,
  HiShoppingBag,
} from "react-icons/hi2";
import { fetchAdminStats, type AdminStats } from "../api/adminStats";
import { requireAdmin } from "../api/auth";
import { useNavigate } from "../lib/router";

type StatCard = {
  label: string;
  value: number | null;
  icon: React.ElementType;
  href?: string;
  highlight?: boolean;
};

function StatCardItem({ card }: { card: StatCard }) {
  const navigate = useNavigate();
  const Icon = card.icon;

  return (
    <button
      type="button"
      disabled={!card.href}
      onClick={() => card.href && navigate(card.href)}
      className={`app-card flex flex-col gap-4 p-5 text-left transition ${
        card.href ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default"
      } ${card.highlight ? "border-amber-200 bg-amber-50/60" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-brown-400">{card.label}</span>
        <div className={`flex size-9 items-center justify-center rounded-full ${card.highlight ? "bg-amber-100 text-amber-600" : "bg-cream-100 text-brown-400"}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className={`text-3xl font-medium ${card.highlight ? "text-amber-700" : "text-brown-600"}`}>
        {card.value === null ? <span className="h-8 w-16 animate-pulse rounded-lg bg-cream-200 inline-block" /> : card.value.toLocaleString()}
      </p>
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        await requireAdmin();
        const data = await fetchAdminStats();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setErrorMessage(err instanceof Error ? err.message : "통계를 불러오지 못했어요.");
      }
    };
    void load();
    return () => { isMounted = false; };
  }, []);

  const cards: StatCard[] = [
    { label: "전체 회원", value: stats?.totalUsers ?? null, icon: HiUsers, href: "/admin/users" },
    { label: "대기 중인 문의", value: stats?.pendingInquiries ?? null, icon: HiChatBubbleLeftRight, href: "/admin/inquiries", highlight: (stats?.pendingInquiries ?? 0) > 0 },
    { label: "누적 진단 수", value: stats?.totalDiagnoses ?? null, icon: HiSparkles },
    { label: "피드백 수", value: stats?.totalFeedbacks ?? null, icon: HiStar },
    { label: "활성 상품 수", value: stats?.totalProducts ?? null, icon: HiShoppingBag },
    { label: "발행된 뉴스", value: stats?.publishedNews ?? null, icon: HiNewspaper, href: "/admin/news" },
    { label: "커뮤니티 게시글", value: stats?.communityPosts ?? null, icon: HiUserGroup },
    { label: "런칭 대기자", value: stats?.waitlistCount ?? null, icon: HiClock },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-medium text-brown-600">대시보드</h1>
        <p className="mt-1 text-sm text-brown-400">WINGS 서비스 현황을 한눈에 확인합니다.</p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm text-red">{errorMessage}</p>
      ) : null}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCardItem key={card.label} card={card} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          className="app-card flex items-center gap-4 p-5 text-left transition hover:-translate-y-0.5"
          onClick={() => navigate("/admin/users")}
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brown-600/10 text-brown-600">
            <HiUsers className="size-6" />
          </div>
          <div>
            <p className="font-medium text-brown-600">회원 관리</p>
            <p className="mt-0.5 text-sm text-brown-400">회원 목록 조회 및 상세 정보 확인</p>
          </div>
        </button>

        <button
          type="button"
          className="app-card flex items-center gap-4 p-5 text-left transition hover:-translate-y-0.5"
          onClick={() => navigate("/admin/inquiries")}
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brown-600/10 text-brown-600">
            <HiChatBubbleLeftRight className="size-6" />
          </div>
          <div>
            <p className="font-medium text-brown-600">문의 관리</p>
            <p className="mt-0.5 text-sm text-brown-400">사용자 1:1 문의 답변 처리</p>
          </div>
        </button>

        <button
          type="button"
          className="app-card flex items-center gap-4 p-5 text-left transition hover:-translate-y-0.5"
          onClick={() => navigate("/admin/news")}
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brown-600/10 text-brown-600">
            <HiNewspaper className="size-6" />
          </div>
          <div>
            <p className="font-medium text-brown-600">뉴스 관리</p>
            <p className="mt-0.5 text-sm text-brown-400">카드뉴스 작성 및 발행 관리</p>
          </div>
        </button>

        <button
          type="button"
          className="app-card flex items-center gap-4 p-5 text-left transition hover:-translate-y-0.5"
          onClick={() => navigate("/admin/news/new")}
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brown-600 text-white">
            <HiChartBar className="size-6" />
          </div>
          <div>
            <p className="font-medium text-brown-600">뉴스 작성</p>
            <p className="mt-0.5 text-sm text-brown-400">새 카드뉴스 작성 시작</p>
          </div>
        </button>
      </section>
    </div>
  );
}
