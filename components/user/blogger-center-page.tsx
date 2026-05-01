"use client";

import { useEffect, useMemo, useState } from "react";

import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { useNotificationCount } from "@/components/common/notification-context";
import { VisitorCenterAccountSettings } from "@/components/user/visitor-center-page/visitor-center-account-settings";
import { VisitorCenterComments } from "@/components/user/visitor-center-page/visitor-center-comments";
import { VisitorCenterConfirmModal } from "@/components/user/visitor-center-page/visitor-center-confirm-modal";
import { VisitorCenterFavorites } from "@/components/user/visitor-center-page/visitor-center-favorites";
import { VisitorCenterHistory } from "@/components/user/visitor-center-page/visitor-center-history";
import { VisitorCenterLiked } from "@/components/user/visitor-center-page/visitor-center-liked";
import { VisitorCenterNotifications } from "@/components/user/visitor-center-page/visitor-center-notifications";

import { commentedArticles } from "./visitor-center-page/commented-articles";
import { historyArticles } from "./visitor-center-page/history-articles";
import { likedArticles } from "./visitor-center-page/liked-articles";
import { BloggerCenterSidebar } from "./blogger-center-page/blogger-center-sidebar";

type SendMessageStatus = "published" | "draft";

type SendMessageItem = {
  title: string;
  audience: string;
  updatedAt: string;
  status: SendMessageStatus;
};

const initialMessages: SendMessageItem[] = [
  { title: "2024 年度技术回顾报告", audience: "所有访客", updatedAt: "2024-05-20 14:30", status: "published" },
  { title: "（草稿）关于社区维护的通知", audience: "未设置", updatedAt: "2024-05-22 11:30", status: "draft" },
  { title: "新功能上线预告：AI 自动摘要", audience: "AlexChen", updatedAt: "2024-05-22 09:00", status: "published" },
  { title: "（草稿）五一假期活动预告", audience: "未设置", updatedAt: "2024-05-21 09:00", status: "draft" },
  { title: "系统升级通知", audience: "所有访客", updatedAt: "2024-05-18 10:00", status: "published" },
  { title: "欢迎加入我们的 Discord 社区", audience: "JohnDoe", updatedAt: "2024-05-15 16:20", status: "published" },
  { title: "（草稿）七月技术分享会报名", audience: "未设置", updatedAt: "2024-05-19 15:45", status: "draft" },
];

const statusMeta: Record<SendMessageStatus, { label: string; className: string }> = {
  published: { label: "已发布", className: "bg-emerald-500/10 text-emerald-400" },
  draft: { label: "草稿", className: "bg-zinc-500/10 text-zinc-400" },
};

