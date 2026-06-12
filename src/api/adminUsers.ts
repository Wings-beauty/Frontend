import { supabase } from "../lib/supabase";
import { requireAdmin } from "./auth";
import type { Inquiry } from "./inquiries";
import type { ProfileRole, ToneCode } from "../constants/inquiries";

export type AdminUserSummary = {
  id: string;
  displayId: string;
  email: string | null;
  nickname: string | null;
  role: ProfileRole;
  createdAt: string | null;
  latestToneCode: string | null;
  latestToneLabel: string | null;
  latestConfidence: number | null;
  savedProductCount: number;
  hasWaitlist: boolean;
};

export type AdminUserFilters = {
  role?: ProfileRole | "all";
  tone?: ToneCode | "all";
  waitlist?: "all" | "joined" | "not_joined";
  search?: string;
};

export type AdminDiagnosisResult = {
  id: number;
  toneCode: string | null;
  toneLabel: string | null;
  confidence: number | null;
  rawResult: unknown;
  createdAt: string | null;
};

export type SavedProductWithProduct = {
  id: number;
  savedAt: string | null;
  productId: number | null;
  brandName: string | null;
  productName: string | null;
  productColor: string | null;
  category: string | null;
  productImageUrl: string | null;
  productUrl: string | null;
  price: number | null;
};

export type AdminCommunityPost = {
  id: number;
  category: string;
  title: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

export type AdminUserDetail = {
  id: string;
  displayId: string;
  email: string | null;
  nickname: string | null;
  profileImageUrl: string | null;
  birthYear: number | null;
  skinNote: string | null;
  skinTone: string | null;
  role: ProfileRole;
  createdAt: string | null;
  updatedAt: string | null;
  hasWaitlist: boolean;
  diagnosisResults: AdminDiagnosisResult[];
  savedProducts: SavedProductWithProduct[];
  inquiries: Inquiry[];
  communityPosts: AdminCommunityPost[];
};

type ProfileRow = {
  id: string;
  email: string | null;
  nickname: string | null;
  profile_image_url: string | null;
  birth_year: number | null;
  skin_note: string | null;
  skin_tone: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type DiagnosisRow = {
  id: number;
  user_id: string | null;
  tone_code: string | null;
  tone_label: string | null;
  confidence: number | null;
  raw_result?: unknown;
  created_at: string | null;
};

type SavedProductRow = {
  id: number;
  user_id: string | null;
  product_id: number | null;
  created_at: string | null;
};

type ProductRow = {
  id: number;
  brand_name: string | null;
  product_name: string | null;
  product_color: string | null;
  category: string | null;
  product_image_url: string | null;
  product_url: string | null;
  price: number | null;
};

type WaitlistRow = {
  user_id: string | null;
  email: string | null;
};

type InquiryRow = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  status: string;
  admin_reply: string | null;
  replied_by: string | null;
  replied_at: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

type CommunityPostRow = {
  id: number;
  user_id: string;
  category: string;
  title: string;
  content: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_deleted: boolean;
  is_hidden: boolean;
  created_at: string;
};

function normalizeRole(role: string | null): ProfileRole {
  return role === "admin" ? "admin" : "user";
}

function getDisplayUserId(email: string | null, id: string) {
  return email?.trim() || id;
}

function mapInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category as Inquiry["category"],
    title: row.title,
    content: row.content,
    status: row.status as Inquiry["status"],
    adminReply: row.admin_reply,
    repliedBy: row.replied_by,
    repliedAt: row.replied_at,
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function matchesSearch(profile: ProfileRow, search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [profile.id, profile.email, profile.nickname]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedSearch));
}

function isWaitlisted(profile: ProfileRow, waitlistRows: WaitlistRow[]) {
  return waitlistRows.some(
    (row) =>
      row.user_id === profile.id ||
      (profile.email ? row.email === profile.email : false),
  );
}

