import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "../src/types/supabase";

type ApiRequest = { method?: string; body: unknown };
type ApiResponse = { status: (statusCode: number) => { json: (body: unknown) => void } };
type AiResult = { season: string; season_kr: string; confidence: number; [key: string]: unknown };
type FinalResult = {
  aiResult: AiResult;
  finalSeason: string;
  finalSeasonKr: string;
  finalConfidence: number;
  adjustedProbs: Record<string, number>;
  correctionApplied: boolean;
  userAnswers?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAiResult(value: unknown): value is AiResult {
  return isRecord(value) && typeof value.season === "string" && typeof value.season_kr === "string" && typeof value.confidence === "number";
}

function isFinalResult(value: unknown): value is FinalResult {
  return isRecord(value) && isAiResult(value.aiResult) && typeof value.finalSeason === "string" && typeof value.finalSeasonKr === "string" && typeof value.finalConfidence === "number" && isRecord(value.adjustedProbs) && typeof value.correctionApplied === "boolean";
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return url && serviceRoleKey
    ? createClient<Database>(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;
}

function normalizeConfidence(confidence: number) {
  return confidence > 1 ? confidence / 100 : confidence;
}

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "POST 요청만 사용할 수 있어요." });

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Supabase guest persistence is not configured");
    return res.status(503).json({ ok: false, message: "부스 진단 저장 기능을 준비 중이에요. 잠시 후 다시 시도해주세요." });
  }

  const payload = req.body;
  if (!isRecord(payload) || typeof payload.guestToken !== "string" || payload.guestToken.length < 20) {
    return res.status(400).json({ ok: false, message: "부스 세션을 확인하지 못했어요. 다시 시작해주세요." });
  }

  const guestTokenHash = createHash("sha256").update(payload.guestToken).digest("hex");

  if (payload.action === "create" && isAiResult(payload.aiResult)) {
    const { data: request, error: requestError } = await admin
      .from("diagnosis_requests")
      .insert({ user_id: null, image_url: null, status: "pending", requester_type: "guest", guest_token_hash: guestTokenHash })
      .select("id")
      .single();

    if (requestError || !request) {
      console.error("Failed to create guest diagnosis request", requestError?.code);
      return res.status(500).json({ ok: false, message: "진단 기록을 저장하지 못했어요. 다시 시도해주세요." });
    }

    const { data: result, error: resultError } = await admin
      .from("diagnosis_results")
      .insert({ request_id: request.id, user_id: null, tone_code: payload.aiResult.season, tone_label: payload.aiResult.season_kr, confidence: normalizeConfidence(payload.aiResult.confidence), raw_result: toJson({ source: "ai_diagnosis_api", ...payload.aiResult }) })
      .select("id")
      .single();

    if (resultError || !result) {
      await admin.from("diagnosis_requests").update({ status: "failed", completed_at: new Date().toISOString(), error_message: "result_insert_failed" }).eq("id", request.id);
      console.error("Failed to create guest diagnosis result", resultError?.code);
      return res.status(500).json({ ok: false, message: "진단 기록을 저장하지 못했어요. 다시 시도해주세요." });
    }

    await admin.from("diagnosis_requests").update({ status: "success", completed_at: new Date().toISOString() }).eq("id", request.id);
    return res.status(201).json({ ok: true, data: { diagnosisRequestId: request.id, diagnosisResultId: result.id } });
  }

  const diagnosisResultId = payload.diagnosisResultId;
  if (payload.action === "finalize" && typeof diagnosisResultId === "number" && Number.isInteger(diagnosisResultId) && isFinalResult(payload.finalResult)) {
    const { data: request, error: requestError } = await admin
      .from("diagnosis_requests")
      .select("id")
      .eq("requester_type", "guest")
      .eq("guest_token_hash", guestTokenHash)
      .maybeSingle();

    if (requestError || !request) return res.status(403).json({ ok: false, message: "이 부스 기록을 확인하지 못했어요. 다시 시작해주세요." });

    const { error: updateError } = await admin
      .from("diagnosis_results")
      .update({
        tone_code: payload.finalResult.finalSeason,
        tone_label: payload.finalResult.finalSeasonKr,
        confidence: payload.finalResult.finalConfidence,
        raw_result: toJson({
          source: "ai_diagnosis_api",
          ...payload.finalResult.aiResult,
          survey_answers: payload.finalResult.userAnswers,
          final_result: {
            finalSeason: payload.finalResult.finalSeason,
            finalSeasonKr: payload.finalResult.finalSeasonKr,
            finalConfidence: payload.finalResult.finalConfidence,
            adjustedProbs: payload.finalResult.adjustedProbs,
            correctionApplied: payload.finalResult.correctionApplied,
          },
        }),
      })
      .eq("id", diagnosisResultId)
      .eq("request_id", request.id);

    if (updateError) {
      console.error("Failed to finalize guest diagnosis", updateError.code);
      return res.status(500).json({ ok: false, message: "최종 진단을 저장하지 못했어요. 다시 시도해주세요." });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ ok: false, message: "요청 형식이 올바르지 않아요." });
}
