"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "../lib/router";
import { HiArrowLeft, HiCheck } from "react-icons/hi2";
import { requireAdmin } from "../api/auth";
import { fetchAdminInquiry, saveAdminInquiryReply, updateAdminInquiryStatus, type Inquiry } from "../api/inquiries";
import { getInquiryCategoryLabel, getInquiryStatusLabel, inquiryStatuses, inquiryStatusLabels, type InquiryStatus } from "../constants/inquiries";
import { Button } from "../components/ui/button";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

const statusBadgeClass: Record<InquiryStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  answered: "bg-green-100 text-green-700",
  closed: "bg-cream-100 text-brown-400",
};

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

  const load = async () => {
    if (!id) { setErrorMessage("문의 정보를 찾을 수 없습니다."); setIsLoading(false); return; }
    try {
      await requireAdmin();
      const data = await fetchAdminInquiry(id);
      setInquiry(data);
      if (data) { setStatus(data.status); setReply(data.adminReply ?? ""); }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "문의를 불러오지 못했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveStatus = async () => {
    if (!id) return;
    setIsSavingStatus(true); setErrorMessage(""); setSuccessMessage("");
    try {
      await updateAdminInquiryStatus(id, status);
      await load();
      setSuccessMessage("상태가 저장되었습니다.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "상태 저장에 실패했어요.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSaveReply = async () => {
    if (!id || !reply.trim()) { setErrorMessage("답변 내용을 입력해주세요."); return; }
    setIsSavingReply(true); setErrorMessage(""); setSuccessMessage("");
    try {
      await saveAdminInquiryReply({ inquiryId: id, reply, status: "answered" });
      await load();
      setSuccessMessage("답변이 저장되었습니다.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "답변 저장에 실패했어요.");
    } finally {
      setIsSavingReply(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/admin/inquiries")}>
          <HiArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-medium text-brown-600">문의 답변</h1>
          {inquiry ? (
            <p className="mt-0.5 text-sm text-brown-400">
              {getInquiryCategoryLabel(inquiry.category)} · {formatDate(inquiry.createdAt)}
            </p>
          ) : null}
        </div>
      </header>

      {isLoading ? <div className="h-48 rounded-2xl bg-white animate-pulse" /> : null}
      {errorMessage ? <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm text-red">{errorMessage}</p> : null}
      {successMessage ? (
        <p className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <HiCheck className="size-4" /> {successMessage}
        </p>
      ) : null}

      {inquiry ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* 왼쪽: 문의 본문 + 기존 답변 */}
          <div className="flex flex-col gap-5">
            <article className="app-panel p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cream-100 px-3 py-1 text-xs text-brown-500">{getInquiryCategoryLabel(inquiry.category)}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass[inquiry.status as InquiryStatus]}`}>
                  {getInquiryStatusLabel(inquiry.status)}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-medium text-brown-600">{inquiry.title}</h2>
              <div className="mt-3 flex flex-col gap-0.5 text-xs text-brown-400">
                <p>작성자: {inquiry.authorNickname ?? inquiry.authorEmail ?? inquiry.displayUserId ?? "-"}</p>
                <p>이메일: {inquiry.authorEmail ?? "-"}</p>
                <p>작성일: {formatDate(inquiry.createdAt)}</p>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-brown-600">{inquiry.content}</p>
            </article>

            {inquiry.adminReply ? (
              <article className="app-panel p-6">
                <h3 className="text-base font-medium text-brown-600">기존 답변</h3>
                <p className="mt-1 text-xs text-brown-400">
                  {formatDate(inquiry.repliedAt)} · {inquiry.repliedBy ?? "-"}
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-brown-600">{inquiry.adminReply}</p>
              </article>
            ) : null}
          </div>

          {/* 오른쪽: 상태 변경 + 답변 작성 */}
          <div className="flex flex-col gap-5">
            <article className="app-panel p-6">
              <h3 className="text-base font-medium text-brown-600">상태 변경</h3>
              <select
                className="mt-3 h-10 w-full rounded-xl border border-cream-200 bg-white px-3 text-sm text-brown-600 outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value as InquiryStatus)}
              >
                {inquiryStatuses.map((s) => <option key={s} value={s}>{inquiryStatusLabels[s]}</option>)}
              </select>
              <Button type="button" variant="outline" className="mt-3 w-full" disabled={isSavingStatus} onClick={handleSaveStatus}>
                {isSavingStatus ? "저장 중..." : "상태만 저장"}
              </Button>
            </article>

            <article className="app-panel p-6">
              <h3 className="text-base font-medium text-brown-600">답변 작성</h3>
              <textarea
                className="mt-3 min-h-40 w-full resize-none rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm leading-7 text-brown-600 outline-none placeholder:text-brown-300 focus:ring-2 focus:ring-brown-200"
                value={reply}
                placeholder="사용자에게 전달할 답변을 입력하세요."
                onChange={(e) => setReply(e.target.value)}
              />
              <Button type="button" className="mt-3 w-full" disabled={isSavingReply} onClick={handleSaveReply}>
                {isSavingReply ? "저장 중..." : "답변 저장 및 완료 처리"}
              </Button>
            </article>
          </div>
        </div>
      ) : null}
    </div>
  );
}
