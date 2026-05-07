import type { MockUploadResponse } from "./mockUploadPhoto";
import { supabase } from "../lib/supabase";
import type { PersonalColorSeason } from "../constants/personalColor";
import {
  getPersonalColorSeasonFromValue,
  personalColorResults,
} from "../constants/personalColor";

const STORAGE_BUCKET = "diagnosis-images";

type DiagnosisResultRow = {
  id: number;
  tone_code: string | null;
  tone_label: string | null;
  confidence: number | null;
  created_at?: string | null;
};

export type DiagnosisHistoryItem = {
  id: number;
  season: PersonalColorSeason;
  toneLabel: string;
  confidence: number | null;
  createdAt: string | null;
};

function getSeasonFromToneCode(toneCode: string | null): PersonalColorSeason {
  if (toneCode?.startsWith("spring")) {
    return "spring";
  }

  if (toneCode?.startsWith("autumn")) {
    return "autumn";
  }

  if (toneCode?.startsWith("winter")) {
    return "winter";
  }

  return "summer";
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

function getMockSeason(seed: number): PersonalColorSeason {
  const seasons: PersonalColorSeason[] = ["spring", "summer", "autumn", "winter"];

  return seasons[seed % seasons.length];
}

async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser();

  return data.user?.id ?? null;
}

async function uploadImageToStorage(file: File) {
  const fileExtension = file.name.split(".").pop() || "jpg";
  const storagePath = `public/${crypto.randomUUID()}.${fileExtension}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return null;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function uploadDiagnosisPhoto(file: File): Promise<MockUploadResponse> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  }

  const localImageUrl = URL.createObjectURL(file);
  const userId = await getCurrentUserId();
  const uploadedImageUrl = await uploadImageToStorage(file);

  const { data, error } = await supabase
    .from("diagnosis_requests")
    .insert({
      user_id: userId,
      image_url: uploadedImageUrl,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    URL.revokeObjectURL(localImageUrl);
    throw new Error(error.message || "진단 요청을 저장하지 못했어요.");
  }

  if (uploadedImageUrl) {
    URL.revokeObjectURL(localImageUrl);
  }

  return {
    uploadId: String(data.id),
    fileName: file.name,
    imageUrl: uploadedImageUrl ?? localImageUrl,
    uploadedAt: new Date().toISOString(),
    diagnosisRequestId: data.id,
  };
}

export async function completeDiagnosis(upload: MockUploadResponse) {
  if (!upload.diagnosisRequestId) {
    return null;
  }

  const userId = await getCurrentUserId();
  const season = getMockSeason(upload.diagnosisRequestId);
  const result = personalColorResults[season];
  const toneCode = `${season}_mock`;

  const { data: existingResult } = await supabase
    .from("diagnosis_results")
    .select("id, tone_code, tone_label, confidence")
    .eq("request_id", upload.diagnosisRequestId)
    .maybeSingle<DiagnosisResultRow>();

  const savedResult =
    existingResult ??
    (
      await supabase
        .from("diagnosis_results")
        .insert({
          request_id: upload.diagnosisRequestId,
          user_id: userId,
          tone_code: toneCode,
          tone_label: result.toneLabel,
          confidence: 0.86,
          raw_result: {
            source: "frontend_mock",
            season,
            toneCode,
          },
        })
        .select("id, tone_code, tone_label, confidence")
        .single()
    ).data;

  if (!savedResult) {
    await supabase
      .from("diagnosis_requests")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: "진단 결과 저장에 실패했어요.",
      })
      .eq("id", upload.diagnosisRequestId);

    return null;
  }

  await supabase
    .from("diagnosis_requests")
    .update({
      status: "success",
      completed_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", upload.diagnosisRequestId);

  const storedSeason = getSeasonFromToneCode(savedResult.tone_code);
  const updatedUpload = {
    ...upload,
    diagnosisResultId: savedResult.id,
  };

  sessionStorage.setItem("wings_uploaded_photo", JSON.stringify(updatedUpload));
  sessionStorage.setItem("wings_personal_color_season", storedSeason);
  sessionStorage.setItem("wings_personal_color_result", savedResult.tone_label ?? result.toneLabel);

  return savedResult;
}
