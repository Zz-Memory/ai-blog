import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toAccountRole(role: string) {
  return role === "BLOGGER" ? "blogger" : "visitor";
}

function toAvatarUrl(role: string) {
  return role === "BLOGGER" ? "/avatars/blogger-default.png" : "/avatars/visitor-default.png";
}

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "用户不存在。" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: toAccountRole(user.role),
      nickname: user.username,
      avatarUrl: toAvatarUrl(user.role),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { nickname?: string };
  const nickname = body.nickname?.trim();

  if (!nickname) {
    return NextResponse.json({ message: "昵称不能为空。" }, { status: 400 });
  }

  if (nickname.length < 2 || nickname.length > 24) {
    return NextResponse.json({ message: "昵称长度需在 2 到 24 个字符之间。" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: auth.user.id },
    data: { username: nickname },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      role: toAccountRole(updatedUser.role),
      nickname: updatedUser.username,
      avatarUrl: toAvatarUrl(updatedUser.role),
    },
  });
}
