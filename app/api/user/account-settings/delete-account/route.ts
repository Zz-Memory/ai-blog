import { NextResponse } from "next/server";

import { VerificationPurpose } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
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

    const body = (await request.json().catch(() => null)) as { email?: string; verificationCode?: string } | null;
    const email = body?.email?.trim() || "";
    const verificationCode = body?.verificationCode?.trim() || "";

    if (!isValidEmail(email)) return NextResponse.json({ message: "请输入有效的电子邮箱。" }, { status: 400 });
    if (email !== auth.user.email) return NextResponse.json({ message: "邮箱不匹配。" }, { status: 400 });
    if (!/^\d{6}$/.test(verificationCode)) return NextResponse.json({ message: "请输入 6 位验证码。" }, { status: 400 });

    const codeRecord = await prisma.verificationCode.findFirst({
      where: {
        email,
        code: verificationCode,
        purpose: VerificationPurpose.DELETE_ACCOUNT,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!codeRecord) {
      return NextResponse.json({ message: "验证码错误或已过期。" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId: auth.user.id } });
      await tx.notification.deleteMany({ where: { recipientId: auth.user.id } });
      await tx.notification.deleteMany({ where: { senderId: auth.user.id } });
      await tx.like.deleteMany({ where: { userId: auth.user.id } });
      await tx.bookmark.deleteMany({ where: { userId: auth.user.id } });
      await tx.browseHistory.deleteMany({ where: { userId: auth.user.id } });
      await tx.aiChatMessage.deleteMany({ where: { session: { userId: auth.user.id } } });
      await tx.aiChatSession.deleteMany({ where: { userId: auth.user.id } });
      await tx.comment.deleteMany({ where: { userId: auth.user.id } });
      await tx.post.deleteMany({ where: { authorId: auth.user.id } });
      await tx.user.delete({ where: { id: auth.user.id } });
      await tx.verificationCode.update({ where: { id: codeRecord.id }, data: { consumedAt: new Date() } });
    });

    return NextResponse.json({ message: "账号已注销。" });
  } catch (error) {
    console.error("Delete account failed:", error);
    return NextResponse.json({ message: "注销账号失败，请稍后重试。" }, { status: 500 });
  }
}
