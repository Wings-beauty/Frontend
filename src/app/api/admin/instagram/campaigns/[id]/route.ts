import { NextResponse } from "next/server";
import { AdminApiError, requireAdminRequest } from "@/lib/admin/requireAdmin";
import { createInstagramServerClient } from "@/lib/instagram/server";

function validText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength ? value.trim() : null;
}

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminRequest(request);
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const update: { keyword?: string; dm_message?: string; active?: boolean } = {};
    if ("keyword" in body) {
      const keyword = validText(body.keyword, 100);
      if (!keyword) return NextResponse.json({ error: "키워드를 확인해 주세요." }, { status: 400 });
      update.keyword = keyword;
    }
    if ("dmMessage" in body) {
      const dmMessage = validText(body.dmMessage, 1000);
      if (!dmMessage) return NextResponse.json({ error: "DM 내용을 확인해 주세요." }, { status: 400 });
      update.dm_message = dmMessage;
    }
    if ("active" in body) {
      if (typeof body.active !== "boolean") return NextResponse.json({ error: "활성 상태를 확인해 주세요." }, { status: 400 });
      update.active = body.active;
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });

    const { data, error } = await createInstagramServerClient().from("instagram_dm_campaigns").update(update).eq("id", id).select("id, media_id, keyword, dm_message, active, created_at, updated_at").maybeSingle();
    if (error?.code === "23505") return NextResponse.json({ error: "이미 이 게시물에 동일한 키워드가 등록되어 있습니다." }, { status: 409 });
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "캠페인을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ campaign: data });
  } catch (error) {
    if (error instanceof AdminApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "요청 처리 중 문제가 발생했습니다." }, { status: 500 });
  }
}
