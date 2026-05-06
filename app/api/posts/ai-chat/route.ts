import { NextResponse } from "next/server";
import { AiChatRole } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getStringField(body: unknown, key: string) {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildAssistantReply(articleTitle: string, articleSummary: string | null, articleContent: string, question: string) {
  const normalizedQuestion = question.toLowerCase();
  const summary = articleSummary?.trim() || articleContent.trim().slice(0, 180);

  if (/(总结|概括|核心|摘要|what.*about|overview|summary)/i.test(normalizedQuestion)) {
    return `这篇文章《${articleTitle}》的核心内容可以概括为：${summary}`;
  }

  if (/(局限|问题|challenge|problem|不足)/i.test(normalizedQuestion)) {
    return `从文章内容来看，《${articleTitle}》主要讨论了现有方案在实际场景中的局限性，并尝试给出更适合上下文理解的改进方向。`;
  }

  if (/(怎么|如何|why|why\s|how\s|实现|落地|实践)/i.test(normalizedQuestion)) {
    return `如果结合文章思路来理解，《${articleTitle}》更强调的是先明确问题，再围绕上下文和知识组织方式去设计更稳妥的实现路径。`;
  }

  return `我已记录你的问题“${question}”。结合文章《${articleTitle}》来看，可以先从这段内容入手：${summary}`;
}

export async function GET(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });

  const url = new URL(request.url);
  const postId = url.searchParams.get("postId");
  if (!postId) return NextResponse.json({ message: "缺少文章标识。" }, { status: 400 });

  const session = await prisma.aiChatSession.findFirst({
    where: { postId, userId: auth.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      post: { select: { title: true } },
    },
  });

  return NextResponse.json({
    session: session
      ? {
          id: session.id,
          postTitle: session.post.title,
          messages: session.messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
          })),
        }
      : null,
  });
}

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const postId = getStringField(body, "postId");
  const question = getStringField(body, "question");

  if (!postId || !question) {
    return NextResponse.json({ message: "缺少必要参数。" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, summary: true, contentMarkdown: true },
  });

  if (!post) {
    return NextResponse.json({ message: "文章不存在。" }, { status: 404 });
  }

  const session = await prisma.aiChatSession.upsert({
    where: {
      userId_postId: {
        userId: auth.user.id,
        postId,
      },
    },
    create: {
      userId: auth.user.id,
      postId,
    },
    update: {},
  });

  const createdMessages = await prisma.$transaction(async (tx) => {
    const userMessage = await tx.aiChatMessage.create({
      data: {
        sessionId: session.id,
        role: AiChatRole.USER,
        content: question,
      },
    });

    const assistantReply = buildAssistantReply(post.title, post.summary, post.contentMarkdown, question);
    const assistantMessage = await tx.aiChatMessage.create({
      data: {
        sessionId: session.id,
        role: AiChatRole.ASSISTANT,
        content: assistantReply,
      },
    });

    return { userMessage, assistantMessage };
  });

  return NextResponse.json({
    sessionId: session.id,
    messages: [
      {
        id: createdMessages.userMessage.id,
        role: createdMessages.userMessage.role,
        content: createdMessages.userMessage.content,
        createdAt: createdMessages.userMessage.createdAt.toISOString(),
      },
      {
        id: createdMessages.assistantMessage.id,
        role: createdMessages.assistantMessage.role,
        content: createdMessages.assistantMessage.content,
        createdAt: createdMessages.assistantMessage.createdAt.toISOString(),
      },
    ],
  });
}
