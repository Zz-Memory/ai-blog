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
  const [selectionToolbarVisible, setSelectionToolbarVisible] = useState(false);
  const [selectionToolbarPosition, setSelectionToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectionToolbarMode, setSelectionToolbarMode] = useState<"style" | "custom">("style");
  const [selectionStyle, setSelectionStyle] = useState<"formal" | "casual" | "academic" | null>(null);
  const [selectionCustomPrompt, setSelectionCustomPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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

  const updateSelectionToolbarPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    if (start === end) {
      setSelectionToolbarVisible(false);
      setSelectionToolbarPosition(null);
      return;
    }

    const rect = textarea.getBoundingClientRect();
    const lineHeight = 28;
    const lineIndex = markdown.slice(0, start).split("\n").length - 1;
    const approxY = rect.top + 24 + lineIndex * lineHeight - textarea.scrollTop;
    const toolbarHeight = selectionToolbarMode === "custom" ? 254 : 168;
    const toolbarWidth = 420;
    const gap = 14;
    const pad = 12;
    const enoughSpaceAbove = approxY - toolbarHeight - gap > pad;
    const top = enoughSpaceAbove ? Math.max(pad, approxY - toolbarHeight - gap) : Math.min(window.innerHeight - toolbarHeight - pad, approxY + lineHeight + gap);
    const left = Math.min(window.innerWidth - toolbarWidth - pad, Math.max(pad, rect.left));
    setSelectionToolbarVisible(true);
    setSelectionToolbarPosition({ top, left });
  };

  const handleTextareaSelect = () => {
    requestAnimationFrame(updateSelectionToolbarPosition);
  };

  const handleSelectionToolbarAction = (mode: "style" | "custom") => {
    setSelectionToolbarMode(mode);
    setSelectionToolbarVisible(true);
    requestAnimationFrame(updateSelectionToolbarPosition);
  };

  useEffect(() => {
    if (!selectionToolbarVisible) return;
    updateSelectionToolbarPosition();
    const handleResize = () => updateSelectionToolbarPosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [markdown, selectionToolbarMode, selectionToolbarVisible]);

  const handleStyleToggle = (style: "formal" | "casual" | "academic") => {
    setSelectionToolbarMode("style");
    setSelectionStyle((current) => (current === style ? null : style));
    setSelectionToolbarVisible(true);
    requestAnimationFrame(updateSelectionToolbarPosition);
  };

  const saveMessage = loading ? "正在加载..." : saveStatus || (error ? "加载失败" : article ? "已加载草稿" : "保存成功");
  const selectedStyleLabel = selectionStyle === "formal" ? "正式" : selectionStyle === "casual" ? "轻松" : selectionStyle === "academic" ? "学术" : "";
  const canApplySelectionChanges = Boolean(selectionStyle || selectionCustomPrompt.trim());
  const selectionToolbarStyle = selectionToolbarPosition ? { top: selectionToolbarPosition.top, left: selectionToolbarPosition.left } : undefined;

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
          <button type="button" onClick={() => router.push("/blogger-center")} className="h-10 w-10 overflow-hidden rounded-full border border-[#414755] transition hover:border-[#adc6ff]/50 hover:shadow-[0_0_0_3px_rgba(173,198,255,0.12)]">
            <img alt="博主头像" className="h-full w-full object-cover" src="/avatars/blogger-default.png" />
          </button>
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
              ref={textareaRef}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              onMouseUp={handleTextareaSelect}
              onKeyUp={handleTextareaSelect}
              onSelect={handleTextareaSelect}
              spellCheck={false}
              className="flex-1 resize-none bg-transparent p-6 font-mono text-[14px] leading-7 text-[#c1c6d7] outline-none placeholder:text-[#414755]"
              placeholder={loading ? "正在加载草稿..." : "开始编写你的文章内容..."}
            />
          </div>
        </div>

        <div className="relative flex h-full w-1/2 flex-col bg-[#131315]">
          <div className="flex-1 overflow-auto p-6 text-[#e5e1e4]">
            {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{error}</div> : <div className="mx-auto max-w-[800px] prose prose-invert prose-p:mb-4 prose-h1:mb-4 prose-h2:mb-3 prose-ul:mb-4 prose-li:mb-1 prose-strong:text-white" dangerouslySetInnerHTML={{ __html: previewHtml }} />}
          </div>
          {selectionToolbarVisible && selectionToolbarPosition ? (
            <div className="pointer-events-auto fixed z-40 w-[420px] rounded-2xl border border-white/10 bg-[#161922]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl" style={selectionToolbarStyle}>
              <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">润色选中文本</div>
                  <div className="text-xs text-zinc-500">先做 UI，后续可接入 AI 能力</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionToolbarVisible(false);
                    setSelectionToolbarPosition(null);
                  }}
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { id: "formal", label: "正式" },
                  { id: "casual", label: "轻松" },
                  { id: "academic", label: "学术" },
                ].map((item) => {
                  const styleId = item.id as "formal" | "casual" | "academic";
                  const isActive = selectionStyle === styleId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleStyleToggle(styleId)}
                      className={`rounded-xl border px-3 py-2 text-sm transition ${isActive ? "border-[#adc6ff]/40 bg-[#adc6ff]/15 text-[#adc6ff]" : "border-white/10 bg-white/5 text-zinc-100 hover:border-[#adc6ff]/30 hover:bg-[#adc6ff]/10 hover:text-[#adc6ff]"}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="mb-2 text-xs font-medium tracking-[0.18em] text-zinc-500">自定义要求</div>
                <textarea
                  value={selectionCustomPrompt}
                  onChange={(event) => setSelectionCustomPrompt(event.target.value)}
                  placeholder="例如：请将选中文本修改得更简洁、有说服力，并保持原意。"
                  className="min-h-[96px] w-full resize-none rounded-xl border border-white/8 bg-[#0f1116] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#adc6ff]/40"
                />
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-500">
                  <span>{selectedStyleLabel ? `当前风格：${selectedStyleLabel}` : "当前风格：未选择"}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setSelectionToolbarVisible(false)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5">
                      取消
                    </button>
                    <button type="button" disabled={!canApplySelectionChanges} onClick={() => handleSelectionToolbarAction("custom")} className="rounded-full bg-[#adc6ff] px-4 py-2 text-sm font-semibold text-[#001a41] transition hover:bg-[#c2d3ff] disabled:cursor-not-allowed disabled:bg-[#33415f] disabled:text-[#7e8aa5]">
                      应用要求
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
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
