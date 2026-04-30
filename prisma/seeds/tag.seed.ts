import type { PrismaClient } from "@prisma/client";

// 13 个预置标签。
// 这些标签会用于后续文章的随机组合，但依然要求和文章主题保持语义一致。
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

// 预置标签。
// 说明：
// - 使用 name 作为展示名；
// - 使用 slug 作为稳定路由标识；
// - 如果标签已存在则更新，保证 seed 可重复执行。
export async function seedTags(prisma: PrismaClient) {
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {
        slug: tag.slug,
      },
      create: tag,
    });

    console.log(`Upserted tag: ${tag.name}`);
  }
}
