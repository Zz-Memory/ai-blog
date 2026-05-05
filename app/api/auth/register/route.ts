import { NextResponse } from "next/server";
import { PrismaClient, VerificationPurpose } from "@prisma/client";
import { hashPassword, isStrongPassword } from "@/lib/password";

const prisma = new PrismaClient();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      nickname?: string;
      email?: string;
      verification?: string;
      password?: string;
      confirmPassword?: string;
    } | null;

    const nickname = body?.nickname?.trim() || "";
    const email = body?.email?.trim() || "";
    const verification = body?.verification?.trim() || "";
    const password = body?.password || "";
    const confirmPassword = body?.confirmPassword || "";

    if (!nickname) return NextResponse.json({ message: "请输入昵称。" }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ message: "请输入有效的电子邮箱。" }, { status: 400 });
    if (!verification) return NextResponse.json({ message: "请输入验证码。" }, { status: 400 });
    if (!password) return NextResponse.json({ message: "请输入密码。" }, { status: 400 });
    if (!isStrongPassword(password)) {
      return NextResponse.json({ message: "密码需由字母与数字组合，且至少 8 位。" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ message: "两次输入的密码不一致。" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "该邮箱已注册。" }, { status: 409 });
    }

    const codeRecord = await prisma.verificationCode.findFirst({
      where: {
        email,
        code: verification,
        purpose: VerificationPurpose.REGISTER,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!codeRecord) {
      return NextResponse.json({ message: "验证码错误或已过期。" }, { status: 400 });
    }

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          username: nickname,
          passwordHash: hashPassword(password),
        },
      });

      await tx.verificationCode.update({
        where: { id: codeRecord.id },
        data: { consumedAt: new Date() },
      });

      return createdUser;
    });

    return NextResponse.json({ message: "注册成功。", user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    console.error("Register failed:", error);
    return NextResponse.json({ message: "注册失败，请稍后重试。" }, { status: 500 });
  }
}
