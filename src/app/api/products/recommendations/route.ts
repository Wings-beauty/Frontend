import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import type { PersonalColorSeason } from "../../../../constants/personalColor";

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

function getKoreanSeason(season: PersonalColorSeason) {
  const seasonMap: Record<PersonalColorSeason, string> = {
    spring: "봄",
    summer: "여름",
    autumn: "가을",
    winter: "겨울",
  };

  return seasonMap[season];
}

function mapProduct(product: ProductRow) {
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
    detailedTone: product.detailed_tone ?? "",
    lipType: product.lip_type ?? "",
    texture: product.texture ?? "",
    recommendedSkinType: product.recommended_skin_type ?? "",
    hue: product.hue,
    saturation: product.saturation,
    brightness: product.brightness,
  };
}

function isPersonalColorSeason(value: string | null): value is PersonalColorSeason {
  return value === "spring" || value === "summer" || value === "autumn" || value === "winter";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season");

  if (!isPersonalColorSeason(season)) {
    return NextResponse.json({ products: [] }, { status: 400 });
  }

  const koreanSeason = getKoreanSeason(season);
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, tone_type, detailed_tone, lip_type, texture, recommended_skin_type, hue, saturation, brightness, is_active",
    )
    .ilike("tone_type", `%${koreanSeason}%`)
    .order("updated_at", { ascending: false })
    .limit(12)
    .returns<ProductRow[]>();

  if (error || !data) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  return NextResponse.json({
    products: data
      .filter((product) => product.is_active !== false)
      .map(mapProduct),
  });
}
