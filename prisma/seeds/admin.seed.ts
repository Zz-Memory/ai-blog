import type { PrismaClient } from "@prisma/client";
import { UserRole, UserStatus } from "@prisma/client";
import { hashPassword } from "./helpers";

// 预置博主账号。
// 与 docs/seed.md 保持一致：
// - 初始密码统一为 12345678
// - 使用 email 作为唯一定位键，保证 seed 可重复执行
const ADMIN_SEED = {
  email: "memory@example.com",
  username: "Memory",
  password: "12345678",
  intro:
    "记录数字生命轨迹。致力于探索人工智能与人类审美的交汇点，相信技术应当隐于无形，服务于心。",
} as const;

export async function seedAdminUser(prisma: PrismaClient) {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_SEED.email },
  });

  const adminData = {
    username: ADMIN_SEED.username,
    passwordHash: hashPassword(ADMIN_SEED.password),
    role: UserRole.BLOGGER,
    status: UserStatus.ACTIVE,
    intro: ADMIN_SEED.intro,
  };

  if (existingAdmin) {
    await prisma.user.update({
      where: { email: ADMIN_SEED.email },
      data: adminData,
    });
    return;
  }

  await prisma.user.create({
    data: {
      email: ADMIN_SEED.email,
      ...adminData,
    },
  });
}
