import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ bookmarkedArticles: [] }, { status: 401 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          category: true,
          postTags: { include: { tag: true } },
          _count: { select: { likes: true, bookmarks: true, comments: { where: { status: "APPROVED" } } } },
          likes: { where: { userId: auth.user.id }, select: { id: true } },
          bookmarks: { where: { userId: auth.user.id }, select: { id: true } },
        },
      },
    },
  });

  return NextResponse.json({
    bookmarkedArticles: bookmarks
      .filter((item) => item.post.status === "PUBLISHED")
      .map((item) => ({
        postId: item.post.id,
        title: item.post.title,
        date: (item.post.publishedAt ?? item.createdAt).toISOString(),
        category: item.post.category?.name ?? "未分类",
        excerpt: item.post.summary ?? item.post.contentMarkdown.slice(0, 160),
        tags: item.post.postTags.map((entry) => entry.tag.name).slice(0, 4),
        stats: {
          likes: item.post._count.likes,
          favorites: item.post._count.bookmarks,
          comments: item.post._count.comments,
        },
        href: `/article/${item.post.slug}`,
        isLiked: item.post.likes.length > 0,
        isBookmarked: item.post.bookmarks.length > 0,
      })),
  });
}
