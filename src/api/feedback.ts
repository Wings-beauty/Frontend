import { supabase } from "../lib/supabase";

export type FeedbackPayload = {
  userId: string;
  diagnosisResultId: number;
  rating: number;
  isMatch: boolean;
  comment: string;
};

export async function fetchFeedbackForDiagnosis(
  userId: string,
  diagnosisResultId: number,
) {
  const { data, error } = await supabase
    .from("feedbacks")
    .select("id, rating, is_match, comment")
    .eq("user_id", userId)
    .eq("diagnosis_result_id", diagnosisResultId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

export async function saveDiagnosisFeedback({
  userId,
  diagnosisResultId,
  rating,
  isMatch,
  comment,
}: FeedbackPayload) {
  const { error } = await supabase.from("feedbacks").insert({
    user_id: userId,
    diagnosis_result_id: diagnosisResultId,
    rating,
    is_match: isMatch,
    comment: comment.trim() || null,
  });

  if (error) {
    throw new Error(error.message || "피드백 저장에 실패했어요.");
  }
}
