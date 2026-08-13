import type { InstagramComment, InstagramDmCampaign, InstagramWebhookEntry, InstagramWebhookPayload } from "./types";

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function commentFromValue(value: InstagramWebhookEntry["value"]): InstagramComment | null {
  const commentId = stringValue(value?.id);
  const commentText = stringValue(value?.text);
  const mediaId = stringValue(value?.media?.id);

  if (!commentId || !commentText || !mediaId) {
    return null;
  }

  return {
    commentId,
    commentText,
    mediaId,
    commenterId: stringValue(value?.sender_id) ?? stringValue(value?.from?.id),
  };
}

function commentFromEntry(entry: InstagramWebhookEntry) {
  if (entry.field === "comments") {
    return commentFromValue(entry.value);
  }

  for (const change of entry.changes ?? []) {
    if (change.field === "comments") {
      const comment = commentFromValue(change.value);
      if (comment) return comment;
    }
  }

  return null;
}

/** Extract only normal Instagram comment events; non-comment events are ignored. */
export function parseInstagramCommentEvents(payload: InstagramWebhookPayload): InstagramComment[] {
  if (payload.object !== "instagram" || !Array.isArray(payload.entry)) {
    return [];
  }

  return payload.entry.map(commentFromEntry).filter((comment): comment is InstagramComment => Boolean(comment));
}

function normalizeKeyword(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

/** First-created matching campaign wins so a comment can produce at most one DM. */
export function findMatchingCampaign(campaigns: InstagramDmCampaign[], commentText: string) {
  const normalizedComment = normalizeKeyword(commentText);

  return campaigns
    .filter((campaign) => campaign.active)
    .sort((left, right) => left.created_at.localeCompare(right.created_at))
    .find((campaign) => {
      const keyword = normalizeKeyword(campaign.keyword);
      return keyword.length > 0 && normalizedComment.includes(keyword);
    });
}
