import type { PrismaClient } from "@prisma/client";
import { CommentStatus } from "@prisma/client";

// 仅对已发布文章生成评论。
// 每篇已发布文章固定 3 条评论：2 条父级评论 + 1 条子级评论。
export async function seedComments(prisma: PrismaClient) {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
  });

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ["visitor01@example.com", "visitor02@example.com", "visitor03@example.com", "memory@example.com"],
      },
    },
  });

  const userByEmail = new Map(users.map((user) => [user.email, user]));
  const commenterEmails = ["visitor01@example.com", "visitor02@example.com", "visitor03@example.com"] as const;

  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];
    const commenterA = userByEmail.get(commenterEmails[index % 3]);
    const commenterB = userByEmail.get(commenterEmails[(index + 1) % 3]);
    const commenterC = userByEmail.get("memory@example.com") ?? userByEmail.get(commenterEmails[(index + 2) % 3]);

    if (!commenterA || !commenterB || !commenterC) {
      continue;
    }

    const parentComment1 = await prisma.comment.create({
      data: {
        postId: post.id,
        userId: commenterA.id,
        content: `这篇文章的思路很清晰，我尤其喜欢你对“${post.title}”的拆解方式。`,
        status: CommentStatus.APPROVED,
      },
    });

    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: commenterB.id,
        content: `补充一下，我觉得这里还可以再结合实际项目场景继续展开。`,
        status: CommentStatus.APPROVED,
      },
    });

    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: commenterC.id,
        parentId: parentComment1.id,
        content: `同意上面的观点，这样的设计确实更适合博客系统落地。`,
        status: CommentStatus.APPROVED,
      },
    });
  }
}
