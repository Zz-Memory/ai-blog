import { NextResponse } from "next/server";
import { createJwtPayload, createSessionToken, hashSessionToken, setAuthCookies, signJwt } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      account?: string;
      password?: string;
    } | null;

    const account = body?.account?.trim() || "";
    const password = body?.password || "";

    if (!account) return NextResponse.json({ message: "请输入账号或邮箱。" }, { status: 400 });
    if (!password) return NextResponse.json({ message: "请输入密码。" }, { status: 400 });

    const user = isValidEmail(account)
      ? await prisma.user.findUnique({ where: { email: account } })
      : await prisma.user.findUnique({ where: { username: account } });

    if (!user) return NextResponse.json({ message: "账号或密码错误。" }, { status: 401 });
    if (!verifyPassword(password, user.passwordHash)) return NextResponse.json({ message: "账号或密码错误。" }, { status: 401 });

    const sessionToken = createSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionTokenHash,
        expiresAt,
      },
    });

    const jwt = signJwt(createJwtPayload(user, session.id));
    const response = NextResponse.json({
      message: "登录成功。",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });

    setAuthCookies(response, jwt, sessionToken);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ message: "登录失败，请稍后重试。" }, { status: 500 });
  }
}
