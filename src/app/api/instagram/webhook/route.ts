import { NextResponse } from "next/server";
import { sendInstagramPrivateReply } from "@/lib/instagram/client";
import { verifyInstagramWebhookSignature } from "@/lib/instagram/signature";
import { createInstagramServerClient } from "@/lib/instagram/server";
import type { InstagramDmCampaign, InstagramWebhookPayload } from "@/lib/instagram/types";
import { findMatchingCampaign, parseInstagramCommentEvents } from "@/lib/instagram/webhook";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge && verifyToken === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return new Response("Forbidden", { status: 403 });
}

async function processComment(comment: ReturnType<typeof parseInstagramCommentEvents>[number]) {
  const supabase = createInstagramServerClient();
  const { data: campaigns, error: campaignError } = await supabase
    .from("instagram_dm_campaigns")
    .select("id, media_id, keyword, dm_message, active, created_at")
    .eq("media_id", comment.mediaId)
    .eq("active", true)
    .order("created_at", { ascending: true })
    .returns<InstagramDmCampaign[]>();

  if (campaignError) throw campaignError;
  const campaign = findMatchingCampaign(campaigns ?? [], comment.commentText);
  if (!campaign) return;

  const { error: insertError } = await supabase.from("instagram_dm_logs").insert({
    campaign_id: campaign.id,
    comment_id: comment.commentId,
    media_id: comment.mediaId,
    instagram_user_id: comment.commenterId,
    comment_text: comment.commentText,
    status: "processing",
  });

  if (insertError) {
    if (insertError.code === "23505") return; // A concurrent/retried delivery already owns this comment.
    throw insertError;
  }

  let result;
  try {
    result = await sendInstagramPrivateReply(comment.commentId, campaign.dm_message);
  } catch (error) {
    result = {
      ok: false as const,
      status: 500,
      errorMessage: error instanceof Error ? error.message.slice(0, 1000) : "Instagram API request failed.",
    };
  }

  if (result.ok) {
    const { error } = await supabase.from("instagram_dm_logs").update({ status: "sent", error_message: null }).eq("comment_id", comment.commentId);
    if (error) throw error;
    console.info("Instagram private reply sent", { commentId: comment.commentId, mediaId: comment.mediaId, campaignId: campaign.id, status: result.status });
    return;
  }

  const { error } = await supabase
    .from("instagram_dm_logs")
    .update({ status: "failed", error_message: result.errorMessage })
    .eq("comment_id", comment.commentId);
  if (error) throw error;
  console.error("Instagram private reply failed", { commentId: comment.commentId, mediaId: comment.mediaId, campaignId: campaign.id, status: result.status, error: result.errorMessage });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyInstagramWebhookSignature(rawBody, request.headers.get("x-hub-signature-256"), process.env.INSTAGRAM_APP_SECRET)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: InstagramWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as InstagramWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const comments = parseInstagramCommentEvents(payload);
  if (!comments.length) return NextResponse.json({ ok: true });

  console.info("Instagram webhook received", { commentCount: comments.length });
  try {
    for (const comment of comments) await processComment(comment);
  } catch (error) {
    console.error("Instagram webhook processing failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
