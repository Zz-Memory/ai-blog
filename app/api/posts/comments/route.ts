import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommentStatus, Prisma, UserRole } from "@prisma/client";

function getStringField(body: unknown, key: string) {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildArticleLink(slug: string) {
  return `/article/${slug}`;
}

async function createCommentNotification(tx: Prisma.TransactionClient, params: { recipientId: string; senderId: string; title: string; content: string; slug: string }) {
  await tx.notification.create({
    data: {
      senderId: params.senderId,
      recipientId: params.recipientId,
      type: "COMMENT",
      title: params.title,
      content: params.content,
      linkUrl: buildArticleLink(params.slug),
      isRead: false,
      readAt: null,
    },
  });
}

function getReplyPreview(content: string) {
  const normalized = content.trim();
  return normalized.length > 20 ? `${normalized.slice(0, 20)}...` : normalized;
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

  if (auth.user.status === "BANNED") {
    return NextResponse.json({ message: "你当前处于禁言状态，无法发表评论。" }, { status: 403 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, authorId: true, slug: true },
  });
  if (!post) {
    return NextResponse.json({ message: "文章不存在。" }, { status: 404 });
  }

  let parentComment: { id: string; userId: string; parentId: string | null } | null = null;
  if (parentId) {
    parentComment = await prisma.comment.findFirst({
      where: { id: parentId, postId },
      select: { id: true, userId: true, parentId: true },
    });
    if (!parentComment) {
      return NextResponse.json({ message: "父评论不存在。" }, { status: 404 });
    }
  }

  const status = auth.user.role === UserRole.BLOGGER ? CommentStatus.APPROVED : CommentStatus.PENDING;

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
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

    if (status === CommentStatus.APPROVED) {
      if (parentComment && parentComment.userId !== auth.user.id) {
        await createCommentNotification(tx, {
          recipientId: parentComment.userId,
          senderId: auth.user.id,
          title: "有人回复了你的评论",
          content: `${auth.user.username} 回复了你的评论：${getReplyPreview(content)}`,
          slug: post.slug,
        });
      } else if (!parentComment && post.authorId !== auth.user.id) {
        await createCommentNotification(tx, {
          recipientId: post.authorId,
          senderId: auth.user.id,
          title: "你的文章有了新评论",
          content: `${auth.user.username} 评论了你的文章《${post.title}》`,
          slug: post.slug,
        });
      }
    }

    return created;
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
