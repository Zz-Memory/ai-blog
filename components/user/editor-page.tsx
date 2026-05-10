"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toPreviewHtml } from "@/lib/markdown";

type EditorArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  contentHtml: string;
  status: "published" | "draft";
  updatedAt: string;
  category: PublishCategory | null;
  tags: PublishTag[];
};

type PublishCategory = { id: string; name: string };
type PublishTag = { id: string; name: string };

const emptyMarkdown = "";

function countWords(text: string) {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length + (cleaned.match(/[\u4e00-\u9fff]/g)?.length ?? 0);
}

function sliceAutocompleteContext(text: string, cursor: number) {
  return {
    prefix: text.slice(Math.max(0, cursor - 500), cursor),
    suffix: text.slice(cursor, Math.min(text.length, cursor + 500)),
  };
}

function normalizeCompletion(text: string) {
  return text.replace(/^\s+/, "");
}

function getCurrentParagraphBounds(text: string, cursor: number) {
  const before = text.slice(0, cursor);
  const after = text.slice(cursor);
  const paragraphStart = Math.max(before.lastIndexOf("\n\n"), before.lastIndexOf("\r\n\r\n"));
  const normalizedStart = paragraphStart === -1 ? 0 : paragraphStart + (before.includes("\r\n\r\n") && before.lastIndexOf("\r\n\r\n") === paragraphStart ? 4 : 2);
  const paragraphEndIndex = after.search(/\n\n|\r\n\r\n/);
  const paragraphEnd = paragraphEndIndex === -1 ? text.length : cursor + paragraphEndIndex;
  return { start: normalizedStart, end: paragraphEnd };
}

function isCursorAtParagraphEnd(text: string, cursor: number) {
  const { end } = getCurrentParagraphBounds(text, cursor);
  const tail = text.slice(cursor, end);
  return /^[\s\u00a0]*$/.test(tail);
}

