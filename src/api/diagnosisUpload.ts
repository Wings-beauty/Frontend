export type DiagnosisUpload = {
  uploadId: string;
  fileName: string;
  imageUrl?: string;
  uploadedAt: string;
  diagnosisRequestId?: number;
  diagnosisResultId?: number;
};

const UPLOAD_STORAGE_KEY = "wings_uploaded_photo";
const SEASON_STORAGE_KEY = "wings_personal_color_season";
const RESULT_STORAGE_KEY = "wings_personal_color_result";

export function clearStoredDiagnosis() {
  sessionStorage.removeItem(UPLOAD_STORAGE_KEY);
  sessionStorage.removeItem(SEASON_STORAGE_KEY);
  sessionStorage.removeItem(RESULT_STORAGE_KEY);
}

export function getStoredDiagnosisUpload(): DiagnosisUpload | null {
  const storedUpload = sessionStorage.getItem(UPLOAD_STORAGE_KEY);

  if (!storedUpload) {
    return null;
  }

  try {
    const { imageUrl: _imageUrl, ...upload } = JSON.parse(
      storedUpload,
    ) as DiagnosisUpload;

    return upload;
  } catch {
    sessionStorage.removeItem(UPLOAD_STORAGE_KEY);
    return null;
  }
}

export function setStoredDiagnosisUpload(upload: DiagnosisUpload) {
  const { imageUrl: _imageUrl, ...serializableUpload } = upload;

  sessionStorage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(serializableUpload));
}
