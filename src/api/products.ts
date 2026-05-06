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
};

type ProductToneTagRow = {
  score: number | null;
  products:
    | {
        id: number;
        brand_name: string | null;
        product_name: string | null;
        product_color: string | null;
        category: string | null;
        color_hex: string | null;
        product_image_url: string | null;
        product_url: string | null;
        price: number | null;
        is_active: boolean | null;
      }
    | null;
};

function mapProduct(product: ProductToneTagRow["products"]): RecommendedProduct | null {
  if (!product || product.is_active === false) {
    return null;
  }

  return {
    id: product.id,
    brandName: product.brand_name ?? "WINGS",
    productName: product.product_name ?? "추천 제품",
    productColor: product.product_color ?? "",
    category: product.category ?? "",
    colorHex: product.color_hex,
    productImageUrl: product.product_image_url,
    productUrl: product.product_url,
    price: product.price,
  };
}

export async function fetchRecommendedProducts(toneCode: string) {
  const { data, error } = await supabase
    .from("product_tone_tags")
    .select(
      "score, products (id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, is_active)",
    )
    .eq("tone_code", toneCode)
    .order("score", { ascending: false })
    .limit(12)
    .returns<ProductToneTagRow[]>();

  if (error || !data) {
    return [];
  }

  return data
    .map((tag) => mapProduct(tag.products))
    .filter((product): product is RecommendedProduct => Boolean(product));
}
