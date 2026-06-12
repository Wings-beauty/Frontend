"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import { HiArrowLeft, HiPaperAirplane } from "react-icons/hi2";
import { getCurrentUser, setAuthReturnTo } from "../api/auth";
import { createInquiry } from "../api/inquiries";
import { inquiryCategories, inquiryCategoryLabels, type InquiryCategory } from "../constants/inquiries";

export default function NewInquiry() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<InquiryCategory>("etc");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();

      if (!user) {
        setAuthReturnTo("/inquiries/new");
        navigate("/login", { replace: true });
      }
    };

    void checkUser();
  }, [navigate]);

  const handleSubmit = async () => {
    const nextTitle = title.trim();
    const nextContent = content.trim();

    if (!category || !nextTitle || !nextContent) {
      setErrorMessage("카테고리, 제목, 내용을 모두 입력해주세요.");
      return;
    }

    if (nextContent.length < 10) {
      setErrorMessage("문의 내용을 10자 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const inquiry = await createInquiry({
        category,
        title: nextTitle,
        content: nextContent,
      });

      navigate(`/inquiries/${inquiry.id}?message=${encodeURIComponent("문의가 접수되었습니다.")}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to create inquiry:", error);
      setErrorMessage(error instanceof Error ? error.message : "문의 저장에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-page px-5 pb-12 pt-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6">
      <header className="relative flex items-center justify-between">
        <button type="button" className="flex size-10 items-center justify-center text-brown-600" aria-label="이전 페이지로 이동" onClick={() => navigate("/inquiries")}>
          <HiArrowLeft className="size-6" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-normal leading-7.5 text-brown-600">WINGS</h1>
        <div className="size-10" aria-hidden="true" />
      </header>

      <section className="mt-12">
        <h2 className="text-3xl font-normal leading-10 text-brown-600">문의 작성</h2>
        <p className="mt-3 text-base font-normal leading-7 text-[#756861]">궁금한 점을 남겨주시면 확인 후 답변드릴게요.</p>
      </section>

      <section className="mt-10 space-y-6">
        <label className="block">
          <span className="text-base font-normal leading-6 text-brown-600">문의 유형</span>
          <select
            className="mt-3 h-14 w-full rounded-2xl border border-cream-200 bg-white px-4 text-base font-normal leading-6 text-brown-600 outline-none"
            value={category}
            onChange={(event) => setCategory(event.target.value as InquiryCategory)}
          >
            {inquiryCategories.map((item) => (
              <option key={item} value={item}>
                {inquiryCategoryLabels[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-base font-normal leading-6 text-brown-600">제목</span>
          <input
            className="mt-3 h-14 w-full rounded-2xl border border-cream-200 bg-white px-4 text-base font-normal leading-6 text-brown-600 outline-none placeholder:text-[#b9aaa4]"
            value={title}
            placeholder="문의 제목을 입력해주세요"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-base font-normal leading-6 text-brown-600">문의 내용</span>
          <textarea
            className="mt-3 min-h-48 w-full resize-none rounded-2xl border border-cream-200 bg-white px-4 py-4 text-base font-normal leading-7 text-brown-600 outline-none placeholder:text-[#b9aaa4]"
            value={content}
            placeholder="문의 내용을 자세히 입력해주세요"
            onChange={(event) => setContent(event.target.value)}
          />
        </label>

        {errorMessage ? <p className="text-center text-sm font-normal leading-5 text-[#c4544a]">{errorMessage}</p> : null}

        <button
          type="button"
          className="flex h-16 w-full items-center justify-center gap-3 rounded-full bg-brown-600 text-xl font-normal leading-7 text-white shadow-[0_8px_24px_rgb(43_33_31/0.055)] disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          <HiPaperAirplane className="size-6" aria-hidden="true" />
          {isSubmitting ? "접수 중" : "문의 접수하기"}
        </button>
      </section>
      </div>
    </main>
  );
}
