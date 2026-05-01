"use client";

import { useEffect, useMemo, useState } from "react";

import { CategoryPill } from "@/components/common/category-pill";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { TagPill } from "@/components/common/tag-pill";
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
type ArticleStatus = "published" | "draft";

type SendMessageItem = {
  title: string;
  audience: string;
  updatedAt: string;
  status: SendMessageStatus;
};

type ArticleItem = {
  title: string;
  excerpt: string;
  tags: string[];
  updatedAt: string;
  status: ArticleStatus;
};

type ReviewStatus = "pending" | "approved";

type ReviewItem = {
  id: string;
  articleTitle: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
  status: ReviewStatus;
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

const articleTabs: Array<{ id: ArticleStatus; label: string; count: number }> = [
  { id: "published", label: "已发布", count: 124 },
  { id: "draft", label: "草稿箱", count: 8 },
];

const reviewStatusMeta: Record<ReviewStatus, { label: string; className: string }> = {
  pending: { label: "待审核", className: "bg-amber-500/10 text-amber-300" },
  approved: { label: "已通过", className: "bg-emerald-500/10 text-emerald-300" },
};

const reviewActionMap: Record<ReviewStatus, Array<{ label: string; className: string }>> = {
  pending: [
    { label: "通过", className: "text-emerald-300 hover:bg-emerald-500/10" },
    { label: "删除", className: "text-rose-300 hover:bg-rose-500/10" },
  ],
  approved: [
    { label: "删除", className: "text-rose-300 hover:bg-rose-500/10" },
  ],
};

export function BloggerCenterPage() {
  const [siteSearchValue, setSiteSearchValue] = useState("");
  const [historySearchValue, setHistorySearchValue] = useState("");
  const [historySearchKeyword, setHistorySearchKeyword] = useState("");
  const [history, setHistory] = useState(historyArticles);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState("articles");
  const [activeTab, setActiveTab] = useState<"compose" | "manage">("compose");
  const [specificAudience, setSpecificAudience] = useState(false);
  const [scheduledSend, setScheduledSend] = useState(false);

  const [activeArticleTab, setActiveArticleTab] = useState<ArticleStatus>("published");
  const [articlePage, setArticlePage] = useState(1);
  const [activeArticleMenu, setActiveArticleMenu] = useState<string | null>(null);
  const [activeArticleMenuPosition, setActiveArticleMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const [reviewPage, setReviewPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | "all">("all");
  const [activeReviewMenu, setActiveReviewMenu] = useState<string | null>(null);
  const [activeReviewMenuPosition, setActiveReviewMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [activeMessageMenuPosition, setActiveMessageMenuPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (activeSection === "send-message") {
      setActiveTab("compose");
    } else {
      setActiveMessageMenu(null);
      setActiveMessageMenuPosition(null);
    }

    if (activeSection === "articles") {
      setActiveArticleTab("published");
    } else {
      setActiveArticleMenu(null);
      setActiveArticleMenuPosition(null);
    }

    if (activeSection === "comments-review") {
      setReviewPage(1);
    } else {
      setActiveReviewMenu(null);
      setActiveReviewMenuPosition(null);
    }
  }, [activeSection]);

  const { unreadCount, setUnreadCount } = useNotificationCount();

  const likedList = useMemo(() => likedArticles, []);
  const commentedList = useMemo(() => commentedArticles, []);

  const filteredHistory = useMemo(() => {
    const q = historySearchKeyword.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => [item.title, item.excerpt, item.category, ...item.tags].join(" ").toLowerCase().includes(q));
  }, [history, historySearchKeyword]);

  useEffect(() => {
    setArticlePage(1);
  }, [activeArticleTab]);

  const reviewItems: ReviewItem[] = useMemo(
    () => [
      {
        id: "r-1",
        articleTitle: "AI 原生极简主义：界面即智能容器",
        author: "晨曦",
        content: "这篇文章把 AI 与极简风格结合得很自然，尤其是留白处理非常舒服。",
        createdAt: "2024-05-22 09:10",
        likes: 18,
        replies: 2,
        status: "pending",
      },
      {
        id: "r-2",
        articleTitle: "前端工程化的下一个十年",
        author: "小蓝",
        content: "关于云端 IDE 的那段分析很有启发，期待后续补充更多实践案例。",
        createdAt: "2024-05-21 21:45",
        likes: 26,
        replies: 4,
        status: "pending",
      },
      {
        id: "r-3",
        articleTitle: "2024 个人年度数字足迹图鉴",
        author: "Neo",
        content: "内容很完整，建议可以增加一个数据来源说明，会更有说服力。",
        createdAt: "2024-05-21 16:20",
        likes: 8,
        replies: 1,
        status: "approved",
      },
      {
        id: "r-4",
        articleTitle: "构建响应式设计系统的新范式",
        author: "阿橙",
        content: "这部分的案例很实用，不过某些段落可以再压缩一点，提升阅读效率。",
        createdAt: "2024-05-20 18:05",
        likes: 3,
        replies: 0,
        status: "pending",
      },
      {
        id: "r-5",
        articleTitle: "（草稿）LLM 推理优化指南：KV Cache 深度解析",
        author: "小马",
        content: "如果后面能补一张 KV Cache 流程图就更好了。",
        createdAt: "2024-05-20 10:30",
        likes: 2,
        replies: 0,
        status: "pending",
      },
      {
        id: "r-6",
        articleTitle: "（草稿）Framer Motion 进阶：复杂序列动画编排",
        author: "风铃",
        content: "动效展示很不错，建议加一个动图演示。",
        createdAt: "2024-05-19 19:50",
        likes: 6,
        replies: 1,
        status: "approved",
      },
      {
        id: "r-7",
        articleTitle: "（草稿）个人工作站自动化：从 Raycast 到 Hammerspoon",
        author: "momo",
        content: "这类工具链文章很受欢迎，读完后我也想整理自己的工作流。",
        createdAt: "2024-05-19 12:10",
        likes: 11,
        replies: 3,
        status: "pending",
      },
      {
        id: "r-8",
        articleTitle: "（草稿）WebGPU 开启前端渲染的新篇章",
        author: "Luna",
        content: "很期待你后续补充 WebGPU 的兼容性方案。",
        createdAt: "2024-05-18 20:15",
        likes: 4,
        replies: 0,
        status: "pending",
      },
    ],
    [],
  );

  const articleRows: Array<ArticleItem & { category: string }> = useMemo(
    () => [
      { title: "AI 原生极简主义：界面即智能容器", category: "设计", excerpt: "探讨在人工智能时代，如何通过大量留白和精准排版重塑阅读体验...", tags: ["UI/UX", "AI"], updatedAt: "2024-05-20 14:30", status: "published" },
      { title: "2024 个人年度数字足迹图鉴", category: "随笔", excerpt: "整理过去一年使用过的 SaaS 工具、阅读过的好书及开源贡献...", tags: ["年度回顾"], updatedAt: "2024-05-10 09:15", status: "published" },
      { title: "前端工程化的下一个十年", category: "前端", excerpt: "从构建工具到云端 IDE，探讨开发者生产力的极限边界...", tags: ["前端", "工程化"], updatedAt: "2024-04-28 16:45", status: "published" },
      { title: "构建响应式设计系统的新范式", category: "CSS", excerpt: "基于 Container Queries 和逻辑属性的现代布局方案实践...", tags: ["CSS", "设计系统"], updatedAt: "2024-04-15 11:20", status: "published" },
      { title: "（草稿）LLM 推理优化指南：KV Cache 深度解析", category: "AI", excerpt: "探讨如何在有限的显存资源下，通过 KV Cache 量化和 PagedAttention 提升吞吐量...", tags: ["AI", "技术底层"], updatedAt: "2024-05-22 11:30", status: "draft" },
      { title: "（草稿）Framer Motion 进阶：复杂序列动画编排", category: "前端", excerpt: "利用 useAnimate 和 Variants 实现极具表现力的页面入场动效...", tags: ["前端", "动效"], updatedAt: "2024-05-21 09:00", status: "draft" },
      { title: "（草稿）个人工作站自动化：从 Raycast 到 Hammerspoon", category: "效率工具", excerpt: "如何通过 Lua 脚本接管 macOS 的每一个窗口，打造极致效率环境...", tags: ["自动化", "效率工具"], updatedAt: "2024-05-19 15:45", status: "draft" },
      { title: "（草稿）WebGPU 开启前端渲染的新篇章", category: "图形学", excerpt: "脱离 WebGL 的限制，直接在浏览器中进行大规模通用计算和图形渲染...", tags: ["图形学", "WebGPU"], updatedAt: "2024-05-18 10:00", status: "draft" },
    ],
    [],
  );

  const publishedArticles = articleRows.filter((article) => article.status === "published");
  const draftArticles = articleRows.filter((article) => article.status === "draft");
  const activeArticles = activeArticleTab === "published" ? publishedArticles : draftArticles;
  const articlesPerPage = 6;
  const totalArticlePages = Math.max(1, Math.ceil(activeArticles.length / articlesPerPage));
  const visibleArticles = activeArticles.slice((articlePage - 1) * articlesPerPage, articlePage * articlesPerPage);

  const filteredReviews = reviewItems.filter((review) => reviewFilter === "all" || review.status === reviewFilter);
  const reviewsPerPage = 6;
  const totalReviewPages = Math.max(1, Math.ceil(filteredReviews.length / reviewsPerPage));
  const visibleReviews = filteredReviews.slice((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage);

  useEffect(() => {
    setReviewPage(1);
  }, [reviewFilter]);

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
          {activeSection === "comments-review" ? (
            <div className="space-y-6">
              <div className="flex items-end justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100 md:text-4xl">评论管理</h1>
                  <p className="mt-2 text-sm text-zinc-400">集中管理文章下的用户评论，快速完成通过与删除操作。</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "全部" },
                    { id: "pending", label: "待审核" },
                    { id: "approved", label: "已通过" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReviewFilter(item.id as ReviewStatus | "all")}
                      className={`rounded-full border px-4 py-2 text-sm transition ${reviewFilter === item.id ? "border-[#adc6ff]/30 bg-[#182033] text-[#adc6ff]" : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#14161b] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[940px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/8 bg-white/[0.03]">
                        <th className="px-6 py-4 text-sm font-medium text-zinc-300">文章标题</th>
                        <th className="px-6 py-4 text-sm font-medium text-zinc-300">评论者</th>
                        <th className="px-6 py-4 text-sm font-medium text-zinc-300">评论内容</th>
                        <th className="px-6 py-4 text-sm font-medium text-zinc-300">评论状态</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-zinc-300">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {visibleReviews.length ? (
                        visibleReviews.map((review) => (
                          <tr key={review.id} className="transition hover:bg-white/[0.03]">
                            <td className="px-6 py-4">
                              <div className="max-w-[220px] truncate text-sm font-medium text-zinc-100">{review.articleTitle}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-300">{review.author}</td>
                            <td className="px-6 py-4">
                              <div className="max-w-[420px] max-h-24 overflow-y-auto break-words text-sm leading-7 text-zinc-300">
                                {review.content}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${reviewStatusMeta[review.status].className}`}>{reviewStatusMeta[review.status].label}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="relative inline-flex">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    const rect = event.currentTarget.getBoundingClientRect();
                                    const menuHeight = review.status === "approved" ? 96 : 132;
                                    const menuWidth = 160;
                                    const gap = 8;
                                    const pad = 12;
                                    const openUp = window.innerHeight - rect.bottom < menuHeight + gap;
                                    const top = openUp ? Math.max(pad, rect.top - menuHeight - gap) : Math.min(window.innerHeight - menuHeight - pad, rect.bottom + gap);
                                    const left = Math.min(window.innerWidth - menuWidth - pad, Math.max(pad, rect.right - menuWidth));
                                    setActiveReviewMenu((cur) => (cur === review.id ? null : review.id));
                                    setActiveReviewMenuPosition((cur) => (cur && activeReviewMenu === review.id ? null : { top, left }));
                                  }}
                                  className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"
                                >
                                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>

                                {activeReviewMenu === review.id && activeReviewMenuPosition ? (
                                  <div className="fixed z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#161922] shadow-2xl" style={{ top: activeReviewMenuPosition.top, left: activeReviewMenuPosition.left }}>
                                    {reviewActionMap[review.status].map((action) => (
                                      <button
                                        key={action.label}
                                        type="button"
                                        onClick={() => {
                                          setActiveReviewMenu(null);
                                          setActiveReviewMenuPosition(null);
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
                        ))
                      ) : (
                        <tr className="h-[220px]">
                          <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">
                            当前筛选条件下没有评论
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 border-t border-white/8 px-6 py-5 sm:flex-row sm:items-center">
                  <div className="text-sm text-zinc-500">显示 {(reviewPage - 1) * reviewsPerPage + 1} - {Math.min(reviewPage * reviewsPerPage, filteredReviews.length)}，共 {filteredReviews.length} 条评论</div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <button type="button" onClick={() => setReviewPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-zinc-100" disabled={reviewPage === 1}>
                      上一页
                    </button>
                    {Array.from({ length: Math.min(totalReviewPages, 5) }, (_, index) => {
                      const page = index + 1;
                      return (
                        <button key={page} type="button" onClick={() => setReviewPage(page)} className={`rounded-lg border px-3 py-1.5 ${reviewPage === page ? "border-[#6e8cff]/30 bg-[#182033] text-[#adc6ff]" : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100"}`}>
                          {page}
                        </button>
                      );
                    })}
                    {totalReviewPages > 5 ? <span className="px-1 text-zinc-500">...</span> : null}
                    {totalReviewPages > 5 ? (
                      <button type="button" onClick={() => setReviewPage(totalReviewPages)} className={`rounded-lg border px-3 py-1.5 ${reviewPage === totalReviewPages ? "border-[#6e8cff]/30 bg-[#182033] text-[#adc6ff]" : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100"}`}>
                        {totalReviewPages}
                      </button>
                    ) : null}
                    <button type="button" onClick={() => setReviewPage((page) => Math.min(totalReviewPages, page + 1))} className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-zinc-100" disabled={reviewPage === totalReviewPages}>
                      下一页
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "articles" ? (
            <div className="space-y-6">
              <div className="flex items-end justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100 md:text-4xl">文章管理</h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                    知识的结晶就在这里
                  </p>
                </div>
                <div className="relative w-full max-w-[320px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-zinc-500">search</span>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-[#101215] py-2.5 pl-10 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[#adc6ff]/50"
                    placeholder="搜索标题、分类或标签..."
                    type="text"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#14161b] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="border-b border-white/8 bg-white/[0.03] px-6">
                  <div className="flex gap-8">
                    {articleTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveArticleTab(tab.id)}
                        className={`py-4 text-sm font-medium transition ${activeArticleTab === tab.id ? "border-b-2 border-[#adc6ff] text-[#adc6ff]" : "text-zinc-500 hover:text-zinc-300"}`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/8 text-sm text-zinc-500">
                        <th className="w-[35%] px-6 py-4 font-medium">文章标题</th>
                        <th className="w-[18%] px-6 py-4 font-medium">分类</th>
                        <th className="w-[22%] px-6 py-4 font-medium">标签</th>
                        <th className="w-[15%] px-6 py-4 font-medium">修改时间</th>
                        <th className="w-[10%] px-6 py-4 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {visibleArticles.length > 0 ? (
                        <>
                          {visibleArticles.map((article) => (
                            <tr key={article.title} className="group h-[73px] transition hover:bg-white/[0.02]">
                              <td className="px-6 py-4">
                                <div className="mb-0.5 truncate font-medium text-white">{article.title}</div>
                                <div className="truncate text-xs text-zinc-500">{article.excerpt}</div>
                              </td>
                              <td className="px-6 py-4">
                                <CategoryPill label={article.category} />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                  {article.tags.map((tag) => (
                                    <TagPill key={tag} label={tag} />
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs text-zinc-500">{article.updatedAt}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="relative inline-flex">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      const rect = event.currentTarget.getBoundingClientRect();
                                      const menuHeight = 132;
                                      const menuWidth = 160;
                                      const gap = 8;
                                      const pad = 12;
                                      const openUp = window.innerHeight - rect.bottom < menuHeight + gap;
                                      const top = openUp
                                        ? Math.max(pad, rect.top - menuHeight - gap)
                                        : Math.min(window.innerHeight - menuHeight - pad, rect.bottom + gap);
                                      const left = Math.min(window.innerWidth - menuWidth - pad, Math.max(pad, rect.right - menuWidth));
                                      setActiveArticleMenu((cur) => (cur === article.title ? null : article.title));
                                      setActiveArticleMenuPosition((cur) => (cur && activeArticleMenu === article.title ? null : { top, left }));
                                    }}
                                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                  </button>

                                  {activeArticleMenu === article.title && activeArticleMenuPosition ? (
                                    <div
                                      className="fixed z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#161922] shadow-2xl"
                                      style={{ top: activeArticleMenuPosition.top, left: activeArticleMenuPosition.left }}
                                    >
                                      {(article.status === "published" ? ["撤回", "编辑", "删除"] : ["发布", "编辑", "删除"]).map((label) => (
                                        <button
                                          key={label}
                                          type="button"
                                          onClick={() => {
                                            setActiveArticleMenu(null);
                                            setActiveArticleMenuPosition(null);
                                          }}
                                          className={`block w-full px-4 py-2 text-left text-sm transition ${label === "删除" ? "text-rose-300 hover:bg-rose-500/10" : label === "发布" ? "text-[#adc6ff] hover:bg-[#adc6ff]/10" : "text-zinc-100 hover:bg-white/8"}`}
                                        >
                                          {label}
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        <tr className="h-[438px]">
                          <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">
                            无文章
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 border-t border-white/8 px-6 py-4 text-xs text-zinc-500 sm:flex-row sm:items-center">
                  <div>
                    {activeArticleTab === "published"
                      ? `显示 ${(articlePage - 1) * articlesPerPage + 1} - ${Math.min(articlePage * articlesPerPage, publishedArticles.length)}，共 ${publishedArticles.length} 篇已发布文章（每页 6 篇）`
                      : `显示 ${(articlePage - 1) * articlesPerPage + 1} - ${Math.min(articlePage * articlesPerPage, draftArticles.length)}，共 ${draftArticles.length} 篇草稿文章（每页 6 篇）`}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setArticlePage((page) => Math.max(1, page - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/5 disabled:opacity-30"
                      disabled={articlePage === 1}
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(totalArticlePages, 5) }, (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setArticlePage(page)}
                          className={`flex h-8 w-8 items-center justify-center rounded ${articlePage === page ? "border border-[#adc6ff]/20 bg-[#182033] font-medium text-[#adc6ff]" : "hover:bg-white/5"}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {totalArticlePages > 5 ? <span className="px-1">...</span> : null}
                    {totalArticlePages > 5 ? (
                      <button
                        type="button"
                        onClick={() => setArticlePage(totalArticlePages)}
                        className={`flex h-8 w-8 items-center justify-center rounded ${articlePage === totalArticlePages ? "border border-[#adc6ff]/20 bg-[#182033] font-medium text-[#adc6ff]" : "hover:bg-white/5"}`}
                      >
                        {totalArticlePages}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setArticlePage((page) => Math.min(totalArticlePages, page + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/5 disabled:opacity-30"
                      disabled={articlePage === totalArticlePages}
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "send-message" ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100 md:text-4xl">消息管理</h1>
                <p className="text-base text-zinc-400">集中管理站内消息的发布与草稿状态</p>
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
                          <input
                            className="w-full rounded-xl border border-white/10 bg-[#101215] py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none transition focus:border-[#adc6ff]/50"
                            placeholder="输入用户名或账号匹配..."
                            type="text"
                          />
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
                        <input
                          type="datetime-local"
                          disabled={!scheduledSend}
                          className="rounded-lg border border-white/10 bg-[#101215] py-2.5 pl-9 pr-3 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed"
                        />
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
                        {initialMessages.length > 0 ? (
                          <>
                            {initialMessages.map((message) => {
                              const messageActions =
                                message.status === "published"
                                  ? [
                                    { label: "撤回", className: "text-zinc-100 hover:bg-white/8" },
                                    { label: "编辑", className: "text-zinc-100 hover:bg-white/8" },
                                    { label: "删除", className: "text-rose-300 hover:bg-rose-500/10" },
                                  ]
                                  : [
                                    { label: "发布", className: "text-[#adc6ff] hover:bg-[#adc6ff]/10" },
                                    { label: "编辑", className: "text-zinc-100 hover:bg-white/8" },
                                    { label: "删除", className: "text-rose-300 hover:bg-rose-500/10" },
                                  ];

                              return (
                                <tr key={`${message.title}-${message.updatedAt}`} className="transition hover:bg-white/[0.03]">
                                  <td className="px-6 py-4">
                                    <div className="max-w-xs truncate text-sm font-medium text-zinc-100">{message.title}</div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-zinc-400">{message.audience}</td>
                                  <td className="px-6 py-4 text-sm text-zinc-400">{message.updatedAt}</td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${message.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-400"}`}>
                                      {message.status === "published" ? "已发布" : "草稿"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="relative inline-flex">
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          const rect = event.currentTarget.getBoundingClientRect();
                                          const menuHeight = 132;
                                          const menuWidth = 160;
                                          const gap = 8;
                                          const pad = 12;
                                          const openUp = window.innerHeight - rect.bottom < menuHeight + gap;
                                          const top = openUp ? Math.max(pad, rect.top - menuHeight - gap) : Math.min(window.innerHeight - menuHeight - pad, rect.bottom + gap);
                                          const left = Math.min(window.innerWidth - menuWidth - pad, Math.max(pad, rect.right - menuWidth));
                                          setActiveMessageMenu((cur) => (cur === message.title ? null : message.title));
                                          setActiveMessageMenuPosition((cur) => (cur && activeMessageMenu === message.title ? null : { top, left }));
                                        }}
                                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"
                                      >
                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                      </button>

                                      {activeMessageMenu === message.title && activeMessageMenuPosition ? (
                                        <div className="fixed z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#161922] shadow-2xl" style={{ top: activeMessageMenuPosition.top, left: activeMessageMenuPosition.left }}>
                                          {messageActions.map((action) => (
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
                              );
                            })}
                          </>
                        ) : (
                          <tr className="h-[438px]">
                            <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">
                              无消息
                            </td>
                          </tr>
                        )}
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
              <VisitorCenterHistory articles={filteredHistory} />
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