export async function fetchAdminUsers(filters: AdminUserFilters = {}) {
  await requireAdmin();

  let profileQuery = supabase
    .from("profiles")
    .select(
      "id, email, nickname, profile_image_url, birth_year, skin_note, skin_tone, role, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (filters.role && filters.role !== "all") {
    profileQuery = profileQuery.eq("role", filters.role);
  }

  const { data: profiles, error: profilesError } =
    await profileQuery.returns<ProfileRow[]>();

  if (profilesError) {
    throw new Error(profilesError.message || "회원 목록을 불러오지 못했어요.");
  }

  const filteredProfiles = (profiles ?? []).filter((profile) =>
    matchesSearch(profile, filters.search ?? ""),
  );
  const userIds = filteredProfiles.map((profile) => profile.id);
  const emails = filteredProfiles
    .map((profile) => profile.email)
    .filter((email): email is string => Boolean(email));

  if (userIds.length === 0) {
    return [];
  }

  const [
    { data: diagnosisRows },
    { data: savedRows },
    { data: waitlistByUser },
    { data: waitlistByEmail },
  ] = await Promise.all([
    supabase
      .from("diagnosis_results")
      .select("id, user_id, tone_code, tone_label, confidence, created_at")
      .in("user_id", userIds)
      .order("created_at", { ascending: false })
      .returns<DiagnosisRow[]>(),
    supabase
      .from("saved_products")
      .select("id, user_id")
      .in("user_id", userIds)
      .returns<SavedProductRow[]>(),
    supabase
      .from("launch_waitlist")
      .select("user_id, email")
      .in("user_id", userIds)
      .returns<WaitlistRow[]>(),
    emails.length > 0
      ? supabase
          .from("launch_waitlist")
          .select("user_id, email")
          .in("email", emails)
          .returns<WaitlistRow[]>()
      : Promise.resolve({ data: [] as WaitlistRow[], error: null }),
  ]);

  const latestByUser = new Map<string, DiagnosisRow>();
  (diagnosisRows ?? []).forEach((row) => {
    if (row.user_id && !latestByUser.has(row.user_id)) {
      latestByUser.set(row.user_id, row);
    }
  });

  const savedCountByUser = new Map<string, number>();
  (savedRows ?? []).forEach((row) => {
    if (row.user_id) {
      savedCountByUser.set(
        row.user_id,
        (savedCountByUser.get(row.user_id) ?? 0) + 1,
      );
    }
  });

  const waitlistRows = [...(waitlistByUser ?? []), ...(waitlistByEmail ?? [])];

  return filteredProfiles
    .map((profile) => {
      const latest = latestByUser.get(profile.id);

      return {
        id: profile.id,
        displayId: getDisplayUserId(profile.email, profile.id),
        email: profile.email,
        nickname: profile.nickname,
        role: normalizeRole(profile.role),
        createdAt: profile.created_at,
        latestToneCode: profile.skin_tone,
        latestToneLabel: profile.skin_tone,
        latestConfidence: latest?.confidence ?? null,
        savedProductCount: savedCountByUser.get(profile.id) ?? 0,
        hasWaitlist: isWaitlisted(profile, waitlistRows),
      } satisfies AdminUserSummary;
    })
    .filter((user) => {
      if (filters.tone && filters.tone !== "all") {
        return user.latestToneCode === filters.tone;
      }

      return true;
    })
    .filter((user) => {
      if (filters.waitlist === "joined") {
        return user.hasWaitlist;
      }

      if (filters.waitlist === "not_joined") {
        return !user.hasWaitlist;
      }

      return true;
    });
}

