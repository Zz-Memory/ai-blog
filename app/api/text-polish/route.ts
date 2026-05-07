import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "deepseek-v4-flash";
const BASE_URL = "https://api.deepseek.com";
const MAX_INPUT_CHARS = 12000;

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: BASE_URL,
});

function getStringField(body: unknown, key: string) {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function trimInput(value: string) {
  return value.slice(0, MAX_INPUT_CHARS);
}

function normalizeOutput(value: string) {
  return value.replace(/\u0000/g, "").trim();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const sourceText = getStringField(body, "sourceText") ?? "";
  const selectedText = getStringField(body, "selectedText") ?? "";
  const style = getStringField(body, "style") ?? "";
  const customPrompt = getStringField(body, "customPrompt") ?? "";
  const title = getStringField(body, "title") ?? "";
  const mode = getStringField(body, "mode") ?? "selection";

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ message: "未配置 DEEPSEEK_API_KEY。" }, { status: 500 });
  }

  const targetText = mode === "full" ? sourceText : selectedText;
  if (!targetText.trim()) {
    return NextResponse.json({ message: "缺少需要润色的文本。" }, { status: 400 });
  }

  const styleHint = style === "formal" ? "正式" : style === "casual" ? "轻松" : style === "academic" ? "学术" : "保持原风格";

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "你是一个中文博客文本润色助手。请在不改变原意的前提下，优化表达流畅度，修正复杂语法错误，统一语言风格。你必须直接输出润色后的正文，不要输出解释、分析、列表、编号、引号或 Markdown 代码块。",
        },
        {
          role: "user",
          content: [
            `文章标题：${title || "未设置"}`,
            `润色要求：${styleHint}${customPrompt.trim() ? `；${customPrompt.trim()}` : ""}`,
            mode === "full" ? "当前操作：全文润色" : "当前操作：选中文本润色",
            "请保留原有段落结构、列表结构与必要的 Markdown 标记。",
            "待润色文本如下：",
            trimInput(targetText),
          ].join("\n\n"),
        },
      ],
      temperature: 0.4,
    });

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          let accumulated = "";
          for await (const chunk of completion) {
            const delta = chunk.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              accumulated += delta;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          }

          const polished = normalizeOutput(accumulated);
          if (!polished) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "润色失败。" })}\n\n`));
            controller.close();
            return;
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : "润色失败。" })}\n\n`));
          controller.close();
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "润色失败。";
    return NextResponse.json({ message }, { status: 502 });
  }
}
