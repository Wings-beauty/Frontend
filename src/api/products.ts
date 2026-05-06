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

export async function fetchRecommendedProducts(season: PersonalColorSeason) {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, tone_type, is_active",
    )
    .ilike("tone_type", `%${season}%`)
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
