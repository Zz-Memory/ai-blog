import { NextResponse } from "next/server";

import { VerificationPurpose } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
import { createTransporter, createVerificationCode, getVerificationMailContent, hasEmailConfig } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as { email?: string; purpose?: string } | null;
    const email = body?.email?.trim() || "";
    const purpose = body?.purpose === VerificationPurpose.DELETE_ACCOUNT ? VerificationPurpose.DELETE_ACCOUNT : VerificationPurpose.RESET_PASSWORD;

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "请输入有效的电子邮箱。" }, { status: 400 });
    }

    if (email !== auth.user.email) {
      return NextResponse.json({ message: "邮箱不匹配。" }, { status: 400 });
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

    if (!hasEmailConfig()) {
      return NextResponse.json({ message: "SMTP 配置未完成。" }, { status: 500 });
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
    console.error("Send account settings verification failed:", error);
    return NextResponse.json({ message: "验证码发送失败，请稍后重试。" }, { status: 500 });
  }
}
