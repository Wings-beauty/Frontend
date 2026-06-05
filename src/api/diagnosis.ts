import type { User } from "@supabase/supabase-js";
import type { DiagnosisUpload } from "./diagnosisUpload";
import { supabase } from "../lib/supabase";
import type { PersonalColorSeason } from "../constants/personalColor";
import {
  getPersonalColorSeasonFromValue,
  personalColorResults,
} from "../constants/personalColor";
import {
  getCurrentUser,
  ensureProfile as ensureUserProfile,
  fetchProfileSkinToneForUser,
  updateProfileSkinTone,
} from "./auth";
import type {
  FinalDiagnosisResult,
  PredictResponse,
  Season,
  SeasonScores,
  SurveyAnswers,
} from "../types/diagnosis";
import { rerankSeasonScores } from "../utils/diagnosisRerank";

const SEASON_KR: Record<Season, string> = {
  spring: "봄 웜톤",
  summer: "여름 쿨톤",
  autumn: "가을 웜톤",
  winter: "겨울 쿨톤",
};

type DiagnosisResultRow = {
  id: number;
  tone_code: string | null;
  tone_label: string | null;
  confidence: number | null;
  created_at?: string | null;
};

type DiagnosisRequestRow = {
  id: number;
  user_id: string | null;
};

export type { FinalDiagnosisResult, PredictResponse, SeasonScores, SurveyAnswers };

export type DiagnosisHistoryItem = {
  id: number;
  season: PersonalColorSeason;
  toneLabel: string;
  confidence: number | null;
  createdAt: string | null;
};

export type DiagnosisHistoryDetail = DiagnosisHistoryItem & {
  description: string;
  detailDescription: string;
};

export type LatestDiagnosis = DiagnosisHistoryItem;

function normalizeConfidence(confidence: number) {
  return confidence > 1 ? confidence / 100 : confidence;
}

function normalizeSeasonScores(
  probs: Partial<Record<PersonalColorSeason, number>> | undefined,
): SeasonScores {
  return {
    spring: typeof probs?.spring === "number" ? probs.spring : 0,
    summer: typeof probs?.summer === "number" ? probs.summer : 0,
    autumn: typeof probs?.autumn === "number" ? probs.autumn : 0,
    winter: typeof probs?.winter === "number" ? probs.winter : 0,
  };
}

function parseOptionalSeason(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  return getPersonalColorSeasonFromValue(value);
}

function getStringField(
  data: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = data[key];

    if (typeof value === "string") {
      return value;
    }
  }

  return undefined;
}

function getNumberField(
  data: Record<string, unknown>,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = data[key];

    if (typeof value === "number") {
      return value;
    }
  }

  return undefined;
}

function getObjectField<T extends Record<string, unknown>>(
  data: Record<string, unknown>,
  keys: string[],
): T | undefined {
  for (const key of keys) {
    const value = data[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as T;
    }
  }

  return undefined;
}

function normalizeLab(
  lab: Record<string, unknown> | undefined,
): PredictResponse["lab"] {
  return {
    L: typeof lab?.L === "number" ? lab.L : typeof lab?.l === "number" ? lab.l : 0,
    a: typeof lab?.a === "number" ? lab.a : 0,
    b: typeof lab?.b === "number" ? lab.b : 0,
  };
}

function parseAiDiagnosisResponse(data: unknown): PredictResponse {
  if (!data || typeof data !== "object") {
    throw new Error("진단 API 응답을 읽지 못했어요.");
  }

  const response = data as Record<string, unknown>;
  const season = getPersonalColorSeasonFromValue(
    getStringField(response, ["season", "toneCode", "tone_code"]),
  );
  const seasonKr = getStringField(response, [
    "season_kr",
    "seasonKr",
    "toneLabel",
    "tone_label",
  ]);
  const confidence = getNumberField(response, ["confidence"]);
  const probabilities = getObjectField<Partial<Record<PersonalColorSeason, number>>>(
    response,
    ["probs", "probabilities"],
  );

  if (!seasonKr) {
    throw new Error("진단 API 응답에 톤 이름이 없어요.");
  }

  if (typeof confidence !== "number") {
    throw new Error("진단 API 응답에 신뢰도가 없어요.");
  }

  return {
    season,
    season_kr: seasonKr,
    confidence,
    probs: normalizeSeasonScores(probabilities),
    lab: normalizeLab(getObjectField(response, ["lab"])),
    success: typeof response.success === "boolean" ? response.success : undefined,
    model_version:
      typeof response.model_version === "string" ? response.model_version : undefined,
    top2_season: parseOptionalSeason(getStringField(response, ["top2_season"])),
    top2_season_kr: getStringField(response, ["top2_season_kr"]),
    top2_confidence: getNumberField(response, ["top2_confidence"]),
    top1_top2_gap: getNumberField(response, ["top1_top2_gap"]),
    needs_questions:
      typeof response.needs_questions === "boolean"
        ? response.needs_questions
        : undefined,
    question_reason: getStringField(response, ["question_reason"]),
    attributes: getObjectField(response, ["attributes"]),
    quality: getObjectField(response, ["quality"]),
  };
}


