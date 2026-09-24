import { describe, expect, it } from "vitest";
import {
  POPUP_PRODUCTS,
  POPUP_QUESTIONS,
  type PopupAnswers,
  type PopupProduct,
} from "../constants/popup";
import { getBudgetOf, recommendPopupProducts } from "./popupRecommend";

function makeProduct(overrides: Partial<PopupProduct>): PopupProduct {
  return {
    key: "p",
    brand: "b",
    name: "n",
    shade: "s",
    category: "skincare",
    criteria: [],
    popupPrice: 10000,
    originalPrice: 12000,
    tags: [],
    reason: "기본 이유",
    priority: 1,
    imageUrl: null,
    colorHex: "#000000",
    ...overrides,
  };
}

function makeAnswers(overrides: Partial<PopupAnswers> = {}): PopupAnswers {
  return {
    category: "skincare",
    criteria: "ingredient",
    texture: "light",
    budget: "under_15000",
    infoNeed: "reviews",
    ...overrides,
  };
}

describe("getBudgetOf", () => {
  it.each([
    [14999, "under_15000"],
    [15000, "15000_25000"],
    [24999, "15000_25000"],
    [25000, "over_25000"],
  ] as const)("%i원은 %s 구간", (price, expected) => {
    expect(getBudgetOf(price)).toBe(expected);
  });
});

describe("recommendPopupProducts", () => {
  it("선택한 카테고리의 제품만 추천한다", () => {
    const result = recommendPopupProducts(
      makeAnswers({ category: "skincare", criteria: "ingredient", budget: "under_15000" }),
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every(({ product }) => product.category === "skincare")).toBe(true);
  });

  it("선택 기준이 일치하는 제품을 먼저 추천한다", () => {
    const result = recommendPopupProducts(
      makeAnswers({ category: "makeup", criteria: "ingredient", budget: "over_25000" }),
    );

    expect(result[0].product.criteria).toContain("ingredient");
  });

  it("가격대 일치가 점수에 반영된다", () => {
    const products = [
      makeProduct({ key: "cheap", popupPrice: 9000, priority: 1 }),
      makeProduct({ key: "premium", popupPrice: 30000, priority: 2 }),
    ];
    const result = recommendPopupProducts(
      makeAnswers({ category: "skincare", criteria: "brand", budget: "over_25000" }),
      products,
    );

    expect(result[0].product.key).toBe("premium");
  });

  it("점수가 같으면 priority, 그다음 가격 순으로 항상 같은 결과를 낸다", () => {
    const products = [
      makeProduct({ key: "c", priority: 2, popupPrice: 9000 }),
      makeProduct({ key: "b", priority: 1, popupPrice: 12000 }),
      makeProduct({ key: "a", priority: 1, popupPrice: 8000 }),
    ];
    const answers = makeAnswers({ category: "skincare", criteria: "brand", budget: "over_25000" });

    const first = recommendPopupProducts(answers, products).map((r) => r.product.key);
    const second = recommendPopupProducts(answers, [...products].reverse()).map(
      (r) => r.product.key,
    );

    expect(first).toEqual(["a", "b", "c"]);
    expect(second).toEqual(first);
  });

  it("모든 답변 조합에서 결과가 비지 않고 최대 3개이며 이유가 비어 있지 않다", () => {
    const [categories, criteria, textures, budgets, infoNeeds] = POPUP_QUESTIONS;

    for (const category of categories.options) {
      for (const criterion of criteria.options) {
        for (const texture of textures.options) {
          for (const budget of budgets.options) {
            for (const infoNeed of infoNeeds.options) {
              const result = recommendPopupProducts({
                category: category.value,
                criteria: criterion.value,
                texture: texture.value,
                budget: budget.value,
                infoNeed: infoNeed.value,
              });

              // 카탈로그가 작은 카테고리(예: 향수 1종)도 있어 2개 미만이 나올 수 있다.
              expect(result.length).toBeGreaterThanOrEqual(1);
              expect(result.length).toBeLessThanOrEqual(3);
              expect(result.every(({ reason }) => reason.trim().length > 0)).toBe(true);
            }
          }
        }
      }
    }
  });

  it("제품이 3개 이상인 카테고리는 항상 3개를 추천한다", () => {
    const countByCategory = new Map<string, number>();
    for (const product of POPUP_PRODUCTS) {
      countByCategory.set(product.category, (countByCategory.get(product.category) ?? 0) + 1);
    }

    for (const [category, count] of countByCategory) {
      if (count < 3) continue;

      const result = recommendPopupProducts(
        makeAnswers({
          category: category as PopupAnswers["category"],
          criteria: "review",
          budget: "15000_25000",
        }),
      );

      expect(result.length).toBe(3);
    }
  });

  it("제품 상수의 key는 서로 겹치지 않는다", () => {
    const keys = POPUP_PRODUCTS.map((product) => product.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("모든 제품에 실제 이미지가 연결돼 있다", () => {
    expect(POPUP_PRODUCTS.every((product) => Boolean(product.imageUrl))).toBe(true);
  });
});
