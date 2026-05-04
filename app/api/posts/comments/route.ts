import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommentStatus, UserRole } from "@prisma/client";

function getStringField(body: unknown, key: string) {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录后再发表评论。" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const postId = getStringField(body, "postId");
  const content = getStringField(body, "content");
  const parentId = getStringField(body, "parentId");

  if (!postId || !content) {
    return NextResponse.json({ message: "缺少必要参数。" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ message: "文章不存在。" }, { status: 404 });
  }

  let parentComment = null;
  if (parentId) {
    parentComment = await prisma.comment.findFirst({
      where: { id: parentId, postId },
      select: { id: true },
    });
    if (!parentComment) {
      return NextResponse.json({ message: "父评论不存在。" }, { status: 404 });
    }
  }

  const status = auth.user.role === UserRole.BLOGGER ? CommentStatus.APPROVED : CommentStatus.PENDING;

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: auth.user.id,
      parentId: parentId ?? null,
      content,
      status,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    comment: {
      id: comment.id,
      status: comment.status,
      createdAt: comment.createdAt.toISOString(),
      message: status === CommentStatus.APPROVED ? "评论已发布。" : "评论已提交审核。",
    },
  });
}
