import type {
  DiagnosisFeedback,
  FinalDiagnosisResult,
  PredictResponse,
  SurveyAnswers,
} from "../types/diagnosis";

export type DiagnosisUpload = {
  uploadId: string;
  fileName: string;
  imageUrl?: string;
  uploadedAt: string;
  diagnosisRequestId?: number;
  diagnosisResultId?: number;
  needsQuestions?: boolean;
  isGuest?: boolean;
};

const UPLOAD_STORAGE_KEY = "wings_uploaded_photo";
const SEASON_STORAGE_KEY = "wings_personal_color_season";
const RESULT_STORAGE_KEY = "wings_personal_color_result";
const AI_RESULT_STORAGE_KEY = "wings_ai_diagnosis_result";
const FINAL_RESULT_STORAGE_KEY = "wings_final_diagnosis_result";
const SURVEY_ANSWERS_STORAGE_KEY = "wings_diagnosis_survey_answers";
const FEEDBACK_STORAGE_KEY = "wings_diagnosis_feedback";

export function clearStoredDiagnosis() {
  sessionStorage.removeItem(UPLOAD_STORAGE_KEY);
  sessionStorage.removeItem(SEASON_STORAGE_KEY);
  sessionStorage.removeItem(RESULT_STORAGE_KEY);
  sessionStorage.removeItem(AI_RESULT_STORAGE_KEY);
  sessionStorage.removeItem(FINAL_RESULT_STORAGE_KEY);
  sessionStorage.removeItem(SURVEY_ANSWERS_STORAGE_KEY);
  sessionStorage.removeItem(FEEDBACK_STORAGE_KEY);
}

function removeImageUrl(upload: DiagnosisUpload) {
  const serializableUpload = { ...upload };
  delete serializableUpload.imageUrl;

  return serializableUpload;
}

export function getStoredDiagnosisUpload(): DiagnosisUpload | null {
  const storedUpload = sessionStorage.getItem(UPLOAD_STORAGE_KEY);

  if (!storedUpload) {
    return null;
  }

  try {
    return removeImageUrl(JSON.parse(storedUpload) as DiagnosisUpload);
  } catch {
    sessionStorage.removeItem(UPLOAD_STORAGE_KEY);
    return null;
  }
}

export function setStoredDiagnosisUpload(upload: DiagnosisUpload) {
  sessionStorage.setItem(
    UPLOAD_STORAGE_KEY,
    JSON.stringify(removeImageUrl(upload)),
  );
}

function readJsonFromSession<T>(key: string): T | null {
  const storedValue = sessionStorage.getItem(key);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export function getStoredAiDiagnosisResult() {
  return readJsonFromSession<PredictResponse>(AI_RESULT_STORAGE_KEY);
}

export function setStoredAiDiagnosisResult(result: PredictResponse) {
  sessionStorage.setItem(AI_RESULT_STORAGE_KEY, JSON.stringify(result));
}

export function getStoredFinalDiagnosisResult() {
  return readJsonFromSession<FinalDiagnosisResult>(FINAL_RESULT_STORAGE_KEY);
}

export function setStoredFinalDiagnosisResult(result: FinalDiagnosisResult) {
  sessionStorage.setItem(FINAL_RESULT_STORAGE_KEY, JSON.stringify(result));
  sessionStorage.setItem("wings_personal_color_season", result.finalSeason);
  sessionStorage.setItem("wings_personal_color_result", result.finalSeasonKr);
}

export function getStoredSurveyAnswers() {
  return readJsonFromSession<SurveyAnswers>(SURVEY_ANSWERS_STORAGE_KEY);
}

export function setStoredSurveyAnswers(answers: SurveyAnswers) {
  sessionStorage.setItem(SURVEY_ANSWERS_STORAGE_KEY, JSON.stringify(answers));
}

export function getStoredDiagnosisFeedback() {
  return readJsonFromSession<DiagnosisFeedback>(FEEDBACK_STORAGE_KEY);
}

export function setStoredDiagnosisFeedback(feedback: DiagnosisFeedback) {
  sessionStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
}
