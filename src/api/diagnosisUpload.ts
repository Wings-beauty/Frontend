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

let pendingDiagnosisPhoto: PendingDiagnosisPhoto | null = null;

export function clearStoredDiagnosis() {
  pendingDiagnosisPhoto = null;
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
