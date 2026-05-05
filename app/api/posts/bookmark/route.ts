import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getPostId(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const value = (body as { postId?: unknown }).postId;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}


export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录后再进行收藏。" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const postId = getPostId(body);
  if (!postId) {
    return NextResponse.json({ message: "缺少文章标识。" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, authorId: true, slug: true },
  });
  if (!post) {
    return NextResponse.json({ message: "文章不存在。" }, { status: 404 });
  }

  const existingBookmark = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId: auth.user.id, postId } },
    select: { id: true },
  });

  if (existingBookmark) {
    await prisma.bookmark.delete({
      where: { userId_postId: { userId: auth.user.id, postId } },
    });

    const bookmarks = await prisma.bookmark.count({ where: { postId } });
    return NextResponse.json({ bookmarked: false, bookmarks });
  }

  await prisma.bookmark.create({
    data: {
      userId: auth.user.id,
      postId,
    },
  });

  const bookmarks = await prisma.bookmark.count({ where: { postId } });
  return NextResponse.json({ bookmarked: true, bookmarks });
}
