import { NextResponse } from "next/server";

import { CommentStatus, NotificationType, UserRole } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isBlogger(userRole: string) {
  return userRole === UserRole.BLOGGER;
}

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ comments: [] }, { status: 401 });
  }

  if (!isBlogger(auth.user.role)) {
    return NextResponse.json({ message: "无权限访问。" }, { status: 403 });
  }

  const comments = await prisma.comment.findMany({
    where: {
      post: {
        authorId: auth.user.id,
      },
    },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      content: true,
      status: true,
      createdAt: true,
      post: {
        select: {
          title: true,
          slug: true,
        },
      },
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return NextResponse.json({
    comments: comments.map((comment) => ({
      id: comment.id,
      articleTitle: comment.post.title,
      author: comment.user.username,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      likes: 0,
      replies: comment._count.replies,
      status: comment.status === CommentStatus.APPROVED ? "approved" : "pending",
      href: `/article/${comment.post.slug}#comments`,
    })),
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
  if (!body?.id || body.action !== "approve") {
    return NextResponse.json({ message: "不支持的操作。" }, { status: 400 });
  }

  const comment = await prisma.comment.findFirst({
    where: {
      id: body.id,
      post: { authorId: auth.user.id },
    },
    select: {
      id: true,
      status: true,
      content: true,
      parentId: true,
      post: {
        select: {
          title: true,
          slug: true,
        },
      },
      userId: true,
      user: {
        select: {
          username: true,
        },
      },
      parent: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!comment) {
    return NextResponse.json({ message: "评论不存在。" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.comment.update({
      where: { id: body.id },
      data: { status: CommentStatus.APPROVED },
    });

    if (comment.status !== CommentStatus.APPROVED && comment.userId !== auth.user.id && comment.parentId) {
      const recipientId = comment.parent?.userId;

      if (recipientId && recipientId !== auth.user.id) {
        await tx.notification.create({
          data: {
            senderId: auth.user.id,
            recipientId,
            type: NotificationType.COMMENT,
            title: "有人回复了你的评论",
            content: `${comment.user.username} 回复了你的评论：${comment.content}`,
            linkUrl: `/article/${comment.post.slug}#comments`,
            isRead: false,
            readAt: null,
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
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
    return NextResponse.json({ message: "缺少评论标识。" }, { status: 400 });
  }

  const comment = await prisma.comment.findFirst({
    where: { id, post: { authorId: auth.user.id } },
    select: { id: true },
  });
  if (!comment) {
    return NextResponse.json({ message: "评论不存在。" }, { status: 404 });
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
