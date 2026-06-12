"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HiArrowLeft, HiPhoto, HiXMark } from "react-icons/hi2";
import { createCommunityPost, BOARDS, uploadCommunityImage, type PostCategory } from "../api/community";
import { getCurrentUser } from "../api/auth";
import { Button } from "../components/ui/button";
import { useNavigate, useLocation } from "../lib/router";

type PostType = "review" | "best_item" | "fail_item" | "question" | "pouch" | "news";

const POST_TYPE_LABELS: Record<PostType, string> = {
  review: "발색 후기",
  best_item: "인생템",
  fail_item: "실패템",
  question: "질문",
  pouch: "파우치 공유",
  news: "뉴스/팁",
};

const POST_TYPES: PostType[] = ["review", "best_item", "fail_item", "question", "pouch", "news"];

export default function CommunityNewPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const boardParam = new URLSearchParams(location.search).get("board") as PostCategory | null;
  const defaultBoard: PostCategory | null = boardParam && BOARDS.some((b) => b.id === boardParam) ? boardParam : null;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PostCategory | null>(defaultBoard);
  const [postType, setPostType] = useState<PostType>("review");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!category) throw new Error("게시판을 선택해주세요.");
      let thumbnailUrl: string | undefined;
      if (imageFile) {
        const user = await getCurrentUser();
        if (!user) throw new Error("로그인이 필요해요.");
        thumbnailUrl = await uploadCommunityImage(imageFile, user.id);
      }
      return createCommunityPost({ title, category, content, thumbnailUrl });
    },
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      navigate(`/community/${id}`, { replace: true });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category) return;
    submitMutation.mutate();
  };

  const isSubmitting = submitMutation.isPending;
  const errorMessage = submitMutation.error instanceof Error ? submitMutation.error.message : "";

  return (
    <main className="app-page px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-5">
        <header className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" aria-label="뒤로 가기" onClick={() => navigate(category ? `/community?board=${category}` : "/community")}>
            <HiArrowLeft className="size-6" aria-hidden="true" />
          </Button>
          <h1 className="text-xl leading-7 text-brown-600">글 작성</h1>
          <div className="size-10" aria-hidden="true" />
        </header>

        <form onSubmit={handleSubmit} className="app-panel px-7 py-8 flex flex-col gap-5">
          {errorMessage ? (
            <p className="rounded-xl bg-red/5 px-4 py-3 text-sm text-red">{errorMessage}</p>
          ) : null}

          {/* Board selector */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-xs font-medium text-brown-400 uppercase tracking-wide">톤 게시판</label>
              <span className="text-[10px] font-semibold text-red">필수</span>
            </div>
            {!category && (
              <p className="mb-2 text-[12px] text-brown-300">게시판을 선택해주세요.</p>
            )}
            <div className="flex gap-2 flex-wrap">
              {BOARDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setCategory(b.id)}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition border"
                  style={
                    category === b.id
                      ? { backgroundColor: b.bgColor, color: b.textColor, borderColor: b.borderColor }
                      : { backgroundColor: "white", color: "#725c53", borderColor: "#eadfd2" }
                  }
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Post type selector */}
          <div>
            <label className="block text-xs font-medium text-brown-400 mb-2 uppercase tracking-wide">글 타입</label>
            <div className="flex gap-2 flex-wrap">
              {POST_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPostType(t)}
                  className="rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition"
                  style={
                    postType === t
                      ? { backgroundColor: "#2b211f", color: "white", borderColor: "#2b211f" }
                      : { backgroundColor: "white", color: "#725c53", borderColor: "#eadfd2" }
                  }
                >
                  {POST_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-500 mb-1.5">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              required
              maxLength={100}
              className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-brown-600 placeholder:text-brown-300 focus:outline-none focus:ring-2 focus:ring-brown-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-500 mb-1.5">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              required
              rows={10}
              className="w-full resize-none rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-brown-600 placeholder:text-brown-300 focus:outline-none focus:ring-2 focus:ring-brown-300"
            />
          </div>

          {/* 이미지 첨부 */}
          <div>
            <label className="block text-sm font-medium text-brown-500 mb-1.5">이미지 첨부 (선택)</label>
            {imagePreview ? (
              <div className="relative w-full overflow-hidden rounded-xl border border-cream-200">
                <img src={imagePreview} alt="첨부 이미지 미리보기" className="max-h-64 w-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                  aria-label="이미지 제거"
                >
                  <HiXMark className="size-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="community-image-upload"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-cream-300 bg-cream-50 px-4 py-8 text-brown-300 transition hover:border-brown-300 hover:text-brown-400"
              >
                <HiPhoto className="size-8" />
                <span className="text-sm">클릭해서 이미지를 추가하세요</span>
                <input
                  ref={fileInputRef}
                  id="community-image-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </label>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !category || !title.trim() || !content.trim()}
            className="w-full"
          >
            {isSubmitting ? "등록 중..." : "게시글 등록"}
          </Button>
        </form>
      </div>
    </main>
  );
}
