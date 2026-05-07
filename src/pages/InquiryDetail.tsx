import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft, HiTrash } from "react-icons/hi2";
import { getCurrentUser, setAuthReturnTo } from "../api/auth";
import {
  fetchMyInquiry,
  softDeleteMyInquiry,
  type Inquiry,
} from "../api/inquiries";
import {
  getInquiryCategoryLabel,
  getInquiryStatusLabel,
} from "../constants/inquiries";

function formatDate(value: string | null) {
  if (!value) {
    return "정보 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function InquiryDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const successMessage = (location.state as { message?: string } | null)?.message;

  useEffect(() => {
    let isMounted = true;

    const loadInquiry = async () => {
      if (!id) {
        setErrorMessage("문의 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!user) {
          setAuthReturnTo(`/inquiries/${id}`);
          navigate("/login", { replace: true });
          return;
        }

        const nextInquiry = await fetchMyInquiry(id);

        if (isMounted) {
          setInquiry(nextInquiry);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "문의 상세를 불러오지 못했어요.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadInquiry();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!inquiry) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await softDeleteMyInquiry(inquiry.id);
      navigate("/inquiries", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "문의 삭제에 실패했어요.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-white px-5 pb-12 pt-6">
      <header className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="목록으로 이동"
          onClick={() => navigate("/inquiries")}
        >
          <HiArrowLeft className="size-6" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">
          WINGS
        </h1>
        <div className="size-10" aria-hidden="true" />
      </header>

      <section className="mt-12">
        <h2 className="text-3xl font-normal leading-10 text-brown-600">
          문의 상세
        </h2>
        {successMessage ? (
          <p className="mt-3 text-base font-normal leading-7 text-[#6bb594]">
            {successMessage}
          </p>
        ) : null}
      </section>

      {isLoading ? (
        <section className="mt-10 rounded-3xl bg-cream-50 px-6 py-8">
          <p className="text-base font-normal leading-7 text-[#7a625c]">
            문의를 불러오는 중입니다.
          </p>
        </section>
      ) : null}

      {!isLoading && !inquiry ? (
        <section className="mt-10 rounded-3xl bg-cream-50 px-6 py-8">
          <p className="text-base font-normal leading-7 text-[#7a625c]">
            문의를 찾을 수 없습니다.
          </p>
        </section>
      ) : null}

      {inquiry ? (
        <section className="mt-10 space-y-6">
          <article className="rounded-3xl bg-white px-6 py-7 shadow-lg">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-cream-100 px-4 py-1.5 text-sm font-normal leading-5 text-brown-600">
                {getInquiryCategoryLabel(inquiry.category)}
              </span>
              <span className="rounded-full bg-[#ffe9e2] px-4 py-1.5 text-sm font-normal leading-5 text-brown-600">
                {getInquiryStatusLabel(inquiry.status)}
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-normal leading-8 text-brown-600">
              {inquiry.title}
            </h3>
            <p className="mt-3 text-sm font-normal leading-5 text-[#7a625c]">
              작성일 {formatDate(inquiry.createdAt)}
            </p>
            <p className="mt-7 whitespace-pre-wrap text-base font-normal leading-7 text-[#3a2527]">
              {inquiry.content}
            </p>
          </article>

          <article className="rounded-3xl bg-cream-50 px-6 py-7">
            <h3 className="text-xl font-normal leading-8 text-brown-600">
              관리자 답변
            </h3>
            {inquiry.adminReply ? (
              <>
                <p className="mt-3 text-sm font-normal leading-5 text-[#7a625c]">
                  답변일 {formatDate(inquiry.repliedAt)}
                </p>
                <p className="mt-5 whitespace-pre-wrap text-base font-normal leading-7 text-[#3a2527]">
                  {inquiry.adminReply}
                </p>
              </>
            ) : (
              <p className="mt-5 text-base font-normal leading-7 text-[#7a625c]">
                아직 답변 대기 중입니다.
              </p>
            )}
          </article>

          {errorMessage ? (
            <p className="text-center text-sm font-normal leading-5 text-[#c4544a]">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-cream-100 text-base font-normal leading-6 text-brown-600 disabled:opacity-60"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <HiTrash className="size-5" aria-hidden="true" />
            {isDeleting ? "삭제 중" : "문의 삭제하기"}
          </button>
        </section>
      ) : null}
    </main>
  );
}
