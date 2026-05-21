import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { getStoredDiagnosisUpload } from "./diagnosisUpload";
import type { ProfileRole } from "../constants/inquiries";
import type { PersonalColorSeason } from "../constants/personalColor";

const AUTH_RETURN_TO = "/home";
const AUTH_RETURN_TO_KEY = "wings_auth_return_to";

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

export async function getCurrentUserProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, profile_image_url, skin_tone, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    nickname: data.nickname,
    profileImageUrl: data.profile_image_url,
    skinTone: data.skin_tone,
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

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) {
    throw new Error(error.message || "구글 로그인에 실패했어요.");
  }
}

export function consumeAuthReturnTo() {
  const returnTo = sessionStorage.getItem(AUTH_RETURN_TO_KEY) ?? AUTH_RETURN_TO;

  sessionStorage.removeItem(AUTH_RETURN_TO_KEY);

  return returnTo;
}

export function setAuthReturnTo(path: string) {
  sessionStorage.setItem(AUTH_RETURN_TO_KEY, path);
}

export async function ensureProfile(user: User) {
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return;
  }

  const nickname =
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    user.email?.split("@")[0] ??
    "WINGS 사용자";
  const profileImageUrl =
    user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null;

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

  const { data } = await supabase
    .from("profiles")
    .select("nickname, profile_image_url, skin_tone, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    nickname:
      data?.nickname ??
      user.user_metadata.full_name ??
      user.user_metadata.name ??
      user.email?.split("@")[0] ??
      "WINGS 사용자",
    email: user.email ?? "",
    profileImageUrl:
      data?.profile_image_url ??
      user.user_metadata.avatar_url ??
      user.user_metadata.picture ??
      null,
    skinTone: data?.skin_tone ?? null,
    role: (data?.role === "admin" ? "admin" : "user") satisfies ProfileRole,
  };
}

export async function fetchProfileSkinToneForUser(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("skin_tone")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.skin_tone) {
    return null;
  }

  sessionStorage.setItem("wings_personal_color_season", data.skin_tone);
  sessionStorage.setItem(
    "wings_personal_color_result",
    data.skin_tone,
  );

  return data.skin_tone;
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
    throw new Error(error.message || "프로필 저장에 실패했어요.");
  }

  return data;
}

export async function updateProfileSkinTone(
  userId: string,
  skinTone: PersonalColorSeason,
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      skin_tone: skinTone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message || "피부 톤 저장에 실패했어요.");
  }
}

export async function saveCurrentDiagnosisToUser(user: User) {
  const upload = getStoredDiagnosisUpload();

  if (!upload) {
    return;
  }

  await ensureProfile(user);

  if (upload.diagnosisRequestId) {
    await supabase
      .from("diagnosis_requests")
      .update({ user_id: user.id })
      .eq("id", upload.diagnosisRequestId);
  }

  if (upload.diagnosisResultId) {
    await supabase
      .from("diagnosis_results")
      .update({ user_id: user.id })
      .eq("id", upload.diagnosisResultId);
  }
}

export async function hasDiagnosisHistory(userId: string) {
  const { data, error } = await supabase
    .from("diagnosis_results")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}
