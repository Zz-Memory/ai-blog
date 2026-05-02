import crypto from "node:crypto";

export function isStrongPassword(value: string) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `pbkdf2$100000$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, iterations, salt, hash] = storedHash.split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) return false;
  const derivedKey = crypto.pbkdf2Sync(password, salt, Number(iterations), 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derivedKey, "hex"));
}
