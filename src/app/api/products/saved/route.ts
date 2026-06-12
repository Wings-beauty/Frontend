import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// service role 키로 RLS 우회 (서버 전용)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";
  return createClient(url, key, { auth: { persistSession: false } });
}

const supabase = getAdminClient();

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ products: [] }, { status: 400 });
  }

  const { data: savedProducts, error: savedProductsError } = await supabase
    .from("saved_products")
    .select("product_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (savedProductsError || !savedProducts) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  const productIds = savedProducts
    .map((item) => item.product_id)
    .filter((productId): productId is number => typeof productId === "number");

  if (productIds.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, brand_name, product_name, product_color, category, color_hex, product_image_url, product_url, price, tone_type, detailed_tone, lip_type, texture, recommended_skin_type, hue, saturation, brightness, is_active",
    )
    .in("id", productIds)
    .returns<ProductRow[]>();

  if (productsError || !products) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  const productsById = new Map(
    products
      .filter((product) => product.is_active !== false)
      .map((product) => mapProduct(product))
      .map((product) => [product.id, product]),
  );

  return NextResponse.json({
    products: productIds
      .map((productId) => productsById.get(productId))
      .filter(Boolean),
  });
}

export async function POST(request: Request) {
  const { userId, productId } = await request.json();

  if (typeof userId !== "string" || typeof productId !== "number") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_products")
    .insert({ user_id: userId, product_id: productId });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const productId = Number(searchParams.get("productId"));

  if (!userId || !Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_products")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
