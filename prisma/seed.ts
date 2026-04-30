import { PrismaClient } from "@prisma/client";
import { seedAdminUser } from "./seeds/admin.seed";
import { seedComments } from "./seeds/comment.seed";
import { seedPostTags, seedPosts } from "./seeds/post.seed";
import { seedTags } from "./seeds/tag.seed";
import { seedVisitorUsers } from "./seeds/visitor.seed";

// Prisma seed 入口文件。
// 这里统一协调各个子 seed 的执行顺序，确保依赖关系正确：
// 1. 先创建博主账号与访客账号；
// 2. 再创建标签；
// 3. 然后创建文章并绑定标签；
// 4. 最后为已发布文章生成评论。
const prisma = new PrismaClient();

async function main() {
  await seedAdminUser(prisma);
  await seedVisitorUsers(prisma);
  await seedTags(prisma);

  const admin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!admin) {
    throw new Error("Admin user was not seeded correctly.");
  }

  await seedPosts(prisma, admin.id);
  await seedPostTags(prisma);
  await seedComments(prisma);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // 无论 seed 成功或失败，都确保 Prisma 连接被正确释放。
    await prisma.$disconnect();
  });
