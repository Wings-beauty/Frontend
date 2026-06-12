"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import { HiChevronRight, HiMagnifyingGlass } from "react-icons/hi2";
import { requireAdmin } from "../api/auth";
import { fetchAdminInquiries, type Inquiry } from "../api/inquiries";
import {
  getInquiryCategoryLabel,
  getInquiryStatusLabel,
  inquiryCategories,
  inquiryCategoryLabels,
  inquiryStatuses,
  inquiryStatusLabels,
  type InquiryCategory,
  type InquiryStatus,
} from "../constants/inquiries";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

const statusBadgeClass: Record<InquiryStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  answered: "bg-green-100 text-green-700",
  closed: "bg-cream-100 text-brown-400",
};

export default function AdminInquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<InquiryCategory | "all">("all");
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
          const data = await fetchAdminInquiries({ status: statusFilter, category: categoryFilter, search });
          if (isMounted) setInquiries(data);
        } catch (err) {
          if (isMounted) setErrorMessage(err instanceof Error ? err.message : "문의 목록을 불러오지 못했어요.");
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      void load();
    }, 250);
    return () => { isMounted = false; window.clearTimeout(timerId); };
  }, [categoryFilter, navigate, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-medium text-brown-600">문의 관리</h1>
        <p className="mt-1 text-sm text-brown-400">총 {isLoading ? "..." : inquiries.length}건 표시 중</p>
      </header>

      {/* 필터 */}
      <div className="app-panel flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brown-300" />
          <input
            className="h-10 w-full rounded-xl border border-cream-200 bg-white pl-10 pr-4 text-sm text-brown-600 outline-none placeholder:text-brown-300 focus:ring-2 focus:ring-brown-200"
            value={search}
            placeholder="제목 또는 내용 검색"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 rounded-xl border border-cream-200 bg-white px-3 text-sm text-brown-600 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InquiryStatus | "all")}
          >
            <option value="all">상태 전체</option>
            {inquiryStatuses.map((s) => <option key={s} value={s}>{inquiryStatusLabels[s]}</option>)}
          </select>
          <select
            className="h-10 rounded-xl border border-cream-200 bg-white px-3 text-sm text-brown-600 outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as InquiryCategory | "all")}
          >
            <option value="all">카테고리 전체</option>
            {inquiryCategories.map((c) => <option key={c} value={c}>{inquiryCategoryLabels[c]}</option>)}
          </select>
        </div>
      </div>

      {errorMessage ? <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm text-red">{errorMessage}</p> : null}

      <div className="app-panel overflow-hidden">
        {/* 데스크탑 테이블 헤더 */}
        <div className="hidden grid-cols-[3fr_1fr_1fr_2fr_40px] gap-4 border-b border-cream-100 px-5 py-3 text-xs font-medium text-brown-400 lg:grid">
          <span>제목 / 작성자</span>
          <span>카테고리</span>
          <span>상태</span>
          <span>작성일 · 답변일</span>
          <span />
        </div>

        {isLoading ? (
          <div className="flex flex-col divide-y divide-cream-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex h-16 items-center px-5">
                <div className="h-4 flex-1 rounded-full bg-cream-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-brown-400">조건에 맞는 문의가 없습니다.</p>
        ) : (
          <div className="flex flex-col divide-y divide-cream-100">
            {inquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                type="button"
                className="group w-full text-left transition hover:bg-cream-50"
                onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}
              >
                {/* 데스크탑 행 */}
                <div className="hidden grid-cols-[3fr_1fr_1fr_2fr_40px] items-center gap-4 px-5 py-3.5 lg:grid">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brown-600">{inquiry.title}</p>
                    <p className="text-xs text-brown-400">{inquiry.authorNickname ?? inquiry.authorEmail ?? inquiry.displayUserId ?? "-"}</p>
                  </div>
                  <span className="text-xs text-brown-400">{getInquiryCategoryLabel(inquiry.category)}</span>
                  <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass[inquiry.status as InquiryStatus]}`}>
                    {getInquiryStatusLabel(inquiry.status)}
                  </span>
                  <div>
                    <p className="text-xs text-brown-400">{formatDate(inquiry.createdAt)}</p>
                    <p className="text-xs text-brown-300">{inquiry.repliedAt ? `답변 ${formatDate(inquiry.repliedAt)}` : "미답변"}</p>
                  </div>
                  <HiChevronRight className="size-4 text-brown-300 group-hover:text-brown-500" />
                </div>

                {/* 모바일 카드 */}
                <div className="flex items-start justify-between gap-3 px-5 py-4 lg:hidden">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brown-400">{getInquiryCategoryLabel(inquiry.category)}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusBadgeClass[inquiry.status as InquiryStatus]}`}>
                        {getInquiryStatusLabel(inquiry.status)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-base font-medium text-brown-600">{inquiry.title}</p>
                    <p className="text-sm text-brown-400">{inquiry.authorNickname ?? inquiry.authorEmail ?? "-"}</p>
                    <p className="mt-1 text-xs text-brown-300">{formatDate(inquiry.createdAt)} · {inquiry.adminReply ? "답변 완료" : "미답변"}</p>
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
