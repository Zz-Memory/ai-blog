import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ commentId: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const { commentId } = await context.params;

  const target = await prisma.comment.findFirst({
    where: { id: commentId, userId: auth.user.id },
    select: { id: true },
  });

  if (!target) {
    return NextResponse.json({ message: "评论不存在或无权限删除。" }, { status: 404 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
