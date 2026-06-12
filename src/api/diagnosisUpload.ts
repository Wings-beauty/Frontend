import type { PredictResponse } from "../types/diagnosis";

export type DiagnosisUpload = {
  uploadId: string;
  fileName: string;
  imageUrl?: string;
  uploadedAt: string;
  diagnosisRequestId?: number;
  diagnosisResultId?: number;
  needsQuestions?: boolean;
};

export type PendingDiagnosisPhoto = {
  file: File;
  fileName: string;
  fileSize: number;
  mimeType: string;
  previewUrl?: string;
};

export type PendingDiagnosisSurvey = {
  diagnosisResultId?: number;
  aiResult: PredictResponse;
};

let pendingDiagnosisPhoto: PendingDiagnosisPhoto | null = null;
let pendingDiagnosisSurvey: PendingDiagnosisSurvey | null = null;

export function clearStoredDiagnosis() {
  pendingDiagnosisPhoto = null;
  pendingDiagnosisSurvey = null;
}

export function setPendingDiagnosisPhoto(photo: PendingDiagnosisPhoto) {
  pendingDiagnosisPhoto = photo;
}

export function getPendingDiagnosisPhoto() {
  return pendingDiagnosisPhoto;
}

export function clearPendingDiagnosisPhoto() {
  pendingDiagnosisPhoto = null;
}

export function setPendingDiagnosisSurvey(survey: PendingDiagnosisSurvey) {
  pendingDiagnosisSurvey = survey;
}

export function getPendingDiagnosisSurvey() {
  return pendingDiagnosisSurvey;
}

export function clearPendingDiagnosisSurvey() {
  pendingDiagnosisSurvey = null;
}
