"use client";

import { useQuery } from "@tanstack/react-query";
import { HiPencilSquare, HiSparkles, HiEye, HiChatBubbleLeftRight, HiHeart, HiArrowRight } from "react-icons/hi2";
import { fetchCommunityPosts, fetchBoardStats, getBoardMeta, BOARDS, POST_CATEGORY_LABELS, type CommunityPost, type PostCategory, type BoardStats } from "../api/community";
import { getCurrentUser } from "../api/auth";
import { Button } from "../components/ui/button";
import { useNavigate, useLocation } from "../lib/router";

// ─── Post Types ────────────────────────────────────────────────────────────────

type PostType = "review" | "best_item" | "fail_item" | "question" | "pouch" | "news";

const POST_TYPE_LABELS: Record<PostType, string> = {
  review: "발색 후기",
  best_item: "인생템",
  fail_item: "실패템",
  question: "질문",
  pouch: "파우치 공유",
  news: "뉴스/팁",
};

const POST_TYPE_COLORS: Record<PostType, { bg: string; text: string }> = {
  review: { bg: "#fce7f3", text: "#be185d" },
  best_item: { bg: "#fff7ed", text: "#c2410c" },
  fail_item: { bg: "#f3f4f6", text: "#4b5563" },
  question: { bg: "#eff6ff", text: "#1d4ed8" },
  pouch: { bg: "#faf5ff", text: "#7c3aed" },
  news: { bg: "#ecfdf5", text: "#065f46" },
};

function derivePostType(post: CommunityPost): PostType {
  const t = (post.title + " " + post.content).toLowerCase();
  if (t.includes("실패") || t.includes("별로") || t.includes("후회")) return "fail_item";
  if (t.includes("인생") || t.includes("최애") || t.includes("재구매")) return "best_item";
  if (t.includes("파우치") || t.includes("구성") || t.includes("구비")) return "pouch";
  if (t.includes("?") || t.includes("추천해") || t.includes("어떤") || t.includes("뭐가") || t.includes("추천 부탁")) return "question";
  if (t.includes("팁") || t.includes("트렌드") || t.includes("출시") || t.includes("신제품")) return "news";
  return "review";
}

// ─── Tone filter config ────────────────────────────────────────────────────────

type ToneFilter = { id: PostCategory | null; label: string };

const TONE_FILTERS: ToneFilter[] = [
  { id: null, label: "전체" },
  { id: "spring_warm", label: "봄 웜" },
  { id: "summer_cool", label: "여름 쿨" },
  { id: "autumn_warm", label: "가을 웜" },
  { id: "winter_cool", label: "겨울 쿨" },
];

// ─── Utils ─────────────────────────────────────────────────────────────────────

