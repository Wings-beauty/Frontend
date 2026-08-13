export type InstagramDmCampaign = {
  id: string;
  media_id: string;
  keyword: string;
  dm_message: string;
  active: boolean;
  created_at: string;
};

export type InstagramComment = {
  commentId: string;
  commentText: string;
  mediaId: string;
  commenterId: string | null;
};

type InstagramWebhookValue = {
  id?: unknown;
  text?: unknown;
  sender_id?: unknown;
  from?: { id?: unknown } | null;
  media?: { id?: unknown } | null;
};

type InstagramWebhookChange = {
  field?: unknown;
  value?: InstagramWebhookValue | null;
};

export type InstagramWebhookEntry = {
  field?: unknown;
  value?: InstagramWebhookValue | null;
  changes?: InstagramWebhookChange[] | null;
};

export type InstagramWebhookPayload = {
  object?: unknown;
  entry?: InstagramWebhookEntry[] | null;
};

export type InstagramApiError = {
  message?: unknown;
  type?: unknown;
  code?: unknown;
};
