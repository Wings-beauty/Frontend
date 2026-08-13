import type { InstagramApiError } from "./types";

// Current Graph API version when this integration was implemented. Keep this in one place.
export const INSTAGRAM_GRAPH_API_VERSION = "v25.0";

export type PrivateReplyResult =
  | { ok: true; status: number }
  | { ok: false; status: number; errorMessage: string };

function formatInstagramError(status: number, body: unknown) {
  const error = typeof body === "object" && body !== null && "error" in body ? (body as { error?: InstagramApiError }).error : undefined;
  const parts = [
    `Instagram API HTTP ${status}`,
    typeof error?.code === "number" ? `code ${error.code}` : null,
    typeof error?.type === "string" ? error.type : null,
    typeof error?.message === "string" ? error.message : null,
  ].filter((part): part is string => Boolean(part));

  return parts.join(" | ").slice(0, 1000);
}

export async function sendInstagramPrivateReply(commentId: string, messageText: string): Promise<PrivateReplyResult> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramUserId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !instagramUserId) {
    return { ok: false, status: 500, errorMessage: "Instagram server configuration is incomplete." };
  }

  const response = await fetch(`https://graph.instagram.com/${INSTAGRAM_GRAPH_API_VERSION}/${instagramUserId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      recipient: { comment_id: commentId },
      message: { text: messageText },
    }),
  });

  if (response.ok) {
    return { ok: true, status: response.status };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Keep a safe, bounded operational error if Meta does not return JSON.
  }

  return { ok: false, status: response.status, errorMessage: formatInstagramError(response.status, body) };
}

export type InstagramMedia = {
  id: string;
  caption: string | null;
  mediaType: string | null;
  permalink: string | null;
  timestamp: string | null;
  thumbnailUrl: string | null;
  mediaUrl: string | null;
};

export async function fetchInstagramMedia(): Promise<InstagramMedia[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramUserId = process.env.INSTAGRAM_USER_ID;
  if (!accessToken || !instagramUserId) throw new Error("Instagram server configuration is incomplete.");

  const fields = "id,caption,media_type,permalink,timestamp,thumbnail_url,media_url";
  const response = await fetch(`https://graph.instagram.com/${INSTAGRAM_GRAPH_API_VERSION}/${instagramUserId}/media?fields=${encodeURIComponent(fields)}&limit=50`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Instagram media request failed", { status: response.status });
    throw new Error("Instagram media request failed.");
  }

  const body = (await response.json()) as { data?: Array<Record<string, unknown>> };
  return (body.data ?? []).flatMap((item) => {
    if (typeof item.id !== "string") return [];
    return [{
      id: item.id,
      caption: typeof item.caption === "string" ? item.caption : null,
      mediaType: typeof item.media_type === "string" ? item.media_type : null,
      permalink: typeof item.permalink === "string" ? item.permalink : null,
      timestamp: typeof item.timestamp === "string" ? item.timestamp : null,
      thumbnailUrl: typeof item.thumbnail_url === "string" ? item.thumbnail_url : null,
      mediaUrl: typeof item.media_url === "string" ? item.media_url : null,
    }];
  });
}
