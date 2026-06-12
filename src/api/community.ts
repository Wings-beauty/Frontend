import { supabase } from "../lib/supabase";
import { getCurrentUser } from "./auth";

export type PostCategory = "spring_warm" | "summer_cool" | "autumn_warm" | "winter_cool";

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  spring_warm: "봄 웜 톤톡",
  summer_cool: "여름 쿨 톤톡",
  autumn_warm: "가을 웜 톤톡",
  winter_cool: "겨울 쿨 톤톡",
};

export type BoardMeta = {
  id: PostCategory;
  label: string;
  description: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
};

export const BOARDS: BoardMeta[] = [
  {
    id: "spring_warm",
    label: "봄 웜 톤톡",
    description: "봄 웜톤에게 어울리는 컬러와 제품 이야기",
    bgColor: "#fff0eb",
    textColor: "#c4533a",
    borderColor: "#ffb7a1",
  },
  {
    id: "summer_cool",
    label: "여름 쿨 톤톡",
    description: "여름 쿨톤을 위한 청량한 뷰티 대화",
    bgColor: "#edf4fc",
    textColor: "#2f6a9e",
    borderColor: "#d7e8fa",
  },
  {
    id: "autumn_warm",
    label: "가을 웜 톤톡",
    description: "가을 웜톤의 깊고 따뜻한 컬러 이야기",
    bgColor: "#faf0e8",
    textColor: "#9c5a2a",
    borderColor: "#d9a98f",
  },
  {
    id: "winter_cool",
    label: "겨울 쿨 톤톡",
    description: "겨울 쿨톤의 선명하고 차가운 무드 이야기",
    bgColor: "#f2effe",
    textColor: "#5a3fa0",
    borderColor: "#e2d8ff",
  },
];

export function getBoardMeta(id: string): BoardMeta {
  return BOARDS.find((b) => b.id === id) ?? BOARDS[0];
}

