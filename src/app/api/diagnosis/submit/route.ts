import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { PersonalColorSeason } from "../../../../constants/personalColor";
import type { Database } from "../../../../types/supabase";

const AI_DIAGNOSIS_ENDPOINT =
  process.env.AI_DIAGNOSIS_ENDPOINT ??
  process.env.AI_DIAGNOSIS_KEY ??
  process.env.NEXT_PUBLIC_AI_DIAGNOSIS_KEY ??
  process.env.REACT_APP_AI_DIAGNOSIS_KEY;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.REACT_APP_SUPABASE_ANON_KEY;

type SeasonScores = Record<PersonalColorSeason, number>;

function createRequestClient(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  return createClient<Database>(supabaseUrl ?? "https://placeholder.supabase.co", supabaseAnonKey ?? "placeholder-anon-key", {
    global: {
      headers: authorization ? { Authorization: authorization } : {},
    },
  });
}

function getPredictUrl() {
  return AI_DIAGNOSIS_ENDPOINT ? `${AI_DIAGNOSIS_ENDPOINT.replace(/\/$/, "")}/predict` : null;
}

function getSeasonFromValue(value: unknown): PersonalColorSeason {
  const text = typeof value === "string" ? value.toLowerCase() : "";

  if (text.includes("spring") || text.includes("봄")) {
    return "spring";
  }

  if (text.includes("autumn") || text.includes("fall") || text.includes("가을")) {
    return "autumn";
  }

  if (text.includes("winter") || text.includes("겨울")) {
    return "winter";
  }

  return "summer";
}

function getToneLabel(season: PersonalColorSeason, payload: Record<string, unknown>) {
  const explicitLabel = payload.season_kr ?? payload.seasonKr ?? payload.toneLabel ?? payload.tone_label;

  if (typeof explicitLabel === "string" && explicitLabel.trim()) {
    return explicitLabel;
  }

  const labels: Record<PersonalColorSeason, string> = {
    spring: "봄 웜톤",
    summer: "여름 쿨톤",
    autumn: "가을 웜톤",
    winter: "겨울 쿨톤",
  };

  return labels[season];
}

function normalizeConfidence(value: unknown) {
  const confidence = typeof value === "number" ? value : 0;
  return confidence > 1 ? confidence / 100 : confidence;
}

function normalizeScores(value: unknown): SeasonScores {
  const scores = value && typeof value === "object" ? (value as Partial<SeasonScores>) : {};

  return {
    spring: typeof scores.spring === "number" ? scores.spring : 0,
    summer: typeof scores.summer === "number" ? scores.summer : 0,
    autumn: typeof scores.autumn === "number" ? scores.autumn : 0,
    winter: typeof scores.winter === "number" ? scores.winter : 0,
  };
}

export async function POST(request: Request) {
  const predictUrl = getPredictUrl();

  if (!predictUrl) {
    return NextResponse.json({ error: "AI diagnosis endpoint is not configured." }, { status: 500 });
  }

  const supabase = createRequestClient(request);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  const { data: requestRow, error: requestError } = await supabase
    .from("diagnosis_requests")
    .insert({
      user_id: user.id,
      image_url: null,
      status: "pending",
    })
    .select("id")
    .single();

  if (requestError || !requestRow) {
    return NextResponse.json({ error: requestError?.message ?? "Failed to create diagnosis request." }, { status: 500 });
  }

  try {
    const proxyFormData = new FormData();
    proxyFormData.append("file", file);

    const aiResponse = await fetch(predictUrl, {
      method: "POST",
      body: proxyFormData,
    });
    const responseText = await aiResponse.text();
    const contentType = aiResponse.headers.get("content-type") ?? "";
    const aiPayload = contentType.includes("application/json") ? JSON.parse(responseText) : { error: responseText };

    if (!aiResponse.ok || !aiPayload || typeof aiPayload !== "object") {
      throw new Error(typeof aiPayload.error === "string" ? aiPayload.error : "AI diagnosis request failed.");
    }

    const payload = aiPayload as Record<string, unknown>;
    const season = getSeasonFromValue(payload.season ?? payload.toneCode ?? payload.tone_code);
    const toneLabel = getToneLabel(season, payload);
    const confidence = normalizeConfidence(payload.confidence);
    const probabilities = normalizeScores(payload.probs ?? payload.probabilities);
    const finalResult = {
      aiResult: {
        ...payload,
        season,
        season_kr: toneLabel,
        confidence,
        probs: probabilities,
      },
      finalSeason: season,
      finalSeasonKr: toneLabel,
      finalConfidence: confidence,
      adjustedProbs: probabilities,
      correctionApplied: false,
    };

    const { data: resultRow, error: resultError } = await supabase
      .from("diagnosis_results")
      .insert({
        request_id: requestRow.id,
        user_id: user.id,
        tone_code: season,
        tone_label: toneLabel,
        confidence,
        raw_result: {
          source: "ai_diagnosis_api",
          ...payload,
          final_result: finalResult,
        },
      })
      .select("id, tone_code, tone_label, confidence, created_at")
      .single();

    if (resultError || !resultRow) {
      throw new Error(resultError?.message ?? "Failed to save diagnosis result.");
    }

    await supabase
      .from("diagnosis_requests")
      .update({
        status: "success",
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", requestRow.id);

    await supabase
      .from("profiles")
      .update({
        skin_tone: season,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      requestId: requestRow.id,
      resultId: resultRow.id,
      finalResult,
    });
  } catch (error) {
    await supabase
      .from("diagnosis_requests")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : "AI diagnosis request failed.",
      })
      .eq("id", requestRow.id);

    return NextResponse.json({ error: error instanceof Error ? error.message : "AI diagnosis request failed." }, { status: 500 });
  }
}
