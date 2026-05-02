import type { PrismaClient } from "@prisma/client";

// 13 个预置标签，与 docs/seed.md 保持一致。
const TAGS = [
  { name: "前端" },
  { name: "后端" },
  { name: "React" },
  { name: "Next.js" },
  { name: "Prisma" },
  { name: "数据库" },
  { name: "TypeScript" },
  { name: "AI" },
  { name: "博客" },
  { name: "性能优化" },
  { name: "部署" },
  { name: "工具链" },
  { name: "node.js" },
] as const;

export async function seedTags(prisma: PrismaClient) {
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }
}
