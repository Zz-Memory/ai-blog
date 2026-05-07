import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "deepseek-v4-flash";
const BASE_URL = "https://api.deepseek.com";
const MAX_INPUT_CHARS = 12000;
const MAX_TITLE_LENGTH = 40;

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

function normalizeTitle(value: string) {
  return value.replace(/[\r\n]+/g, " ").replace(/^\s+|\s+$/g, "").replace(/^(["'“‘`\[【(（]+)|(["'”’`\]】)）]+)$/g, "").trim();
}

function extractTitle(raw: string) {
  const cleaned = normalizeTitle(raw);
  return cleaned.length > MAX_TITLE_LENGTH ? cleaned.slice(0, MAX_TITLE_LENGTH) : cleaned;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const currentTitle = getStringField(body, "currentTitle") ?? "";
  const contentMarkdown = getStringField(body, "contentMarkdown") ?? "";

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ message: "未配置 DEEPSEEK_API_KEY。" }, { status: 500 });
  }

  if (!contentMarkdown.trim()) {
    return NextResponse.json({ message: "缺少文章内容。" }, { status: 400 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "你是一个中文博客标题生成器。请根据用户提供的标题、关键词和文章内容，生成一个简洁、自然、适合博客发布的标题。只输出标题本身，不要输出解释、编号、引号或多余符号。标题长度控制在 8 到 24 个汉字左右，必要时可包含少量英文或数字。",
        },
        {
          role: "user",
          content: `当前标题：${currentTitle || "未设置"}\n\n文章内容：\n${trimInput(contentMarkdown)}`,
        },
      ],
      temperature: 0.7,
    });

    const rawTitle = completion.choices[0]?.message?.content ?? "";
    const title = extractTitle(rawTitle);
    if (!title) {
      return NextResponse.json({ message: "标题生成失败。" }, { status: 502 });
    }

    return NextResponse.json({ title });
  } catch (error) {
    const message = error instanceof Error ? error.message : "标题生成失败。";
    return NextResponse.json({ message }, { status: 502 });
  }
}
