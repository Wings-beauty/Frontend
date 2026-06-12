import { supabase } from "../lib/supabase";

export type NotificationType = "like" | "comment" | "system" | "news" | "announcement";

export type Notification = {
  id: number;
  userId: string;
  type: NotificationType | string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationRow = {
  id: number;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link_url: string | null;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
};

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    linkUrl: row.link_url,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<NotificationRow[]>();

  if (error) throw new Error(error.message || "알림을 불러오지 못했어요.");
  return (data ?? []).map(mapNotification);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await supabase.rpc("get_unread_notification_count");
  return (data as number) ?? 0;
}

export async function markNotificationRead(notificationId: number): Promise<void> {
  const { error } = await supabase.rpc("mark_notification_read", {
    p_notification_id: notificationId,
  });
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase.rpc("mark_all_notifications_read");
  if (error) throw new Error(error.message);
}

export async function deleteNotification(notificationId: number): Promise<void> {
  const { error } = await supabase.rpc("delete_notification", {
    p_notification_id: notificationId,
  });
  if (error) throw new Error(error.message);
}

export async function deleteAllNotifications(): Promise<void> {
  const { error } = await supabase.rpc("delete_all_notifications");
  if (error) throw new Error(error.message);
}
