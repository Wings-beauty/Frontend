import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import type { PersonalColorSeason } from "../../../constants/personalColor";

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

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 48;

function getKoreanSeason(season: PersonalColorSeason) {
  const seasonMap: Record<PersonalColorSeason, string> = {
    spring: "봄",
    summer: "여름",
    autumn: "가을",
    winter: "겨울",
  };

  return seasonMap[season];
}

function isPersonalColorSeason(value: string | null): value is PersonalColorSeason {
  return value === "spring" || value === "summer" || value === "autumn" || value === "winter";
}

function getPositiveInteger(value: string | null, fallback: number, max?: number) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  const integerValue = Math.floor(parsedValue);

  return typeof max === "number" ? Math.min(integerValue, max) : integerValue;
}

function escapeFilterValue(value: string) {
  return value.replace(/[%_]/g, "\\$&").replace(/,/g, "");
}

function mapProduct(product: ProductRow) {
  return {
    id: product.id,
    brandName: product.brand_name ?? "WINGS",
    productName: product.product_name ?? "상품명 없음",
    productColor: product.product_color ?? "",
    category: product.category ?? "",
    colorHex: product.color_hex,
    productImageUrl: product.product_image_url,
    productUrl: product.product_url,
    price: product.price,
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

async function fetchCategories() {
  const { data } = await supabase
    .from("products")
    .select("category")
    .or("is_active.is.null,is_active.eq.true")
    .returns<{ category: string | null }[]>();

  return Array.from(new Set((data ?? []).map((product) => product.category).filter((category): category is string => Boolean(category)))).sort();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = getPositiveInteger(searchParams.get("page"), 0);
  const pageSize = getPositiveInteger(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const season = searchParams.get("season");
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.trim() ?? "";

  let query = supabase
    .from("products")
    .select(
      "id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, tone_type, detailed_tone, lip_type, texture, recommended_skin_type, hue, saturation, brightness, is_active",
      { count: "exact" },
    )
    .or("is_active.is.null,is_active.eq.true")
    .order("updated_at", { ascending: false });

  if (isPersonalColorSeason(season)) {
    const koreanSeason = getKoreanSeason(season);
    const escapedSeason = escapeFilterValue(season);
    const escapedKoreanSeason = escapeFilterValue(koreanSeason);

    query = query.or(
      [
        `tone_type.ilike.%${escapedSeason}%`,
        `detailed_tone.ilike.%${escapedSeason}%`,
        `tone_type.ilike.%${escapedKoreanSeason}%`,
        `detailed_tone.ilike.%${escapedKoreanSeason}%`,
      ].join(","),
    );
  }

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (search) {
    const escapedSearch = escapeFilterValue(search);

    query = query.or(
      [
        `brand_name.ilike.%${escapedSearch}%`,
        `product_name.ilike.%${escapedSearch}%`,
        `product_color.ilike.%${escapedSearch}%`,
        `tone_type.ilike.%${escapedSearch}%`,
        `detailed_tone.ilike.%${escapedSearch}%`,
      ].join(","),
    );
  }

  const [{ data, error, count }, categories] = await Promise.all([
    query.range(from, to).returns<ProductRow[]>(),
    fetchCategories(),
  ]);

  if (error || !data) {
    return NextResponse.json(
      {
        products: [],
        nextPage: null,
        totalCount: 0,
        categories,
      },
      { status: 500 },
    );
  }

  const totalCount = count ?? 0;
  const nextPage = from + data.length < totalCount ? page + 1 : null;

  return NextResponse.json({
    products: data.map(mapProduct),
    nextPage,
    totalCount,
    categories,
  });
}
