import {
  setStoredDiagnosisUpload,
  type DiagnosisUpload,
} from "./diagnosisUpload";
import { supabase } from "../lib/supabase";
import type { PersonalColorSeason } from "../constants/personalColor";
import {
  getPersonalColorSeasonFromValue,
  personalColorResults,
} from "../constants/personalColor";

const AI_DIAGNOSIS_ENDPOINT = import.meta.env
  .REACT_APP_AI_DIAGNOSIS_KEY as string | undefined;

type DiagnosisResultRow = {
  id: number;
  tone_code: string | null;
  tone_label: string | null;
  confidence: number | null;
  created_at?: string | null;
};

type AiDiagnosisResponse = {
  season: PersonalColorSeason;
  season_kr: string;
  confidence: number;
  probs: Record<PersonalColorSeason, number>;
  lab: {
    L: number;
    a: number;
    b: number;
  };
};

export type DiagnosisHistoryItem = {
  id: number;
  season: PersonalColorSeason;
  toneLabel: string;
  confidence: number | null;
  createdAt: string | null;
};

function getSeasonFromToneCode(toneCode: string | null): PersonalColorSeason {
  return getPersonalColorSeasonFromValue(toneCode);
}

function normalizeConfidence(confidence: number) {
  return confidence > 1 ? confidence / 100 : confidence;
}

function parseAiDiagnosisResponse(data: unknown): AiDiagnosisResponse {
  if (!data || typeof data !== "object") {
    throw new Error("진단 API 응답을 읽지 못했어요.");
  }

  const response = data as Partial<AiDiagnosisResponse>;
  const season = getPersonalColorSeasonFromValue(response.season);

  if (typeof response.season_kr !== "string") {
    throw new Error("진단 API 응답에 톤 이름이 없어요.");
  }

  if (typeof response.confidence !== "number") {
    throw new Error("진단 API 응답에 신뢰도가 없어요.");
  }

  return {
    season,
    season_kr: response.season_kr,
    confidence: response.confidence,
    probs: response.probs ?? {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0,
    },
    lab: response.lab ?? {
      L: 0,
      a: 0,
      b: 0,
    },
  };
}

async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser();

  return data.user?.id ?? null;
}

async function requestAiDiagnosis(file: File) {
  if (!AI_DIAGNOSIS_ENDPOINT) {
    throw new Error("REACT_APP_AI_DIAGNOSIS_KEY 환경변수가 없습니다.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${AI_DIAGNOSIS_ENDPOINT}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("진단 API 요청에 실패했어요.");
  }

  return parseAiDiagnosisResponse(await response.json());
}

function storeDiagnosisResult(upload: DiagnosisUpload, result: DiagnosisResultRow) {
  const storedSeason = getSeasonFromToneCode(result.tone_code);
  const updatedUpload = {
    ...upload,
    diagnosisResultId: result.id,
  };

  setStoredDiagnosisUpload(updatedUpload);
  sessionStorage.setItem("wings_personal_color_season", storedSeason);
  sessionStorage.setItem(
    "wings_personal_color_result",
    result.tone_label ?? personalColorResults[storedSeason].toneLabel,
  );
}

export async function fetchLatestDiagnosisSeasonForUser(userId: string) {
  const { data, error } = await supabase
    .from("diagnosis_results")
    .select("tone_code, tone_label")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Pick<DiagnosisResultRow, "tone_code" | "tone_label">>();

  if (error || !data) {
    return null;
  }

  const season = getPersonalColorSeasonFromValue(data.tone_code ?? data.tone_label);

  sessionStorage.setItem("wings_personal_color_season", season);

  if (data.tone_label) {
    sessionStorage.setItem("wings_personal_color_result", data.tone_label);
  }

  return season;
}

export async function fetchDiagnosisHistoryForUser(userId: string) {
  const { data, error } = await supabase
    .from("diagnosis_results")
    .select("id, tone_code, tone_label, confidence, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<DiagnosisResultRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map((item) => {
    const season = getPersonalColorSeasonFromValue(
      item.tone_code ?? item.tone_label,
    );

    return {
      id: item.id,
      season,
      toneLabel: item.tone_label ?? personalColorResults[season].toneLabel,
      confidence: item.confidence,
      createdAt: item.created_at ?? null,
    };
  });
}

export async function uploadDiagnosisPhoto(file: File): Promise<DiagnosisUpload> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  }

  const userId = await getCurrentUserId();
  const requestedAt = new Date().toISOString();

  const { data: request, error: requestError } = await supabase
    .from("diagnosis_requests")
    .insert({
      user_id: userId,
      image_url: null,
      status: "pending",
    })
    .select("id")
    .single();

  if (requestError || !request) {
    throw new Error(requestError?.message || "진단 요청을 저장하지 못했어요.");
  }

  try {
    const aiResult = await requestAiDiagnosis(file);
    const { data: result, error: resultError } = await supabase
      .from("diagnosis_results")
      .insert({
        request_id: request.id,
        user_id: userId,
        tone_code: aiResult.season,
        tone_label: aiResult.season_kr,
        confidence: normalizeConfidence(aiResult.confidence),
        raw_result: {
          source: "ai_diagnosis_api",
          ...aiResult,
        },
      })
      .select("id, tone_code, tone_label, confidence")
      .single<DiagnosisResultRow>();

    if (resultError || !result) {
      throw new Error(resultError?.message || "진단 결과 저장에 실패했어요.");
    }

    await supabase
      .from("diagnosis_requests")
      .update({
        status: "success",
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", request.id);

    const upload = {
      uploadId: String(request.id),
      fileName: file.name,
      uploadedAt: requestedAt,
      diagnosisRequestId: request.id,
      diagnosisResultId: result.id,
    };

    storeDiagnosisResult(upload, result);

    return upload;
  } catch (error) {
    await supabase
      .from("diagnosis_requests")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message:
          error instanceof Error ? error.message : "진단 API 요청에 실패했어요.",
      })
      .eq("id", request.id);

    throw error instanceof Error
      ? error
      : new Error("진단 API 요청에 실패했어요.");
  }
}

export async function completeDiagnosis(upload: DiagnosisUpload) {
  if (!upload.diagnosisRequestId) {
    return null;
  }

  const { data: result, error } = await supabase
    .from("diagnosis_results")
    .select("id, tone_code, tone_label, confidence")
    .eq("request_id", upload.diagnosisRequestId)
    .maybeSingle<DiagnosisResultRow>();

  if (error || !result) {
    return null;
  }

  storeDiagnosisResult(upload, result);

  return result;
}
