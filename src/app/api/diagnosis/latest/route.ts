import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { PersonalColorSeason } from "../../../../constants/personalColor";
import { personalColorResults } from "../../../../constants/personalColor";
import type { Database } from "../../../../types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type DiagnosisResultRow = {
  id: number;
  tone_code: string | null;
  tone_label: string | null;
  confidence: number | null;
  raw_result: unknown;
  created_at: string | null;
};

function createRequestClient(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  return createClient<Database>(supabaseUrl ?? "https://placeholder.supabase.co", supabaseAnonKey ?? "placeholder-anon-key", {
    global: {
      headers: authorization ? { Authorization: authorization } : {},
    },
  });
}

function getSeason(value: string | null | undefined): PersonalColorSeason {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("spring") || value?.includes("봄")) {
    return "spring";
  }

  if (normalized.includes("autumn") || normalized.includes("fall") || value?.includes("가을")) {
    return "autumn";
  }

  if (normalized.includes("winter") || value?.includes("겨울")) {
    return "winter";
  }

  return "summer";
}

export async function GET(request: Request) {
  const supabase = createRequestClient(request);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ result: null }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("diagnosis_results")
    .select("id, tone_code, tone_label, confidence, raw_result, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<DiagnosisResultRow>();

  if (error || !data) {
    return NextResponse.json({ result: null });
  }

  const rawResult = data.raw_result && typeof data.raw_result === "object" ? (data.raw_result as Record<string, unknown>) : {};
  const rawFinalResult = rawResult.final_result && typeof rawResult.final_result === "object" ? (rawResult.final_result as Record<string, unknown>) : null;
  const season = getSeason(data.tone_code ?? data.tone_label);
  const tone = personalColorResults[season];
  const confidence = typeof data.confidence === "number" ? data.confidence : 0;
  const finalResult = rawFinalResult ?? {
    aiResult: {
      season,
      season_kr: data.tone_label ?? tone.toneLabel,
      confidence,
      probs: {
        spring: season === "spring" ? confidence : 0,
        summer: season === "summer" ? confidence : 0,
        autumn: season === "autumn" ? confidence : 0,
        winter: season === "winter" ? confidence : 0,
      },
      lab: { L: 0, a: 0, b: 0 },
    },
    finalSeason: season,
    finalSeasonKr: data.tone_label ?? tone.toneLabel,
    finalConfidence: confidence,
    adjustedProbs: {
      spring: season === "spring" ? confidence : 0,
      summer: season === "summer" ? confidence : 0,
      autumn: season === "autumn" ? confidence : 0,
      winter: season === "winter" ? confidence : 0,
    },
    correctionApplied: false,
  };

  return NextResponse.json({
    result: {
      id: data.id,
      createdAt: data.created_at,
      finalResult,
    },
  });
}
