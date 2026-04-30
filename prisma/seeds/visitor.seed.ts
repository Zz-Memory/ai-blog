import type { PrismaClient } from "@prisma/client";
import { UserRole, UserStatus } from "@prisma/client";
import { hashPassword } from "./helpers";

// 3 个普通游客账号。
// 与 docs/seed.md 保持一致：
// - 初始密码统一为 12345678
// - 使用 email 作为唯一定位键，保证 seed 可重复执行
const VISITORS = [
  {
    email: "visitor01@example.com",
    username: "visitor01",
    password: "12345678",
    intro: "普通测试访客账号 1。",
  },
  {
    email: "visitor02@example.com",
    username: "visitor02",
    password: "12345678",
    intro: "普通测试访客账号 2。",
  },
  {
    email: "visitor03@example.com",
    username: "visitor03",
    password: "12345678",
    intro: "普通测试访客账号 3。",
  },
] as const;

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
      continue;
    }

    await prisma.user.create({
      data: {
        email: visitor.email,
        ...visitorData,
      },
    });
  }
}
