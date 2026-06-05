import type { PersonalColorSeason } from "../constants/personalColor";

export type RecommendedProduct = {
  id: number;
  brandName: string;
  productName: string;
  productColor: string;
  category: string;
  colorHex: string | null;
  productImageUrl: string | null;
  productUrl: string | null;
  price: number | null;
  toneType: string;
  detailedTone: string;
  lipType: string;
  texture: string;
  recommendedSkinType: string;
  hue: number | null;
  saturation: number | null;
  brightness: number | null;
};

type ProductsResponse = {
  products?: RecommendedProduct[];
};

async function readProductsResponse(response: Response) {
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as ProductsResponse;

  return data.products ?? [];
}

export async function fetchRecommendedProducts(season: PersonalColorSeason) {
  const response = await fetch(
    `/api/products/recommendations?season=${encodeURIComponent(season)}`,
  );

  return readProductsResponse(response);
}

export async function fetchSavedProductsForUser(userId: string) {
  const response = await fetch(
    `/api/products/saved?userId=${encodeURIComponent(userId)}`,
  );

  return readProductsResponse(response);
}

export async function removeSavedProduct(userId: string, productId: number) {
  const response = await fetch(
    `/api/products/saved?userId=${encodeURIComponent(userId)}&productId=${productId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("찜한 상품을 해제하지 못했어요.");
  }
}

export async function saveSavedProduct(userId: string, productId: number) {
  const response = await fetch("/api/products/saved", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, productId }),
  });

  if (!response.ok) {
    throw new Error("상품을 찜하지 못했어요.");
  }
}
