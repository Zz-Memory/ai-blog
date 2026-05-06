import { NextResponse } from "next/server";
import OpenAI from "openai";
import { AiChatRole } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_CONTEXT_PAIRS = 10;
const OPENAI_BASE_URL = "https://api.deepseek.com";
const OPENAI_MODEL = "deepseek-v4-flash";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: OPENAI_BASE_URL,
});

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function getStringField(body: unknown, key: string) {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildSystemPrompt(articleTitle: string, articleSummary: string | null, contentMarkdown: string) {
  return [
    "你是文章详情页内的 AI 助手，请围绕当前文章内容回答问题。",
    "回答要简洁、准确、自然，优先基于文章本身内容，不要编造。",
    `当前文章标题：${articleTitle}`,
    articleSummary ? `当前文章摘要：${articleSummary}` : "",
    "当前文章完整正文（Markdown）：",
    contentMarkdown,
    "如果用户的问题与文章无关，请礼貌提醒并尽量引导回文章内容。",
  ].filter(Boolean).join("\n\n");
}

function getRecentContext(messages: { role: AiChatRole; content: string }[]) {
  const recent = messages.slice(-MAX_CONTEXT_PAIRS * 2);
  return recent.map((message) => ({
    role: message.role === AiChatRole.USER ? "user" : "assistant",
    content: message.content,
  })) as Array<{ role: "user" | "assistant"; content: string }>;
}

async function createAssistantStream(messages: ChatMessage[]) {
  const completion = (await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages,
    stream: true,
    reasoning_effort: "high",
  } as any)) as unknown as AsyncIterable<{ choices: Array<{ delta?: { content?: string } }> }>;

  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullText += delta;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, content: fullText })}\n\n`));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return { stream, getContent: () => fullText };
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
      post: { select: { title: true, summary: true } },
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

  let session = await prisma.aiChatSession.findFirst({
    where: { userId: auth.user.id, postId },
  });

  if (!session) {
    session = await prisma.aiChatSession.create({
      data: { userId: auth.user.id, postId },
    });
  }

  const history = await prisma.aiChatMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.aiChatMessage.create({
    data: { sessionId: session.id, role: AiChatRole.USER, content: question },
  });

  const contextMessages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(post.title, post.summary, post.contentMarkdown) },
    ...getRecentContext(history.map((message) => ({ role: message.role, content: message.content }))),
    { role: "user", content: question },
  ];

  const completionStream = await createAssistantStream(contextMessages);

  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const reader = completionStream.stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        await prisma.aiChatMessage.create({
          data: {
            sessionId: session.id,
            role: AiChatRole.ASSISTANT,
            content: completionStream.getContent() || "抱歉，我暂时无法生成回答。",
          },
        });
        controller.close();
      } catch {
        controller.error(new Error("DeepSeek 流式输出失败"));
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
