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

export type ProductsPageResponse = {
  products: RecommendedProduct[];
  nextPage: number | null;
  totalCount: number;
  categories: string[];
};

export type ProductsPageParams = {
  page?: number;
  pageSize?: number;
  season?: PersonalColorSeason | null;
  category?: string;
  search?: string;
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

export async function fetchAllProducts() {
  const response = await fetch("/api/products");

  return readProductsResponse(response);
}

export async function fetchProductsPage({
  page = 0,
  pageSize = 24,
  season,
  category = "all",
  search = "",
}: ProductsPageParams) {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (season) {
    searchParams.set("season", season);
  }

  if (category !== "all") {
    searchParams.set("category", category);
  }

  if (search.trim()) {
    searchParams.set("search", search.trim());
  }

  const response = await fetch(`/api/products?${searchParams.toString()}`);

  if (!response.ok) {
    return {
      products: [],
      nextPage: null,
      totalCount: 0,
      categories: [],
    } satisfies ProductsPageResponse;
  }

  return (await response.json()) as ProductsPageResponse;
}

export async function fetchSavedProductsForUser(): Promise<RecommendedProduct[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_products")
    .select("product_id")
    .eq("user_id", user.id);

  if (error) throw error;

  const productIds = (data ?? [])
    .map((row) => row.product_id)
    .filter((id): id is number => typeof id === "number");

  if (productIds.length === 0) return [];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, tone_type, detailed_tone, lip_type, texture, recommended_skin_type, hue, saturation, brightness",
    )
    .in("id", productIds)
    .eq("is_active", true);

  if (productsError) throw productsError;

  return (products ?? []).map((p) => ({
    id: p.id,
    brandName: p.brand_name ?? "WINGS",
    productName: p.product_name ?? "추천 상품",
    productColor: p.product_color ?? "",
    category: p.category ?? "",
    colorHex: p.color_hex,
    productImageUrl: p.product_image_url,
    productUrl: p.product_url,
    price: p.price,
    toneType: p.tone_type ?? "",
    detailedTone: p.detailed_tone ?? "",
    lipType: p.lip_type ?? "",
    texture: p.texture ?? "",
    recommendedSkinType: p.recommended_skin_type ?? "",
    hue: p.hue,
    saturation: p.saturation,
    brightness: p.brightness,
  }));
}

export async function toggleSavedProduct(productId: number): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("toggle_saved_product", {
    p_product_id: productId,
  });

  if (error) throw error;

  return Boolean(data);
}