export function BloggerCenterPage() {
  const [siteSearchValue, setSiteSearchValue] = useState("");
  const [historySearchValue, setHistorySearchValue] = useState("");
  const [historySearchKeyword, setHistorySearchKeyword] = useState("");
  const [history, setHistory] = useState(historyArticles);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState("send-message");
  const [activeTab, setActiveTab] = useState<"compose" | "manage">("compose");
  const [specificAudience, setSpecificAudience] = useState(false);
  const [scheduledSend, setScheduledSend] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [activeMessageMenuPosition, setActiveMessageMenuPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (activeSection === "send-message") {
      setActiveTab("compose");
    } else {
      setActiveMessageMenu(null);
      setActiveMessageMenuPosition(null);
    }
  }, [activeSection]);

  const { unreadCount, setUnreadCount } = useNotificationCount();

  const likedList = useMemo(() => likedArticles, []);
  const commentedList = useMemo(() => commentedArticles, []);

  const filteredArticles = useMemo(() => {
    const q = historySearchKeyword.trim().toLowerCase();
    if (!q) return history;

    return history.filter((item) => {
      const haystack = [item.title, item.excerpt, item.category, ...item.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [history, historySearchKeyword]);

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader
        searchValue={siteSearchValue}
        onSearchChange={setSiteSearchValue}
        onSearchSubmit={() => undefined}
        onLoginClick={() => undefined}
        onRegisterClick={() => undefined}
        isAuthenticated
      />

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1440px] grid-cols-1 gap-8 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-8">
        <BloggerCenterSidebar
          activeId={activeSection}
          onSelect={setActiveSection}
          onLogoutClick={() => setShowLogoutConfirm(true)}
          onSettingsClick={() => setActiveSection("settings")}
          notificationBadgeCount={unreadCount}
        />

        <section className="space-y-6 pb-10">
          {activeSection === "send-message" ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100 md:text-4xl">发送消息</h1>
                <p className="text-base text-zinc-400">让用户听到您的声音吧</p>
              </div>

              <div className="flex gap-10 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("compose")}
                  className={`pb-3 text-lg font-semibold transition ${activeTab === "compose" ? "border-b-2 border-[#adc6ff] text-[#adc6ff]" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  新消息
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("manage")}
                  className={`pb-3 text-lg font-semibold transition ${activeTab === "manage" ? "border-b-2 border-[#adc6ff] text-[#adc6ff]" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  消息管理
                </button>
              </div>

              {activeTab === "compose" ? (
                <div className="space-y-6 rounded-[28px] border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-8">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-zinc-200">接收者</div>
                      <div className="flex flex-wrap items-center gap-8">
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300 transition hover:text-zinc-100">
                          <input type="radio" name="audience" checked={!specificAudience} onChange={() => setSpecificAudience(false)} className="h-4 w-4 accent-[#adc6ff]" />
                          所有访客
                        </label>
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300 transition hover:text-zinc-100">
                          <input type="radio" name="audience" checked={specificAudience} onChange={() => setSpecificAudience(true)} className="h-4 w-4 accent-[#adc6ff]" />
                          特定用户
                        </label>
                      </div>
                    </div>

                    {specificAudience ? (
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.18em] text-zinc-500">搜索用户</label>
                        <div className="relative max-w-md">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-zinc-500">person_search</span>
                          <input className="w-full rounded-xl border border-white/10 bg-[#101215] py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none transition focus:border-[#adc6ff]/50" placeholder="输入用户名或账号匹配..." type="text" />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-200">消息标题</label>
                    <input className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-[#adc6ff]/50" placeholder="输入引人注目的标题..." type="text" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-zinc-200">正文内容</div>
                    <textarea
                      className="min-h-[280px] w-full rounded-2xl border border-white/10 bg-[#101215] px-4 py-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#adc6ff]/50"
                      placeholder="请输入消息正文..."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-zinc-200">发送设置</div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                      <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300 transition hover:text-zinc-100">
                        <input type="radio" name="timing" checked={!scheduledSend} onChange={() => setScheduledSend(false)} className="h-4 w-4 accent-[#adc6ff]" />
                        立即发送
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300 transition hover:text-zinc-100">
                        <input type="radio" name="timing" checked={scheduledSend} onChange={() => setScheduledSend(true)} className="h-4 w-4 accent-[#adc6ff]" />
                        定时发送
                      </label>
                      <div className={`relative ${scheduledSend ? "opacity-100" : "opacity-50"}`}>
                        <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[18px] text-zinc-500">calendar_today</span>
                        <input type="datetime-local" disabled={!scheduledSend} className="rounded-lg border border-white/10 bg-[#101215] py-2.5 pl-9 pr-3 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
                      存为草稿
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-xl bg-[#adc6ff] px-5 py-3 text-sm font-medium text-[#001a41] transition hover:bg-[#c3d2ff]">
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      确认发送
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[#14161b] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/8 bg-white/[0.03]">
                          <th className="px-6 py-4 text-sm font-medium text-zinc-300">标题</th>
                          <th className="px-6 py-4 text-sm font-medium text-zinc-300">接收群体</th>
                          <th className="px-6 py-4 text-sm font-medium text-zinc-300">修改时间</th>
                          <th className="px-6 py-4 text-sm font-medium text-zinc-300">状态</th>
                          <th className="px-6 py-4 text-right text-sm font-medium text-zinc-300">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8">
                        {initialMessages.map((message) => (
                          <tr key={`${message.title}-${message.updatedAt}`} className="transition hover:bg-white/[0.03]">
                            <td className="px-6 py-4">
                              <div className="max-w-xs truncate text-sm font-medium text-zinc-100">{message.title}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-400">{message.audience}</td>
                            <td className="px-6 py-4 text-sm text-zinc-400">{message.updatedAt}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusMeta[message.status].className}`}>{statusMeta[message.status].label}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="relative inline-flex">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    const buttonRect = event.currentTarget.getBoundingClientRect();
                                    const menuHeight = message.status === "published" ? 132 : 132;
                                    const menuWidth = 160;
                                    const gap = 8;
                                    const viewportPadding = 12;
                                    const spaceBelow = window.innerHeight - buttonRect.bottom;
                                    const openUpward = spaceBelow < menuHeight + gap;
                                    const top = openUpward
                                      ? Math.max(viewportPadding, buttonRect.top - menuHeight - gap)
                                      : Math.min(window.innerHeight - menuHeight - viewportPadding, buttonRect.bottom + gap);
                                    const left = Math.min(window.innerWidth - menuWidth - viewportPadding, Math.max(viewportPadding, buttonRect.right - menuWidth));

                                    setActiveMessageMenu((current) => (current === message.title ? null : message.title));
                                    setActiveMessageMenuPosition((current) => (current && activeMessageMenu === message.title ? null : { top, left }));
                                  }}
                                  className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"
                                  aria-expanded={activeMessageMenu === message.title}
                                >
                                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>

                                {activeMessageMenu === message.title && activeMessageMenuPosition ? (
                                  <div
                                    className="fixed z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#161922] shadow-2xl"
                                    style={{ top: activeMessageMenuPosition.top, left: activeMessageMenuPosition.left }}
                                  >
                                    {(message.status === "published"
                                      ? [
                                          { label: "撤回", className: "text-zinc-100 hover:bg-white/8" },
                                          { label: "编辑", className: "text-zinc-100 hover:bg-white/8" },
                                          { label: "删除", className: "text-rose-300 hover:bg-rose-500/10" },
                                        ]
                                      : [
                                          { label: "发布", className: "text-[#adc6ff] hover:bg-[#adc6ff]/10" },
                                          { label: "编辑", className: "text-zinc-100 hover:bg-white/8" },
                                          { label: "删除", className: "text-rose-300 hover:bg-rose-500/10" },
                                        ]
                                    ).map((action) => (
                                      <button
                                        key={action.label}
                                        type="button"
                                        onClick={() => {
                                          setActiveMessageMenu(null);
                                          setActiveMessageMenuPosition(null);
                                        }}
                                        className={`block w-full px-4 py-2 text-left text-sm transition ${action.className}`}
                                      >
                                        {action.label}
                                      </button>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 border-t border-white/8 px-6 py-5 sm:flex-row sm:items-center">
                    <div className="text-sm text-zinc-500">显示 1 至 7 条，共 24 条</div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <button type="button" className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-zinc-100">
                        上一页
                      </button>
                      <button type="button" className="rounded-lg border border-[#6e8cff]/30 bg-[#182033] px-3 py-1.5 text-[#adc6ff]">
                        1
                      </button>
                      <button type="button" className="rounded-lg border border-transparent px-3 py-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100">
                        2
                      </button>
                      <button type="button" className="rounded-lg border border-transparent px-3 py-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100">
                        3
                      </button>
                      <span className="px-1 text-zinc-500">...</span>
                      <button type="button" className="rounded-lg border border-transparent px-3 py-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100">
                        8
                      </button>
                      <button type="button" className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-zinc-100">
                        下一页
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {activeSection === "history" ? (
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-zinc-100">浏览记录</h2>
                    <p className="mt-2 text-sm leading-7 text-zinc-400">延续访客中心的浏览记录模块，方便您查看自己的内容浏览轨迹。</p>
                  </div>
                  <button type="button" onClick={() => setShowClearConfirm(true)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10">
                    清空记录
                  </button>
                </div>
              </div>
              <VisitorCenterHistory articles={filteredArticles} />
            </div>
          ) : null}

          {activeSection === "liked" ? <VisitorCenterLiked articles={likedList} /> : null}
          {activeSection === "favorites" ? <VisitorCenterFavorites articles={likedList} /> : null}
          {activeSection === "comments" ? <VisitorCenterComments articles={commentedList} /> : null}
          {activeSection === "notifications" ? <VisitorCenterNotifications onUnreadCountChange={setUnreadCount} /> : null}
          {activeSection === "settings" ? <VisitorCenterAccountSettings /> : null}
        </section>
      </main>

      <VisitorCenterConfirmModal
        open={showClearConfirm}
        title="确认清空浏览记录？"
        description="此操作会永久删除当前浏览记录，且无法恢复。"
        cancelLabel="取消"
        confirmLabel="确认清空"
        confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400"
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          setHistory([]);
          setShowClearConfirm(false);
        }}
      />

      <VisitorCenterConfirmModal
        open={showLogoutConfirm}
        title="确认退出登录？"
        description="退出后需要重新登录才能继续访问个人中心功能。"
        cancelLabel="取消"
        confirmLabel="确认退出"
        confirmButtonClassName="bg-[#adc6ff] text-[#001a41] hover:bg-[#c3d2ff]"
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => setShowLogoutConfirm(false)}
      />

      <SiteFooter />
    </div>
  );
}
