import { supabase } from "@/lib/supabase";

export type InstagramMedia = { id: string; caption: string | null; mediaType: string | null; permalink: string | null; timestamp: string | null; thumbnailUrl: string | null; mediaUrl: string | null };
export type InstagramCampaign = { id: string; media_id: string; keyword: string; dm_message: string; active: boolean; created_at: string; updated_at: string };

async function adminFetch(path: string, init?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}), ...init?.headers } });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "요청 처리 중 문제가 발생했습니다.");
  return body;
}

export async function fetchInstagramMedia() { return (await adminFetch("/api/admin/instagram/media")) as { media: InstagramMedia[] }; }
export async function fetchInstagramCampaigns() { return (await adminFetch("/api/admin/instagram/campaigns")) as { campaigns: InstagramCampaign[] }; }
export async function createInstagramCampaign(input: { mediaId: string; keyword: string; dmMessage: string; active: boolean }) { return (await adminFetch("/api/admin/instagram/campaigns", { method: "POST", body: JSON.stringify(input) })) as { campaign: InstagramCampaign }; }
export async function updateInstagramCampaign(id: string, input: { keyword?: string; dmMessage?: string; active?: boolean }) { return (await adminFetch(`/api/admin/instagram/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(input) })) as { campaign: InstagramCampaign }; }
