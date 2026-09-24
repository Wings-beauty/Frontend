import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/supabase", () => ({ supabase: {} }));
vi.mock("./auth", () => ({ requireAdmin: vi.fn() }));

const { computePopupAdminStats } = await import("./popupAdmin");

const PRODUCT = "clasivo-new-heart-cica-cushion";
const OTHER = "heeyo-3sec-hair-booster";

const baseRows = {
  visitors: [
    { user_id: "a", utm_source: "instagram", utm_campaign: "1001" },
    { user_id: "b", utm_source: "instagram", utm_campaign: "1001" },
    { user_id: "c", utm_source: null, utm_campaign: null },
  ],
  quizzes: [{ user_id: "a" }, { user_id: "b" }],
  events: [
    { user_id: "a", product_key: PRODUCT, event_type: "recommend" },
    { user_id: "b", product_key: PRODUCT, event_type: "recommend" },
    { user_id: "a", product_key: PRODUCT, event_type: "view" },
    { user_id: "a", product_key: PRODUCT, event_type: "view" },
    { user_id: "a", product_key: PRODUCT, event_type: "view" },
    { user_id: "b", product_key: PRODUCT, event_type: "view" },
    { user_id: "a", product_key: PRODUCT, event_type: "like" },
    { user_id: "a", product_key: PRODUCT, event_type: "unlike" },
    { user_id: "a", product_key: PRODUCT, event_type: "like" },
  ],
  wishlist: [{ user_id: "a", product_key: PRODUCT }],
  slots: [{ user_id: "a", time_slot: "12-14" }],
  surveys: [
    {
      user_id: "a",
      product_keys: [PRODUCT],
      reasons: ["팝업 특가가 좋아서", "선물하려고"],
      comment: "좋았어요",
      updated_at: "2026-10-01T05:00:00.000Z",
    },
  ],
};

describe("computePopupAdminStats", () => {
  const stats = computePopupAdminStats(baseRows);
  const product = stats.products.find((item) => item.productKey === PRODUCT)!;

  it("퍼널 합계는 고유 사용자 기준이다", () => {
    expect(stats.totals).toEqual({
      visitors: 3,
      quizUsers: 2,
      visitSlotUsers: 1,
      surveyUsers: 1,
    });
  });

  it("제품 지표를 이벤트 수와 고유 사용자로 나눠 계산한다", () => {
    expect(product.recommendCount).toBe(2);
    expect(product.recommendUsers).toBe(2);
    expect(product.viewCount).toBe(4);
    expect(product.viewUsers).toBe(2);
    expect(product.likeCount).toBe(2);
    expect(product.wishlistNow).toBe(1);
    expect(product.purchaseSurveyCount).toBe(1);
  });

  it("찜 전환율은 조회 횟수가 아니라 고유 조회자 기준이다", () => {
    expect(product.wishlistConversion).toBe(0.5);
  });

  it("조회자가 없으면 찜 전환율은 null이다", () => {
    const untouched = stats.products.find((item) => item.productKey === OTHER)!;

    expect(untouched.wishlistConversion).toBeNull();
    expect(untouched.viewCount).toBe(0);
  });

  it("유입 경로별 퍼널을 first-touch 기준으로 묶는다", () => {
    const instagram = stats.sources.find((item) => item.source === "instagram")!;
    const direct = stats.sources.find((item) => item.source === "(direct)")!;

    expect(instagram).toMatchObject({
      campaign: "1001",
      visitors: 2,
      quizUsers: 2,
      visitSlotUsers: 1,
      surveyUsers: 1,
    });
    expect(direct).toMatchObject({ campaign: "-", visitors: 1, quizUsers: 0 });
  });

  it("시간대, 구매 이유, 최근 의견을 집계한다", () => {
    expect(stats.timeSlots.find((slot) => slot.value === "12-14")?.count).toBe(1);
    expect(stats.timeSlots.find((slot) => slot.value === "10-12")?.count).toBe(0);
    expect(stats.reasons).toHaveLength(2);
    expect(stats.recentComments).toEqual([
      { comment: "좋았어요", createdAt: "2026-10-01T05:00:00.000Z" },
    ]);
  });

  it("데이터가 없어도 빈 통계를 반환한다", () => {
    const empty = computePopupAdminStats({
      visitors: [],
      quizzes: [],
      events: [],
      wishlist: [],
      slots: [],
      surveys: [],
    });

    expect(empty.totals.visitors).toBe(0);
    expect(empty.sources).toEqual([]);
    expect(empty.timeSlots.every((slot) => slot.count === 0)).toBe(true);
  });
});
