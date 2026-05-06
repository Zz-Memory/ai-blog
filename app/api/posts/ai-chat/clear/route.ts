import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });

  const url = new URL(request.url);
  const postId = url.searchParams.get("postId");
  if (!postId) return NextResponse.json({ message: "缺少文章标识。" }, { status: 400 });

  const session = await prisma.aiChatSession.findFirst({
    where: { userId: auth.user.id, postId },
    select: { id: true },
  });

  if (!session) {
    return NextResponse.json({ ok: true, cleared: false });
  }

  await prisma.aiChatMessage.deleteMany({ where: { sessionId: session.id } });
  await prisma.aiChatSession.delete({ where: { id: session.id } });

  return NextResponse.json({ ok: true, cleared: true });
}
