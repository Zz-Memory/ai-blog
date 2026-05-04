"use client";

import { useState } from "react";

type SendMessageStatus = "published" | "draft";

export function BloggerCenterMessages() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (status: SendMessageStatus) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/user/blogger-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          audience: "所有访客",
          status,
          type: "SYSTEM",
          linkUrl: null,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || "保存失败");
      }

      setTitle("");
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100 md:text-4xl">发送消息</h1>
        <p className="text-base text-zinc-400">向全部访客发布站内消息通知</p>
      </div>

      <div className="space-y-6 rounded-[28px] border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-8">
        {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-200">消息标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-[#adc6ff]/50"
            placeholder="输入引人注目的标题..."
            type="text"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-zinc-200">正文内容</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[280px] w-full rounded-2xl border border-white/10 bg-[#101215] px-4 py-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#adc6ff]/50"
            placeholder="请输入消息正文..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSubmit("draft")}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            存为草稿
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSubmit("published")}
            className="flex items-center gap-2 rounded-xl bg-[#adc6ff] px-5 py-3 text-sm font-medium text-[#001a41] transition hover:bg-[#c3d2ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            确认发送
          </button>
        </div>
      </div>
    </div>
  );
}
