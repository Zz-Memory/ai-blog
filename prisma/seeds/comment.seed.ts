import type { PrismaClient } from "@prisma/client";
import { CommentStatus } from "@prisma/client";

// 评论作者轮换表。
// 用不同访客模拟真实评论场景，避免所有评论都来自同一个账号。
const COMMENTERS = [
  { email: "visitor1@example.com" },
  { email: "visitor2@example.com" },
  { email: "visitor3@example.com" },
] as const;

// 仅对已发布文章生成评论。
// 每篇文章固定 3 条：2 条父评论 + 1 条回复评论。
export async function seedComments(prisma: PrismaClient) {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
  });

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: COMMENTERS.map((commenter) => commenter.email),
      },
    },
  });

  const userByEmail = new Map(users.map((user) => [user.email, user]));

  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];

    const commenterA = userByEmail.get(COMMENTERS[index % 3].email);
    const commenterB = userByEmail.get(COMMENTERS[(index + 1) % 3].email);
    const commenterC = userByEmail.get(COMMENTERS[(index + 2) % 3].email);

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

    console.log(`Seeded comments for post: ${post.title}`);
  }
}
