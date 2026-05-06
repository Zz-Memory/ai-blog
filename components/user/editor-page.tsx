"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toPreviewHtml } from "@/lib/markdown";

type EditorArticle = {
  id: string;
  title: string;
  summary: string;
  contentMarkdown: string;
  contentHtml: string;
  status: "published" | "draft";
  updatedAt: string;
};

const emptyMarkdown = "";

function countWords(text: string) {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length + (cleaned.match(/[\u4e00-\u9fff]/g)?.length ?? 0);
}

export function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState(emptyMarkdown);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [article, setArticle] = useState<EditorArticle | null>(null);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const lastSavedRef = useRef<{ title: string; markdown: string; html: string } | null>(null);
  const saveRequestIdRef = useRef(0);

  useEffect(() => {
    const loadDraft = async () => {
      setLoading(true);
      setError(null);
      try {
        let targetId = articleId;
        if (!targetId) {
          const response = await fetch("/api/blogger/articles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create-draft" }),
          });
          if (!response.ok) throw new Error();
          const data = (await response.json()) as { article: EditorArticle };
          targetId = data.article.id;
          router.replace(`/editor?id=${targetId}`);
          setArticle(data.article);
          setTitle(data.article.title);
          setMarkdown(data.article.contentMarkdown);
          lastSavedRef.current = { title: data.article.title, markdown: data.article.contentMarkdown, html: data.article.contentHtml };
          return;
        }

        const response = await fetch(`/api/blogger/articles?id=${encodeURIComponent(targetId)}`, { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = (await response.json()) as { article: EditorArticle };
        setArticle(data.article);
        setTitle(data.article.title);
        setMarkdown(data.article.contentMarkdown);
        lastSavedRef.current = { title: data.article.title, markdown: data.article.contentMarkdown, html: data.article.contentHtml };
      } catch {
        setError("文章加载失败，请稍后重试。");
      } finally {
        setLoading(false);
      }
    };

    void loadDraft();
  }, [articleId, router]);

  const stats = useMemo(() => {
    const words = countWords(markdown);
    const lines = markdown ? markdown.split("\n").length : 0;
    const chars = markdown.length;
    return { words, lines, chars };
  }, [markdown]);

  const previewHtml = useMemo(() => toPreviewHtml(markdown), [markdown]);

  useEffect(() => {
    if (loading || error || !article?.id) return;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      const currentSnapshot = { title: title.trim(), markdown, html: previewHtml };
      const lastSnapshot = lastSavedRef.current;
      const changed = !lastSnapshot || lastSnapshot.title !== currentSnapshot.title || lastSnapshot.markdown !== currentSnapshot.markdown;
      if (!changed) return;

      const requestId = saveRequestIdRef.current + 1;
      saveRequestIdRef.current = requestId;
      setSaveStatus("正在保存...");
      try {
        const response = await fetch("/api/blogger/articles", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: article.id,
            action: "save",
            title: currentSnapshot.title,
            contentMarkdown: currentSnapshot.markdown,
            contentHtml: currentSnapshot.html,
          }),
        });
        if (!response.ok) throw new Error();
        if (saveRequestIdRef.current !== requestId) return;
        lastSavedRef.current = currentSnapshot;
        setSaveStatus("保存成功");
      } catch {
        if (saveRequestIdRef.current !== requestId) return;
        setSaveStatus("保存失败");
      }
    }, 1000);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [article?.id, error, loading, markdown, previewHtml, title]);

  const handleMdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const fileName = file.name.toLowerCase();
    const isMdFile = file.type === "text/markdown" || file.type === "text/x-markdown" || fileName.endsWith(".md") || fileName.endsWith(".markdown");
    if (!isMdFile) {
      setError("只能上传 MD 文件，请重新选择。");
      return;
    }

    try {
      const content = await file.text();
      setMarkdown(content);
      setError(null);
    } catch {
      setError("MD 文件解析失败，请稍后重试。");
    }
  };

  const handleDraftBoxClick = () => {
    router.push("/blogger-center?section=articles&tab=draft");
  };

  const saveMessage = loading ? "正在加载..." : saveStatus || (error ? "加载失败" : article ? "已加载草稿" : "保存成功");

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
          <span className="text-sm text-[#8b90a0]">{saveMessage}</span>
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
          <input ref={fileInputRef} accept=".md,.markdown,text/markdown,text/x-markdown" className="hidden" type="file" onChange={handleMdUpload} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full border border-[#414755] px-4 py-1.5 text-sm text-[#c1c6d7] transition hover:bg-white/5 hover:text-white">
            上传MD文件
          </button>
          <button type="button" onClick={handleDraftBoxClick} className="rounded-full border border-[#414755] px-4 py-1.5 text-sm text-[#c1c6d7] transition hover:bg-white/5 hover:text-white">
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
              placeholder={loading ? "正在加载草稿..." : "开始编写你的文章内容..."}
            />
          </div>
        </div>

        <div className="flex h-full w-1/2 flex-col bg-[#131315]">
          <div className="flex-1 overflow-auto p-6 text-[#e5e1e4]">
            {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{error}</div> : <div className="mx-auto max-w-[800px] prose prose-invert prose-p:mb-4 prose-h1:mb-4 prose-h2:mb-3 prose-ul:mb-4 prose-li:mb-1 prose-strong:text-white" dangerouslySetInnerHTML={{ __html: previewHtml }} />}
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
