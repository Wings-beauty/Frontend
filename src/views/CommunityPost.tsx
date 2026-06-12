"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HiArrowLeft, HiChatBubbleLeftRight, HiHeart, HiTrash } from "react-icons/hi2";
import {
  fetchCommunityPost,
  fetchCommunityComments,
  createCommunityComment,
  deleteCommunityPost,
  deleteCommunityComment,
  togglePostLike,
  getPostLikeStatus,
  increasePostViewCount,
  getBoardMeta,
  POST_CATEGORY_LABELS,
  type CommunityPost,
  type CommunityComment,
} from "../api/community";
import { getAnonymousId } from "../lib/anonymousId";
import { getCurrentUserProfile } from "../api/auth";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useNavigate, useParams } from "../lib/router";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    return <img src={imageUrl} alt={name} className="size-8 rounded-full object-cover" />;
  }
  return <div className="bg-cream-200 text-brown-400 flex size-8 items-center justify-center rounded-full text-sm font-medium">{name.charAt(0)}</div>;
}

export default function CommunityPostDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const postId = Number(id);
  const queryClient = useQueryClient();

  const [commentInput, setCommentInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const postQuery = useQuery({
    queryKey: ["community-post", postId],
    queryFn: () => fetchCommunityPost(postId),
    enabled: Number.isFinite(postId),
  });

  const commentsQuery = useQuery({
    queryKey: ["community-comments", postId],
    queryFn: () => fetchCommunityComments(postId),
    enabled: Number.isFinite(postId),
  });

  const profileQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUserProfile,
    staleTime: Infinity,
  });

  const likeQuery = useQuery({
    queryKey: ["community-post-like", postId],
    queryFn: () => getPostLikeStatus(postId),
    enabled: Number.isFinite(postId),
    staleTime: Infinity,
  });

  const likeMutation = useMutation({
    mutationFn: () => togglePostLike(postId),
    onSuccess: (result) => {
      if (result.reason === "login_required") {
        navigate("/login");
        return;
      }
      if (!result.changed) return;
      // 상세 캐시 업데이트
      queryClient.setQueryData(["community-post-like", postId], { liked: result.liked });
      if (result.likeCount !== null) {
        const nextLikeCount = result.likeCount as number;
        queryClient.setQueryData(["community-post", postId], (prev: CommunityPost | null | undefined) =>
          prev ? { ...prev, likeCount: nextLikeCount } : prev,
        );
        // 목록 캐시도 즉시 반영 (["community-posts", *] 모두)
        queryClient.setQueriesData<CommunityPost[]>(
          { queryKey: ["community-posts"] },
          (prev) => prev?.map((p) => p.id === postId ? { ...p, likeCount: nextLikeCount } : p),
        );
      }
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => createCommunityComment(postId, text),
    onSuccess: () => {
      setCommentInput("");
      void queryClient.invalidateQueries({ queryKey: ["community-comments", postId] });
      queryClient.setQueriesData<CommunityPost[]>(
        { queryKey: ["community-posts"] },
        (prev) => prev?.map((p) => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p),
      );
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteCommunityComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-comments", postId] });
      queryClient.setQueriesData<CommunityPost[]>(
        { queryKey: ["community-posts"] },
        (prev) => prev?.map((p) => p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p),
      );
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deleteCommunityPost(postId),
    onSuccess: () => {
      navigate(post?.category ? `/community?board=${post.category}` : "/community", { replace: true });
    },
  });

  const viewMutation = useMutation({
    mutationFn: ({ contentId, anonymousId }: { contentId: number; anonymousId: string }) =>
      increasePostViewCount(contentId, anonymousId),
    onSuccess: (result) => {
      if (!result.counted) return;
      queryClient.setQueryData(["community-post", postId], (prev: CommunityPost | null | undefined) =>
        prev ? { ...prev, viewCount: result.viewCount } : prev,
      );
      queryClient.setQueriesData<CommunityPost[]>(
        { queryKey: ["community-posts"] },
        (prev) => prev?.map((p) => p.id === postId ? { ...p, viewCount: result.viewCount } : p),
      );
    },
  });

  useEffect(() => {
    if (!Number.isFinite(postId)) return;
    const timer = setTimeout(() => {
      viewMutation.mutate({ contentId: postId, anonymousId: getAnonymousId() });
    }, 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (!Number.isFinite(postId)) {
    navigate("/community", { replace: true });
    return null;
  }

  const post = postQuery.data ?? null;
  const comments = commentsQuery.data ?? [];
  const currentUserId = profileQuery.data?.id ?? null;
  const isLiked = likeQuery.data?.liked ?? false;
  const isLoading = postQuery.isLoading;
  const errorMessage = postQuery.error instanceof Error ? postQuery.error.message : postQuery.isError ? "게시글을 불러오지 못했어요." : "";
  const commentError = addCommentMutation.error instanceof Error ? addCommentMutation.error.message : "";

  const handleSubmitComment = () => {
    const text = commentInput.trim();
    if (!text || addCommentMutation.isPending) return;
    addCommentMutation.mutate(text);
  };

  const handleDeletePost = () => {
    if (!confirm("게시글을 삭제할까요?")) return;
    deletePostMutation.mutate();
  };

  return (
    <main className="app-page px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-5">
        <header className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" aria-label="게시판으로 이동" onClick={() => navigate(post ? `/community?board=${post.category}` : "/community")}>
            <HiArrowLeft className="size-6" aria-hidden="true" />
          </Button>
          {post ? (
            <>
              <div
                className="size-6 shrink-0 rounded-full"
                style={{
                  backgroundColor: getBoardMeta(post.category).bgColor,
                  border: `1.5px solid ${getBoardMeta(post.category).borderColor}`,
                }}
              />
              <h1 className="flex-1 text-base font-medium" style={{ color: getBoardMeta(post.category).textColor }}>
                {POST_CATEGORY_LABELS[post.category]}
              </h1>
            </>
          ) : (
            <h1 className="text-brown-600 flex-1 text-xl leading-7">커뮤니티</h1>
          )}
          <div className="size-10" aria-hidden="true" />
        </header>

        {isLoading ? <div className="h-64 animate-pulse rounded-[32px] bg-white" /> : null}
        {errorMessage ? <p className="bg-red/5 text-red rounded-2xl px-4 py-3 text-sm leading-6">{errorMessage}</p> : null}

        {!isLoading && post ? (
          <>
            <article className="app-panel px-7 py-8">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={post.authorName} imageUrl={post.authorImageUrl} />
                  <div>
                    <p className="text-brown-600 text-sm font-medium">{post.authorName}</p>
                    <p className="text-brown-300 text-xs">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="text-brown-400 border-brown-200 text-xs">{POST_CATEGORY_LABELS[post.category]}</Badge>
                  {currentUserId === post.userId ? (
                    <Button type="button" variant="ghost" size="icon" className="text-brown-300 hover:text-red size-8" disabled={deletePostMutation.isPending} onClick={handleDeletePost}>
                      <HiTrash className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </div>

              <h2 className="text-brown-600 mt-6 text-2xl leading-9 font-medium break-keep">{post.title}</h2>

              {post.thumbnailUrl && (
                <div className="border-cream-200 mt-4 size-96 overflow-hidden rounded-2xl border">
                  <img src={post.thumbnailUrl} alt="첨부 이미지" className="object-fill" />
                </div>
              )}

              <p className="text-brown-600 mt-4 text-base leading-7 whitespace-pre-line">{post.content}</p>

              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  disabled={likeMutation.isPending}
                  onClick={() => likeMutation.mutate()}
                  className="flex items-center gap-1.5 text-sm transition disabled:opacity-40"
                  style={{ color: isLiked ? "#e05c5c" : "#b8a99f" }}
                  aria-label={isLiked ? "좋아요 취소" : "좋아요"}
                >
                  <HiHeart className="size-5" style={{ fill: isLiked ? "#e05c5c" : "none", stroke: isLiked ? "#e05c5c" : "#b8a99f", strokeWidth: 1.5 }} />
                  {post.likeCount}
                </button>
                <span className="text-brown-300 flex items-center gap-1.5 text-sm">
                  <HiChatBubbleLeftRight className="size-4" />
                  댓글 {comments.length}
                </span>
              </div>
            </article>

            <section className="app-panel px-7 py-6">
              <h3 className="text-brown-600 mb-4 text-base font-medium">댓글 {comments.length}개</h3>

              {commentError ? <p className="bg-red/5 text-red mb-3 rounded-xl px-4 py-2 text-sm">{commentError}</p> : null}

              {comments.length === 0 ? (
                <p className="text-brown-300 py-4 text-center text-sm">첫 댓글을 남겨보세요.</p>
              ) : (
                <ul className="divide-cream-100 flex flex-col divide-y">
                  {comments.map((comment) => (
                    <li key={comment.id} className="flex items-start gap-3 py-4">
                      <Avatar name={comment.authorName} imageUrl={comment.authorImageUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-brown-600 text-sm font-medium">{comment.authorName}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-brown-300 text-xs">{formatDate(comment.createdAt)}</p>
                            {comment.isOwner ? (
                              <button
                                type="button"
                                className="text-brown-300 hover:text-red transition disabled:opacity-40"
                                disabled={deleteCommentMutation.isPending}
                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                              >
                                <HiTrash className="size-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <p className="text-brown-500 mt-1 text-sm whitespace-pre-line">{comment.content}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {currentUserId ? (
                <div className="mt-4 flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    rows={2}
                    className="border-cream-200 bg-cream-50 text-brown-600 placeholder:text-brown-300 focus:ring-brown-300 flex-1 resize-none rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitComment();
                    }}
                  />
                  <Button type="button" size="sm" disabled={!commentInput.trim() || addCommentMutation.isPending} onClick={handleSubmitComment} className="self-end">
                    등록
                  </Button>
                </div>
              ) : (
                <p className="text-brown-300 mt-4 text-center text-sm">
                  댓글을 작성하려면{" "}
                  <button type="button" className="text-brown-600 underline" onClick={() => navigate("/login")}>
                    로그인
                  </button>
                  하세요.
                </p>
              )}
            </section>
          </>
        ) : null}

        {!isLoading && !post && !errorMessage ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-[32px] bg-white p-8 text-center">
            <p className="text-brown-600 text-lg leading-7">게시글을 찾을 수 없어요.</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
