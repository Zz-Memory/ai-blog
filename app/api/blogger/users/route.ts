import { NextResponse } from "next/server";

import { UserStatus, UserRole } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isBlogger(role: string) {
  return role === UserRole.BLOGGER;
}

function formatJoinedAt(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ users: [], page: 1, pageSize: 6, total: 0, totalPages: 1 }, { status: 401 });
  }

  if (!isBlogger(auth.user.role)) {
    return NextResponse.json({ message: "无权限访问。" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.max(1, Math.min(20, Number(url.searchParams.get("pageSize") ?? "6") || 6));
  const search = (url.searchParams.get("search") ?? "").trim();
  const skip = (page - 1) * pageSize;

  const where = {
    role: UserRole.VISITOR,
    ...(search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      nickname: user.username,
      email: user.email,
      joinedAt: formatJoinedAt(user.createdAt),
      status: user.status === UserStatus.ACTIVE ? "active" : "muted",
    })),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function PATCH(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  if (!isBlogger(auth.user.role)) {
    return NextResponse.json({ message: "无权限访问。" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { id?: string; action?: string } | null;
  if (!body?.id || body.action !== "toggle-status") {
    return NextResponse.json({ message: "不支持的操作。" }, { status: 400 });
  }

  const target = await prisma.user.findFirst({ where: { id: body.id, role: UserRole.VISITOR }, select: { id: true, status: true } });
  if (!target) {
    return NextResponse.json({ message: "用户不存在。" }, { status: 404 });
  }

  if (target.id === auth.user.id) {
    return NextResponse.json({ message: "不能修改自己的状态。" }, { status: 400 });
  }

  const nextStatus = target.status === UserStatus.ACTIVE ? UserStatus.BANNED : UserStatus.ACTIVE;
  await prisma.user.update({ where: { id: target.id }, data: { status: nextStatus } });

  return NextResponse.json({ ok: true, status: nextStatus === UserStatus.ACTIVE ? "active" : "muted" });
}

export async function DELETE(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  if (!isBlogger(auth.user.role)) {
    return NextResponse.json({ message: "无权限访问。" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "缺少用户标识。" }, { status: 400 });
  }

  if (id === auth.user.id) {
    return NextResponse.json({ message: "不能删除自己。" }, { status: 400 });
  }

  const target = await prisma.user.findFirst({ where: { id, role: UserRole.VISITOR }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ message: "用户不存在。" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { userId: target.id } });
    await tx.notification.deleteMany({ where: { recipientId: target.id } });
    await tx.notification.deleteMany({ where: { senderId: target.id } });
    await tx.like.deleteMany({ where: { userId: target.id } });
    await tx.bookmark.deleteMany({ where: { userId: target.id } });
    await tx.browseHistory.deleteMany({ where: { userId: target.id } });
    await tx.aiChatMessage.deleteMany({ where: { session: { userId: target.id } } });
    await tx.aiChatSession.deleteMany({ where: { userId: target.id } });
    await tx.comment.deleteMany({ where: { userId: target.id } });
    await tx.post.deleteMany({ where: { authorId: target.id } });
    await tx.user.delete({ where: { id: target.id } });
  });

  return NextResponse.json({ ok: true });
}
