"use client";

import { useMemo, useState } from "react";

import { ArticleCard } from "@/components/blog/article-card";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";

type HistoryArticle = {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { likes: number; comments: number };
};

const historyArticles: HistoryArticle[] = [
  {
    title: "掌握 Tailwind CSS v3 中的玻璃拟态",
    date: "2024.05.24",
    category: "Web 开发",
    excerpt:
      "深入探讨如何使用现代 CSS 和 Tailwind 工具类创建高性能、美观的玻璃效果，专注于深色模式美学。",
    tags: ["Web 开发"],
    stats: { likes: 86, comments: 24 },
  },
  {
    title: "我 2024 年的极简开发者工作区",
    date: "2024.05.24",
    category: "效率提升",
    excerpt:
      "探索优化桌面和浏览器工作流的工具、硬件及视觉环境，让创作过程更加专注而高效。",
    tags: ["效率提升"],
    stats: { likes: 86, comments: 24 },
  },
  {
    title: "AI 代理的错觉",
    date: "2024.05.23",
    category: "Web 开发",
    excerpt:
      "关于我们如何给 LLM 拟人化的哲学思考，以及构建更符合用户预期的“原生 AI”界面的设计启示。",
    tags: ["Web 开发"],
    stats: { likes: 86, comments: 24 },
  },
];

export function VisitorCenterPage() {
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [history, setHistory] = useState(historyArticles);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettingsNote, setShowSettingsNote] = useState(false);

  const filteredArticles = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => {
      const haystack = [item.title, item.excerpt, item.category, ...item.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [history, keyword]);

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={(value) => setKeyword(value)}
        onLoginClick={() => undefined}
        onRegisterClick={() => undefined}
        isAuthenticated
      />

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1440px] grid-cols-1 gap-8 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-8">
        <aside className="hidden lg:flex lg:flex-col">
          <div className="sticky top-24 rounded-3xl border border-white/8 bg-[#14161b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="text-xs tracking-[0.28em] text-zinc-500">访客专栏</div>
            <nav className="mt-6 space-y-2">
              {[
                { label: "浏览历史", active: true, icon: "history" },
                { label: "我的点赞", icon: "favorite" },
                { label: "我的收藏", icon: "bookmark" },
                { label: "我的评论", icon: "chat_bubble" },
                { label: "消息通知", icon: "notifications", badge: 3 },
                { label: "账号设置", icon: "settings" },
                { label: "退出登录", icon: "logout" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.label === "退出登录") setShowLogoutConfirm(true);
                    if (item.label === "账号设置") setShowSettingsNote(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${item.active
                    ? "border-[#6e8cff]/40 bg-[#182033] text-blue-100 shadow-[inset_0_0_0_1px_rgba(110,140,255,0.12)]"
                    : "border-transparent bg-transparent text-zinc-500 hover:border-white/8 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#9db2ff] px-2 text-xs font-semibold text-[#10131a]">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <section className="space-y-6 pb-10">
          <div className="rounded-[28px] border border-white/8 bg-[#14161b] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:px-8 lg:px-10 lg:py-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="text-sm tracking-[0.32em] text-zinc-500">个人中心</div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">浏览记录</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">你在 Memory 数字空间的近期足迹。</p>
              </div>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="rounded-full border border-rose-400/20 bg-rose-500/10 px-5 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100"
              >
                清空记录
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/8 bg-[#101215] px-4 py-3 text-sm text-zinc-500">
              <span className="material-symbols-outlined text-[20px] text-zinc-600">search</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    setKeyword(searchInput);
                  }
                }}
                placeholder="在浏览记录中搜索..."
                className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="relative pl-6">
              <div className="absolute left-0 top-3 h-3 w-3 rounded-full border border-[#6e8cff] bg-[#101215] shadow-[0_0_0_4px_rgba(110,140,255,0.18)]" />
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-zinc-100">浏览历史</h2>
                <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-zinc-500">
                  {filteredArticles.length} 条记录
                </span>
              </div>

              <div className="relative border-l border-white/8 pl-6">
                {filteredArticles.length ? (
                  <div className="space-y-4 pb-4">
                    {filteredArticles.map((article) => (
                      <div key={article.title} className="rounded-[24px] border border-white/8 bg-[#14161b] p-0">
                        <ArticleCard
                          href="#"
                          compact
                          title={article.title}
                          date={article.date}
                          category={article.category}
                          excerpt={article.excerpt}
                          tags={article.tags}
                          stats={article.stats}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-zinc-500">
                    当前没有浏览记录。
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
            >
              加载更早的记录
            </button>
          </div>
        </section>
      </main>

      {showClearConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" aria-label="关闭清空确认框" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#18191d] p-6 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
            <h2 className="text-xl font-semibold text-zinc-100">确认清空浏览记录？</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">此操作会永久删除当前浏览记录，且无法恢复。</p>
            <div className="mt-6 flex gap-3">
              <button type="button" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:bg-white/10" onClick={() => setShowClearConfirm(false)}>
                取消
              </button>
              <button type="button" className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-400" onClick={() => {
                setHistory([]);
                setShowClearConfirm(false);
              }}>
                确认清空
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" aria-label="关闭退出登录确认框" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#18191d] p-6 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
            <h2 className="text-xl font-semibold text-zinc-100">确认退出登录？</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">退出后需要重新登录才能继续访问个人中心功能。</p>
            <div className="mt-6 flex gap-3">
              <button type="button" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:bg-white/10" onClick={() => setShowLogoutConfirm(false)}>
                取消
              </button>
              <button type="button" className="flex-1 rounded-xl bg-[#adc6ff] px-4 py-3 text-sm font-medium text-[#001a41] transition hover:bg-[#c3d2ff]" onClick={() => setShowLogoutConfirm(false)}>
                确认退出
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSettingsNote ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" aria-label="关闭账号设置提示" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSettingsNote(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#18191d] p-6 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
            <h2 className="text-xl font-semibold text-zinc-100">账号设置</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">这里后续可以接入头像、昵称、密码和偏好设置页面。</p>
            <div className="mt-6 flex justify-end">
              <button type="button" className="rounded-xl bg-[#adc6ff] px-4 py-3 text-sm font-medium text-[#001a41] transition hover:bg-[#c3d2ff]" onClick={() => setShowSettingsNote(false)}>
                我知道了
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  );
}
