import type { PrismaClient } from "@prisma/client";
import { UserRole, UserStatus } from "@prisma/client";
import { hashPassword } from "./helpers";

// 访客测试账号配置。
// 这 3 个账号会用于后续的浏览、评论、点赞、收藏等行为测试。
const VISITORS = [
  {
    email: "visitor1@example.com",
    username: "visitor1",
    password: "Visitor123456!",
    intro: "喜欢关注前端工程化与博客系统实现的测试访客。",
  },
  {
    email: "visitor2@example.com",
    username: "visitor2",
    password: "Visitor123456!",
    intro: "主要浏览内容管理、数据库与后端实现相关博客。",
  },
  {
    email: "visitor3@example.com",
    username: "visitor3",
    password: "Visitor123456!",
    intro: "偏爱 AI 辅助创作与博客写作工具的测试访客。",
  },
] as const;

// 预置 3 个访客账号。
// 逻辑说明：
// - 以 email 作为唯一定位键，保证 seed 可重复执行；
// - 已存在则更新，不存在则创建；
// - 统一使用 ACTIVE 状态，方便后续直接测试登录与互动。
export async function seedVisitorUsers(prisma: PrismaClient) {
  for (const visitor of VISITORS) {
    const existingVisitor = await prisma.user.findUnique({
      where: { email: visitor.email },
    });

    const visitorData = {
      username: visitor.username,
      passwordHash: hashPassword(visitor.password),
      role: UserRole.VISITOR,
      status: UserStatus.ACTIVE,
      intro: visitor.intro,
    };

    if (existingVisitor) {
      await prisma.user.update({
        where: { email: visitor.email },
        data: visitorData,
      });

      console.log(`Updated existing visitor user: ${visitor.email}`);
      continue;
    }

    await prisma.user.create({
      data: {
        email: visitor.email,
        ...visitorData,
      },
    });

    console.log(`Created visitor user: ${visitor.email}`);
  }
}
