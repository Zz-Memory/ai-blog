import { randomBytes, scryptSync } from "node:crypto";

// 统一的密码哈希工具。
// seed 场景下我们不需要复杂的登录安全策略，但仍然要避免明文密码入库。
// 使用 `salt + hash` 格式，既便于后续认证校验，也便于重复执行 seed 时重新生成。
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
