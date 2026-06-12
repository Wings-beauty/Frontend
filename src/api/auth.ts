import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { ProfileRole } from "../constants/inquiries";
import type { PersonalColorSeason } from "../constants/personalColor";

const AUTH_RETURN_TO = "/home";

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  console.log("getCurrentUser data:", data);
  return data.user;
}

export type CurrentUserProfile = {
  id: string;
  nickname: string | null;
  profileImageUrl: string | null;
  skinTone: PersonalColorSeason | null;
  role: ProfileRole;
};

type ProfileToneRow = {
  id?: string;
  nickname?: string | null;
  profile_image_url?: string | null;
  skin_tone?: PersonalColorSeason | null;
  role?: string | null;
};

function getProfileTone(profile: Pick<ProfileToneRow, "skin_tone"> | null | undefined) {
  return profile?.skin_tone ?? null;
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.from("profiles").select("id, nickname, profile_image_url, skin_tone, role").eq("id", user.id).maybeSingle<ProfileToneRow>();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id ?? user.id,
    nickname: data.nickname ?? null,
    profileImageUrl: data.profile_image_url ?? null,
    skinTone: getProfileTone(data),
    role: data.role === "admin" ? "admin" : "user",
  } satisfies CurrentUserProfile;
}

export async function isAdminUser() {
  const profile = await getCurrentUserProfile();

  return profile?.role === "admin";
}

export async function requireAdmin() {
  const profile = await getCurrentUserProfile();

  if (profile?.role !== "admin") {
    throw new Error("관리자 권한이 필요합니다.");
  }

  return profile;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message || "로그아웃에 실패했어요.");
  }
}

export async function deleteMyAccount() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.access_token) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw error;
  }

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    throw signOutError;
  }

  return data;
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase URL 또는 공개 키가 설정되지 않았습니다.");
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  });

  if (error) {
    throw new Error(error.message || "구글 로그인에 실패했어요.");
  }
}

export function consumeAuthReturnTo() {
  if (typeof window === "undefined") {
    return AUTH_RETURN_TO;
  }

  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  return returnTo?.startsWith("/") ? returnTo : AUTH_RETURN_TO;
}

export function setAuthReturnTo(path: string) {
  void path;
}

export async function ensureProfile(user: User) {
  const { data: existingProfile, error: selectError } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

  // SELECT 에러(RLS 포함) 또는 이미 존재하면 INSERT 하지 않음
  if (existingProfile || selectError) {
    return;
  }

  const nickname = user.user_metadata.full_name ?? user.user_metadata.name ?? user.email?.split("@")[0] ?? "WINGS 사용자";
  const profileImageUrl = user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null;

  await supabase.from("profiles").insert({
    id: user.id,
    nickname,
    profile_image_url: profileImageUrl,
    role: "user",
    updated_at: new Date().toISOString(),
  });
}

export async function fetchProfile(user: User) {
  await ensureProfile(user);

  const { data, error } = await supabase.from("profiles").select("nickname, profile_image_url, skin_tone, role").eq("id", user.id).maybeSingle<ProfileToneRow>();

  if (error) {
    console.error("fetchProfile error:", error.message, error.code);
  }

  console.log("fetchProfile data:", data);

  return {
    nickname: data?.nickname ?? user.user_metadata.full_name ?? user.user_metadata.name ?? user.email?.split("@")[0] ?? "WINGS 사용자",
    email: user.email ?? "",
    profileImageUrl: data?.profile_image_url ?? user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null,
    skinTone: getProfileTone(data),
    role: (data?.role === "admin" ? "admin" : "user") satisfies ProfileRole,
  };
}

export async function fetchProfileSkinToneForUser(userId: string) {
  const { data, error } = await supabase.from("profiles").select("skin_tone").eq("id", userId).maybeSingle<ProfileToneRow>();

  const tone = getProfileTone(data);

  if (error || !tone) {
    return null;
  }

  return tone;
}

export async function uploadProfileAvatar(file: File, userId: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "31536000",
    upsert: true,
  });

  if (error) {
    throw new Error(error.message || "프로필 사진을 업로드하지 못했어요.");
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);

  await supabase
    .from("profiles")
    .update({ profile_image_url: data.publicUrl, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return data.publicUrl;
}

export async function updateProfileNickname(userId: string, nickname: string) {
  const nextNickname = nickname.trim();

  if (!nextNickname) {
    throw new Error("닉네임을 입력해주세요.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      nickname: nextNickname,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("nickname, profile_image_url")
    .single();

  if (error) {
    throw new Error(error.message || "프로필 수정에 실패했어요.");
  }

  return data;
}

export async function updateProfileSkinTone(userId: string, skinTone: PersonalColorSeason) {
  const { error } = await supabase
    .from("profiles")
    .update({
      skin_tone: skinTone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message || "피부 톤 수정에 실패했어요.");
  }
}

export async function saveCurrentDiagnosisToUser(user: User) {
  await ensureProfile(user);
}

export async function hasDiagnosisHistory(userId: string) {
  const { data, error } = await supabase.from("diagnosis_results").select("id").eq("user_id", userId).limit(1).maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}