export type CommunityPost = {
  id: number;
  userId: string;
  authorName: string;
  authorImageUrl: string | null;
  title: string;
  category: PostCategory;
  content: string;
  thumbnailUrl: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CommunityComment = {
  id: number;
  postId: number;
  userId: string;
  authorName: string;
  authorImageUrl: string | null;
  content: string;
  createdAt: string;
  isOwner: boolean;
};

type PostRow = {
  id: number;
  user_id: string;
  title: string;
  category: string;
  content: string;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_deleted: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

type CommentRow = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  is_deleted: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  nickname: string | null;
  profile_image_url: string | null;
  skin_tone: string | null;
};

async function fetchProfiles(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, ProfileRow>();
  const { data } = await supabase.from("public_profiles").select("id, nickname, profile_image_url, skin_tone").in("id", userIds).returns<ProfileRow[]>();
  return new Map((data ?? []).map((p) => [p.id, p]));
}

function getDisplayName(userId: string, profiles: Map<string, ProfileRow>) {
  const p = profiles.get(userId);
  return p?.nickname ?? "익명";
}

function mapPost(row: PostRow, profiles: Map<string, ProfileRow>): CommunityPost {
  return {
    id: row.id,
    userId: row.user_id,
    authorName: getDisplayName(row.user_id, profiles),
    authorImageUrl: profiles.get(row.user_id)?.profile_image_url ?? null,
    title: row.title,
    category: (row.category as PostCategory) ?? "free",
    content: row.content,
    thumbnailUrl: row.thumbnail_url,
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchCommunityPosts(options?: { category?: PostCategory; page?: number; pageSize?: number }) {
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 20;
  const from = page * pageSize;

  let query = supabase
    .from("community_posts")
    .select("*")
    .eq("is_deleted", false)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  const { data, error } = await query.returns<PostRow[]>();

  if (error) throw new Error(error.message || "게시글을 불러오지 못했어요.");

  const rows = data ?? [];
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const profiles = await fetchProfiles(userIds);

  return rows.map((r) => mapPost(r, profiles));
}

export async function fetchCommunityPost(postId: number) {
  const { data, error } = await supabase.from("community_posts").select("*").eq("id", postId).eq("is_deleted", false).maybeSingle<PostRow>();

  if (error) throw new Error(error.message || "게시글을 불러오지 못했어요.");
  if (!data) return null;

  const profiles = await fetchProfiles([data.user_id]);
  return mapPost(data, profiles);
}

export async function createCommunityPost(payload: { title: string; category: PostCategory; content: string; thumbnailUrl?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      title: payload.title.trim(),
      category: payload.category,
      content: payload.content.trim(),
      thumbnail_url: payload.thumbnailUrl ?? null,
    })
    .select("id")
    .single<{ id: number }>();

  if (error || !data) throw new Error(error?.message || "게시글을 작성하지 못했어요.");
  return data.id;
}

export async function updateCommunityPost(postId: number, payload: { title?: string; category?: PostCategory; content?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase
    .from("community_posts")
    .update({
      ...(payload.title !== undefined && { title: payload.title.trim() }),
      ...(payload.category !== undefined && { category: payload.category }),
      ...(payload.content !== undefined && { content: payload.content.trim() }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message || "게시글을 수정하지 못했어요.");
}

export async function deleteCommunityPost(postId: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase.from("community_posts").update({ is_deleted: true, updated_at: new Date().toISOString() }).eq("id", postId).eq("user_id", user.id);

  if (error) throw new Error(error.message || "게시글을 삭제하지 못했어요.");
}

export async function fetchCommunityComments(postId: number) {
  const { data, error } = await supabase
    .from("community_comments")
    .select("*")
    .eq("post_id", postId)
    .eq("is_deleted", false)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true })
    .returns<CommentRow[]>();

  if (error) throw new Error(error.message || "댓글을 불러오지 못했어요.");

  const rows = data ?? [];
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const profiles = await fetchProfiles(userIds);
  const currentUser = await getCurrentUser();

  return rows.map(
    (r): CommunityComment => ({
      id: r.id,
      postId: r.post_id,
      userId: r.user_id,
      authorName: getDisplayName(r.user_id, profiles),
      authorImageUrl: profiles.get(r.user_id)?.profile_image_url ?? null,
      content: r.content,
      createdAt: r.created_at,
      isOwner: currentUser?.id === r.user_id,
    }),
  );
}

export async function createCommunityComment(postId: number, content: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase.from("community_comments").insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
  });

  if (error) throw new Error(error.message || "댓글을 작성하지 못했어요.");
}

export async function deleteCommunityComment(commentId: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase.from("community_comments").update({ is_deleted: true, updated_at: new Date().toISOString() }).eq("id", commentId).eq("user_id", user.id);

  if (error) throw new Error(error.message || "댓글을 삭제하지 못했어요.");
}

export type BoardStats = {
  id: PostCategory;
  postCount: number;
  commentCount: number;
  likeCount: number;
};

export async function fetchBoardStats(): Promise<Map<PostCategory, BoardStats>> {
  const toneCategories: PostCategory[] = ["spring_warm", "summer_cool", "autumn_warm", "winter_cool"];

  const { data, error } = await supabase.from("community_posts").select("category, comment_count, like_count").in("category", toneCategories).eq("is_deleted", false).eq("is_hidden", false);

  const map = new Map<PostCategory, BoardStats>();
  for (const cat of toneCategories) {
    map.set(cat, { id: cat, postCount: 0, commentCount: 0, likeCount: 0 });
  }

  if (error || !data) return map;

  for (const row of data) {
    const cat = row.category as PostCategory;
    const s = map.get(cat);
    if (!s) continue;
    s.postCount += 1;
    s.commentCount += row.comment_count ?? 0;
    s.likeCount += row.like_count ?? 0;
  }

  return map;
}

export type ViewResult = {
  counted: boolean;
  reason: "counted" | "duplicate_24h" | "author_excluded" | "admin_excluded";
  viewCount: number;
};

export type LikeResult = {
  liked: boolean;
  changed: boolean;
  reason: "liked" | "unliked" | "login_required" | "author_excluded" | "admin_excluded";
  likeCount: number | null;
};

export async function togglePostLike(postId: number): Promise<LikeResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("toggle_post_like", { p_post_id: postId });
  if (error) throw error;
  return data as LikeResult;
}

export async function getPostLikeStatus(postId: number): Promise<{ liked: boolean }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { liked: false };
  const { data } = await supabase.from("community_post_likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
  return { liked: !!data };
}

export async function increasePostViewCount(postId: number, anonymousId: string): Promise<ViewResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("increment_post_view", {
    p_post_id: postId,
    p_anonymous_id: anonymousId,
  });
  if (error) throw error;
  return data as ViewResult;
}

export async function uploadCommunityImage(file: File, userId: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("community").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "이미지를 업로드하지 못했어요.");
  }

  const { data } = supabase.storage.from("community").getPublicUrl(path);

  return data.publicUrl;
}