function isUniqueConstraintError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = (error as { message?: string }).message;
  const code = (error as { code?: string }).code;

  return (
    code === "23505" ||
    typeof message === "string" &&
      (message.includes("duplicate key") || message.includes("unique constraint") || message.includes("already exists"))
  );
}

function getLoginRequiredError() {
  return new Error("AI 진단은 로그인 후 이용할 수 있어요.");
}

function getDailyLimitError() {
  return new Error("오늘의 진단 기회를 이미 사용했어요. 내일 다시 이용해주세요.");
}

function getGenericDiagnosisError() {
  return new Error("진단 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
}

export async function requestAiDiagnosis(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/diagnosis/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("진단 API 요청에 실패했어요.");
  }

  return parseAiDiagnosisResponse(await response.json());
}

export async function analyzeDiagnosisPhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { getAuthorizationHeader } = await import("./home");
  const response = await fetch("/api/diagnosis/submit", {
    method: "POST",
    headers: await getAuthorizationHeader(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("진단 결과를 저장하지 못했습니다.");
  }

  const data = (await response.json()) as {
    finalResult: FinalDiagnosisResult;
  };
  const finalResult = data.finalResult;
  const aiResult = finalResult.aiResult;

  return {
    aiResult,
    finalResult,
    needsQuestions: shouldAskDiagnosisQuestions(aiResult),
  };
}

function storeDiagnosisResult(upload: DiagnosisUpload, result: DiagnosisResultRow) {
  const updatedUpload = {
    ...upload,
    diagnosisResultId: result.id,
  };

  void updatedUpload;
}

type DiagnosisRequestInsertPayload = {
  user_id: string;
  image_url: null;
  status: "pending";
};

async function createDiagnosisRequest(user: User) {
  const payload: DiagnosisRequestInsertPayload = {
    user_id: user.id,
    image_url: null,
    status: "pending",
  };

  const { data: request, error } = await supabase
    .from("diagnosis_requests")
    .insert(payload)
    .select("id, user_id")
    .single<DiagnosisRequestRow>();

  if (error || !request) {
    if (isUniqueConstraintError(error)) {
      throw getDailyLimitError();
    }

    throw getGenericDiagnosisError();
  }

  return request;
}

async function saveDiagnosisResult(
  requestId: number,
  userId: string | null,
  aiResult: PredictResponse,
) {
  const { data, error } = await supabase
    .from("diagnosis_results")
    .insert({
      request_id: requestId,
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

  if (error || !data) {
    throw new Error(error?.message ?? "진단 결과 저장에 실패했어요.");
  }

  return data;
}

function shouldAskDiagnosisQuestions(result: PredictResponse) {
  return (
    result.needs_questions ??
    (result.confidence < 50 ||
      (typeof result.top1_top2_gap === "number" &&
        result.top1_top2_gap < 12) ||
      (result.season === "autumn" && result.confidence < 60))
  );
}

export function createFinalDiagnosisResult(
  aiResult: PredictResponse,
  answers?: SurveyAnswers,
): FinalDiagnosisResult {
  if (!answers) {
    return {
      aiResult,
      finalSeason: aiResult.season,
      finalSeasonKr: aiResult.season_kr,
      finalConfidence: normalizeConfidence(aiResult.confidence),
      adjustedProbs: aiResult.probs,
      correctionApplied: false,
    };
  }

  const rerankedResult = rerankSeasonScores(aiResult.probs, answers);

  return {
    aiResult,
    userAnswers: answers,
    finalSeason: rerankedResult.finalSeason,
    finalSeasonKr: SEASON_KR[rerankedResult.finalSeason],
    finalConfidence: rerankedResult.finalConfidence,
    adjustedProbs: rerankedResult.adjustedProbs,
    correctionApplied: rerankedResult.correctionApplied,
  };
}

async function updateSavedDiagnosisWithFinalResult(
  diagnosisResultId: number,
  finalResult: FinalDiagnosisResult,
) {
  const { error } = await supabase
    .from("diagnosis_results")
    .update({
      tone_code: finalResult.finalSeason,
      tone_label: finalResult.finalSeasonKr,
      confidence: finalResult.finalConfidence,
      raw_result: {
        source: "ai_diagnosis_api",
        ...finalResult.aiResult,
        survey_answers: finalResult.userAnswers,
        final_result: {
          finalSeason: finalResult.finalSeason,
          finalSeasonKr: finalResult.finalSeasonKr,
          finalConfidence: finalResult.finalConfidence,
          adjustedProbs: finalResult.adjustedProbs,
          correctionApplied: finalResult.correctionApplied,
        },
      },
    })
    .eq("id", diagnosisResultId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function finalizeDiagnosisWithSurvey(
  diagnosisResultId: number | undefined,
  aiResult: PredictResponse,
  answers: SurveyAnswers,
) {
  const finalResult = createFinalDiagnosisResult(aiResult, answers);

  if (diagnosisResultId) {
    await updateSavedDiagnosisWithFinalResult(diagnosisResultId, finalResult);
  }

  const user = await getCurrentUser();

  if (user) {
    await updateProfileSkinTone(user.id, finalResult.finalSeason);
  }

  return finalResult;
}

async function updateDiagnosisRequestStatus(
  requestId: number,
  status: "success" | "failed",
  errorMessage: string | null = null,
) {
  await supabase
    .from("diagnosis_requests")
    .update({
      status,
      completed_at: new Date().toISOString(),
      error_message: errorMessage,
    })
    .eq("id", requestId);
}

export { ensureUserProfile };

export async function fetchLatestDiagnosisSeasonForUser(userId: string) {
  return fetchProfileSkinToneForUser(userId);
}

export async function fetchLatestDiagnosisForUser(userId: string) {
  const profileSeason = await fetchProfileSkinToneForUser(userId);

  const { data, error } = await supabase
    .from("diagnosis_results")
    .select("id, tone_code, tone_label, confidence, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<DiagnosisResultRow>();

  if (error || !data) {
    return null;
  }

  const season =
    profileSeason ??
    getPersonalColorSeasonFromValue(data.tone_code ?? data.tone_label);

  return {
    id: data.id,
    season,
    toneLabel: personalColorResults[season].toneLabel,
    confidence: data.confidence,
    createdAt: data.created_at ?? null,
  };
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

export async function fetchDiagnosisHistoryDetailForUser(
  userId: string,
  diagnosisId: number,
) {
  const { data, error } = await supabase
    .from("diagnosis_results")
    .select("id, tone_code, tone_label, confidence, created_at")
    .eq("user_id", userId)
    .eq("id", diagnosisId)
    .maybeSingle<DiagnosisResultRow>();

  if (error || !data) {
    return null;
  }

  const season = getPersonalColorSeasonFromValue(
    data.tone_code ?? data.tone_label,
  );
  const result = personalColorResults[season];

  return {
    id: data.id,
    season,
    toneLabel: data.tone_label ?? result.toneLabel,
    confidence: data.confidence,
    createdAt: data.created_at ?? null,
    description: result.description,
    detailDescription: result.detailDescription,
  } satisfies DiagnosisHistoryDetail;
}

export async function uploadDiagnosisPhoto(file: File): Promise<DiagnosisUpload> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  }

  const user = await getCurrentUser();

  if (!user) {
    throw getLoginRequiredError();
  }

  const requestedAt = new Date().toISOString();

  await ensureUserProfile(user);
  let requestId: number | null = null;

  try {
    const request = await createDiagnosisRequest(user);
    requestId = request.id;
    const aiResult = await requestAiDiagnosis(file);
    const result = await saveDiagnosisResult(
      request.id,
      user.id,
      aiResult,
    );
    const finalResult = createFinalDiagnosisResult(aiResult);

    await updateDiagnosisRequestStatus(request.id, "success", null);

    const upload = {
      uploadId: String(request.id),
      fileName: file.name,
      uploadedAt: requestedAt,
      diagnosisRequestId: request.id,
      diagnosisResultId: result.id,
      needsQuestions: shouldAskDiagnosisQuestions(aiResult),
    };

    storeDiagnosisResult(upload, result);
    await updateProfileSkinTone(user.id, finalResult.finalSeason);

    return upload;
  } catch (error) {
    if (requestId) {
      await updateDiagnosisRequestStatus(
        requestId,
        "failed",
        error instanceof Error ? error.message : null,
      );
    }

    if (error instanceof Error) {
      const knownMessages = [
        getLoginRequiredError().message,
        getDailyLimitError().message,
        getGenericDiagnosisError().message,
        "이미지를 먼저 선택해주세요.",
        "이미지 파일만 업로드할 수 있어요.",
      ];

      if (knownMessages.includes(error.message)) {
        throw error;
      }
    }

    throw getGenericDiagnosisError();
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
