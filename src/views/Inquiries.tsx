"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import {
  HiArrowLeft,
  HiChevronRight,
  HiMiniUser,
  HiPencilSquare,
} from "react-icons/hi2";
import { fetchProfile, getCurrentUser, setAuthReturnTo } from "../api/auth";
import { fetchMyInquiries, type Inquiry } from "../api/inquiries";
import {
  getInquiryCategoryLabel,
  getInquiryStatusLabel,
} from "../constants/inquiries";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function Inquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadInquiries = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) {
          setAuthReturnTo("/inquiries");
          navigate("/login", { replace: true });
          return;
        }

        const [profile, myInquiries] = await Promise.all([
          fetchProfile(user),
          fetchMyInquiries(),
        ]);

        if (!isMounted) {
          return;
        }

        setProfileImageUrl(profile.profileImageUrl);
        setInquiries(myInquiries);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "문의 목록을 불러오지 못했어요.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadInquiries();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-white px-5 pb-12 pt-6">
      <header className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="이전 페이지로 이동"
          onClick={() => navigate("/mypage")}
        >
          <HiArrowLeft className="size-6" aria-hidden="true" />
        </button>

        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-cream-200 bg-cream-50">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              className="size-full object-cover"
              alt="프로필"
            />
          ) : (
            <HiMiniUser className="size-7 text-brown-400" aria-hidden="true" />
          )}
        </div>
      </header>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-normal leading-10 text-brown-600">
              1:1 문의
            </h2>
            <p className="mt-3 text-base font-normal leading-7 text-[#7a625c]">
              문의 내역과 답변을 확인할 수 있어요.
            </p>
          </div>
          <button
            type="button"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brown-600 text-white shadow-md"
            aria-label="문의 작성"
            onClick={() => navigate("/inquiries/new")}
          >
            <HiPencilSquare className="size-6" aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="mt-10">
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
              아직 작성한 문의가 없습니다.
            </p>
            <button
              type="button"
              className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-brown-600 text-lg font-normal leading-7 text-white"
              onClick={() => navigate("/inquiries/new")}
            >
              문의 작성하기
            </button>
          </article>
        ) : null}

        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <button
              key={inquiry.id}
              type="button"
              className="w-full rounded-3xl bg-white px-5 py-5 text-left shadow-md"
              onClick={() => navigate(`/inquiries/${inquiry.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-normal leading-5 text-[#df7e8b]">
                    {getInquiryCategoryLabel(inquiry.category)}
                  </p>
                  <h3 className="mt-2 truncate text-xl font-normal leading-7 text-brown-600">
                    {inquiry.title}
                  </h3>
                  <p className="mt-3 text-sm font-normal leading-5 text-[#7a625c]">
                    {formatDate(inquiry.createdAt)} ·{" "}
                    {inquiry.adminReply ? "답변 있음" : "답변 대기"}
                  </p>
                </div>
                <HiChevronRight
                  className="mt-2 size-5 shrink-0 text-[#9b8179]"
                  aria-hidden="true"
                />
              </div>
              <span className="mt-4 inline-flex rounded-full bg-cream-100 px-4 py-1.5 text-sm font-normal leading-5 text-brown-600">
                {getInquiryStatusLabel(inquiry.status)}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
