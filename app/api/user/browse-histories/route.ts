import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ histories: [] }, { status: 401 });
  }

  const histories = await prisma.browseHistory.findMany({
    where: { userId: auth.user.id },
    orderBy: [{ visitedAt: "desc" }, { createdAt: "desc" }],
    include: {
      post: {
        include: {
          category: true,
          postTags: { include: { tag: true } },
          _count: { select: { likes: true, bookmarks: true, comments: true } },
        },
      },
    },
  });

  return NextResponse.json({
    histories: histories
      .filter((item) => item.post.status === "PUBLISHED")
      .map((item) => ({
        id: item.id,
        title: item.post.title,
        visitedAt: item.visitedAt.toISOString(),
        href: `/article/${item.post.slug}`,
        category: item.post.category?.name ?? "未分类",
        excerpt: item.post.summary ?? item.post.contentMarkdown.slice(0, 160),
        tags: item.post.postTags.map((entry) => entry.tag.name).slice(0, 4),
        stats: {
          likes: item.post._count.likes,
          favorites: item.post._count.bookmarks,
          comments: item.post._count.comments,
        },
      })),
  });
}

export async function DELETE() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  await prisma.browseHistory.deleteMany({ where: { userId: auth.user.id } });
  return NextResponse.json({ ok: true });
}
