import type { PrismaClient } from "@prisma/client";

// 13 个预置标签，与 docs/seed.md 保持一致。
const TAGS = [
  { name: "前端", slug: "frontend" },
  { name: "后端", slug: "backend" },
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextjs" },
  { name: "Prisma", slug: "prisma" },
  { name: "数据库", slug: "database" },
  { name: "TypeScript", slug: "typescript" },
  { name: "AI", slug: "ai" },
  { name: "博客", slug: "blog" },
  { name: "性能优化", slug: "performance-optimization" },
  { name: "部署", slug: "deployment" },
  { name: "工具链", slug: "tooling" },
  { name: "node.js", slug: "node-js" },
] as const;

export async function seedTags(prisma: PrismaClient) {
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { slug: tag.slug },
      create: tag,
    });
  }
}
