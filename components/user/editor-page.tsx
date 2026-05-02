"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const initialMarkdown = `# 品牌与风格
本设计系统旨在定义一个以人工智能为核心的个人博客体验。品牌性格融合了人类创作的感性与 AI 处理的理性。

**设计风格：AI 原生极简主义 (AI-Native Minimalism)**
这种风格超越了传统扁平化设计，强调界面作为“智能容器”的角色。设计语言通过大量留白、精确的排版和流动的玻璃质感，营造出一种前卫且深邃的数字空间感。

## 布局与间距
本设计系统采用固定宽度网格与动态页边距相结合的模式，专注于阅读效率。

- **阅读容器**: 核心内容区限制在 800px 宽度内，这是长文阅读的最佳视觉扫描宽度。
- **8px 节奏**: 所有间距均基于 8px 步进系统。组件内部间距通常使用 12px 或 16px。`;

type MenuOption = { label: string; icon: string };

type ToolbarButton = {
  id: string;
  icon: string;
  tooltip: string;
  menu?: MenuOption[];
};

const leftToolbarButtons: ToolbarButton[] = [
  { id: "heading", icon: "title", tooltip: "标题", menu: [{ label: "H1", icon: "looks_one" }, { label: "H2", icon: "looks_two" }, { label: "H3", icon: "looks_3" }, { label: "H4", icon: "looks_4" }, { label: "H5", icon: "looks_5" }, { label: "H6", icon: "looks_6" }] },
  { id: "bold", icon: "format_bold", tooltip: "粗体" },
  { id: "italic", icon: "format_italic", tooltip: "斜体" },
  { id: "link", icon: "link", tooltip: "链接" },
  { id: "code-inline", icon: "code", tooltip: "代码" },
  { id: "code-block", icon: "data_object", tooltip: "代码块" },
  { id: "ul", icon: "format_list_bulleted", tooltip: "无序列表" },
  { id: "ol", icon: "format_list_numbered", tooltip: "有序列表" },
  { id: "strike", icon: "strikethrough_s", tooltip: "删除线" },
  { id: "task", icon: "checklist", tooltip: "任务列表" },
  { id: "table", icon: "table_chart", tooltip: "表格" },
  { id: "align", icon: "format_align_left", tooltip: "对齐", menu: [{ label: "左对齐", icon: "format_align_left" }, { label: "居中对齐", icon: "format_align_center" }, { label: "右对齐", icon: "format_align_right" }] },
];

const rightToolbarButtons: ToolbarButton[] = [
  { id: "toc", icon: "toc", tooltip: "目录" },
  { id: "import", icon: "upload_file", tooltip: "文档导入" },
  { id: "edit-only", icon: "edit_document", tooltip: "仅编辑区" },
  { id: "preview-only", icon: "preview", tooltip: "仅预览区" },
];

function countWords(text: string) {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length + (cleaned.match(/[\u4e00-\u9fff]/g)?.length ?? 0);
}

function toPreviewHtml(markdown: string) {
  return markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-5 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n- (.*)/g, "<li>$1</li>")
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<h1|<h2|<h3|<li>|<p)/gm, '<p class="mb-4">')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-5 mb-4">$1</ul>')
    .replace(/<p class="mb-4">\s*<h/g, '<h')
    .replace(/<\/li><\/ul>\s*<ul class="list-disc pl-5 mb-4">/g, '')
    .replace(/<p class="mb-4">/g, '<p class="mb-4">')
    .replace(/\n/g, '<br/>');
}

function ToolbarButton({
  button,
  activeMenu,
  onToggleMenu,
  onAction,
}: {
  button: ToolbarButton;
  activeMenu: string | null;
  onToggleMenu: (id: string) => void;
  onAction: (id: string) => void;
}) {
  const hasMenu = Boolean(button.menu?.length);
  const menuOpen = activeMenu === button.id;

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={() => (hasMenu ? onToggleMenu(button.id) : onAction(button.id))}
        className={`group relative rounded-lg p-1.5 text-[#8b90a0] transition hover:bg-white/5 hover:text-white ${menuOpen ? "bg-white/5 text-white" : ""}`}
      >
        <span className="material-symbols-outlined text-[20px]">{button.icon}</span>
      </button>

      {menuOpen && hasMenu ? (
        <div className="absolute left-1/2 top-full z-[80] mt-2 min-w-24 -translate-x-1/2 rounded-xl border border-white/10 bg-[#161922] p-1 shadow-2xl">
          {button.menu!.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onAction(`${button.id}:${option.label}`)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-100 transition hover:bg-white/8"
            >
              <span className="material-symbols-outlined text-[18px] text-[#adc6ff]">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute -top-10 left-1/2 z-[90] w-max -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#161922] px-3 py-1.5 text-xs font-medium text-zinc-100 shadow-2xl">
      {label}
      <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#161922]" />
    </div>
  );
}

export function EditorPage() {
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [syncScroll, setSyncScroll] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<"both" | "edit" | "preview">("both");
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  const stats = useMemo(() => {
    const words = countWords(markdown);
    const lines = markdown.split("\n").length;
    const chars = markdown.length;
    return { words, lines, chars };
  }, [markdown]);

  const previewHtml = useMemo(() => toPreviewHtml(markdown), [markdown]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!toolbarRef.current?.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const syncSelection = () => {
      selectionRef.current = { start: textarea.selectionStart ?? 0, end: textarea.selectionEnd ?? 0 };
    };

    textarea.addEventListener("select", syncSelection);
    textarea.addEventListener("keyup", syncSelection);
    textarea.addEventListener("mouseup", syncSelection);

    return () => {
      textarea.removeEventListener("select", syncSelection);
      textarea.removeEventListener("keyup", syncSelection);
      textarea.removeEventListener("mouseup", syncSelection);
    };
  }, []);

  const handleToolbarAction = (actionId: string) => {
    if (actionId === "edit-only") {
      setLayoutMode((current) => (current === "edit" ? "both" : "edit"));
      return;
    }

    if (actionId === "preview-only") {
      setLayoutMode((current) => (current === "preview" ? "both" : "preview"));
      return;
    }

    if (actionId === "toc") {
      setActiveMenu((current) => (current === "toc" ? null : "toc"));
      return;
    }

    setActiveMenu(null);
    requestAnimationFrame(() => editorRef.current?.focus({ preventScroll: true }));
  };

  const showEditor = layoutMode !== "preview";
  const showPreview = layoutMode !== "edit";

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
          <button type="button" onClick={() => setAiEnabled((current) => !current)} className="flex items-center gap-2 rounded-full border border-[#adc6ff]/30 bg-[#adc6ff]/10 px-3 py-1.5 transition hover:bg-[#adc6ff]/15">
            <span className="material-symbols-outlined text-[18px] text-[#adc6ff]">smart_toy</span>
            <span className="text-sm text-[#adc6ff]">小智</span>
            <span className={`relative inline-flex h-4 w-8 rounded-full ${aiEnabled ? "bg-[#adc6ff]" : "bg-[#414755]"}`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${aiEnabled ? "left-4" : "left-0.5"}`} />
            </span>
          </button>
          <button type="button" className="rounded-full border border-[#414755] px-4 py-1.5 text-sm text-[#c1c6d7] transition hover:bg-white/5 hover:text-white">草稿箱</button>
          <button type="button" className="rounded-full bg-[#adc6ff] px-4 py-2 text-sm font-semibold text-[#002e69] transition hover:shadow-[0_0_15px_rgba(75,142,255,0.4)]">发布文章</button>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-[#414755]">
            <img alt="User Avatar" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5PoWMep41jh0y5b34xxK8FfpRHQgO-GtXGN7cm0XBIFwJHee2YNGpeN9rkIi-hdbRK-cBcuqnkO956Wd5Lbpq57P7IFuoNe1r5EjGIQ8dB_qv6YTo51D_2NCwOh6HrFHOzdRH9X_KWUzsjWB0ILvE_epTkjfoMZkwjVchiuS9R-XqqssQBVnCzg77Yie0EbOAs5fm42lIeRx6GNzLvaiOOajOrjRuES4IBq6NvtYLcNCi5GxYfcnoADL4Lor_ZuMAlfLWqpESPJyX" />
          </div>
        </div>
      </header>

      <div ref={toolbarRef} className="fixed left-0 top-16 z-[120] flex h-12 w-full items-center justify-between border-b border-[#414755]/30 bg-[#0e0e10]/95 px-12 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {leftToolbarButtons.map((button) => (
            <div key={button.id} className="relative flex items-center" onMouseEnter={() => setHoveredButton(button.id)} onMouseLeave={() => setHoveredButton(null)}>
              <ToolbarButton
                button={button}
                activeMenu={activeMenu}
                onToggleMenu={(id) => setActiveMenu((current) => (current === id ? null : id))}
                onAction={handleToolbarAction}
              />
              {hoveredButton === button.id ? <Tooltip label={button.tooltip} /> : null}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {rightToolbarButtons.map((button) => (
            <div key={button.id} className="relative flex items-center" onMouseEnter={() => setHoveredButton(button.id)} onMouseLeave={() => setHoveredButton(null)}>
              <button
                type="button"
                onClick={() => handleToolbarAction(button.id)}
                className={`rounded-lg p-1.5 text-[#8b90a0] transition hover:bg-white/5 hover:text-white ${layoutMode === "edit" && button.id === "edit-only" ? "text-[#adc6ff]" : ""} ${layoutMode === "preview" && button.id === "preview-only" ? "text-[#adc6ff]" : ""}`}
              >
                <span className="material-symbols-outlined text-[20px]">{button.icon}</span>
              </button>
              {hoveredButton === button.id ? <Tooltip label={button.tooltip} /> : null}
            </div>
          ))}
        </div>
      </div>

      <main className="relative mt-28 flex flex-1 overflow-hidden">
        {showEditor ? (
          <div className={`flex h-full flex-col border-r border-[#414755]/30 bg-[#0e0e10] ${showPreview ? "w-1/2" : "w-full"}`}>
            <div className="flex-1 overflow-hidden">
              <div className="flex h-full overflow-auto bg-[#0e0e10]">
                <div className="w-12 shrink-0 select-none border-r border-white/5 bg-[#0e0e10] py-6 pr-3 font-mono text-[13px] leading-7 text-[#414755]">
                  {markdown.split("\n").map((_, index) => <span key={index} className="block text-right">{index + 1}</span>)}
                </div>
                <textarea
                  ref={editorRef}
                  value={markdown}
                  onChange={(event) => setMarkdown(event.target.value)}
                  spellCheck={false}
                  className="flex-1 resize-none bg-transparent p-6 font-mono text-[14px] leading-7 text-[#c1c6d7] outline-none placeholder:text-[#414755]"
                />
              </div>
            </div>
          </div>
        ) : null}

        {showPreview ? (
          <div className={`flex h-full flex-col bg-[#131315] ${showEditor ? "w-1/2" : "w-full"}`}>
            <div className="flex-1 overflow-auto p-6 text-[#e5e1e4]">
              <div className="prose prose-invert mx-auto max-w-[800px] prose-p:mb-4 prose-h1:mb-4 prose-h2:mb-3 prose-ul:mb-4 prose-li:mb-1 prose-strong:text-white" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        ) : null}
      </main>

      <footer className="fixed bottom-0 left-0 z-50 flex h-10 w-full items-center justify-between border-t border-white/10 bg-[#0e0e10] px-4 text-sm text-[#8b90a0]">
        <div className="flex items-center gap-4">
          <span>字数: {stats.words}</span>
          <span>行数: {stats.lines}</span>
          <span>字符数: {stats.chars.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 transition hover:text-white">
            <input checked={syncScroll} onChange={(event) => setSyncScroll(event.target.checked)} className="rounded border-[#414755] bg-transparent text-[#adc6ff] focus:ring-0 focus:ring-offset-0" type="checkbox" />
            同步滚动
          </label>
          <button type="button" className="flex items-center gap-1 transition hover:text-white">
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            回到顶部
          </button>
        </div>
      </footer>
    </div>
  );
}
