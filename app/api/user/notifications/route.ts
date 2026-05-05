import { NextResponse } from "next/server";

import { NotificationType } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type NotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: Date;
  sender: { username: string } | null;
};

function formatTime(createdAt: Date) {
  return createdAt.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      recipientId: auth.user.id,
    },
    orderBy: [{ createdAt: "desc" }],
    include: { sender: { select: { username: true } } },
  });

  return NextResponse.json({
    notifications: notifications.map((item: NotificationRow) => ({
      id: item.id,
      type: item.type,
      userName: item.sender?.username ?? "系统通知",
      userAvatarText: (item.sender?.username ?? "S").slice(0, 1).toUpperCase(),
      time: formatTime(item.createdAt),
      title: item.title,
      message: item.content,
      targetArticle: item.linkUrl ?? item.title,
      linkUrl: item.linkUrl,
      unread: !item.isRead,
    })),
    unreadCount: notifications.filter((item: NotificationRow) => !item.isRead).length,
  });
}

export async function PATCH(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { action?: string; id?: string };

  if (body.action === "mark-all-read") {
    await prisma.notification.updateMany({
      where: { recipientId: auth.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "mark-read" && body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, recipientId: auth.user.id },
      data: { isRead: true, readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ message: "不支持的操作。" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    await prisma.notification.deleteMany({ where: { id, recipientId: auth.user.id } });
    return NextResponse.json({ ok: true });
  }

  await prisma.notification.deleteMany({ where: { recipientId: auth.user.id } });
  return NextResponse.json({ ok: true });
}
