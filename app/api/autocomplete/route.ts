import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_CONTEXT_CHARS = 500;
const MAX_COMPLETION_TOKENS = 256;
const MODEL = "deepseek-v4-pro";
const BASE_URL = "https://api.deepseek.com/beta";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: BASE_URL,
});

function getStringField(body: unknown, key: string) {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function trimPrefix(value: string) {
  return value.slice(-MAX_CONTEXT_CHARS);
}

function trimSuffix(value: string) {
  return value.slice(0, MAX_CONTEXT_CHARS);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const prefix = getStringField(body, "prefix") ?? "";
  const suffix = getStringField(body, "suffix") ?? "";

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ message: "未配置 DEEPSEEK_API_KEY。" }, { status: 500 });
  }

  if (!prefix && !suffix) {
    return NextResponse.json({ message: "缺少补全上下文。" }, { status: 400 });
  }

  try {
    const completion = await client.completions.create({
      model: MODEL,
      prompt: trimPrefix(prefix),
      suffix: trimSuffix(suffix),
      max_tokens: MAX_COMPLETION_TOKENS,
      temperature: 0.1,
      stream: true,
    });

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices?.[0]?.text ?? "";
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : "DeepSeek 补全请求失败。" })}\n\n`));
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
    const message = error instanceof Error ? error.message : "DeepSeek 补全请求失败。";
    return NextResponse.json({ message }, { status: 502 });
  }
}
