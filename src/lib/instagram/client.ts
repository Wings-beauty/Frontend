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
