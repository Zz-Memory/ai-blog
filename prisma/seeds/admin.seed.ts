import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

// 预置博主账号的配置项。
// 这里集中管理默认邮箱、用户名与初始密码，后续如果需要切换为环境变量，
// 只需要修改这一处即可。
const ADMIN_SEED = {
  email: "admin@example.com",
  username: "admin",
  password: "admin123456",
  intro:
    "穿梭于代码与模型之间。以构建一站式 AI 系统为锚，探索智能化工具与创作者精神的共振，用技术重塑表达效率。",
} as const;

// 对明文密码做哈希，避免在数据库中存储可逆明文。
// 这里采用 `salt + hash` 的形式，便于后续认证时校验。
function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// 预置系统博主账号。
// 逻辑说明：
// 1. 如果数据库里已经存在该邮箱，则更新为预置博主状态；
// 2. 如果不存在，则创建一条新的用户记录；
// 3. 这样可以保证 seed 可重复执行而不会产生重复账号。
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

    console.log(`Updated existing admin user: ${ADMIN_SEED.email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email: ADMIN_SEED.email,
      ...adminData,
    },
  });

  console.log(`Created admin user: ${ADMIN_SEED.email}`);
}
