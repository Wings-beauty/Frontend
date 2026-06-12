"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiBell,
  HiChatBubbleLeftRight,
  HiHeart,
  HiNewspaper,
  HiSparkles,
  HiTrash,
  HiXMark,
} from "react-icons/hi2";
import {
  fetchNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
  type Notification,
} from "../api/notifications";
import { useNavigate } from "../lib/router";

function relativeDate(value: string) {
  const ms = Date.now() - new Date(value).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
}

function NotificationIcon({ type }: { type: string }) {
  const cls = "size-4.5";
  if (type === "like") return <HiHeart className={cls} />;
  if (type === "comment") return <HiChatBubbleLeftRight className={cls} />;
  if (type === "news") return <HiNewspaper className={cls} />;
  if (type === "announcement") return <HiSparkles className={cls} />;
  return <HiBell className={cls} />;
}

function iconStyle(type: string): { bg: string; color: string } {
  if (type === "like") return { bg: "#fff0f0", color: "#e05c5c" };
  if (type === "comment") return { bg: "#f0f4ff", color: "#4c6ef5" };
  if (type === "news") return { bg: "#fff7ed", color: "#c2410c" };
  if (type === "announcement") return { bg: "#faf5ff", color: "#7c3aed" };
  return { bg: "#f5f0eb", color: "#a66555" };
}

export default function NotificationPopover({ authStatus }: { authStatus: "loading" | "guest" | "user" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const unreadCountQuery = useQuery({
    queryKey: ["notification-unread-count"],
    queryFn: getUnreadNotificationCount,
    enabled: authStatus === "user",
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
  const unreadCount = unreadCountQuery.data ?? 0;

  const listQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: open && authStatus === "user",
    refetchOnMount: "always",
  });

  const notifications = listQuery.data ?? [];
  const localUnreadCount = notifications.filter((n) => !n.isRead).length;

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["notification-unread-count"] });
  }

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: (id) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (prev) =>
        prev?.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    },
    onSettled: invalidate,
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => {
      queryClient.setQueryData<Notification[]>(["notifications"], (prev) =>
        prev?.map((n) => ({ ...n, isRead: true })),
      );
    },
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onMutate: (id) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (prev) =>
        prev?.filter((n) => n.id !== id),
      );
    },
    onSettled: invalidate,
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onMutate: () => {
      queryClient.setQueryData<Notification[]>(["notifications"], []);
    },
    onSettled: invalidate,
  });

  const handleRead = (id: number, linkUrl: string | null) => {
    readMutation.mutate(id);
    if (linkUrl) {
      setOpen(false);
      navigate(linkUrl);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 벨 버튼 */}
      <button
        type="button"
        className="relative flex size-10 items-center justify-center rounded-full border border-cream-200 bg-white text-[#725C53] transition hover:bg-cream-50"
        aria-label="알림"
        onClick={() => setOpen((v) => !v)}
      >
        <HiBell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-[#e05c5c] text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 팝오버 패널 */}
      {open && (
        <div className="absolute right-0 top-12 z-[60] w-80 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-2xl sm:w-96">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-cream-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-brown-600">
              알림
              {localUnreadCount > 0 && (
                <span className="ml-2 rounded-full bg-[#e05c5c] px-2 py-0.5 text-[11px] font-bold text-white">
                  {localUnreadCount}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-3">
              {localUnreadCount > 0 && (
                <button
                  type="button"
                  disabled={readAllMutation.isPending}
                  onClick={() => readAllMutation.mutate()}
                  className="text-xs text-brown-400 transition hover:text-brown-600 disabled:opacity-40"
                >
                  모두 읽음
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  disabled={deleteAllMutation.isPending}
                  onClick={() => deleteAllMutation.mutate()}
                  className="text-xs text-brown-300 transition hover:text-[#e05c5c] disabled:opacity-40"
                >
                  전체 삭제
                </button>
              )}
              <button
                type="button"
                className="text-brown-200 transition hover:text-brown-400"
                aria-label="닫기"
                onClick={() => setOpen(false)}
              >
                <HiXMark className="size-4" />
              </button>
            </div>
          </div>

          {/* 목록 */}
          <div className="max-h-[440px] overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="flex flex-col divide-y divide-cream-100">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-4">
                    <div className="size-8 shrink-0 animate-pulse rounded-full bg-cream-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-cream-100" />
                      <div className="h-3 animate-pulse rounded-full bg-cream-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <HiBell className="size-9 text-brown-200" />
                <p className="text-sm text-brown-400">새 알림이 없어요.</p>
              </div>
            ) : (
              <ul className="divide-y divide-cream-100">
                {notifications.map((notification) => {
                  const style = iconStyle(notification.type);
                  return (
                    <li
                      key={notification.id}
                      className={`relative flex items-start gap-3 px-5 py-3.5 transition hover:bg-cream-50 ${!notification.isRead ? "bg-cream-50/60" : ""}`}
                    >
                      {!notification.isRead && (
                        <span className="absolute left-2 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#e05c5c]" />
                      )}
                      <span
                        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: style.bg, color: style.color }}
                      >
                        <NotificationIcon type={notification.type} />
                      </span>
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => handleRead(notification.id, notification.linkUrl)}
                      >
                        <p className={`text-[13px] leading-5 ${notification.isRead ? "text-brown-500" : "font-medium text-brown-600"}`}>
                          {notification.title}
                        </p>
                        {notification.body && (
                          <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-brown-300">{notification.body}</p>
                        )}
                        <p className="mt-1 text-[11px] text-brown-300">{relativeDate(notification.createdAt)}</p>
                      </button>
                      <button
                        type="button"
                        className="mt-1 shrink-0 text-brown-200 transition hover:text-brown-400"
                        aria-label="알림 삭제"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(notification.id);
                        }}
                      >
                        <HiTrash className="size-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
