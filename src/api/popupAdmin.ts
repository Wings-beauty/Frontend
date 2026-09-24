import { supabase } from "../lib/supabase";
import { requireAdmin } from "./auth";
import {
  POPUP_EVENT,
  POPUP_PRODUCTS,
  POPUP_TIME_SLOTS,
  type PopupTimeSlot,
} from "../constants/popup";

const EVENT_KEY = POPUP_EVENT.key;
const PAGE_SIZE = 1000;

type PageResult<T> = PromiseLike<{
  data: T[] | null;
  error: { message: string } | null;
}>;

async function fetchAllRows<T>(query: (from: number, to: number) => PageResult<T>) {
  const rows: T[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(error.message);
    }

    rows.push(...(data ?? []));

    if (!data || data.length < PAGE_SIZE) {
      break;
    }
  }

  return rows;
}

export type PopupProductStat = {
  productKey: string;
  label: string;
  recommendCount: number;
  recommendUsers: number;
  viewCount: number;
  viewUsers: number;
  wishlistNow: number;
  likeCount: number;
  wishlistConversion: number | null;
  purchaseSurveyCount: number;
};

export type PopupSourceStat = {
  source: string;
  campaign: string;
  visitors: number;
  quizUsers: number;
  visitSlotUsers: number;
  surveyUsers: number;
};

export type PopupAdminStats = {
  totals: {
    visitors: number;
    quizUsers: number;
    visitSlotUsers: number;
    surveyUsers: number;
  };
  products: PopupProductStat[];
  sources: PopupSourceStat[];
  timeSlots: { value: PopupTimeSlot; label: string; count: number }[];
  reasons: { reason: string; count: number }[];
  recentComments: { comment: string; createdAt: string }[];
};

function increment<K>(map: Map<K, number>, key: K) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function uniqueUsers(rows: { user_id: string }[]) {
  return new Set(rows.map((row) => row.user_id));
}

export async function fetchPopupAdminStats(): Promise<PopupAdminStats> {
  await requireAdmin();

  const [visitors, quizzes, events, wishlist, slots, surveys] = await Promise.all([
    fetchAllRows((from, to) =>
      supabase
        .from("popup_visitors")
        .select("user_id, utm_source, utm_campaign")
        .eq("event_key", EVENT_KEY)
        .order("created_at")
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("popup_quiz_responses")
        .select("user_id")
        .eq("event_key", EVENT_KEY)
        .order("created_at")
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("popup_product_events")
        .select("user_id, product_key, event_type")
        .eq("event_key", EVENT_KEY)
        .order("id")
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("popup_wishlist")
        .select("user_id, product_key")
        .eq("event_key", EVENT_KEY)
        .order("created_at")
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("popup_visit_slots")
        .select("user_id, time_slot")
        .eq("event_key", EVENT_KEY)
        .order("created_at")
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("popup_purchase_surveys")
        .select("user_id, product_keys, reasons, comment, updated_at")
        .eq("event_key", EVENT_KEY)
        .order("created_at")
        .range(from, to),
    ),
  ]);

  return computePopupAdminStats({ visitors, quizzes, events, wishlist, slots, surveys });
}

export type PopupAdminRows = {
  visitors: { user_id: string; utm_source: string | null; utm_campaign: string | null }[];
  quizzes: { user_id: string }[];
  events: { user_id: string; product_key: string; event_type: string }[];
  wishlist: { user_id: string; product_key: string }[];
  slots: { user_id: string; time_slot: string }[];
  surveys: {
    user_id: string;
    product_keys: string[];
    reasons: string[];
    comment: string | null;
    updated_at: string;
  }[];
};

export function computePopupAdminStats({
  visitors,
  quizzes,
  events,
  wishlist,
  slots,
  surveys,
}: PopupAdminRows): PopupAdminStats {
  const productKeys = new Set(POPUP_PRODUCTS.map((product) => product.key));
  for (const event of events) productKeys.add(event.product_key);

  const products: PopupProductStat[] = [...productKeys].map((productKey) => {
    const productEvents = events.filter((event) => event.product_key === productKey);
    const ofType = (type: string) =>
      productEvents.filter((event) => event.event_type === type);
    const viewUsers = uniqueUsers(ofType("view"));
    const wishers = uniqueUsers(
      wishlist.filter((row) => row.product_key === productKey),
    );
    const known = POPUP_PRODUCTS.find((product) => product.key === productKey);

    return {
      productKey,
      label: known ? `${known.brand} ${known.name} ${known.shade}` : productKey,
      recommendCount: ofType("recommend").length,
      recommendUsers: uniqueUsers(ofType("recommend")).size,
      viewCount: ofType("view").length,
      viewUsers: viewUsers.size,
      wishlistNow: wishers.size,
      likeCount: ofType("like").length,
      wishlistConversion: viewUsers.size > 0 ? wishers.size / viewUsers.size : null,
      purchaseSurveyCount: surveys.filter((survey) =>
        survey.product_keys.includes(productKey),
      ).length,
    };
  });

  const sourceOf = new Map(
    visitors.map((visitor) => [
      visitor.user_id,
      {
        source: visitor.utm_source ?? "(direct)",
        campaign: visitor.utm_campaign ?? "-",
      },
    ]),
  );
  const sources = new Map<string, PopupSourceStat>();
  const bucketOf = (userId: string) => {
    const origin = sourceOf.get(userId) ?? { source: "(unknown)", campaign: "-" };
    const id = JSON.stringify([origin.source, origin.campaign]);
    let bucket = sources.get(id);

    if (!bucket) {
      bucket = { ...origin, visitors: 0, quizUsers: 0, visitSlotUsers: 0, surveyUsers: 0 };
      sources.set(id, bucket);
    }

    return bucket;
  };

  for (const visitor of visitors) bucketOf(visitor.user_id).visitors += 1;
  for (const user of uniqueUsers(quizzes)) bucketOf(user).quizUsers += 1;
  for (const user of uniqueUsers(slots)) bucketOf(user).visitSlotUsers += 1;
  for (const user of uniqueUsers(surveys)) bucketOf(user).surveyUsers += 1;

  const slotCounts = new Map<string, number>();
  for (const slot of slots) increment(slotCounts, slot.time_slot);

  const reasonCounts = new Map<string, number>();
  for (const survey of surveys) {
    for (const reason of survey.reasons) increment(reasonCounts, reason);
  }

  return {
    totals: {
      visitors: uniqueUsers(visitors).size,
      quizUsers: uniqueUsers(quizzes).size,
      visitSlotUsers: uniqueUsers(slots).size,
      surveyUsers: uniqueUsers(surveys).size,
    },
    products: products.sort(
      (a, b) => b.viewCount + b.likeCount - (a.viewCount + a.likeCount),
    ),
    sources: [...sources.values()].sort((a, b) => b.visitors - a.visitors),
    timeSlots: POPUP_TIME_SLOTS.map((slot) => ({
      ...slot,
      count: slotCounts.get(slot.value) ?? 0,
    })),
    reasons: [...reasonCounts.entries()]
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
    recentComments: surveys
      .filter((survey) => survey.comment)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 10)
      .map((survey) => ({
        comment: survey.comment ?? "",
        createdAt: survey.updated_at,
      })),
  };
}
