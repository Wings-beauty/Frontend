export const productCategoryLabels: Record<string, string> = {
  lip: "립",
  blusher: "블러셔",
  eye_shadow: "아이섀도우",
};

export function getProductCategoryLabel(
  category: string | null | undefined,
) {
  if (!category) {
    return "";
  }

  return productCategoryLabels[category] ?? category;
}
