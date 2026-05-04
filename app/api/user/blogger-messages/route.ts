import { NextResponse } from "next/server";
import { NotificationStatus, NotificationType, UserRole } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function shouldStoreLinkUrl(type: NotificationType) {
  return type === "LIKE" || type === "COMMENT" || type === "REPLY" || type === "REVIEW";
}

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ messages: [] }, { status: 401 });

  const messages = await prisma.notification.findMany({
    where: { senderId: auth.user.id },
    orderBy: [{ createdAt: "desc" }],
    include: { sender: { select: { username: true } } },
  });

  return NextResponse.json({
    messages: messages.map((item) => ({
      id: item.id,
      title: item.title,
      senderNickname: item.sender?.username ?? "",
      updatedAt: item.createdAt.toISOString().slice(0, 16).replace("T", " "),
      status: item.status === NotificationStatus.PUBLISHED ? "published" : "draft",
      type: item.type,
      content: item.content,
      linkUrl: item.linkUrl,
      isRead: item.isRead,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    content?: string;
    audience?: string;
    scheduledSend?: boolean;
    status?: "draft" | "published";
    recipientUsername?: string | null;
    type?: NotificationType;
    linkUrl?: string | null;
  };

  const title = body.title?.trim();
  const content = body.content?.trim();
  if (!title || !content) {
    return NextResponse.json({ message: "标题和内容不能为空。" }, { status: 400 });
  }

  const status = body.status === "published" ? NotificationStatus.PUBLISHED : NotificationStatus.DRAFT;
  const targetType = body.type ?? "SYSTEM";

  let recipientIds: string[] = [];
  if (body.recipientUsername) {
    const recipient = await prisma.user.findUnique({ where: { username: body.recipientUsername }, select: { id: true } });
    if (!recipient) {
      return NextResponse.json({ message: "未找到指定接收者。" }, { status: 400 });
    }
    recipientIds = [recipient.id];
  } else {
    const visitors = await prisma.user.findMany({ where: { role: UserRole.VISITOR, status: "ACTIVE" }, select: { id: true } });
    recipientIds = visitors.map((row) => row.id);
  }

  const created = await prisma.$transaction(
    recipientIds.map((recipientId) =>
      prisma.notification.create({
        data: {
          recipientId,
          senderId: auth.user.id,
          type: targetType,
          status,
          title,
          content,
          linkUrl: shouldStoreLinkUrl(targetType) ? body.linkUrl?.trim() ?? null : null,
          isRead: false,
          readAt: null,
        },
      })
    )
  );

  return NextResponse.json({ ok: true, count: created.length });
}

export async function PATCH(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { id?: string; action?: "publish" | "retract" };
  if (!body.id || !body.action) return NextResponse.json({ message: "参数错误。" }, { status: 400 });

  const status = body.action === "publish" ? NotificationStatus.PUBLISHED : NotificationStatus.DRAFT;
  await prisma.notification.updateMany({ where: { id: body.id, senderId: auth.user.id }, data: { status } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    await prisma.notification.deleteMany({ where: { id, senderId: auth.user.id } });
    return NextResponse.json({ ok: true });
  }
  await prisma.notification.deleteMany({ where: { senderId: auth.user.id } });
  return NextResponse.json({ ok: true });
}
