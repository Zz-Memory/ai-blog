import { NextResponse } from "next/server";
import { AUTH_JWT_COOKIE, AUTH_SESSION_COOKIE, hashSessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (sessionToken) {
    await prisma.session.deleteMany({ where: { sessionTokenHash: hashSessionToken(sessionToken) } });
  }

  const response = NextResponse.json({ message: "已退出登录。" });
  response.headers.append("Set-Cookie", `${AUTH_JWT_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
  response.headers.append("Set-Cookie", `${AUTH_SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
  return response;
}