function relativeDate(value: string) {
  const ms = Date.now() - new Date(value).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection({ isLoggedIn, navigate }: { isLoggedIn: boolean; navigate: (to: string) => void }) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl px-6 py-9"
      style={{
        background: "linear-gradient(135deg, #fff5f0 0%, #fdf0f8 45%, #f2effe 100%)",
      }}
    >
      {/* Tone blobs */}
      <div className="pointer-events-none absolute -top-8 -right-8 size-36 rounded-full opacity-40 blur-3xl" style={{ background: "#ffb7a1" }} />
      <div className="pointer-events-none absolute -bottom-6 left-0 size-28 rounded-full opacity-30 blur-2xl" style={{ background: "#d7e8fa" }} />
      <div className="pointer-events-none absolute right-16 bottom-6 size-20 rounded-full opacity-35 blur-2xl" style={{ background: "#e2d8ff" }} />

      {/* Color dots row */}
      <div className="relative mb-4 flex items-center gap-2">
        <div className="flex gap-1.5">
          {[
            { color: "#ffb7a1", label: "봄" },
            { color: "#d7e8fa", label: "여름" },
            { color: "#d9a98f", label: "가을" },
            { color: "#e2d8ff", label: "겨울" },
          ].map(({ color, label }) => (
            <div key={label} title={label} className="size-3.5 rounded-full ring-1 ring-white/70" style={{ backgroundColor: color }} />
          ))}
        </div>
        <span className="text-brown-300 text-xs">4가지 퍼스널 컬러</span>
      </div>

      <div className="relative">
        <h1 className="text-brown-600 text-[1.6rem] leading-tight font-bold">
          톤별 <span style={{ color: "#c4533a" }}>톤톡</span>
        </h1>
        <p className="text-brown-400 mt-2.5 text-sm leading-[1.75]">
          나와 같은 톤의 사람들이 남긴
          <br />
          발색 후기, 실패템, 인생템 이야기를 확인해보세요.
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button size="sm" onClick={() => navigate(isLoggedIn ? "/community/new" : "/login")} className="flex items-center gap-1.5">
            <HiPencilSquare className="size-4" />
            글쓰기
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/photo")} className="border-cream-300 text-brown-500 flex items-center gap-1.5 bg-white/70 hover:bg-white">
            <HiSparkles className="size-4" />내 톤 진단하기
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Tone filter tabs ──────────────────────────────────────────────────────────

function ToneTabs({ active, onSelect }: { active: PostCategory | null; onSelect: (id: PostCategory | null) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TONE_FILTERS.map((f) => {
        const isActive = f.id === active;
        const board = f.id ? getBoardMeta(f.id) : null;
        return (
          <button
            key={String(f.id)}
            type="button"
            onClick={() => onSelect(f.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition active:scale-95"
            style={
              isActive
                ? {
                    backgroundColor: board?.bgColor ?? "#f5f0eb",
                    color: board?.textColor ?? "#2b211f",
                    borderColor: board?.borderColor ?? "#eadfd2",
                  }
                : { backgroundColor: "white", color: "#725c53", borderColor: "#eadfd2" }
            }
          >
            {f.id && board && <div className="size-2 shrink-0 rounded-full" style={{ backgroundColor: board.borderColor }} />}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Popular posts (horizontal scroll) ────────────────────────────────────────

function PopularPosts({ posts, navigate }: { posts: CommunityPost[]; navigate: (to: string) => void }) {
  if (posts.length === 0) return null;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-brown-300 text-xs font-semibold tracking-widest uppercase">인기 톤톡</h2>
        <span className="text-brown-300 text-xs">지금 많이 보는 글</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => {
          const board = getBoardMeta(post.category);
          const ptype = derivePostType(post);
          const tc = POST_TYPE_COLORS[ptype];
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => navigate(`/community/${post.id}`)}
              className="border-cream-200 hover:border-cream-300 hover:bg-cream-50/50 flex w-48 shrink-0 flex-col rounded-2xl border bg-white p-4 text-left transition active:scale-[0.97]"
            >
              {/* Board badge */}
              <span
                className="mb-2 self-start rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: board.bgColor, color: board.textColor, border: `1px solid ${board.borderColor}` }}
              >
                {POST_CATEGORY_LABELS[post.category]}
              </span>

              {/* Type badge */}
              <span className="mb-2.5 self-start rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: tc.bg, color: tc.text }}>
                {POST_TYPE_LABELS[ptype]}
              </span>

              <p className="text-brown-600 line-clamp-3 flex-1 text-[13px] leading-[1.45] font-semibold">{post.title}</p>

              <div className="text-brown-300 mt-3 flex items-center gap-2.5 text-[11px]">
                <span className="flex items-center gap-1">
                  <HiChatBubbleLeftRight className="size-3" />
                  {post.commentCount}
                </span>
                <span className="flex items-center gap-1">
                  <HiEye className="size-3" />
                  {post.viewCount}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Feed card ─────────────────────────────────────────────────────────────────

function FeedCard({ post, navigate }: { post: CommunityPost; navigate: (to: string) => void }) {
  const board = getBoardMeta(post.category);
  const ptype = derivePostType(post);
  const tc = POST_TYPE_COLORS[ptype];

  const bodyText = post.content
    .replace(/\n/g, " ")
    .replace(/#[\w가-힣]+/g, "")
    .trim();
  const hashtags = (post.content.match(/#[\w가-힣]+/g) ?? []).slice(0, 4);

  return (
    <button
      type="button"
      onClick={() => navigate(`/community/${post.id}`)}
      // Mobile: 독립 카드  |  Desktop: 리스트 아이템 (border-bottom)
      className="w-full text-left transition active:scale-[0.99]
        rounded-2xl border border-cream-200 bg-white p-4 hover:border-cream-300
        sm:rounded-none sm:border-0 sm:border-b sm:border-cream-100 sm:bg-transparent sm:px-0 sm:py-5 sm:last:border-b-0 sm:hover:bg-cream-50/30"
    >
      {/* Badges */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: board.bgColor, color: board.textColor, border: `1px solid ${board.borderColor}` }}
        >
          {POST_CATEGORY_LABELS[post.category]}
        </span>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: tc.bg, color: tc.text }}>
          {POST_TYPE_LABELS[ptype]}
        </span>
      </div>

      {/* Desktop: 텍스트 왼쪽 + 썸네일 오른쪽 */}
      <div className="sm:flex sm:items-start sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-brown-600 line-clamp-2 text-[14px] leading-[1.55] font-semibold">{post.title}</h3>
          {bodyText && <p className="text-brown-400 mt-1 line-clamp-2 text-[12px] leading-[1.65]">{bodyText}</p>}

          {/* Mobile 전용: 썸네일 (텍스트 아래 전체 폭) */}
          {post.thumbnailUrl && (
            <div className="mt-3 sm:hidden">
              <img
                src={post.thumbnailUrl}
                alt=""
                className="border-cream-100 aspect-[16/9] w-full rounded-xl border object-cover"
              />
            </div>
          )}

          {hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hashtags.map((tag) => (
                <span key={tag} className="text-brown-300 text-[11px]">{tag}</span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="text-brown-300 flex items-center gap-1.5 text-[11px]">
              <span>{post.authorName}</span>
              <span>·</span>
              <span>{relativeDate(post.createdAt)}</span>
            </div>
            <div className="text-brown-300 flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <HiChatBubbleLeftRight className="size-3.5" />
                {post.commentCount}
              </span>
              <span className="flex items-center gap-1">
                <HiHeart className="size-3.5" />
                {post.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <HiEye className="size-3.5" />
                {post.viewCount}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop 전용: 오른쪽 썸네일 */}
        {post.thumbnailUrl && (
          <img
            src={post.thumbnailUrl}
            alt=""
            className="border-cream-200 hidden size-20 shrink-0 rounded-xl border object-cover sm:block"
          />
        )}
      </div>
    </button>
  );
}

// ─── Feed section ──────────────────────────────────────────────────────────────

function FeedSection({
  posts,
  isLoading,
  activeBoard,
  isLoggedIn,
  navigate,
}: {
  posts: CommunityPost[];
  isLoading: boolean;
  activeBoard: PostCategory | null;
  isLoggedIn: boolean;
  navigate: (to: string) => void;
}) {
  const label = activeBoard ? getBoardMeta(activeBoard).label : "전체 피드";
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-brown-300 text-xs font-semibold tracking-widest uppercase">{label}</h2>
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => navigate(activeBoard ? `/community/new?board=${activeBoard}` : "/community/new")}
            className="text-brown-300 hover:text-brown-500 flex items-center gap-1 text-[12px] transition"
          >
            <HiPencilSquare className="size-3.5" />
            글쓰기
          </button>
        )}
      </div>

      {/* Mobile: 카드 목록(gap), Desktop: 흰 패널(border) 안에 리스트 */}
      <div className="flex flex-col gap-3 sm:gap-0 sm:rounded-2xl sm:border sm:border-cream-200 sm:bg-white">
        {isLoading ? (
          // 스켈레톤
          <div className="divide-cream-100 flex flex-col gap-3 sm:gap-0 sm:divide-y sm:px-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-cream-200 bg-white p-4 sm:rounded-none sm:border-0 sm:bg-transparent sm:py-5">
                <div className="mb-3 flex gap-2">
                  <div className="bg-cream-100 h-3 w-16 animate-pulse rounded-full" />
                  <div className="bg-cream-100 h-3 w-10 animate-pulse rounded-full" />
                </div>
                <div className="bg-cream-100 mb-2 h-4 w-3/4 animate-pulse rounded-full" />
                <div className="bg-cream-100 h-3 w-full animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-cream-200 bg-white py-16 text-center sm:rounded-none sm:border-0">
            <HiPencilSquare className="text-cream-300 size-10" />
            <p className="text-brown-300 mt-3 text-sm">아직 게시글이 없어요.</p>
            {isLoggedIn && (
              <Button size="sm" className="mt-4" onClick={() => navigate(activeBoard ? `/community/new?board=${activeBoard}` : "/community/new")}>
                첫 글 작성하기
              </Button>
            )}
          </div>
        ) : (
          // Mobile: gap으로 카드 나열 / Desktop: px-4 padding, 내부에서 border-b
          <div className="flex flex-col gap-3 sm:gap-0 sm:px-4">
            {posts.map((post) => (
              <FeedCard key={post.id} post={post} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function Community() {
  const navigate = useNavigate();
  const location = useLocation();

  const boardParam = new URLSearchParams(location.search).get("board") as PostCategory | null;
  const validBoards = BOARDS.map((b) => b.id) as string[];
  const activeBoard: PostCategory | null = boardParam && validBoards.includes(boardParam) ? boardParam : null;

  const postsQuery = useQuery({
    queryKey: ["community-posts", activeBoard],
    queryFn: () => fetchCommunityPosts({ category: activeBoard ?? undefined, pageSize: 30 }),
    refetchOnMount: "always",
  });

  const statsQuery = useQuery({
    queryKey: ["community-board-stats"],
    queryFn: fetchBoardStats,
    staleTime: 5 * 60_000,
  });

  const authQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });

  const posts = postsQuery.data ?? [];
  const statsMap = statsQuery.data ?? new Map<PostCategory, BoardStats>();
  const isLoggedIn = Boolean(authQuery.data);
  const isLoading = postsQuery.isLoading;

  const popularPosts = [...posts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 4);

  const handleFilterSelect = (id: PostCategory | null) => {
    navigate(id ? `/community?board=${id}` : "/community");
  };

  return (
    <main className="app-page px-4 pt-5 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-7">
        <HeroSection isLoggedIn={isLoggedIn} navigate={navigate} />

        <ToneTabs active={activeBoard} onSelect={handleFilterSelect} />

        {!isLoading && popularPosts.length > 0 && <PopularPosts posts={popularPosts} navigate={navigate} />}

        <FeedSection posts={posts} isLoading={isLoading} activeBoard={activeBoard} isLoggedIn={isLoggedIn} navigate={navigate} />
      </div>
    </main>
  );
}
