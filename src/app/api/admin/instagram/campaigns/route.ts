import { NextResponse } from "next/server";
import { AdminApiError, requireAdminRequest } from "@/lib/admin/requireAdmin";
import { createInstagramServerClient } from "@/lib/instagram/server";

function validText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength ? value.trim() : null;
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const { data, error } = await createInstagramServerClient().from("instagram_dm_campaigns").select("id, media_id, keyword, dm_message, active, created_at, updated_at").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ campaigns: data ?? [] });
  } catch (error) {
    if (error instanceof AdminApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "요청 처리 중 문제가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const mediaId = validText(body.mediaId, 100);
    const keyword = validText(body.keyword, 100);
    const dmMessage = validText(body.dmMessage, 1000);
    if (!mediaId || !keyword || !dmMessage || typeof body.active !== "boolean") return NextResponse.json({ error: "게시물, 키워드, DM 내용과 활성 상태를 확인해 주세요." }, { status: 400 });

    const { data, error } = await createInstagramServerClient().from("instagram_dm_campaigns").insert({ media_id: mediaId, keyword, dm_message: dmMessage, active: body.active }).select("id, media_id, keyword, dm_message, active, created_at, updated_at").single();
    if (error?.code === "23505") return NextResponse.json({ error: "이미 이 게시물에 동일한 키워드가 등록되어 있습니다." }, { status: 409 });
    if (error) throw error;
    return NextResponse.json({ campaign: data }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "요청 처리 중 문제가 발생했습니다." }, { status: 500 });
  }
}
