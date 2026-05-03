import { notFound } from "next/navigation";

import { ArticleDetailPage } from "@/components/blog/article-detail-page";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

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
          parentId: null,
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          likeCount: true,
          user: {
            select: {
              username: true,
            },
          },
          replies: {
            where: { status: "APPROVED" },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              content: true,
              createdAt: true,
              likeCount: true,
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!article || !article.contentHtml) {
    notFound();
  }

  const comments = article.comments.map((comment) => ({
    id: comment.id,
    author: comment.user.username,
    avatarText: comment.user.username.charAt(0).toUpperCase(),
    time: comment.createdAt.toISOString(),
    content: comment.content,
    likes: comment.likeCount,
    replies: comment.replies.map((reply) => ({
      id: reply.id,
      author: reply.user.username,
      avatarText: reply.user.username.charAt(0).toUpperCase(),
      time: reply.createdAt.toISOString(),
      content: reply.content,
      likes: reply.likeCount,
      replyTo: comment.user.username,
    })),
  }));

  return (
    <ArticleDetailPage
      article={{
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
      }}
      comments={comments}
    />
  );
}
