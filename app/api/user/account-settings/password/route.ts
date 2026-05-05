import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, isStrongPassword, verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      oldPassword?: string;
      password?: string;
      confirmPassword?: string;
    } | null;

    const oldPassword = body?.oldPassword || "";
    const password = body?.password || "";
    const confirmPassword = body?.confirmPassword || "";

    if (!oldPassword) return NextResponse.json({ message: "请输入旧密码。" }, { status: 400 });
    if (!password) return NextResponse.json({ message: "请输入新密码。" }, { status: 400 });
    if (!isStrongPassword(password)) {
      return NextResponse.json({ message: "密码需由字母与数字组合，且至少 8 位。" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ message: "两次输入的新密码不一致。" }, { status: 400 });
    }
    if (!verifyPassword(oldPassword, auth.user.passwordHash)) {
      return NextResponse.json({ message: "旧密码错误。" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { passwordHash: hashPassword(password) },
    });

    return NextResponse.json({ message: "密码修改成功。" });
  } catch (error) {
    console.error("Change password failed:", error);
    return NextResponse.json({ message: "修改密码失败，请稍后重试。" }, { status: 500 });
  }
}
