import type { PrismaClient } from "@prisma/client";

// 4 个基础分类：前端、后端、数据库、随笔。
// 使用 name 作为唯一定位键，保证 seed 可重复执行。
const CATEGORIES = [
  {
    name: "前端",
    description: "前端开发相关内容，包括框架、工程化与 UI 实践。",
  },
  {
    name: "后端",
    description: "后端开发相关内容，包括接口、权限与架构设计。",
  },
  {
    name: "数据库",
    description: "数据库设计、建模与性能优化相关内容。",
  },
  {
    name: "随笔",
    description: "记录开发过程中的思考、总结与杂记。",
  },
] as const;

export async function seedCategories(prisma: PrismaClient) {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
      },
      create: category as any,
    });
  }
}
