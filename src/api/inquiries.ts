import { supabase } from "../lib/supabase";
import { getCurrentUser, requireAdmin } from "./auth";
import type {
  InquiryCategory,
  InquiryStatus,
} from "../constants/inquiries";

export type Inquiry = {
  id: string;
  userId: string;
  authorEmail?: string | null;
  authorNickname?: string | null;
  category: InquiryCategory;
  title: string;
  content: string;
  status: InquiryStatus;
  adminReply: string | null;
  repliedBy: string | null;
  repliedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InquiryFilters = {
  status?: InquiryStatus | "all";
  category?: InquiryCategory | "all";
  search?: string;
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

function mapInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category as InquiryCategory,
    title: row.title,
    content: row.content,
    status: row.status as InquiryStatus,
    adminReply: row.admin_reply,
    repliedBy: row.replied_by,
    repliedAt: row.replied_at,
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type ProfileRow = {
  id: string;
  email: string | null;
  nickname: string | null;
};

async function attachInquiryAuthors(inquiries: Inquiry[]) {
  const userIds = Array.from(new Set(inquiries.map((inquiry) => inquiry.userId)));

  if (userIds.length === 0) {
    return inquiries;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, email, nickname")
    .in("id", userIds)
    .returns<ProfileRow[]>();
  const profileById = new Map((data ?? []).map((profile) => [profile.id, profile]));

  return inquiries.map((inquiry) => {
    const profile = profileById.get(inquiry.userId);

    return {
      ...inquiry,
      authorEmail: profile?.email ?? null,
      authorNickname: profile?.nickname ?? null,
    };
  });
}

async function getRequiredUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  return user;
}

export async function fetchMyInquiries() {
  const user = await getRequiredUser();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .returns<InquiryRow[]>();

  if (error) {
    throw new Error(error.message || "문의 목록을 불러오지 못했어요.");
  }

  return (data ?? []).map(mapInquiry);
}

export async function fetchMyInquiry(inquiryId: string) {
  const user = await getRequiredUser();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", inquiryId)
    .eq("user_id", user.id)
    .eq("is_deleted", false)
    .maybeSingle<InquiryRow>();

  if (error) {
    throw new Error(error.message || "문의 상세를 불러오지 못했어요.");
  }

  if (!data) {
    return null;
  }

  return mapInquiry(data);
}

export async function createInquiry({
  category,
  title,
  content,
}: {
  category: InquiryCategory;
  title: string;
  content: string;
}) {
  const user = await getRequiredUser();
  const nextTitle = title.trim();
  const nextContent = content.trim();

  if (!category || !nextTitle || !nextContent) {
    throw new Error("카테고리, 제목, 내용을 모두 입력해주세요.");
  }

  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      user_id: user.id,
      category,
      title: nextTitle,
      content: nextContent,
      status: "pending",
      is_deleted: false,
    })
    .select("*")
    .single<InquiryRow>();

  if (error || !data) {
    console.error("Failed to create inquiry:", error);
    throw new Error(error?.message || "문의 저장에 실패했어요.");
  }

  return mapInquiry(data);
}

export async function softDeleteMyInquiry(inquiryId: string) {
  const user = await getRequiredUser();
  const { error } = await supabase
    .from("inquiries")
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inquiryId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "문의 삭제에 실패했어요.");
  }
}

export async function fetchAdminInquiries(filters: InquiryFilters = {}) {
  await requireAdmin();

  let query = supabase
    .from("inquiries")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  const search = filters.search?.trim();

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data, error } = await query.returns<InquiryRow[]>();

  if (error) {
    throw new Error(error.message || "관리자 문의 목록을 불러오지 못했어요.");
  }

  return attachInquiryAuthors((data ?? []).map(mapInquiry));
}

export async function fetchAdminInquiry(inquiryId: string) {
  await requireAdmin();

  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", inquiryId)
    .eq("is_deleted", false)
    .maybeSingle<InquiryRow>();

  if (error) {
    throw new Error(error.message || "관리자 문의 상세를 불러오지 못했어요.");
  }

  if (!data) {
    return null;
  }

  const [inquiry] = await attachInquiryAuthors([mapInquiry(data)]);

  return inquiry ?? null;
}

export async function updateAdminInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
) {
  await requireAdmin();

  const { error } = await supabase
    .from("inquiries")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inquiryId)
    .eq("is_deleted", false);

  if (error) {
    throw new Error(error.message || "문의 상태 변경에 실패했어요.");
  }
}

export async function saveAdminInquiryReply({
  inquiryId,
  reply,
  status = "answered",
}: {
  inquiryId: string;
  reply: string;
  status?: InquiryStatus;
}) {
  const adminProfile = await requireAdmin();
  const nextReply = reply.trim();

  if (!nextReply) {
    throw new Error("답변 내용을 입력해주세요.");
  }

  const { error } = await supabase
    .from("inquiries")
    .update({
      admin_reply: nextReply,
      replied_by: adminProfile.id,
      replied_at: new Date().toISOString(),
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inquiryId)
    .eq("is_deleted", false);

  if (error) {
    throw new Error(error.message || "답변 저장에 실패했어요.");
  }
}