function isCursorAtLineEnd(text: string, cursor: number) {
  const lineBreakIndex = text.indexOf("\n", cursor);
  const lineEnd = lineBreakIndex === -1 ? text.length : lineBreakIndex;
  const tail = text.slice(cursor, lineEnd);
  return /^[\s\u00a0]*$/.test(tail);
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
  const [selectionPolishing, setSelectionPolishing] = useState(false);
  const [selectionPolishError, setSelectionPolishError] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishDialogLoading, setPublishDialogLoading] = useState(false);
  const [publishCategoryId, setPublishCategoryId] = useState("");
  const [publishTagIds, setPublishTagIds] = useState<string[]>([]);
  const [publishSlug, setPublishSlug] = useState("");
  const [publishSummary, setPublishSummary] = useState("");
  const [publishCategories, setPublishCategories] = useState<PublishCategory[]>([]);
  const [publishTags, setPublishTags] = useState<PublishTag[]>([]);
  const [publishDialogError, setPublishDialogError] = useState<string | null>(null);
  const [publishDialogSaving, setPublishDialogSaving] = useState(false);
  const [titleGenerating, setTitleGenerating] = useState(false);
  const [titleGenerateError, setTitleGenerateError] = useState<string | null>(null);
  const [ghostText, setGhostText] = useState("");
  const [ghostLoading, setGhostLoading] = useState(false);
  const [ghostError, setGhostError] = useState<string | null>(null);
  const [ghostCaret, setGhostCaret] = useState<number | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{ top: number; left: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const ghostMarkerRef = useRef<HTMLSpanElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const autocompleteTimerRef = useRef<number | null>(null);
  const autocompleteAbortRef = useRef<AbortController | null>(null);
  const autocompleteRequestSeqRef = useRef(0);
  const lastAutocompleteKeyRef = useRef<string>("");
  const lastInputSourceRef = useRef<"keyboard" | "pointer" | "programmatic">("programmatic");
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
  const ghostTextDisplay = ghostText;

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

  const getSelectedTextRange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return null;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    if (start === end) return null;
    return { start, end };
  };

  const replaceSelectedRange = (replacement: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const nextMarkdown = `${markdown.slice(0, start)}${replacement}${markdown.slice(end)}`;
    const nextCursor = start + replacement.length;
    setMarkdown(nextMarkdown);
    requestAnimationFrame(() => {
      textarea.selectionStart = nextCursor;
      textarea.selectionEnd = nextCursor;
      textarea.focus();
    });
  };

  const handleTitleGenerate = async () => {
    if (!markdown.trim()) {
      setTitleGenerateError("请先输入文章内容后再生成标题。");
      return;
    }

    setTitleGenerating(true);
    setTitleGenerateError(null);
    try {
      const response = await fetch("/api/title-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTitle: title,
          contentMarkdown: markdown,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "标题生成失败。");
      }

      const data = (await response.json()) as { title?: string };
      const nextTitle = data.title?.trim();
      if (!nextTitle) throw new Error("标题生成失败。");
      setTitle(nextTitle);
    } catch (error) {
      setTitleGenerateError(error instanceof Error ? error.message : "标题生成失败。");
    } finally {
      setTitleGenerating(false);
    }
  };

  const openPublishDialog = async () => {
    setPublishDialogOpen(true);
    setPublishDialogLoading(true);
    setPublishDialogError(null);
    try {
      const metaResponse = await fetch("/api/blogger/articles?meta=1", { cache: "no-store" });
      if (!metaResponse.ok) throw new Error();
      const meta = (await metaResponse.json()) as { categories: PublishCategory[]; tags: PublishTag[] };
      setPublishCategories(meta.categories);
      setPublishTags(meta.tags);

      if (article?.id) {
        const articleResponse = await fetch(`/api/blogger/articles?id=${encodeURIComponent(article.id)}`, { cache: "no-store" });
        if (!articleResponse.ok) throw new Error();
        const data = (await articleResponse.json()) as { article: EditorArticle };
        setPublishSlug(data.article.slug ?? "");
        setPublishCategoryId(data.article.category?.id ?? "");
        setPublishTagIds((data.article.tags ?? []).slice(0, 3).map((tag) => tag.id));
        setPublishSummary(data.article.summary?.trim() ? data.article.summary : markdown.replace(/\s+/g, " ").trim().slice(0, 100));
      } else {
        setPublishSlug(articleId ?? "");
        setPublishCategoryId("");
        setPublishTagIds([]);
        setPublishSummary(markdown.replace(/\s+/g, " ").trim().slice(0, 100));
      }
    } catch {
      setPublishDialogError("发布面板加载失败，请稍后重试。");
    } finally {
      setPublishDialogLoading(false);
    }
  };

  const togglePublishTag = (tagId: string) => {
    setPublishTagIds((current) => {
      if (current.includes(tagId)) return current.filter((item) => item !== tagId);
      if (current.length >= 3) return current;
      return [...current, tagId];
    });
  };

  const handlePublishArticle = async () => {
    if (!article?.id) return;
    const slug = publishSlug.trim();
    if (!slug) {
      setPublishDialogError("Slug 为必填项，请先填写。");
      return;
    }
    setPublishDialogSaving(true);
    setPublishDialogError(null);
    try {
      const response = await fetch("/api/blogger/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article.id,
          action: "publish",
          title: title.trim(),
          contentMarkdown: markdown,
          contentHtml: previewHtml,
          slug,
          summary: publishSummary.trim(),
          categoryId: publishCategoryId || null,
          tagIds: publishTagIds,
        }),
      });
      if (response.status === 409) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setPublishDialogError(data?.message ?? "Slug 已存在，请更换后再发布。");
        return;
      }
      if (!response.ok) throw new Error();
      setPublishDialogOpen(false);
      router.push("/blogger-center?section=articles&tab=published");
    } catch {
      setPublishDialogError("发布失败，请稍后重试。");
    } finally {
      setPublishDialogSaving(false);
    }
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

  const clearGhostSuggestion = () => {
    setGhostText("");
    setGhostCaret(null);
    setGhostPosition(null);
    setGhostError(null);
  };

  const handleAiToggle = () => {
    setAiEnabled((current) => {
      const next = !current;
      if (!next) {
        if (autocompleteTimerRef.current) window.clearTimeout(autocompleteTimerRef.current);
        autocompleteAbortRef.current?.abort();
        autocompleteRequestSeqRef.current += 1;
        clearGhostSuggestion();
        setGhostLoading(false);
        lastInputSourceRef.current = "programmatic";
      }
      return next;
    });
  };

  const markPointerDrivenCursorMove = () => {
    lastInputSourceRef.current = "pointer";
    clearGhostSuggestion();
  };

  const markKeyboardDrivenInput = () => {
    lastInputSourceRef.current = "keyboard";
  };

  const handleTextareaSelect = () => {
    requestAnimationFrame(() => {
      updateSelectionToolbarPosition();
      updateGhostVisibility();
    });
  };

  const handleTextareaPointerDown = () => {
    markPointerDrivenCursorMove();
  };

  const handleTextareaScroll = () => {
    requestAnimationFrame(() => {
      if (!ghostCaret) return;
      updateGhostPosition();
      updateGhostVisibility();
    });
  };

  const updateGhostPosition = () => {
    const textarea = textareaRef.current;
    const marker = ghostMarkerRef.current;
    if (!textarea || !marker) return;
    const textareaRect = textarea.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const top = markerRect.top - textareaRect.top + textarea.scrollTop;
    const left = markerRect.left - textareaRect.left + textarea.scrollLeft;
    setGhostPosition({ top, left });
  };

  const updateGhostVisibility = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart ?? 0;
    if (!isCursorAtParagraphEnd(markdown, cursor) || !isCursorAtLineEnd(markdown, cursor)) {
      clearGhostSuggestion();
      return;
    }
  };

  const requestAutocomplete = useCallback(async () => {
    if (!aiEnabled || loading || error) return;
    if (lastInputSourceRef.current !== "keyboard") return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart ?? 0;
    const selectionEnd = textarea.selectionEnd ?? 0;
    if (cursor !== selectionEnd) {
      clearGhostSuggestion();
      return;
    }
    if (!isCursorAtParagraphEnd(markdown, cursor) || !isCursorAtLineEnd(markdown, cursor)) {
      clearGhostSuggestion();
      return;
    }

    const { prefix, suffix } = sliceAutocompleteContext(markdown, cursor);
    if (!prefix.trim() && !suffix.trim()) {
      setGhostText("");
      setGhostCaret(null);
      setGhostPosition(null);
      setGhostError(null);
      return;
    }

    const cacheKey = `${cursor}:${prefix}:${suffix}`;
    if (lastAutocompleteKeyRef.current === cacheKey) return;
    lastAutocompleteKeyRef.current = cacheKey;

    autocompleteAbortRef.current?.abort();
    const controller = new AbortController();
    autocompleteAbortRef.current = controller;
    const requestSeq = ++autocompleteRequestSeqRef.current;
    setGhostLoading(true);
    setGhostError(null);

    try {
      const response = await fetch("/api/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ prefix, suffix }),
      });

      if (!response.ok || !response.body) throw new Error("autocomplete_failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let suggestion = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6)) as { delta?: string; done?: boolean };
          if (payload.delta) suggestion += payload.delta;
          if (payload.done) break;
        }
      }

      const normalized = normalizeCompletion(suggestion);
      if (controller.signal.aborted) return;
      if (requestSeq !== autocompleteRequestSeqRef.current) return;
      setGhostText(normalized);
      setGhostCaret(normalized ? cursor : null);
      if (normalized) {
        requestAnimationFrame(updateGhostPosition);
      } else {
        setGhostPosition(null);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      if (requestSeq !== autocompleteRequestSeqRef.current) return;
      setGhostText("");
      setGhostCaret(null);
      setGhostPosition(null);
      setGhostError(err instanceof Error ? err.message : "补全失败");
    } finally {
      if (requestSeq === autocompleteRequestSeqRef.current && !controller.signal.aborted) setGhostLoading(false);
    }
  }, [aiEnabled, error, loading, markdown]);

  const handleSelectionToolbarAction = (mode: "style" | "custom") => {
    setSelectionToolbarMode(mode);
    setSelectionToolbarVisible(true);
    requestAnimationFrame(updateSelectionToolbarPosition);
  };

  const handleSelectionPolish = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (!aiEnabled) {
      setSelectionPolishError("请先开启 AI 助手。");
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const hasSelection = start !== end;
    const selectedText = hasSelection ? markdown.slice(start, end) : markdown;
    if (!selectedText.trim()) {
      setSelectionPolishError("请先选中文本，或直接润色全文。");
      return;
    }

    setSelectionPolishing(true);
    setSelectionPolishError(null);
    try {
      const response = await fetch("/api/text-polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: hasSelection ? "selection" : "full",
          sourceText: markdown,
          selectedText,
          title,
          style: selectionStyle ?? "",
          customPrompt: selectionCustomPrompt,
        }),
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "润色失败。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let polished = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6)) as { delta?: string; error?: string; done?: boolean };
          if (payload.error) throw new Error(payload.error);
          if (payload.delta) polished += payload.delta;
          if (payload.done) break;
        }
      }

      const nextText = polished.trim();
      if (!nextText) throw new Error("润色失败。");

      if (hasSelection) {
        const nextMarkdown = `${markdown.slice(0, start)}${nextText}${markdown.slice(end)}`;
        setMarkdown(nextMarkdown);
        requestAnimationFrame(() => {
          const nextCursor = start + nextText.length;
          textarea.selectionStart = nextCursor;
          textarea.selectionEnd = nextCursor;
          textarea.focus();
        });
      } else {
        setMarkdown(nextText);
      }

      setSelectionToolbarVisible(false);
      setSelectionToolbarPosition(null);
      clearGhostSuggestion();
    } catch (error) {
      setSelectionPolishError(error instanceof Error ? error.message : "润色失败。");
    } finally {
      setSelectionPolishing(false);
    }
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!aiEnabled || loading || error || !textarea) {
      setGhostText("");
      setGhostCaret(null);
      setGhostPosition(null);
      setGhostLoading(false);
      return;
    }

    if (lastInputSourceRef.current !== "keyboard") {
      if (autocompleteTimerRef.current) window.clearTimeout(autocompleteTimerRef.current);
      clearGhostSuggestion();
      return;
    }

    if (autocompleteTimerRef.current) window.clearTimeout(autocompleteTimerRef.current);
    autocompleteRequestSeqRef.current += 1;
    autocompleteAbortRef.current?.abort();
    autocompleteTimerRef.current = window.setTimeout(() => {
      void requestAutocomplete();
    }, 500);

    return () => {
      if (autocompleteTimerRef.current) window.clearTimeout(autocompleteTimerRef.current);
    };
  }, [aiEnabled, error, loading, markdown, requestAutocomplete]);

  const handleStyleToggle = (style: "formal" | "casual" | "academic") => {
    setSelectionToolbarMode("style");
    setSelectionStyle((current) => (current === style ? null : style));
    setSelectionToolbarVisible(true);
    requestAnimationFrame(updateSelectionToolbarPosition);
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    markKeyboardDrivenInput();
    setMarkdown(event.target.value);
    const cursor = event.target.selectionStart ?? event.target.value.length;
    setGhostCaret(cursor);
    setGhostText("");
    setGhostError(null);
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    markKeyboardDrivenInput();
    if (event.key === "Tab" && ghostTextDisplay) {
      event.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      const nextMarkdown = `${markdown.slice(0, start)}${ghostTextDisplay}${markdown.slice(end)}`;
      const nextCursor = start + ghostTextDisplay.length;
      setMarkdown(nextMarkdown);
      setGhostText("");
      setGhostCaret(null);
      setGhostError(null);
      requestAnimationFrame(() => {
        textarea.selectionStart = nextCursor;
        textarea.selectionEnd = nextCursor;
        textarea.focus();
      });
    }
  };

  const saveMessage = loading ? "正在加载..." : saveStatus || (error ? "加载失败" : article ? "已加载草稿" : "保存成功");
  const selectedStyleLabel = selectionStyle === "formal" ? "正式" : selectionStyle === "casual" ? "轻松" : selectionStyle === "academic" ? "学术" : "";
  const canApplySelectionChanges = Boolean(selectionStyle || selectionCustomPrompt.trim());
  const selectionToolbarStyle = selectionToolbarPosition ? { top: selectionToolbarPosition.top, left: selectionToolbarPosition.left } : undefined;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f6fffd] text-slate-800 antialiased">
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-cyan-100/80 bg-white/88 px-6 shadow-[0_10px_30px_rgba(56,189,248,0.1)] backdrop-blur-xl">
        <div className="mr-6 flex-1 max-w-2xl">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border-none bg-transparent px-0 text-2xl font-semibold tracking-[-0.02em] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
            placeholder="请输入文章标题..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-3">
          {titleGenerateError ? <span className="text-sm text-rose-300">{titleGenerateError}</span> : null}
          <span className="text-sm text-[#8b90a0]">{saveMessage}</span>
          <button
            type="button"
            onClick={handleTitleGenerate}
            disabled={titleGenerating || loading || !markdown.trim()}
            className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-sm text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {titleGenerating ? "标题生成中..." : "标题生成"}
          </button>
          <button
            type="button"
            onClick={handleAiToggle}
            className="flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 transition hover:bg-cyan-100"
          >
            <span className="material-symbols-outlined text-[18px] text-cyan-700">smart_toy</span>
            <span className="text-sm text-cyan-700">AI助手</span>
            <span className={`relative inline-flex h-4 w-8 rounded-full ${aiEnabled ? "bg-cyan-500" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${aiEnabled ? "left-4" : "left-0.5"}`} />
            </span>
          </button>
          <input ref={fileInputRef} accept=".md,.markdown,text/markdown,text/x-markdown" className="hidden" type="file" onChange={handleMdUpload} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full border border-cyan-100 px-4 py-1.5 text-sm text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-800">
            上传MD文件
          </button>
          <button type="button" onClick={handleDraftBoxClick} className="rounded-full border border-cyan-100 px-4 py-1.5 text-sm text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-800">
            草稿箱
          </button>
          <button type="button" onClick={openPublishDialog} className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105">
            发布文章
          </button>
          <button type="button" onClick={() => router.push("/blogger-center")} className="h-10 w-10 overflow-hidden rounded-full border border-cyan-100 transition hover:border-cyan-300/70 hover:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
            <img alt="博主头像" className="h-full w-full object-cover" src="/avatars/blogger-default.png" />
          </button>
        </div>
      </header>

      <main className="relative mt-16 flex flex-1 overflow-hidden">
        <div className="flex h-full w-1/2 flex-col border-r border-cyan-100/80 bg-white/70">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex w-12 shrink-0 flex-col items-end border-r border-cyan-100/80 bg-cyan-50/60 py-6 pr-3 font-mono text-[13px] leading-7 text-slate-400 select-none">
              {markdown.split("\n").map((_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
                onMouseDown={handleTextareaPointerDown}
                onMouseUp={handleTextareaSelect}
                onKeyUp={handleTextareaSelect}
                onSelect={handleTextareaSelect}
                onScroll={handleTextareaScroll}
                spellCheck={false}
                className="h-full w-full resize-none bg-transparent p-6 font-mono text-[14px] leading-7 text-slate-700 outline-none placeholder:text-slate-400"
                placeholder={loading ? "正在加载草稿..." : "开始编写你的文章内容..."}
              />
              {ghostTextDisplay && ghostCaret !== null ? (
                <div className="pointer-events-none absolute inset-0 overflow-hidden p-6 font-mono text-[14px] leading-7">
                  <div className="relative whitespace-pre-wrap text-transparent">
                    <span>{markdown.slice(0, ghostCaret)}</span>
                    <span ref={ghostMarkerRef} className="inline-block whitespace-pre-wrap opacity-0">
                      {ghostTextDisplay}
                    </span>
                  </div>
                  {ghostPosition ? (
                    <div
                      className="absolute text-[#7c8598]"
                      style={{
                        top: ghostPosition.top,
                        left: ghostPosition.left,
                        whiteSpace: "pre-wrap",
                        transform: "translateX(1px)",
                        textShadow: "0 0 0 transparent",
                      }}
                    >
                      {ghostTextDisplay}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {ghostLoading ? <div className="pointer-events-none absolute right-6 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8b90a0]">补全中...</div> : null}
              {ghostError ? <div className="pointer-events-none absolute right-6 top-4 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-200">补全失败</div> : null}
            </div>
          </div>
        </div>

        <div className="relative flex h-full w-1/2 flex-col bg-[#f6fffd]">
          <div className="flex-1 overflow-auto p-6 text-slate-700">
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : <div className="mx-auto max-w-[800px] prose prose-sky prose-p:mb-4 prose-h1:mb-4 prose-h2:mb-3 prose-ul:mb-4 prose-li:mb-1 prose-strong:text-slate-900" dangerouslySetInnerHTML={{ __html: previewHtml }} />}
          </div>
          {publishDialogOpen ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-cyan-100/80 bg-white/92 shadow-[0_24px_80px_rgba(56,189,248,0.16)]">
                <div className="flex items-center justify-between border-b border-cyan-100/80 px-6 py-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">发布文章</div>
                    <div className="mt-1 text-sm text-slate-500">分类与标签来自数据库，Slug 与摘要可编辑</div>
                  </div>
                  <button type="button" onClick={() => setPublishDialogOpen(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="max-h-[calc(90vh-72px)] overflow-y-auto px-6 py-5">
                  {publishDialogLoading ? <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-10 text-center text-sm text-slate-500">正在加载发布配置...</div> : null}
                  {!publishDialogLoading && publishDialogError ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{publishDialogError}</div> : null}

                  {!publishDialogLoading ? (
                    <>
                      <div className="grid gap-5 lg:grid-cols-2">
                        <section className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                          <h3 className="text-sm font-semibold text-slate-900">分类（单选）</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {publishCategories.length > 0 ? publishCategories.map((category) => {
                              const active = publishCategoryId === category.id;
                              return (
                                <button key={category.id} type="button" onClick={() => setPublishCategoryId((current) => (current === category.id ? "" : category.id))} className={`rounded-full border px-4 py-2 text-sm transition ${active ? "border-cyan-300 bg-gradient-to-r from-cyan-500 to-violet-500 text-white" : "border-cyan-100 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"}`}>
                                  {category.name}
                                </button>
                              );
                            }) : <div className="text-sm text-slate-500">暂无分类数据</div>}
                          </div>
                        </section>

                        <section className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                          <h3 className="text-sm font-semibold text-slate-900">标签（最多 3 个）</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {publishTags.length > 0 ? publishTags.map((tag) => {
                              const active = publishTagIds.includes(tag.id);
                              const disabled = !active && publishTagIds.length >= 3;
                              return (
                                <button key={tag.id} type="button" disabled={disabled} onClick={() => togglePublishTag(tag.id)} className={`rounded-full border px-4 py-2 text-sm transition ${active ? "border-cyan-300 bg-gradient-to-r from-cyan-500 to-violet-500 text-white" : disabled ? "cursor-not-allowed border-cyan-100 bg-white text-slate-300" : "border-cyan-100 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"}`}>
                                  {tag.name}
                                </button>
                              );
                            }) : <div className="text-sm text-slate-500">暂无标签数据</div>}
                          </div>
                          <div className="mt-3 text-xs text-slate-500">已选 {publishTagIds.length} / 3</div>
                        </section>
                      </div>

                      <div className="mt-5 grid gap-5">
                        <label className="block rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                          <div className="text-sm font-semibold text-slate-900">Slug（必填）</div>
                          <input value={publishSlug} onChange={(event) => setPublishSlug(event.target.value)} placeholder="例如：my-first-post" className="mt-3 w-full rounded-2xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-cyan-300" />
                        </label>

                        <label className="block rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-slate-900">摘要</div>
                            <div className="text-xs text-slate-500">默认取文章前 100 字符，可手动编辑</div>
                          </div>
                          <textarea value={publishSummary} onChange={(event) => setPublishSummary(event.target.value)} rows={5} className="mt-3 w-full resize-none rounded-2xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-cyan-300" />
                        </label>
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-cyan-100/80 px-6 py-4">
                  <div className="text-xs text-slate-500">分类只能选一个，标签最多三个</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setPublishDialogOpen(false)} className="rounded-full border border-cyan-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-cyan-50">取消</button>
                    <button type="button" onClick={handlePublishArticle} disabled={publishDialogSaving || publishDialogLoading} className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
                      {publishDialogSaving ? "发布中..." : "确认发布"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {selectionToolbarVisible && selectionToolbarPosition ? (
            <div className="pointer-events-auto fixed z-40 w-[420px] rounded-2xl border border-cyan-100/80 bg-white/95 p-3 shadow-[0_20px_60px_rgba(56,189,248,0.16)] backdrop-blur-xl" style={selectionToolbarStyle}>
              <div className="flex items-center justify-between gap-3 border-b border-cyan-100/80 pb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">AI 润色</div>
                  <div className="text-xs text-slate-500">支持选中文本或全文润色</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionToolbarVisible(false);
                    setSelectionToolbarPosition(null);
                  }}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700"
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
                      className={`rounded-xl border px-3 py-2 text-sm transition ${isActive ? "border-cyan-300 bg-gradient-to-r from-cyan-500 to-violet-500 text-white" : "border-cyan-100 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-3">
                <div className="mb-2 text-xs font-medium tracking-[0.18em] text-slate-500">自定义要求</div>
                <textarea
                  value={selectionCustomPrompt}
                  onChange={(event) => setSelectionCustomPrompt(event.target.value)}
                  placeholder="例如：请将选中文本修改得更简洁、有说服力，并保持原意。"
                  className="min-h-[96px] w-full resize-none rounded-xl border border-cyan-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-cyan-300"
                />
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{selectedStyleLabel ? `当前风格：${selectedStyleLabel}` : "当前风格：未选择"}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setSelectionToolbarVisible(false)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5">
                      取消
                    </button>
                    <button type="button" disabled={selectionPolishing} onClick={handleSelectionPolish} className="rounded-full bg-[#adc6ff] px-4 py-2 text-sm font-semibold text-[#001a41] transition hover:bg-[#c2d3ff] disabled:cursor-not-allowed disabled:bg-[#33415f] disabled:text-[#7e8aa5]">
                      {selectionPolishing ? "润色中..." : "开始润色"}
                    </button>
                  </div>
                </div>
                {selectionPolishError ? <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{selectionPolishError}</div> : null}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 z-50 flex h-10 w-full items-center justify-between border-t border-cyan-100/80 bg-white/90 px-4 text-sm text-slate-500 backdrop-blur-xl">
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
