import {
  POPUP_BUDGET_PHRASES,
  POPUP_CRITERIA_PHRASES,
  POPUP_PRODUCTS,
  POPUP_TEXTURE_PHRASES,
  type PopupAnswers,
  type PopupBudget,
  type PopupProduct,
} from "../constants/popup";

export type PopupRecommendation = {
  product: PopupProduct;
  reason: string;
};

const MAX_RECOMMENDATIONS = 3;

export function getBudgetOf(price: number): PopupBudget {
  if (price < 15000) return "under_15000";
  if (price < 25000) return "15000_25000";
  return "over_25000";
}

function scoreProduct(product: PopupProduct, answers: PopupAnswers) {
  let score = 0;

  if (product.criteria.includes(answers.criteria)) score += 2;
  if (getBudgetOf(product.popupPrice) === answers.budget) score += 1;

  return score;
}

function buildReason(product: PopupProduct, answers: PopupAnswers) {
  const criteriaMatched = product.criteria.includes(answers.criteria);
  const budgetMatched = getBudgetOf(product.popupPrice) === answers.budget;
  const lead: string[] = [];

  if (criteriaMatched) lead.push(POPUP_CRITERIA_PHRASES[answers.criteria]);
  if (budgetMatched) lead.push(POPUP_BUDGET_PHRASES[answers.budget]);
  // 사용감은 제품별로 태그해두지 않았으므로, 일치 여부와 상관없이 취향으로 언급만 한다.
  lead.push(POPUP_TEXTURE_PHRASES[answers.texture]);

  return `${lead.join(" ")} 추천드려요. ${product.reason}`;
}

export function recommendPopupProducts(
  answers: PopupAnswers,
  products: PopupProduct[] = POPUP_PRODUCTS,
): PopupRecommendation[] {
  return products
    .filter((product) => product.category === answers.category)
    .map((product) => ({ product, score: scoreProduct(product, answers) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.product.priority - b.product.priority ||
        a.product.popupPrice - b.product.popupPrice,
    )
    .slice(0, MAX_RECOMMENDATIONS)
    .map(({ product }) => ({ product, reason: buildReason(product, answers) }));
}
