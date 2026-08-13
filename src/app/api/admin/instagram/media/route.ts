import { NextResponse } from "next/server";
import { AdminApiError, requireAdminRequest } from "@/lib/admin/requireAdmin";
import { fetchInstagramMedia } from "@/lib/instagram/client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return NextResponse.json({ media: await fetchInstagramMedia() });
  } catch (error) {
    if (error instanceof AdminApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Instagram 게시물을 불러오지 못했습니다. 토큰과 연결 상태를 확인해 주세요." }, { status: 502 });
  }
}
