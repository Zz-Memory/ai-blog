"use client";

type SendMessageStatus = "published" | "draft";

type SendMessageItem = {
  title: string;
  audience: string;
  updatedAt: string;
  status: SendMessageStatus;
};

type Props = {
  messages: SendMessageItem[];
  activeTab: "compose" | "manage";
  onTabChange: (tab: "compose" | "manage") => void;
  specificAudience: boolean;
  onSpecificAudienceChange: (value: boolean) => void;
  scheduledSend: boolean;
  onScheduledSendChange: (value: boolean) => void;
  activeMenuTitle: string | null;
  activeMenuPosition: { top: number; left: number } | null;
  onMenuOpen: (title: string, top: number, left: number) => void;
  onMenuClose: () => void;
  onRequestDelete: (messageTitle: string) => void;
};

export function BloggerCenterMessages({ messages, activeTab, onTabChange, specificAudience, onSpecificAudienceChange, scheduledSend, onScheduledSendChange, activeMenuTitle, activeMenuPosition, onMenuOpen, onMenuClose, onRequestDelete }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100 md:text-4xl">消息管理</h1>
        <p className="text-base text-zinc-400">让用户听到您的声音吧</p>
      </div>

      <div className="flex gap-10 border-b border-white/10">
        <button type="button" onClick={() => onTabChange("compose")} className={`pb-3 text-lg font-semibold transition ${activeTab === "compose" ? "border-b-2 border-[#adc6ff] text-[#adc6ff]" : "text-zinc-400 hover:text-zinc-200"}`}>新消息</button>
        <button type="button" onClick={() => onTabChange("manage")} className={`pb-3 text-lg font-semibold transition ${activeTab === "manage" ? "border-b-2 border-[#adc6ff] text-[#adc6ff]" : "text-zinc-400 hover:text-zinc-200"}`}>消息管理</button>
      </div>

      {activeTab === "compose" ? (
        <div className="space-y-6 rounded-[28px] border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-8">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm font-medium text-zinc-200">接收者</div>
              <div className="flex flex-wrap items-center gap-8">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300 transition hover:text-zinc-100"><input type="radio" name="audience" checked={!specificAudience} onChange={() => onSpecificAudienceChange(false)} className="h-4 w-4 accent-[#adc6ff]" />所有访客</label>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300 transition hover:text-zinc-100"><input type="radio" name="audience" checked={specificAudience} onChange={() => onSpecificAudienceChange(true)} className="h-4 w-4 accent-[#adc6ff]" />特定用户</label>
              </div>
            </div>

            {specificAudience ? <div className="space-y-2"><label className="text-xs uppercase tracking-[0.18em] text-zinc-500">搜索用户</label><div className="relative max-w-md"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-zinc-500">person_search</span><input className="w-full rounded-xl border border-white/10 bg-[#101215] py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none transition focus:border-[#adc6ff]/50" placeholder="输入用户名或账号匹配..." type="text" /></div></div> : null}
          </div>

          <div className="space-y-2"><label className="text-sm font-medium text-zinc-200">消息标题</label><input className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-[#adc6ff]/50" placeholder="输入引人注目的标题..." type="text" /></div>
          <div className="space-y-2"><div className="text-sm font-medium text-zinc-200">正文内容</div><textarea className="min-h-[280px] w-full rounded-2xl border border-white/10 bg-[#101215] px-4 py-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#adc6ff]/50" placeholder="请输入消息正文..." /></div>
          <div className="space-y-3">
            <div className="text-sm font-medium text-zinc-200">发送设置</div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300 transition hover:text-zinc-100"><input type="radio" name="timing" checked={!scheduledSend} onChange={() => onScheduledSendChange(false)} className="h-4 w-4 accent-[#adc6ff]" />立即发送</label>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300 transition hover:text-zinc-100"><input type="radio" name="timing" checked={scheduledSend} onChange={() => onScheduledSendChange(true)} className="h-4 w-4 accent-[#adc6ff]" />定时发送</label>
              <div className={`relative ${scheduledSend ? "opacity-100" : "opacity-50"}`}><span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[18px] text-zinc-500">calendar_today</span><input type="datetime-local" disabled={!scheduledSend} className="rounded-lg border border-white/10 bg-[#101215] py-2.5 pl-9 pr-3 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed" /></div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2"><button type="button" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10">存为草稿</button><button type="button" className="flex items-center gap-2 rounded-xl bg-[#adc6ff] px-5 py-3 text-sm font-medium text-[#001a41] transition hover:bg-[#c3d2ff]"><span className="material-symbols-outlined text-[18px]">send</span>确认发送</button></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[#14161b] shadow-[0_20px_60px_rgba(0,0,0,0.22)]"><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="border-b border-white/8 bg-white/[0.03]"><th className="px-6 py-4 text-sm font-medium text-zinc-300">标题</th><th className="px-6 py-4 text-sm font-medium text-zinc-300">接收群体</th><th className="px-6 py-4 text-sm font-medium text-zinc-300">修改时间</th><th className="px-6 py-4 text-sm font-medium text-zinc-300">状态</th><th className="px-6 py-4 text-right text-sm font-medium text-zinc-300">操作</th></tr></thead><tbody className="divide-y divide-white/8">{messages.length ? messages.map((message) => (<tr key={`${message.title}-${message.updatedAt}`} className="transition hover:bg-white/[0.03]"><td className="px-6 py-4"><div className="max-w-xs truncate text-sm font-medium text-zinc-100">{message.title}</div></td><td className="px-6 py-4 text-sm text-zinc-400">{message.audience}</td><td className="px-6 py-4 text-sm text-zinc-400">{message.updatedAt}</td><td className="px-6 py-4"><span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${message.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-400"}`}>{message.status === "published" ? "已发布" : "草稿"}</span></td><td className="px-6 py-4 text-right"><div className="relative inline-flex"><button type="button" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const menuHeight = 132; const menuWidth = 160; const gap = 8; const pad = 12; const openUp = window.innerHeight - rect.bottom < menuHeight + gap; const top = openUp ? Math.max(pad, rect.top - menuHeight - gap) : Math.min(window.innerHeight - menuHeight - pad, rect.bottom + gap); const left = Math.min(window.innerWidth - menuWidth - pad, Math.max(pad, rect.right - menuWidth)); onMenuOpen(message.title, top, left); }} className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>{activeMenuTitle === message.title && activeMenuPosition ? (<div className="fixed z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#161922] shadow-2xl" style={{ top: activeMenuPosition.top, left: activeMenuPosition.left }}>{(message.status === "published" ? ["撤回", "编辑", "删除"] : ["发布", "编辑", "删除"]).map((label) => (<button key={label} type="button" onClick={() => { if (label === "删除") onRequestDelete(message.title); onMenuClose(); }} className={`block w-full px-4 py-2 text-left text-sm transition ${label === "删除" ? "text-rose-300 hover:bg-rose-500/10" : label === "发布" ? "text-[#adc6ff] hover:bg-[#adc6ff]/10" : "text-zinc-100 hover:bg-white/8"}`}>{label}</button>))}</div>) : null}</div></td></tr>)) : <tr className="h-[220px]"><td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">无消息</td></tr>}</tbody></table></div></div>
      )}
    </div>
  );
}
