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
      email?: string;
      verificationCode?: string;
      password?: string;
      confirmPassword?: string;
    } | null;

    const email = body?.email?.trim() || "";
    const verificationCode = body?.verificationCode?.trim() || "";
    const password = body?.password || "";
    const confirmPassword = body?.confirmPassword || "";

    if (!isValidEmail(email)) return NextResponse.json({ message: "请输入有效的电子邮箱。" }, { status: 400 });
    if (!verificationCode) return NextResponse.json({ message: "请输入验证码。" }, { status: 400 });
    if (!password) return NextResponse.json({ message: "请输入新密码。" }, { status: 400 });
    if (!isStrongPassword(password)) {
      return NextResponse.json({ message: "密码需由字母与数字组合，且至少 8 位。" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ message: "两次输入的新密码不一致。" }, { status: 400 });
    }

    const codeRecord = await prisma.verificationCode.findFirst({
      where: {
        email,
        code: verificationCode,
        purpose: VerificationPurpose.RESET_PASSWORD,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!codeRecord) {
      return NextResponse.json({ message: "验证码错误或已过期。" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "该邮箱尚未注册。" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(password) },
      });

      await tx.verificationCode.update({
        where: { id: codeRecord.id },
        data: { consumedAt: new Date() },
      });
    });

    return NextResponse.json({ message: "密码重置成功。" });
  } catch (error) {
    console.error("Reset password failed:", error);
    return NextResponse.json({ message: "重置密码失败，请稍后重试。" }, { status: 500 });
  }
}
