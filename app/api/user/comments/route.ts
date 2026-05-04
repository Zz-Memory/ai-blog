import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ comments: [] }, { status: 401 });
  }

  const comments = await prisma.comment.findMany({
    where: { userId: auth.user.id, status: "APPROVED" },
    orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
    include: {
      user: { select: { role: true } },
      post: {
        include: {
          category: true,
          postTags: { include: { tag: true } },
          _count: { select: { likes: true, bookmarks: true } },
          comments: {
            where: { status: "APPROVED" },
            select: { id: true },
          },
          likes: { where: { userId: auth.user.id }, select: { id: true } },
          bookmarks: { where: { userId: auth.user.id }, select: { id: true } },
        },
      },
      replies: { select: { id: true } },
    },
  });

  return NextResponse.json({
    comments: comments
      .filter((item) => item.post.status === "PUBLISHED")
      .map((item) => ({
        id: item.id,
        postId: item.post.id,
        title: item.post.title,
        date: (item.post.publishedAt ?? item.post.createdAt).toISOString(),
        category: item.post.category?.name ?? "未分类",
        excerpt: item.post.summary ?? item.post.contentMarkdown.slice(0, 160),
        tags: item.post.postTags.map((entry) => entry.tag.name).slice(0, 4),
        href: `/article/${item.post.slug}#comments`,
        stats: {
          likes: item.post._count.likes,
          favorites: item.post._count.bookmarks,
          comments: item.post.comments.length,
        },
        isLiked: item.post.likes.length > 0,
        isBookmarked: item.post.bookmarks.length > 0,
        authorRole: item.user.role,
        comment: {
          id: item.id,
          content: item.content,
          time: item.createdAt.toISOString(),
          likes: item.likeCount,
          replies: item.replies.length,
        },
      })),
  });
}
