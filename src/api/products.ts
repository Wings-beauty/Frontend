import type { PersonalColorSeason } from "../constants/personalColor";
import { supabase } from "../lib/supabase";

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
};

type ProductRow = {
  id: number;
  brand_name: string | null;
  product_name: string | null;
  product_color: string | null;
  category: string | null;
  color_hex: string | null;
  product_image_url: string | null;
  product_url: string | null;
  price: number | null;
  tone_type: string | null;
  is_active: boolean | null;
};

function mapProduct(product: ProductRow): RecommendedProduct | null {
  if (product.is_active === false) {
    return null;
  }

  return {
    id: product.id,
    brandName: product.brand_name ?? "WINGS",
    productName: product.product_name ?? "추천 상품",
    productColor: product.product_color ?? "",
    category: product.category ?? "",
    colorHex: product.color_hex,
    productImageUrl: product.product_image_url,
    productUrl: product.product_url,
    price: product.price,
    toneType: product.tone_type ?? "",
  };
}

function getKoreanSeason(season: PersonalColorSeason): string {
  const seasonMap: Record<string, string> = {
    spring: "봄",
    summer: "여름",
    autumn: "가을",
    winter: "겨울",
  };
  return seasonMap[String(season)] ?? String(season);
}

export async function fetchRecommendedProducts(season: PersonalColorSeason) {
  const translatedseason = getKoreanSeason(season);
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, tone_type, is_active",
    )
    .ilike("tone_type", `%${translatedseason}%`)
    .order("updated_at", { ascending: false })
    .limit(12)
    .returns<ProductRow[]>();

  if (error || !data) {
    return [];
  }

  return data
    .map(mapProduct)
    .filter((product): product is RecommendedProduct => Boolean(product));
}

export async function fetchSavedProductsForUser(userId: string) {
  const { data: savedProducts, error: savedProductsError } = await supabase
    .from("saved_products")
    .select("product_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (savedProductsError || !savedProducts) {
    return [];
  }

  const productIds = savedProducts
    .map((item) => item.product_id)
    .filter((productId): productId is number => typeof productId === "number");

  if (productIds.length === 0) {
    return [];
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, tone_type, is_active",
    )
    .in("id", productIds)
    .returns<ProductRow[]>();

  if (productsError || !products) {
    return [];
  }

  const productsById = new Map(
    products
      .map(mapProduct)
      .filter((product): product is RecommendedProduct => Boolean(product))
      .map((product) => [product.id, product]),
  );

  return productIds
    .map((productId) => productsById.get(productId))
    .filter((product): product is RecommendedProduct => Boolean(product));
}

export async function removeSavedProduct(userId: string, productId: number) {
  const { error } = await supabase
    .from("saved_products")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(error.message || "찜한 제품을 해제하지 못했어요.");
  }
}

export async function saveSavedProduct(userId: string, productId: number) {
  const { error } = await supabase
    .from("saved_products")
    .insert({ user_id: userId, product_id: productId });

  if (error) {
    // Unique constraint violation code is usually '23505'
    if (error.code === "23505") return;
    throw new Error(error.message || "제품을 찜하지 못했어요.");
  }
}
