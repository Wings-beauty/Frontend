import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { PersonalColorSeason } from "../../../constants/personalColor";
import type { Database } from "../../../types/supabase";

type ProfileRow = {
  id?: string;
  nickname?: string | null;
  profile_image_url?: string | null;
  skin_tone?: string | null;
  role?: string | null;
};

type DiagnosisResultRow = {
  id: number;
  tone_code: string | null;
  tone_label: string | null;
  confidence: number | null;
  created_at: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.REACT_APP_SUPABASE_ANON_KEY;

function createRequestClient(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  return createClient<Database>(supabaseUrl ?? "https://placeholder.supabase.co", supabaseAnonKey ?? "placeholder-anon-key", {
    global: {
      headers: authorization ? { Authorization: authorization } : {},
    },
  });
}

function normalizeSeason(value: string | null | undefined): PersonalColorSeason | null {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("spring") || value?.includes("봄")) {
    return "spring";
  }

  if (normalized.includes("summer") || value?.includes("여름")) {
    return "summer";
  }

  if (normalized.includes("autumn") || normalized.includes("fall") || value?.includes("가을")) {
    return "autumn";
  }

  if (normalized.includes("winter") || value?.includes("겨울")) {
    return "winter";
  }

  return null;
}

function getToneLabel(season: PersonalColorSeason | null, fallback: string | null | undefined) {
  if (fallback) {
    return fallback;
  }

  const labels: Record<PersonalColorSeason, string> = {
    spring: "봄 웜톤",
    summer: "여름 쿨톤",
    autumn: "가을 웜톤",
    winter: "겨울 쿨톤",
  };

  return season ? labels[season] : "진단 결과";
}

export async function GET(request: Request) {
  const supabase = createRequestClient(request);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, nickname, profile_image_url, skin_tone, role")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  let profile = existingProfile;

  if (!profile) {
    const nickname = user.user_metadata.full_name ?? user.user_metadata.name ?? user.email?.split("@")[0] ?? "WINGS 사용자";
    const profileImageUrl = user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null;

    const { data: createdProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        nickname,
        profile_image_url: profileImageUrl,
        role: "user",
        updated_at: new Date().toISOString(),
      })
      .select("id, nickname, profile_image_url, skin_tone, role")
      .maybeSingle<ProfileRow>();

    profile = createdProfile ?? {
      id: user.id,
      nickname,
      profile_image_url: profileImageUrl,
      skin_tone: null,
      role: "user",
    };
  }

  const { data: latestDiagnosis } = await supabase
    .from("diagnosis_results")
    .select("id, tone_code, tone_label, confidence, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<DiagnosisResultRow>();

  const profileSeason = normalizeSeason(profile?.skin_tone);
  const diagnosisSeason = normalizeSeason(latestDiagnosis?.tone_code ?? latestDiagnosis?.tone_label);
  const season = profileSeason ?? diagnosisSeason;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? "",
    },
    profile: {
      nickname: profile?.nickname ?? user.user_metadata.full_name ?? user.user_metadata.name ?? user.email?.split("@")[0] ?? "WINGS 사용자",
      profileImageUrl: profile?.profile_image_url ?? user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null,
      skinTone: season,
      role: profile?.role === "admin" ? "admin" : "user",
    },
    latestDiagnosis: latestDiagnosis
      ? {
          id: latestDiagnosis.id,
          season: diagnosisSeason ?? season,
          toneLabel: getToneLabel(diagnosisSeason ?? season, latestDiagnosis.tone_label),
          confidence: latestDiagnosis.confidence,
          createdAt: latestDiagnosis.created_at,
        }
      : null,
  });
}
