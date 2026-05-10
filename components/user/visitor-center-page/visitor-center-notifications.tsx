"use client";

import { useEffect, useMemo, useState } from "react";

import { VisitorCenterConfirmModal } from "./visitor-center-confirm-modal";
import type { NotificationItem } from "./notification-items";
import { notificationItems } from "./notification-items";

type VisitorCenterNotificationsProps = {
  items?: NotificationItem[];
  onUnreadCountChange?: (count: number) => void;
};

function NotificationAvatar({ item }: { item: NotificationItem }) {
  const base = item.type === "system" ? "bg-white/5 text-zinc-300" : "bg-[#101215] text-zinc-100";
  const avatarUrl = item.userAvatarUrl ?? (item.type === "system" ? null : "/avatars/visitor-default.png");
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/8 ${base}`}>
      {item.type === "system" ? (
        <span className="material-symbols-outlined text-[20px]">notifications</span>
      ) : avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={item.userName} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-semibold">{item.userAvatarText}</span>
      )}
    </div>
  );
}

export function VisitorCenterNotifications({ items = notificationItems, onUnreadCountChange }: VisitorCenterNotificationsProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NotificationItem | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [notifications, setNotifications] = useState(items);

  useEffect(() => {
    setNotifications(items);
  }, [items]);

  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  const visibleItems = notifications.slice(0, visibleCount);
  const hasMore = visibleCount < notifications.length;

  const openDeleteConfirm = (item: NotificationItem) => {
    setDeleteTarget(item);
    setConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/user/notifications?id=${deleteTarget.id}`, { method: "DELETE" });
    setNotifications((current) => current.filter((item) => item.id !== deleteTarget.id));
    closeDeleteConfirm();
  };

  const clearAllNotifications = async () => {
    await fetch("/api/user/notifications", { method: "DELETE" });
    setNotifications([]);
    setVisibleCount(6);
    setClearConfirmOpen(false);
  };

  const markAllRead = async () => {
    await fetch("/api/user/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-all-read" }),
    });
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  };

  const markNotificationRead = async (notificationId: string) => {
    const target = notifications.find((item) => item.id === notificationId);
    if (!target || !target.unread) return;

    await fetch("/api/user/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-read", id: notificationId }),
    });

    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, unread: false } : item))
    );
  };

  return (
    <div className="space-y-8 rounded-[28px] border border-cyan-100/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(56,189,248,0.12)] sm:p-8">
      <div className="space-y-3">
        <h2 className="text-[48px] font-bold tracking-[-0.02em] text-slate-900">消息通知</h2>
        <p className="max-w-2xl text-[17px] leading-8 text-slate-600">管理您收到的消息。</p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setClearConfirmOpen(true)}
          className="rounded-full border border-cyan-100 bg-white px-4 py-2 text-sm font-medium text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          清空
        </button>
        <button
          type="button"
          onClick={markAllRead}
          className="rounded-full border border-cyan-100 bg-white px-4 py-2 text-sm font-medium text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          全部标为已读
        </button>
      </div>

      <div className="space-y-4">
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <article
              key={item.id}
              className={`group rounded-2xl border px-5 py-4 shadow-[0_0_0_1px_rgba(56,189,248,0.06)] transition ${item.unread ? "border-cyan-200 bg-cyan-50/70" : "border-cyan-100 bg-white"}`}
              onMouseEnter={() => {
                void markNotificationRead(item.id);
              }}
            >
              <div className="flex items-start gap-4">
                <NotificationAvatar item={item} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900">
                        <span>{item.userName}</span>
                        <span className="text-slate-500">{item.title}</span>
                        {item.unread ? <span className="h-2 w-2 rounded-full bg-cyan-500" /> : null}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.message}</p>
                    </div>
                    <time className="shrink-0 text-xs text-slate-500">{item.time}</time>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {item.type === "system" || !item.linkUrl ? null : (
                      <a href={item.linkUrl} className="text-sm font-medium text-cyan-700 transition hover:text-violet-700">
                        查看相关内容
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openDeleteConfirm(item)}
                      className="rounded-full border border-cyan-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50"
                    >
                      删除通知
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-cyan-100 bg-cyan-50/50 px-6 py-12 text-center text-sm text-slate-500">
            当前没有消息通知。
          </div>
        )}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + 6)}
            className="rounded-full border border-cyan-100 bg-white px-6 py-3 text-sm font-medium text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            加载更多通知
          </button>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-zinc-600">没有更多消息了</div>
      )}

      <VisitorCenterConfirmModal
        open={clearConfirmOpen}
        title="清空消息"
        description="确定要一键清空全部消息通知吗？此操作无法恢复。"
        cancelLabel="取消"
        confirmLabel="确认清空"
        confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400"
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={clearAllNotifications}
      />

      <VisitorCenterConfirmModal
        open={confirmOpen}
        title="确认删除通知"
        description={deleteTarget ? `确定要删除这条来自「${deleteTarget.userName}」的通知吗？删除后无法恢复。` : "确定要删除这条通知吗？删除后无法恢复。"}
        cancelLabel="取消"
        confirmLabel="确认删除"
        confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400"
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
      />
    </div>
  );
}
