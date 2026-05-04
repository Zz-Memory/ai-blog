import { notFound } from "next/navigation";

import { ArticleDetailPage } from "@/components/blog/article-detail-page";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const auth = await getAuthUser();

  const article = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      contentHtml: true,
      publishedAt: true,
      category: {
        select: { name: true },
      },
      author: {
        select: {
          username: true,
          intro: true,
        },
      },
      postTags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      likes: {
        select: { userId: true },
      },
      bookmarks: {
        select: { userId: true },
      },
      _count: {
        select: {
          likes: true,
          bookmarks: true,
          comments: true,
        },
      },
      comments: {
        where: {
          status: "APPROVED",
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          parentId: true,
          content: true,
          createdAt: true,
          likeCount: true,
          user: {
            select: {
              username: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!article || !article.contentHtml) {
    notFound();
  }

  const topLevelComments = article.comments.filter((comment) => !comment.parentId);
  const comments = topLevelComments.map((comment) => ({
    id: comment.id,
    parentId: comment.parentId,
    author: comment.user.username,
    avatarText: comment.user.username.charAt(0).toUpperCase(),
    avatarUrl: comment.user.role === "BLOGGER" ? "/avatars/blogger-default.png" : "/avatars/visitor-default.png",
    time: comment.createdAt.toISOString(),
    content: comment.content,
    likes: comment.likeCount,
    replies: article.comments
      .filter((reply) => reply.parentId === comment.id)
      .map((reply) => ({
        id: reply.id,
        parentId: reply.parentId,
        author: reply.user.username,
        avatarText: reply.user.username.charAt(0).toUpperCase(),
        avatarUrl: reply.user.role === "BLOGGER" ? "/avatars/blogger-default.png" : "/avatars/visitor-default.png",
        time: reply.createdAt.toISOString(),
        content: reply.content,
        likes: reply.likeCount,
        replyTo: comment.user.username,
      })),
  }));

  if (auth) {
    const recentVisit = await prisma.browseHistory.findFirst({
      where: {
        userId: auth.user.id,
        postId: article.id,
        visitedAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
      select: { id: true },
      orderBy: { visitedAt: "desc" },
    });

    if (!recentVisit) {
      await prisma.browseHistory.deleteMany({
        where: {
          userId: auth.user.id,
          postId: article.id,
        },
      });

      await prisma.browseHistory.create({
        data: {
          userId: auth.user.id,
          postId: article.id,
        },
      });
    }
  }

  return (
    <ArticleDetailPage
      article={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        contentHtml: article.contentHtml,
        publishedAt: article.publishedAt?.toISOString() ?? null,
        category: article.category?.name ?? null,
        author: {
          username: article.author.username,
          intro: article.author.intro,
          avatarUrl: "/avatars/blogger-default.png",
        },
        tags: article.postTags.map(({ tag }) => ({ id: tag.id, label: tag.name })),
      }}
      engagement={{
        likes: article._count.likes,
        bookmarks: article._count.bookmarks,
        comments: article._count.comments,
        isLiked: auth ? article.likes.some((like) => like.userId === auth.user.id) : false,
        isBookmarked: auth ? article.bookmarks.some((bookmark) => bookmark.userId === auth.user.id) : false,
      }}
      comments={comments}
    />
  );
}
