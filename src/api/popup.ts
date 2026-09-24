import { popupSupabase } from "../lib/popupSupabase";
import {
  POPUP_EVENT,
  type PopupAnswers,
  type PopupTimeSlot,
} from "../constants/popup";
import { captureAttribution } from "../utils/utm";

const EVENT_KEY = POPUP_EVENT.key;

type ProductEventType = "recommend" | "view" | "like" | "unlike";

let sessionPromise: Promise<string> | null = null;

/** 익명 세션을 확보하고, 처음 방문이면 first-touch 유입 정보와 함께 방문자를 등록한다. */
export function ensurePopupSession() {
  sessionPromise ??= (async () => {
    const {
      data: { session },
    } = await popupSupabase.auth.getSession();
    let userId = session?.user.id;

    if (!userId) {
      const { data, error } = await popupSupabase.auth.signInAnonymously();

      if (error || !data.user) {
        throw new Error("참여 정보를 준비하지 못했어요. 잠시 후 다시 시도해주세요.");
      }

      userId = data.user.id;
    }

    const { error } = await popupSupabase.from("popup_visitors").upsert(
      { event_key: EVENT_KEY, user_id: userId, ...captureAttribution() },
      { onConflict: "event_key,user_id", ignoreDuplicates: true },
    );

    if (error) {
      throw new Error("방문 정보를 저장하지 못했어요.");
    }

    return userId;
  })().catch((error: unknown) => {
    sessionPromise = null;
    throw error;
  });

  return sessionPromise;
}

function productEventRows(
  userId: string,
  productKeys: string[],
  eventType: ProductEventType,
) {
  return productKeys.map((productKey) => ({
    event_key: EVENT_KEY,
    user_id: userId,
    product_key: productKey,
    event_type: eventType,
  }));
}

/** 퀴즈 저장이 성공했을 때만 추천 이벤트를 기록한다. */
export async function submitQuiz(
  answers: PopupAnswers,
  recommendedKeys: string[],
) {
  const userId = await ensurePopupSession();

  const { error } = await popupSupabase.from("popup_quiz_responses").upsert(
    {
      event_key: EVENT_KEY,
      user_id: userId,
      category: answers.category,
      criteria: answers.criteria,
      texture: answers.texture,
      budget: answers.budget,
      info_need: answers.infoNeed,
      recommended_keys: recommendedKeys,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_key,user_id" },
  );

  if (error) {
    throw new Error("응답을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
  }

  const { error: eventError } = await popupSupabase
    .from("popup_product_events")
    .insert(productEventRows(userId, recommendedKeys, "recommend"));

  if (eventError) {
    throw new Error("응답을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}

export async function logProductView(productKey: string) {
  try {
    const userId = await ensurePopupSession();

    await popupSupabase
      .from("popup_product_events")
      .insert(productEventRows(userId, [productKey], "view"));
  } catch {
    // 조회 기록 실패가 화면 사용을 막지 않도록 무시한다.
  }
}

export async function fetchMyWishlist() {
  const userId = await ensurePopupSession();

  const { data, error } = await popupSupabase
    .from("popup_wishlist")
    .select("product_key")
    .eq("event_key", EVENT_KEY)
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.product_key);
}

export async function setWishlist(productKey: string, wished: boolean) {
  const userId = await ensurePopupSession();

  if (wished) {
    const { error } = await popupSupabase
      .from("popup_wishlist")
      .insert({ event_key: EVENT_KEY, user_id: userId, product_key: productKey });

    if (error) {
      if (error.code === "23505") return;
      throw new Error("찜하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  } else {
    const { error } = await popupSupabase
      .from("popup_wishlist")
      .delete()
      .eq("event_key", EVENT_KEY)
      .eq("user_id", userId)
      .eq("product_key", productKey);

    if (error) {
      throw new Error("찜을 해제하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  await popupSupabase
    .from("popup_product_events")
    .insert(productEventRows(userId, [productKey], wished ? "like" : "unlike"));
}

export async function fetchMyVisitSlot() {
  const userId = await ensurePopupSession();

  const { data } = await popupSupabase
    .from("popup_visit_slots")
    .select("time_slot")
    .eq("event_key", EVENT_KEY)
    .eq("user_id", userId)
    .maybeSingle();

  return data?.time_slot ?? null;
}

export async function saveVisitSlot(timeSlot: PopupTimeSlot) {
  const userId = await ensurePopupSession();

  const { error } = await popupSupabase.from("popup_visit_slots").upsert(
    {
      event_key: EVENT_KEY,
      user_id: userId,
      time_slot: timeSlot,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_key,user_id" },
  );

  if (error) {
    throw new Error("방문 예정 시간을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}

export type PurchaseSurvey = {
  productKeys: string[];
  reasons: string[];
  comment: string;
};

export async function fetchMyPurchaseSurvey(): Promise<PurchaseSurvey | null> {
  const userId = await ensurePopupSession();

  const { data } = await popupSupabase
    .from("popup_purchase_surveys")
    .select("product_keys, reasons, comment")
    .eq("event_key", EVENT_KEY)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    productKeys: data.product_keys,
    reasons: data.reasons,
    comment: data.comment ?? "",
  };
}

export async function submitPurchaseSurvey(survey: PurchaseSurvey) {
  const userId = await ensurePopupSession();

  const { error } = await popupSupabase.from("popup_purchase_surveys").upsert(
    {
      event_key: EVENT_KEY,
      user_id: userId,
      product_keys: survey.productKeys,
      reasons: survey.reasons,
      comment: survey.comment.trim().slice(0, 500) || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_key,user_id" },
  );

  if (error) {
    throw new Error("설문을 제출하지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}
