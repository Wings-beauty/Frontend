import { supabase } from "../lib/supabase";
import { getCurrentUser, requireAdmin } from "./auth";

export type NewsComment = {
  id: number;
  newsId: number;
  userId: string;
  authorName: string;
  authorImageUrl: string | null;
  content: string;
  createdAt: string;
  isOwner: boolean;
};

type NewsRow = {
  id: number;
  title: string;
  category: string | null;
  content: string;
  author_id: string | null;
  is_published: boolean | null;
  published_at: string | null;
  thumbnail_url: string | null;
  like_count: number | null;
  view_count: number | null;
};

type AuthorRow = {
  id: string;
  nickname: string | null;
  profile_image_url: string | null;
  skin_tone: string | null;
};

export type CardNewsSlide = {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
};

export type CardNewsSeo = {
  title: string;
  description: string;
  keywords: string;
};

export type CardNewsExposure = {
  isFeatured: boolean;
  targetTone: string;
};

export type CardNewsDocument = {
  version: 1;
  summary: string;
  seo: CardNewsSeo;
  exposure: CardNewsExposure;
  slides: CardNewsSlide[];
};

export type NewsItem = {
  id: number;
  title: string;
  category: string | null;
  content: string;
  document: CardNewsDocument;
  summary: string;
  preview: string;
  authorId: string | null;
  authorName: string;
  isPublished: boolean;
  publishedAt: string | null;
  thumbnailUrl: string | null;
  likeCount: number;
  viewCount: number;
};

export type SaveNewsPayload = {
  title: string;
  category: string;
  thumbnailUrl: string;
  document: CardNewsDocument;
  isPublished: boolean;
};

function createLegacySlides(content: string): CardNewsSlide[] {
  const slides = content
    .split(/\n{2,}/)
    .map((slide) => slide.trim())
    .filter(Boolean)
    .map((body, index) => ({
      id: `legacy-${index + 1}`,
      title: "",
      body,
      imageUrl: "",
    }));

  return slides.length > 0 ? slides : [{ id: "legacy-1", title: "", body: content, imageUrl: "" }];
}

export function createEmptySlide(): CardNewsSlide {
  return {
    id: crypto.randomUUID(),
    title: "",
    body: "",
    imageUrl: "",
  };
}

export function createEmptyDocument(): CardNewsDocument {
  return {
    version: 1,
    summary: "",
    seo: {
      title: "",
      description: "",
      keywords: "",
    },
    exposure: {
      isFeatured: false,
      targetTone: "all",
    },
    slides: [createEmptySlide()],
  };
}

function parseNewsDocument(content: string): CardNewsDocument {
  try {
    const parsed = JSON.parse(content) as Partial<CardNewsDocument>;

    if (parsed.version === 1 && Array.isArray(parsed.slides)) {
      return {
        version: 1,
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
        seo: {
          title: typeof parsed.seo?.title === "string" ? parsed.seo.title : "",
          description: typeof parsed.seo?.description === "string" ? parsed.seo.description : "",
          keywords: typeof parsed.seo?.keywords === "string" ? parsed.seo.keywords : "",
        },
        exposure: {
          isFeatured: Boolean(parsed.exposure?.isFeatured),
          targetTone: typeof parsed.exposure?.targetTone === "string" ? parsed.exposure.targetTone : "all",
        },
        slides: parsed.slides.map((slide, index) => ({
          id: typeof slide.id === "string" ? slide.id : `slide-${index + 1}`,
          title: typeof slide.title === "string" ? slide.title : "",
          body: typeof slide.body === "string" ? slide.body : "",
          imageUrl: typeof slide.imageUrl === "string" ? slide.imageUrl : "",
        })),
      };
    }
  } catch {
    // Legacy plain text news is handled below.
  }

  return {
    ...createEmptyDocument(),
    summary: content.replace(/\s+/g, " ").trim().slice(0, 80),
    slides: createLegacySlides(content),
  };
}

