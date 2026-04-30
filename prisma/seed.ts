import { PrismaClient } from "@prisma/client";
import { seedAdminUser } from "./seeds/admin.seed";

// Prisma seed 入口文件。
// 这里仅负责创建 PrismaClient、调用各个子 seed 模块、以及在结束时释放连接。
// 当后续需要初始化标签、收藏夹、测试文章等数据时，只需要继续在此处引入并调用对应模块即可。
const prisma = new PrismaClient();

async function main() {
  // 预置系统博主账号。
  // 这是项目初始化后最基础的一条数据，用于登录后台和进行内容管理。
  await seedAdminUser(prisma);
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
