export type NotificationType = "all" | "likes" | "comments" | "newUsers" | "system";

export type NotificationItem = {
  id: string;
  type: Exclude<NotificationType, "all">;
  userName: string;
  userAvatarText: string;
  time: string;
  title: string;
  message: string;
  targetArticle?: string;
  linkUrl?: string | null;
  unread?: boolean;
};

export const notificationItems: NotificationItem[] = [];