function getPreview(document: CardNewsDocument) {
  const text = document.summary || document.slides.map((slide) => `${slide.title} ${slide.body}`).join(" ");
  const compact = text.replace(/\s+/g, " ").trim();

  return compact.length > 20 ? `${compact.slice(0, 20)}...` : compact;
}

function getAuthorName(authorId: string | null, authors: Map<string, AuthorRow>) {
  if (!authorId) {
    return "WINGS";
  }

  const author = authors.get(authorId);

  return author?.nickname ?? "WINGS";
}

function mapNews(row: NewsRow, authors: Map<string, AuthorRow>): NewsItem {
  const document = parseNewsDocument(row.content);

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    document,
    summary: document.summary,
    preview: getPreview(document),
    authorId: row.author_id,
    authorName: getAuthorName(row.author_id, authors),
    isPublished: row.is_published === true,
    publishedAt: row.published_at,
    thumbnailUrl: row.thumbnail_url,
    likeCount: row.like_count ?? 0,
    viewCount: row.view_count ?? 0,
  };
}

async function fetchAuthors(authorIds: string[]) {
  if (authorIds.length === 0) {
    return new Map<string, AuthorRow>();
  }

  const { data } = await supabase.from("public_profiles").select("id, nickname, profile_image_url, skin_tone").in("id", authorIds).returns<AuthorRow[]>();

  return new Map((data ?? []).map((author) => [author.id, author]));
}

async function fetchNewsById(newsId: number, options?: { publishedOnly?: boolean }) {
  let query = supabase
    .from("news")
    .select("id, title, category, content, author_id, is_published, published_at, thumbnail_url, like_count, view_count")
    .eq("id", newsId);

  if (options?.publishedOnly) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query.maybeSingle<NewsRow>();

  if (error) {
    throw new Error(error.message || "뉴스를 불러오지 못했어요.");
  }

  if (!data) {
    return null;
  }

  const authors = await fetchAuthors(data.author_id ? [data.author_id] : []);

  return mapNews(data, authors);
}

export async function fetchPublishedNews() {
  const { data, error } = await supabase
    .from("news")
    .select("id, title, category, content, author_id, is_published, published_at, thumbnail_url, like_count, view_count")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .returns<NewsRow[]>();

  if (error) {
    throw new Error(error.message || "뉴스를 불러오지 못했어요.");
  }

  const authorIds = Array.from(new Set((data ?? []).map((row) => row.author_id).filter((id): id is string => Boolean(id))));
  const authors = await fetchAuthors(authorIds);

  return (data ?? []).map((row) => mapNews(row, authors));
}

export async function fetchPublishedNewsDetail(newsId: number) {
  return fetchNewsById(newsId, { publishedOnly: true });
}

export async function fetchAdminNewsDetail(newsId: number) {
  await requireAdmin();

  return fetchNewsById(newsId);
}

function serializeDocument(document: CardNewsDocument) {
  return JSON.stringify({
    ...document,
    slides: document.slides.map((slide) => ({
      id: slide.id || crypto.randomUUID(),
      title: slide.title.trim(),
      body: slide.body.trim(),
      imageUrl: slide.imageUrl.trim(),
    })),
  });
}

export async function saveNews(payload: SaveNewsPayload, newsId?: number) {
  await requireAdmin();
  const user = await getCurrentUser();
  const title = payload.title.trim();
  const category = payload.category.trim();
  const thumbnailUrl = payload.thumbnailUrl.trim();
  const content = serializeDocument(payload.document);

  if (!title) {
    throw new Error("제목은 필수입니다.");
  }

  if (payload.document.slides.length === 0) {
    throw new Error("카드뉴스 슬라이드를 1장 이상 추가해주세요.");
  }

  const row = {
    title,
    category: category || null,
    content,
    author_id: user?.id ?? null,
    is_published: payload.isPublished,
    published_at: payload.isPublished ? new Date().toISOString() : null,
    thumbnail_url: thumbnailUrl || null,
  };

  if (newsId) {
    const { error } = await supabase.from("news").update(row).eq("id", newsId);

    if (error) {
      throw new Error(error.message || "뉴스를 저장하지 못했어요.");
    }

    return newsId;
  }

  const { data, error } = await supabase.from("news").insert(row).select("id").single<{ id: number }>();

  if (error || !data) {
    throw new Error(error?.message || "뉴스를 저장하지 못했어요.");
  }

  return data.id;
}

