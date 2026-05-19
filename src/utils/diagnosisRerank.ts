import type { Season, SeasonScores, SurveyAnswers } from "../types/diagnosis";

const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

const QUESTION_WEIGHTS: {
  [Question in keyof SurveyAnswers]: Record<
    SurveyAnswers[Question],
    SeasonScores
  >;
} = {
  warmcool_preference: {
    warm: {
      spring: 0.1,
      summer: -0.08,
      autumn: 0.1,
      winter: -0.08,
    },
    cool: {
      spring: -0.08,
      summer: 0.12,
      autumn: -0.1,
      winter: 0.12,
    },
    unknown: {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0,
    },
  },
  brightness_preference: {
    light: {
      spring: 0.06,
      summer: 0.08,
      autumn: -0.04,
      winter: -0.03,
    },
    deep: {
      spring: -0.03,
      summer: -0.04,
      autumn: 0.08,
      winter: 0.06,
    },
    unknown: {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0,
    },
  },
  clarity_preference: {
    clear: {
      spring: 0.07,
      summer: -0.04,
      autumn: -0.04,
      winter: 0.07,
    },
    muted: {
      spring: -0.04,
      summer: 0.07,
      autumn: 0.07,
      winter: -0.04,
    },
    unknown: {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0,
    },
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getTopSeason(scores: SeasonScores) {
  return [...SEASONS].sort((a, b) => scores[b] - scores[a])[0];
}

function normalizeScores(scores: SeasonScores): SeasonScores {
  const total = SEASONS.reduce((sum, season) => sum + scores[season], 0);

  if (total <= 0) {
    return {
      spring: 0.25,
      summer: 0.25,
      autumn: 0.25,
      winter: 0.25,
    };
  }

  return SEASONS.reduce(
    (normalized, season) => ({
      ...normalized,
      [season]: scores[season] / total,
    }),
    {} as SeasonScores,
  );
}

export function rerankSeasonScores(
  aiScores: SeasonScores,
  answers: SurveyAnswers,
  options?: {
    alpha?: number;
    topK?: number;
    maxAdjustment?: number;
  },
): {
  finalSeason: Season;
  finalConfidence: number;
  adjustedProbs: SeasonScores;
  correctionApplied: boolean;
} {
  const alpha = options?.alpha ?? 0.5;
  const topK = options?.topK ?? 3;
  const maxAdjustment = options?.maxAdjustment ?? 0.15;
  const originalTopSeason = getTopSeason(aiScores);
  const correctionTargets = new Set(
    [...SEASONS].sort((a, b) => aiScores[b] - aiScores[a]).slice(0, topK),
  );

  const adjustments = SEASONS.reduce(
    (scoreMap, season) => ({
      ...scoreMap,
      [season]: 0,
    }),
    {} as SeasonScores,
  );

  const selectedWeights = [
    QUESTION_WEIGHTS.warmcool_preference[answers.warmcool_preference],
    QUESTION_WEIGHTS.brightness_preference[answers.brightness_preference],
    QUESTION_WEIGHTS.clarity_preference[answers.clarity_preference],
  ];

  selectedWeights.forEach((weights) => {
    SEASONS.forEach((season) => {
      if (correctionTargets.has(season)) {
        adjustments[season] += weights[season];
      }
    });
  });

  const adjustedScores = SEASONS.reduce((scoreMap, season) => {
    const adjustment = clamp(adjustments[season], -maxAdjustment, maxAdjustment);

    return {
      ...scoreMap,
      [season]: Math.max(0, aiScores[season] + alpha * adjustment),
    };
  }, {} as SeasonScores);

  const adjustedProbs = normalizeScores(adjustedScores);
  const finalSeason = getTopSeason(adjustedProbs);

  return {
    finalSeason,
    finalConfidence: adjustedProbs[finalSeason],
    adjustedProbs,
    correctionApplied: originalTopSeason !== finalSeason,
  };
}
