import { NextResponse } from "next/server";
import { NotificationType, UserRole } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function shouldStoreLinkUrl(type: NotificationType) {
  return type === "COMMENT";
}

function isPublicRecipient(userRole: string, status: string) {
  return userRole === "VISITOR" && status === "ACTIVE";
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
    recipientUsername?: string | null;
    type?: NotificationType;
    linkUrl?: string | null;
  };

  const title = body.title?.trim();
  const content = body.content?.trim();
  if (!title || !content) {
    return NextResponse.json({ message: "标题和内容不能为空。" }, { status: 400 });
  }

  const targetType: NotificationType = body.type ?? NotificationType.SYSTEM;

  let recipientIds: string[] = [];
  if (body.recipientUsername) {
    const recipient = await prisma.user.findUnique({ where: { username: body.recipientUsername }, select: { id: true } });
    if (!recipient) {
      return NextResponse.json({ message: "未找到指定接收者。" }, { status: 400 });
    }
    recipientIds = [recipient.id];
  } else {
    const visitors = await prisma.user.findMany({ where: { role: UserRole.VISITOR, status: "ACTIVE" }, select: { id: true, role: true, status: true } });
    recipientIds = visitors.filter((user) => isPublicRecipient(user.role, user.status)).map((row) => row.id);
  }

  const created = await prisma.$transaction(
    recipientIds.map((recipientId) =>
      prisma.notification.create({
        data: {
          recipientId,
          senderId: auth.user.id,
          type: targetType,
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