export async function uploadNewsImage(file: File) {
  await requireAdmin();

  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("news").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "이미지를 업로드하지 못했어요. Supabase Storage의 news 버킷을 확인해주세요.");
  }

  const { data } = supabase.storage.from("news").getPublicUrl(path);

  return data.publicUrl;
}

type NewsCommentRow = {
  id: number;
  news_id: number;
  user_id: string;
  content: string;
  is_deleted: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

type CommentAuthorRow = {
  id: string;
  nickname: string | null;
  profile_image_url: string | null;
  skin_tone: string | null;
};

async function fetchCommentAuthors(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, CommentAuthorRow>();
  const { data } = await supabase
    .from("public_profiles")
    .select("id, nickname, profile_image_url, skin_tone")
    .in("id", userIds)
    .returns<CommentAuthorRow[]>();
  return new Map((data ?? []).map((p) => [p.id, p]));
}

export async function fetchNewsComments(newsId: number): Promise<NewsComment[]> {
  const { data, error } = await supabase
    .from("news_comments")
    .select("*")
    .eq("news_id", newsId)
    .eq("is_deleted", false)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true })
    .returns<NewsCommentRow[]>();

  if (error) throw new Error(error.message || "댓글을 불러오지 못했어요.");

  const rows = data ?? [];
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const profiles = await fetchCommentAuthors(userIds);
  const currentUser = await getCurrentUser();

  return rows.map((r) => ({
    id: r.id,
    newsId: r.news_id,
    userId: r.user_id,
    authorName: profiles.get(r.user_id)?.nickname ?? "익명",
    authorImageUrl: profiles.get(r.user_id)?.profile_image_url ?? null,
    content: r.content,
    createdAt: r.created_at,
    isOwner: currentUser?.id === r.user_id,
  }));
}

export async function createNewsComment(newsId: number, content: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase.from("news_comments").insert({
    news_id: newsId,
    user_id: user.id,
    content: content.trim(),
  });

  if (error) throw new Error(error.message || "댓글을 작성하지 못했어요.");
}

export async function deleteNewsComment(commentId: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase
    .from("news_comments")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message || "댓글을 삭제하지 못했어요.");
}

export type LikeResult = {
  liked: boolean;
  changed: boolean;
  reason: "liked" | "unliked" | "login_required" | "author_excluded" | "admin_excluded";
  likeCount: number | null;
};

export async function toggleNewsLike(newsId: number): Promise<LikeResult> {
  const { data, error } = await supabase.rpc("toggle_news_like", { p_news_id: newsId });
  if (error) throw error;
  return data as LikeResult;
}

export async function getNewsLikeStatus(newsId: number): Promise<{ liked: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { liked: false };
  const { data } = await supabase
    .from("news_likes")
    .select("id")
    .eq("news_id", newsId)
    .eq("user_id", user.id)
    .maybeSingle();
  return { liked: !!data };
}

export type ViewResult = {
  counted: boolean;
  reason: "counted" | "duplicate_24h" | "author_excluded" | "admin_excluded";
  viewCount: number;
};

export async function increaseNewsViewCount(newsId: number, anonymousId: string): Promise<ViewResult> {
  const { data, error } = await supabase.rpc("increment_news_view", {
    p_news_id: newsId,
    p_anonymous_id: anonymousId,
  });
  if (error) throw error;
  return data as ViewResult;
}
