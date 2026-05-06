import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { MockUploadResponse } from "./mockUploadPhoto";

const AUTH_RETURN_TO = "/home";

function getStoredUpload(): MockUploadResponse | null {
  const storedUpload = sessionStorage.getItem("wings_uploaded_photo");

  if (!storedUpload) {
    return null;
  }

  try {
    return JSON.parse(storedUpload) as MockUploadResponse;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();

  return data.user;
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
  const nickname =
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    user.email?.split("@")[0] ??
    "WINGS 사용자";
  const profileImageUrl =
    user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null;

  await supabase.from("profiles").upsert({
    id: user.id,
    nickname,
    profile_image_url: profileImageUrl,
    updated_at: new Date().toISOString(),
  });
}

export async function saveCurrentDiagnosisToUser(user: User) {
  const upload = getStoredUpload();

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
