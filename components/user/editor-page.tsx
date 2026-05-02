"use client";

import { useMemo, useState } from "react";

const initialMarkdown = `# 品牌与风格
本设计系统旨在定义一个以人工智能为核心的个人博客体验。品牌性格融合了人类创作的感性与 AI 处理的理性。

**设计风格：AI 原生极简主义 (AI-Native Minimalism)**
这种风格超越了传统扁平化设计，强调界面作为“智能容器”的角色。设计语言通过大量留白、精确的排版和流动的玻璃质感，营造出一种前卫且深邃的数字空间感。

## 布局与间距
本设计系统采用固定宽度网格与动态页边距相结合的模式，专注于阅读效率。

- **阅读容器**: 核心内容区限制在 800px 宽度内，这是长文阅读的最佳视觉扫描宽度。
- **8px 节奏**: 所有间距均基于 8px 步进系统。组件内部间距通常使用 12px 或 16px。`;

function countWords(text: string) {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length + (cleaned.match(/[\u4e00-\u9fff]/g)?.length ?? 0);
}

function toPreviewHtml(markdown: string) {
  return markdown
    // 1. 基础 XSS 转义 (必须在最前)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

    // 2. 代码块 (简易处理，不支持语法高亮)
    .replace(/```[\s\S]*?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-4 rounded overflow-x-auto mb-4"><code>$1</code></pre>')

    // 3. 行内代码
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-500 rounded px-1">$1</code>')

    // 4. 图片 (必须在链接前)
    .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded my-4" />')

    // 5. 超链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')

    // 6. 引用块
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 text-gray-600 italic my-4">$1</blockquote>')

    // 7. 标题 1~6 级
    .replace(/^###### (.*$)/gim, '<h6 class="text-base font-semibold mt-4 mb-2">$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5 class="text-lg font-semibold mt-4 mb-2">$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-semibold mt-5 mb-3">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-5 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')

    // 原有逻辑保留...
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n- (.*)/g, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<h1|<h2|<h3|<h4|<h5|<h6|<pre|<blockquote|<img|<a|<li>|<p|<code)/gm, '<p class="mb-4">')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-5 mb-4">$1</ul>')
    .replace(/<p class="mb-4">\s*<h/g, '<h')
    .replace(/<\/li><\/ul>\s*<ul class="list-disc pl-5 mb-4">/g, '')
    // 7. 处理换行，需避开 <pre> 块
    .replace(/(?<!<pre[^>]*>[\s\S]*?)\n/g, '<br/>');
}

export function EditorPage() {
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [aiEnabled, setAiEnabled] = useState(true);

  const stats = useMemo(() => {
    const words = countWords(markdown);
    const lines = markdown.split("\n").length;
    const chars = markdown.length;
    return { words, lines, chars };
  }, [markdown]);

  const previewHtml = useMemo(() => toPreviewHtml(markdown), [markdown]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#131315] text-[#e5e1e4] antialiased">
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
        <div className="mr-6 flex-1 max-w-2xl">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border-none bg-transparent px-0 text-2xl font-semibold tracking-[-0.02em] text-[#e5e1e4] outline-none placeholder:text-[#414755] focus:ring-0"
            placeholder="请输入文章标题..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[#8b90a0]">保存成功</span>
          <button
            type="button"
            onClick={() => setAiEnabled((current) => !current)}
            className="flex items-center gap-2 rounded-full border border-[#adc6ff]/30 bg-[#adc6ff]/10 px-3 py-1.5 transition hover:bg-[#adc6ff]/15"
          >
            <span className="material-symbols-outlined text-[18px] text-[#adc6ff]">smart_toy</span>
            <span className="text-sm text-[#adc6ff]">AI助手</span>
            <span className={`relative inline-flex h-4 w-8 rounded-full ${aiEnabled ? "bg-[#adc6ff]" : "bg-[#414755]"}`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${aiEnabled ? "left-4" : "left-0.5"}`} />
            </span>
          </button>
          <button type="button" className="rounded-full border border-[#414755] px-4 py-1.5 text-sm text-[#c1c6d7] transition hover:bg-white/5 hover:text-white">
            上传MD
          </button>
          <button type="button" className="rounded-full border border-[#414755] px-4 py-1.5 text-sm text-[#c1c6d7] transition hover:bg-white/5 hover:text-white">
            草稿箱
          </button>
          <button type="button" className="rounded-full bg-[#adc6ff] px-4 py-2 text-sm font-semibold text-[#002e69] transition hover:shadow-[0_0_15px_rgba(75,142,255,0.4)]">
            发布文章
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-[#414755]">
            <img alt="博主头像" className="h-full w-full object-cover" src="/avatars/blogger-default.png" />
          </div>
        </div>
      </header>

      <main className="relative mt-16 flex flex-1 overflow-hidden">
        <div className="flex h-full w-1/2 flex-col border-r border-[#414755]/30 bg-[#0e0e10]">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex w-12 shrink-0 flex-col items-end border-r border-white/5 bg-[#0e0e10] py-6 pr-3 font-mono text-[13px] leading-7 text-[#414755] select-none">
              {markdown.split("\n").map((_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>
            <textarea
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              spellCheck={false}
              className="flex-1 resize-none bg-transparent p-6 font-mono text-[14px] leading-7 text-[#c1c6d7] outline-none placeholder:text-[#414755]"
            />
          </div>
        </div>

        <div className="flex h-full w-1/2 flex-col bg-[#131315]">
          <div className="flex-1 overflow-auto p-6 text-[#e5e1e4]">
            <div className="mx-auto max-w-[800px] prose prose-invert prose-p:mb-4 prose-h1:mb-4 prose-h2:mb-3 prose-ul:mb-4 prose-li:mb-1 prose-strong:text-white" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 z-50 flex h-10 w-full items-center justify-between border-t border-white/10 bg-[#0e0e10] px-4 text-sm text-[#8b90a0]">
        <div className="flex items-center gap-4">
          <span>字数: {stats.words}</span>
          <span>行数: {stats.lines}</span>
          <span>字符数: {stats.chars.toLocaleString()}</span>
        </div>
        <div>COPYRIGHT © 2026 MEMORY的小破站</div>
      </footer>
    </div>
  );
}
