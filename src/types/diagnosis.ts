import type { PersonalColorSeason } from "../constants/personalColor";

export type Season = PersonalColorSeason;

export type SeasonScores = Record<Season, number>;

export type SurveyAnswers = {
  warmcool_preference: "warm" | "cool" | "unknown";
  brightness_preference: "light" | "deep" | "unknown";
  clarity_preference: "clear" | "muted" | "unknown";
};

export type DiagnosisFeedback = {
  matchStatus: "match" | "unclear" | "not_match";
  userSelectedSeason?: Season | "unknown";
  comment?: string;
};

export type PredictResponse = {
  success?: boolean;
  model_version?: string;
  season: Season;
  season_kr: string;
  confidence: number;
  probs: SeasonScores;
  lab: {
    L: number;
    a: number;
    b: number;
  };
  top2_season?: Season;
  top2_season_kr?: string;
  top2_confidence?: number;
  top1_top2_gap?: number;
  needs_questions?: boolean;
  question_reason?: string;
  attributes?: {
    temperature?: "warm" | "cool" | string;
    brightness?: "light" | "deep" | string;
    clarity?: "clear" | "muted" | string;
  };
  quality?: {
    face_detected?: boolean;
    skin_extract_success?: boolean;
  };
};

export type FinalDiagnosisResult = {
  aiResult: PredictResponse;
  userAnswers?: SurveyAnswers;
  finalSeason: Season;
  finalSeasonKr: string;
  finalConfidence: number;
  adjustedProbs: SeasonScores;
  correctionApplied: boolean;
};

export type DiagnosisFlowState = {
  imageUri?: string;
  aiResult?: PredictResponse;
  needsQuestions: boolean;
  surveyAnswers?: SurveyAnswers;
  finalResult?: FinalDiagnosisResult;
  feedback?: DiagnosisFeedback;
};
