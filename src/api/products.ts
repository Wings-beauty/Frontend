<<<<<<< Updated upstream
import type { PersonalColorSeason } from "../constants/personalColor";
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  toneType: string;
  detailedTone: string;
  lipType: string;
  texture: string;
  recommendedSkinType: string;
  hue: number | null;
  saturation: number | null;
  brightness: number | null;
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
  detailed_tone: string | null;
  lip_type: string | null;
  texture: string | null;
  recommended_skin_type: string | null;
  hue: number | null;
  saturation: number | null;
  brightness: number | null;
  is_active: boolean | null;
};

function mapProduct(product: ProductRow): RecommendedProduct | null {
  if (product.is_active === false) {
=======
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
>>>>>>> Stashed changes
    return null;
  }

  return {
    id: product.id,
    brandName: product.brand_name ?? "WINGS",
<<<<<<< Updated upstream
    productName: product.product_name ?? "추천 상품",
=======
    productName: product.product_name ?? "추천 제품",
>>>>>>> Stashed changes
    productColor: product.product_color ?? "",
    category: product.category ?? "",
    colorHex: product.color_hex,
    productImageUrl: product.product_image_url,
    productUrl: product.product_url,
    price: product.price,
<<<<<<< Updated upstream
    toneType: product.tone_type ?? "",
    detailedTone: product.detailed_tone ?? "",
    lipType: product.lip_type ?? "",
    texture: product.texture ?? "",
    recommendedSkinType: product.recommended_skin_type ?? "",
    hue: product.hue,
    saturation: product.saturation,
    brightness: product.brightness,
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
      "id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, tone_type, detailed_tone, lip_type, texture, recommended_skin_type, hue, saturation, brightness, is_active",
    )
    .ilike("tone_type", `%${translatedseason}%`)
    .order("updated_at", { ascending: false })
    .limit(12)
    .returns<ProductRow[]>();
=======
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
>>>>>>> Stashed changes

  if (error || !data) {
    return [];
  }

  return data
<<<<<<< Updated upstream
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
      "id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, tone_type, detailed_tone, lip_type, texture, recommended_skin_type, hue, saturation, brightness, is_active",
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
=======
    .map((tag) => mapProduct(tag.products))
    .filter((product): product is RecommendedProduct => Boolean(product));
}
>>>>>>> Stashed changes