export async function fetchAdminUserDetail(userId: string) {
  await requireAdmin();

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, email, nickname, profile_image_url, birth_year, skin_note, skin_tone, role, created_at, updated_at",
    )
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (!profile && userId.includes("@")) {
    const emailLookup = await supabase
      .from("profiles")
      .select(
        "id, email, nickname, profile_image_url, birth_year, skin_note, skin_tone, role, created_at, updated_at",
      )
      .eq("email", userId)
      .maybeSingle<ProfileRow>();

    profile = emailLookup.data;
    profileError = emailLookup.error;
  }

  if (profileError) {
    throw new Error(profileError.message || "회원 정보를 불러오지 못했어요.");
  }

  if (!profile) {
    return null;
  }

  const profileId = profile.id;

  const [
    { data: diagnosisRows },
    { data: savedRows },
    { data: inquiryRows },
    { data: communityPostRows },
    { data: waitlistByUser },
    { data: waitlistByEmail },
  ] = await Promise.all([
    supabase
      .from("diagnosis_results")
      .select("id, user_id, tone_code, tone_label, confidence, raw_result, created_at")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false })
      .returns<DiagnosisRow[]>(),
    supabase
      .from("saved_products")
      .select("id, user_id, product_id, created_at")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false })
      .returns<SavedProductRow[]>(),
    supabase
      .from("inquiries")
      .select("*")
      .eq("user_id", profileId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .returns<InquiryRow[]>(),
    supabase
      .from("community_posts")
      .select("id, user_id, category, title, content, view_count, like_count, comment_count, is_deleted, is_hidden, created_at")
      .eq("user_id", profileId)
      .eq("is_deleted", false)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .returns<CommunityPostRow[]>(),
    supabase
      .from("launch_waitlist")
      .select("user_id, email")
      .eq("user_id", profileId)
      .returns<WaitlistRow[]>(),
    profile.email
      ? supabase
          .from("launch_waitlist")
          .select("user_id, email")
          .eq("email", profile.email)
          .returns<WaitlistRow[]>()
      : Promise.resolve({ data: [] as WaitlistRow[], error: null }),
  ]);

  const productIds = (savedRows ?? [])
    .map((row) => row.product_id)
    .filter((id): id is number => typeof id === "number");
  const { data: products } =
    productIds.length > 0
      ? await supabase
          .from("products")
          .select(
            "id, brand_name, product_name, product_color, category, product_image_url, product_url, price",
          )
          .in("id", productIds)
          .returns<ProductRow[]>()
      : { data: [] as ProductRow[] };
  const productById = new Map((products ?? []).map((product) => [product.id, product]));
  const waitlistRows = [...(waitlistByUser ?? []), ...(waitlistByEmail ?? [])];

  return {
    id: profile.id,
    displayId: getDisplayUserId(profile.email, profile.id),
    email: profile.email,
    nickname: profile.nickname,
    profileImageUrl: profile.profile_image_url,
    birthYear: profile.birth_year,
    skinNote: profile.skin_note,
    skinTone: profile.skin_tone,
    role: normalizeRole(profile.role),
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    hasWaitlist: isWaitlisted(profile, waitlistRows),
    diagnosisResults: (diagnosisRows ?? []).map((row) => ({
      id: row.id,
      toneCode: row.tone_code,
      toneLabel: row.tone_label,
      confidence: row.confidence,
      rawResult: row.raw_result ?? null,
      createdAt: row.created_at,
    })),
    savedProducts: (savedRows ?? []).map((row) => {
      const product = row.product_id ? productById.get(row.product_id) : null;

      return {
        id: row.id,
        savedAt: row.created_at,
        productId: row.product_id,
        brandName: product?.brand_name ?? null,
        productName: product?.product_name ?? null,
        productColor: product?.product_color ?? null,
        category: product?.category ?? null,
        productImageUrl: product?.product_image_url ?? null,
        productUrl: product?.product_url ?? null,
        price: product?.price ?? null,
      };
    }),
    inquiries: (inquiryRows ?? []).map(mapInquiry),
    communityPosts: (communityPostRows ?? []).map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      content: row.content,
      viewCount: row.view_count,
      likeCount: row.like_count,
      commentCount: row.comment_count,
      createdAt: row.created_at,
    })),
  } satisfies AdminUserDetail;
}
