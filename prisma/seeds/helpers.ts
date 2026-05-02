import crypto from "node:crypto";

// 统一的密码哈希工具。
// 与 `lib/password.ts` 保持一致，确保 seed 数据可以直接通过正式登录校验逻辑验证。
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${derivedKey}`;
}
