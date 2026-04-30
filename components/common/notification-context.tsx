"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { notificationItems } from "@/components/user/visitor-center-page/notification-items";

type NotificationContextValue = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  clearUnreadCount: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

// 全局通知状态提供器。
// 这里把未读消息数量做成全局状态，这样 `SiteHeader` 和个人中心等页面都可以共享同一份数据。
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(() => notificationItems.filter((item) => item.unread).length);

  const value = useMemo<NotificationContextValue>(
    () => ({
      unreadCount,
      setUnreadCount,
      clearUnreadCount: () => setUnreadCount(0),
    }),
    [unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// 读取全局未读消息数量。
export function useNotificationCount() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationCount must be used within NotificationProvider");
  }
  return context;
}
