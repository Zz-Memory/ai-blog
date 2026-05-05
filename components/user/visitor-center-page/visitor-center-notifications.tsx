"use client";

import { useEffect, useMemo, useState } from "react";

import { VisitorCenterConfirmModal } from "./visitor-center-confirm-modal";
import type { NotificationItem, NotificationType } from "./notification-items";
import { notificationItems } from "./notification-items";

type VisitorCenterNotificationsProps = {
  items?: NotificationItem[];
  onUnreadCountChange?: (count: number) => void;
};

const tabs: Array<{ id: NotificationType; label: string }> = [
  { id: "all", label: "全部" },
  { id: "likes", label: "点赞和收藏" },
  { id: "comments", label: "评论" },
  { id: "newUsers", label: "新增用户" },
  { id: "system", label: "系统通知" },
];

function NotificationAvatar({ item }: { item: NotificationItem }) {
  const base = item.type === "system" ? "bg-white/5 text-zinc-300" : "bg-[#101215] text-zinc-100";
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/8 ${base}`}>
      {item.type === "system" ? (
        <span className="material-symbols-outlined text-[20px]">notifications</span>
      ) : (
        <span className="text-sm font-semibold">{item.userAvatarText}</span>
      )}
    </div>
  );
}

export function VisitorCenterNotifications({ items = notificationItems, onUnreadCountChange }: VisitorCenterNotificationsProps) {
  const [activeTab, setActiveTab] = useState<NotificationType>("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NotificationItem | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [notifications, setNotifications] = useState(items);

  useEffect(() => {
    setNotifications(items);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return notifications;
    return notifications.filter((item) => item.type === activeTab);
  }, [activeTab, notifications]);

  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

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

  const handleTabChange = (tab: NotificationType) => {
    setActiveTab(tab);
    setVisibleCount(6);
  };

  return (
    <div className="space-y-8 rounded-[28px] border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-8">
      <div className="space-y-3">
        <h2 className="text-[48px] font-bold tracking-[-0.02em] text-zinc-100">消息通知</h2>
        <p className="max-w-2xl text-[17px] leading-8 text-zinc-400">管理您收到的消息。</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div className="flex flex-wrap gap-6 text-sm">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`pb-3 transition ${isActive ? "border-b-2 border-[#adc6ff] text-[#adc6ff]" : "text-zinc-500 hover:text-zinc-200"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setClearConfirmOpen(true)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
          >
            清空
          </button>
          <button
            type="button"
            onClick={markAllRead}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
          >
            全部标为已读
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <article
              key={item.id}
              className={`group rounded-2xl border px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition ${item.unread ? "border-[#adc6ff]/20 bg-[#171a23]" : "border-white/8 bg-[#15171c]"}`}
              onMouseEnter={() => {
                if (item.unread) {
                  setNotifications((current) =>
                    current.map((currentItem) => (currentItem.id === item.id ? { ...currentItem, unread: false } : currentItem))
                  );
                }
              }}
            >
              <div className="flex items-start gap-4">
                <NotificationAvatar item={item} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-100">
                        <span>{item.userName}</span>
                        <span className="text-zinc-500">{item.title}</span>
                        {item.unread ? <span className="h-2 w-2 rounded-full bg-[#adc6ff]" /> : null}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">{item.message}</p>
                    </div>
                    <time className="shrink-0 text-xs text-zinc-500">{item.time}</time>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {item.type === "system" || !item.linkUrl ? null : (
                      <a href={item.linkUrl} className="text-sm font-medium text-[#adc6ff] transition hover:text-[#c3d2ff]">
                        查看相关内容
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openDeleteConfirm(item)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10"
                    >
                      删除通知
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-zinc-500">
            当前没有符合条件的通知。
          </div>
        )}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + 6)}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
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
