import type { FinalDiagnosisResult, PredictResponse } from "../types/diagnosis";

const GUEST_TOKEN_STORAGE_KEY = "wings_booth_guest_token";

type GuestDiagnosisIds = { diagnosisRequestId: number; diagnosisResultId: number };
type BoothApiResponse = { ok: true; data?: GuestDiagnosisIds } | { ok: false; message?: string };

function getGuestToken() {
  let token = sessionStorage.getItem(GUEST_TOKEN_STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem(GUEST_TOKEN_STORAGE_KEY, token);
  }
  return token;
}

async function postGuestDiagnosis(body: Record<string, unknown>) {
  const response = await fetch("/api/booth-diagnosis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, guestToken: getGuestToken() }),
  });
  const payload = (await response.json()) as BoothApiResponse;
  if (!response.ok || !payload.ok) {
    throw new Error("message" in payload && payload.message ? payload.message : "진단 기록을 저장하지 못했어요.");
  }
  return payload.data;
}

export async function createGuestDiagnosis(aiResult: PredictResponse) {
  const data = await postGuestDiagnosis({ action: "create", aiResult });
  if (!data) throw new Error("진단 기록을 저장하지 못했어요.");
  return data;
}

export async function finalizeGuestDiagnosis(diagnosisResultId: number, finalResult: FinalDiagnosisResult) {
  await postGuestDiagnosis({ action: "finalize", diagnosisResultId, finalResult });
}
