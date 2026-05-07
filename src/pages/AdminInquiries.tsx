import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiChevronRight,
  HiHome,
  HiMagnifyingGlass,
  HiShieldCheck,
} from "react-icons/hi2";
import { getCurrentUser, requireAdmin, setAuthReturnTo } from "../api/auth";
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
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminInquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] =
    useState<InquiryCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAdminInquiries = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const user = await getCurrentUser();

        if (!user) {
          setAuthReturnTo("/admin/inquiries");
          navigate("/login", { replace: true });
          return;
        }

        await requireAdmin();
        const nextInquiries = await fetchAdminInquiries({
          status: statusFilter,
          category: categoryFilter,
          search,
        });

        if (isMounted) {
          setInquiries(nextInquiries);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "관리자 문의 목록을 불러오지 못했어요.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timerId = window.setTimeout(() => {
      void loadAdminInquiries();
    }, 250);

    return () => {
      isMounted = false;
      window.clearTimeout(timerId);
    };
  }, [categoryFilter, navigate, search, statusFilter]);

  return (
    <main className="min-h-dvh bg-white px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="홈으로 이동"
          onClick={() => navigate("/home")}
        >
          <HiHome className="size-7" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">
          관리자
        </h1>
        <div className="flex size-10 items-center justify-center rounded-full bg-cream-100 text-brown-600">
          <HiShieldCheck className="size-6" aria-hidden="true" />
        </div>
      </header>

      <section className="mt-10 rounded-3xl bg-cream-50 px-5 py-5">
        <h2 className="text-3xl font-normal leading-10 text-brown-600">
          문의 관리
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-2 text-sm font-normal leading-5">
          <button
            type="button"
            className="rounded-full bg-white px-4 py-2 text-brown-600"
            onClick={() => navigate("/admin/users")}
          >
            회원 관리
          </button>
          <button
            type="button"
            className="rounded-full bg-brown-600 px-4 py-2 text-white"
          >
            문의 관리
          </button>
          {["제품 관리", "진단 로그", "피드백 관리", "런칭 대기자"].map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full bg-white px-4 py-2 text-[#b2a19b]"
              disabled
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <div className="relative">
          <HiMagnifyingGlass
            className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9b8179]"
            aria-hidden="true"
          />
          <input
            className="h-13 w-full rounded-2xl border border-cream-200 bg-white pl-12 pr-4 text-base font-normal leading-6 text-brown-600 outline-none placeholder:text-[#b9aaa4]"
            value={search}
            placeholder="제목 또는 내용 검색"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select
            className="h-13 rounded-2xl border border-cream-200 bg-white px-4 text-base font-normal leading-6 text-brown-600 outline-none"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as InquiryStatus | "all")
            }
          >
            <option value="all">상태 전체</option>
            {inquiryStatuses.map((status) => (
              <option key={status} value={status}>
                {inquiryStatusLabels[status]}
              </option>
            ))}
          </select>

          <select
            className="h-13 rounded-2xl border border-cream-200 bg-white px-4 text-base font-normal leading-6 text-brown-600 outline-none"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as InquiryCategory | "all")
            }
          >
            <option value="all">카테고리 전체</option>
            {inquiryCategories.map((category) => (
              <option key={category} value={category}>
                {inquiryCategoryLabels[category]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-6">
        {isLoading ? (
          <article className="rounded-3xl bg-cream-50 px-6 py-8">
            <p className="text-base font-normal leading-7 text-[#7a625c]">
              문의 목록을 불러오는 중입니다.
            </p>
          </article>
        ) : null}

        {errorMessage ? (
          <article className="rounded-3xl bg-cream-50 px-6 py-8">
            <p className="text-base font-normal leading-7 text-[#c4544a]">
              {errorMessage}
            </p>
          </article>
        ) : null}

        {!isLoading && !errorMessage && inquiries.length === 0 ? (
          <article className="rounded-3xl bg-cream-50 px-6 py-8 text-center">
            <p className="text-base font-normal leading-7 text-[#7a625c]">
              조건에 맞는 문의가 없습니다.
            </p>
          </article>
        ) : null}

        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <button
              key={inquiry.id}
              type="button"
              className="w-full rounded-3xl bg-white px-5 py-5 text-left shadow-md"
              onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-normal leading-5 text-[#df7e8b]">
                    {getInquiryCategoryLabel(inquiry.category)} ·{" "}
                    {getInquiryStatusLabel(inquiry.status)}
                  </p>
                  <h3 className="mt-2 truncate text-xl font-normal leading-7 text-brown-600">
                    {inquiry.title}
                  </h3>
                  <p className="mt-3 text-sm font-normal leading-5 text-[#7a625c]">
                    작성자{" "}
                    {inquiry.authorNickname ??
                      inquiry.authorEmail ??
                      inquiry.userId}
                  </p>
                  <p className="mt-1 text-sm font-normal leading-5 text-[#7a625c]">
                    작성 {formatDate(inquiry.createdAt)} · 답변{" "}
                    {formatDate(inquiry.repliedAt)} ·{" "}
                    {inquiry.adminReply ? "답변 있음" : "답변 없음"}
                  </p>
                </div>
                <HiChevronRight
                  className="mt-2 size-5 shrink-0 text-[#9b8179]"
                  aria-hidden="true"
                />
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
