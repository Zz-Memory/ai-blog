import crypto from "node:crypto";
import { cookies } from "next/headers";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export const AUTH_JWT_COOKIE = "auth_token";
export const AUTH_SESSION_COOKIE = "session_token";
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

export type AuthPayload = {
  sid: string;
  uid: string;
  email: string;
  username: string;
  role: string;
  exp: number;
  iat: number;
};

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createJwtPayload(user: User, sid: string): AuthPayload {
  const iat = Math.floor(Date.now() / 1000);
  return {
    sid,
    uid: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    iat,
    exp: iat + JWT_EXPIRES_IN_SECONDS,
  };
}

export function signJwt(payload: Omit<AuthPayload, "exp" | "iat"> & Partial<Pick<AuthPayload, "exp" | "iat">>) {
  const iat = payload.iat ?? Math.floor(Date.now() / 1000);
  const exp = payload.exp ?? iat + JWT_EXPIRES_IN_SECONDS;
  const fullPayload: AuthPayload = { ...payload, iat, exp } as AuthPayload;
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest("base64");
  const encodedSignature = signature.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export function verifyJwt(token: string) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

  const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  if (expectedSignature.length !== encodedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(encodedSignature))) return null;

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthPayload;
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export function setAuthCookies(response: Response, jwt: string, sessionToken: string) {
  const expires = new Date(Date.now() + JWT_EXPIRES_IN_SECONDS * 1000);
  response.headers.append(
    "Set-Cookie",
    `${AUTH_JWT_COOKIE}=${jwt}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`,
  );
  response.headers.append(
    "Set-Cookie",
    `${AUTH_SESSION_COOKIE}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`,
  );
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get(AUTH_JWT_COOKIE)?.value;
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (!jwt || !sessionToken) return null;

  const payload = verifyJwt(jwt);
  if (!payload) return null;

  const session = await prisma.session.findUnique({ where: { sessionTokenHash: hashSessionToken(sessionToken) }, include: { user: true } });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  if (session.userId !== payload.uid || session.user.email !== payload.email) return null;
  return { user: session.user, session };
}
