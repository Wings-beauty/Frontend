import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { getStoredDiagnosisUpload } from "./diagnosisUpload";

const AUTH_RETURN_TO = "/home";

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();

  return data.user;
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
  return AUTH_RETURN_TO;
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
    updated_at: new Date().toISOString(),
  });
}

export async function fetchProfile(user: User) {
  await ensureProfile(user);

  const { data } = await supabase
    .from("profiles")
    .select("nickname, profile_image_url")
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
  };
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
