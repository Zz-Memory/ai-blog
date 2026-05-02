import { NextResponse } from "next/server";
import { PrismaClient, VerificationPurpose } from "@prisma/client";
import { createTransporter, createVerificationCode, getVerificationMailContent, hasEmailConfig } from "@/lib/email";

const prisma = new PrismaClient();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    if (!hasEmailConfig()) {
      return NextResponse.json({ message: "SMTP 配置未完成。" }, { status: 500 });
    }

    const body = (await request.json().catch(() => null)) as { email?: string; purpose?: string } | null;
    const email = body?.email?.trim() || "";
    const purpose = body?.purpose === VerificationPurpose.RESET_PASSWORD ? VerificationPurpose.RESET_PASSWORD : VerificationPurpose.REGISTER;

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "请输入有效的电子邮箱。" }, { status: 400 });
    }

    const cooldownSeconds = 60;
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        purpose,
        createdAt: { gte: new Date(Date.now() - cooldownSeconds * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCode) {
      return NextResponse.json({ message: `请求过于频繁，请 ${cooldownSeconds} 秒后再试。` }, { status: 429 });
    }

    const code = createVerificationCode();
    const transporter = createTransporter();

    await prisma.verificationCode.create({
      data: {
        email,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await transporter.sendMail(getVerificationMailContent(email, code));

    return NextResponse.json({ message: "验证码已发送，请查收邮箱。" });
  } catch (error) {
    console.error("Send verification email failed:", error);
    return NextResponse.json({ message: "验证码发送失败，请稍后重试。" }, { status: 500 });
  }
}
