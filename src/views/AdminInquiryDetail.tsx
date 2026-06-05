"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "../lib/router";
import { HiArrowLeft, HiShieldCheck } from "react-icons/hi2";
import { getCurrentUser, requireAdmin, setAuthReturnTo } from "../api/auth";
import {
  fetchAdminInquiry,
  saveAdminInquiryReply,
  updateAdminInquiryStatus,
  type Inquiry,
} from "../api/inquiries";
import {
  getInquiryCategoryLabel,
  getInquiryStatusLabel,
  inquiryStatuses,
  inquiryStatusLabels,
  type InquiryStatus,
} from "../constants/inquiries";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminInquiryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<InquiryStatus>("pending");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadInquiry = async () => {
    if (!id) {
      setErrorMessage("문의 정보를 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const user = await getCurrentUser();

      if (!user) {
        setAuthReturnTo(`/admin/inquiries/${id}`);
        navigate("/login", { replace: true });
        return;
      }

      await requireAdmin();
      const nextInquiry = await fetchAdminInquiry(id);

      setInquiry(nextInquiry);

      if (nextInquiry) {
        setStatus(nextInquiry.status);
        setReply(nextInquiry.adminReply ?? "");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "관리자 문의 상세를 불러오지 못했어요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInquiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveStatus = async () => {
    if (!id) {
      return;
    }

    setIsSavingStatus(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateAdminInquiryStatus(id, status);
      await loadInquiry();
      setSuccessMessage("상태가 저장되었습니다.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "상태 저장에 실패했어요.",
      );
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSaveReply = async () => {
    if (!id) {
      return;
    }

    if (!reply.trim()) {
      setErrorMessage("답변 내용을 입력해주세요.");
      return;
    }

    setIsSavingReply(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await saveAdminInquiryReply({
        inquiryId: id,
        reply,
        status: "answered",
      });
      await loadInquiry();
      setSuccessMessage("답변이 저장되었습니다.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "답변 저장에 실패했어요.",
      );
    } finally {
      setIsSavingReply(false);
    }
  };

  return (
    <main className="min-h-dvh bg-white px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="목록으로 이동"
          onClick={() => navigate("/admin/inquiries")}
        >
          <HiArrowLeft className="size-6" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">
          문의 답변
        </h1>
        <div className="flex size-10 items-center justify-center rounded-full bg-cream-100 text-brown-600">
          <HiShieldCheck className="size-6" aria-hidden="true" />
        </div>
      </header>

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
            <h2 className="mt-5 text-2xl font-normal leading-8 text-brown-600">
              {inquiry.title}
            </h2>
            <p className="mt-3 text-sm font-normal leading-5 text-[#7a625c]">
              작성자{" "}
              {inquiry.authorNickname ?? inquiry.authorEmail ?? inquiry.displayUserId ?? inquiry.userId}
            </p>
            <p className="mt-1 text-sm font-normal leading-5 text-[#7a625c]">
              작성자 ID {inquiry.displayUserId ?? inquiry.userId}
            </p>
            <p className="mt-1 text-sm font-normal leading-5 text-[#7a625c]">
              작성자 이메일 {inquiry.authorEmail ?? "-"}
            </p>
            <p className="mt-1 text-sm font-normal leading-5 text-[#7a625c]">
              작성일 {formatDate(inquiry.createdAt)}
            </p>
            <p className="mt-7 whitespace-pre-wrap text-base font-normal leading-7 text-[#3a2527]">
              {inquiry.content}
            </p>
          </article>

          <article className="rounded-3xl bg-cream-50 px-6 py-7">
            <h3 className="text-xl font-normal leading-8 text-brown-600">
              기존 답변
            </h3>
            {inquiry.adminReply ? (
              <>
                <p className="mt-3 text-sm font-normal leading-5 text-[#7a625c]">
                  답변일 {formatDate(inquiry.repliedAt)} · 답변자{" "}
                  {inquiry.repliedBy ?? "-"}
                </p>
                <p className="mt-5 whitespace-pre-wrap text-base font-normal leading-7 text-[#3a2527]">
                  {inquiry.adminReply}
                </p>
              </>
            ) : (
              <p className="mt-5 text-base font-normal leading-7 text-[#7a625c]">
                아직 등록된 답변이 없습니다.
              </p>
            )}
          </article>

          <article className="rounded-3xl bg-white px-6 py-7 shadow-lg">
            <label className="block">
              <span className="text-lg font-normal leading-7 text-brown-600">
                상태 변경
              </span>
              <select
                className="mt-4 h-14 w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 text-base font-normal leading-6 text-brown-600 outline-none"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as InquiryStatus)
                }
              >
                {inquiryStatuses.map((item) => (
                  <option key={item} value={item}>
                    {inquiryStatusLabels[item]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="mt-5 flex h-13 w-full items-center justify-center rounded-full bg-cream-100 text-base font-normal leading-6 text-brown-600 disabled:opacity-60"
              disabled={isSavingStatus}
              onClick={handleSaveStatus}
            >
              {isSavingStatus ? "상태 저장 중" : "상태만 저장하기"}
            </button>
          </article>

          <article className="rounded-3xl bg-white px-6 py-7 shadow-lg">
            <label
              htmlFor="admin-reply"
              className="text-lg font-normal leading-7 text-brown-600"
            >
              답변 작성/수정
            </label>
            <textarea
              id="admin-reply"
              className="mt-4 min-h-48 w-full resize-none rounded-2xl border border-cream-200 bg-cream-50 px-4 py-4 text-base font-normal leading-7 text-brown-600 outline-none placeholder:text-[#b9aaa4]"
              value={reply}
              placeholder="사용자에게 전달할 답변을 입력해주세요."
              onChange={(event) => setReply(event.target.value)}
            />
            <button
              type="button"
              className="mt-5 flex h-14 w-full items-center justify-center rounded-full bg-brown-600 text-lg font-normal leading-7 text-white shadow-lg disabled:opacity-60"
              disabled={isSavingReply}
              onClick={handleSaveReply}
            >
              {isSavingReply ? "답변 저장 중" : "답변 저장하고 완료 처리"}
            </button>
          </article>

          {successMessage ? (
            <p className="text-center text-sm font-normal leading-5 text-[#6bb594]">
              {successMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="text-center text-sm font-normal leading-5 text-[#c4544a]">
              {errorMessage}
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
