"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { useAuth } from "@/components/common/auth-context";
import { useNotificationCount } from "@/components/common/notification-context";
import { VisitorCenterAccountSettings } from "@/components/user/visitor-center-page/visitor-center-account-settings";
import { VisitorCenterConfirmModal } from "@/components/user/visitor-center-page/visitor-center-confirm-modal";
import { VisitorCenterFavorites } from "@/components/user/visitor-center-page/visitor-center-favorites";
import { VisitorCenterHistory } from "@/components/user/visitor-center-page/visitor-center-history";
import { VisitorCenterLiked } from "@/components/user/visitor-center-page/visitor-center-liked";
import { VisitorCenterNotifications } from "@/components/user/visitor-center-page/visitor-center-notifications";
import { VisitorCenterToolbar } from "@/components/user/visitor-center-page/visitor-center-toolbar";

import { historyArticles } from "./visitor-center-page/history-articles";
import { likedArticles } from "./visitor-center-page/liked-articles";
import { BloggerCenterArticles } from "./blogger-center-page/blogger-center-articles";
import { BloggerCenterComments } from "./blogger-center-page/blogger-center-comments";
import { BloggerCenterMessages } from "./blogger-center-page/blogger-center-messages";
import { BloggerCenterSidebar } from "./blogger-center-page/blogger-center-sidebar";
import { BloggerCenterUsers } from "./blogger-center-page/blogger-center-users";

type ArticleStatus = "published" | "draft";
type ReviewStatus = "pending" | "approved";
type MessageStatus = "published" | "draft";

type UserStatus = "active" | "muted";

type UserItem = {
  id: string;
  nickname: string;
  email: string;
  joinedAt: string;
  status: UserStatus;
};

type ArticleItem = {
  title: string;
  excerpt: string;
  tags: string[];
  updatedAt: string;
  status: ArticleStatus;
};

type ArticleRow = ArticleItem & { category: string };

type MessageItem = {
  title: string;
  audience: string;
  updatedAt: string;
  status: MessageStatus;
};

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
  approved: [{ label: "删除", className: "text-rose-300 hover:bg-rose-500/10" }],
};

const initialUsers: UserItem[] = [
  { id: "u-1", nickname: "AlexChen", email: "alexchen@example.com", joinedAt: "2024-04-02", status: "active" },
  { id: "u-2", nickname: "晨曦", email: "chenxi@example.com", joinedAt: "2024-04-08", status: "active" },
  { id: "u-3", nickname: "小蓝", email: "xiaolan@example.com", joinedAt: "2024-04-12", status: "muted" },
  { id: "u-4", nickname: "Neo", email: "neo@example.com", joinedAt: "2024-04-18", status: "active" },
  { id: "u-5", nickname: "momo", email: "momo@example.com", joinedAt: "2024-04-20", status: "active" },
  { id: "u-6", nickname: "Luna", email: "luna@example.com", joinedAt: "2024-04-21", status: "muted" },
];

const initialMessages: MessageItem[] = [
  { title: "2024 年度技术回顾报告", audience: "所有访客", updatedAt: "2024-05-20 14:30", status: "published" },
  { title: "（草稿）关于社区维护的通知", audience: "未设置", updatedAt: "2024-05-22 11:30", status: "draft" },
  { title: "新功能上线预告：AI 自动摘要", audience: "AlexChen", updatedAt: "2024-05-22 09:00", status: "published" },
  { title: "（草稿）五一假期活动预告", audience: "未设置", updatedAt: "2024-05-21 09:00", status: "draft" },
  { title: "系统升级通知", audience: "所有访客", updatedAt: "2024-05-18 10:00", status: "published" },
  { title: "欢迎加入我们的 Discord 社区", audience: "JohnDoe", updatedAt: "2024-05-15 16:20", status: "published" },
  { title: "（草稿）七月技术分享会报名", audience: "未设置", updatedAt: "2024-05-19 15:45", status: "draft" },
];

const BLOGGER_CENTER_STORAGE_KEY = "ai-blog.blogger-center.active-section";

export function BloggerCenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const [siteSearchValue, setSiteSearchValue] = useState("");
  const [historySearchValue, setHistorySearchValue] = useState("");
  const [historySearchKeyword, setHistorySearchKeyword] = useState("");
  const [historyVisibleCount, setHistoryVisibleCount] = useState(4);
  const [history, setHistory] = useState(historyArticles);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState("articles");
  const [likedList, setLikedList] = useState(likedArticles);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedError, setLikedError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"compose" | "manage">("compose");
  const [specificAudience, setSpecificAudience] = useState(false);
  const [scheduledSend, setScheduledSend] = useState(false);

  useEffect(() => {
    const savedSection = window.localStorage.getItem(BLOGGER_CENTER_STORAGE_KEY);
    if (savedSection === "new-article") {
      router.push("/editor");
      return;
    }

    if (savedSection === "articles" || savedSection === "comments-review" || savedSection === "send-message" || savedSection === "users" || savedSection === "history" || savedSection === "liked" || savedSection === "favorites" || savedSection === "comments" || savedSection === "notifications" || savedSection === "settings") {
      setActiveSection(savedSection);
    }
  }, [router]);

  const [activeArticleTab, setActiveArticleTab] = useState<ArticleStatus>("published");
  const [articlePage, setArticlePage] = useState(1);
  const [activeArticleMenu, setActiveArticleMenu] = useState<string | null>(null);
  const [activeArticleMenuPosition, setActiveArticleMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const [reviewPage, setReviewPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | "all">("all");
  const [activeReviewMenu, setActiveReviewMenu] = useState<string | null>(null);
  const [activeReviewMenuPosition, setActiveReviewMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [reviewDeleteTarget, setReviewDeleteTarget] = useState<ReviewItem | null>(null);

  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [activeMessageMenuPosition, setActiveMessageMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [messageDeleteTarget, setMessageDeleteTarget] = useState<MessageItem | null>(null);
  const [articleDeleteTarget, setArticleDeleteTarget] = useState<ArticleRow | null>(null);

  const [users, setUsers] = useState(initialUsers);
  const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);
  const [activeUserMenuPosition, setActiveUserMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [userDeleteTarget, setUserDeleteTarget] = useState<UserItem | null>(null);
  const [userSearchValue, setUserSearchValue] = useState("");
  const [userPage, setUserPage] = useState(1);

  const { unreadCount, setUnreadCount } = useNotificationCount();

  useEffect(() => {
    if (activeSection !== "liked") return;

    const loadLikedArticles = async () => {
      setLikedLoading(true);
      setLikedError(null);

      try {
        const response = await fetch("/api/user/liked-articles", { cache: "no-store" });
        if (!response.ok) throw new Error("加载我的点赞失败");
        const data = (await response.json()) as { likedArticles: typeof likedArticles };
        setLikedList(data.likedArticles);
      } catch {
        setLikedError("我的点赞加载失败，请稍后重试。");
      } finally {
        setLikedLoading(false);
      }
    };

    void loadLikedArticles();
  }, [activeSection]);

  const articleRows: ArticleRow[] = useMemo(
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

  const reviewItems: ReviewItem[] = useMemo(
    () => [
      { id: "r-1", articleTitle: "AI 原生极简主义：界面即智能容器", author: "晨曦", content: "这篇文章把 AI 与极简风格结合得很自然，尤其是留白处理非常舒服。", createdAt: "2024-05-22 09:10", likes: 18, replies: 2, status: "pending" },
      { id: "r-2", articleTitle: "前端工程化的下一个十年", author: "小蓝", content: "关于云端 IDE 的那段分析很有启发，期待后续补充更多实践案例。", createdAt: "2024-05-21 21:45", likes: 26, replies: 4, status: "pending" },
      { id: "r-3", articleTitle: "2024 个人年度数字足迹图鉴", author: "Neo", content: "内容很完整，建议可以增加一个数据来源说明，会更有说服力。", createdAt: "2024-05-21 16:20", likes: 8, replies: 1, status: "approved" },
      { id: "r-4", articleTitle: "构建响应式设计系统的新范式", author: "阿橙", content: "这部分的案例很实用，不过某些段落可以再压缩一点，提升阅读效率。", createdAt: "2024-05-20 18:05", likes: 3, replies: 0, status: "pending" },
      { id: "r-5", articleTitle: "（草稿）LLM 推理优化指南：KV Cache 深度解析", author: "小马", content: "如果后面能补一张 KV Cache 流程图就更好了。", createdAt: "2024-05-20 10:30", likes: 2, replies: 0, status: "pending" },
      { id: "r-6", articleTitle: "（草稿）Framer Motion 进阶：复杂序列动画编排", author: "风铃", content: "动效展示很不错，建议加一个动图演示。", createdAt: "2024-05-19 19:50", likes: 6, replies: 1, status: "approved" },
      { id: "r-7", articleTitle: "（草稿）个人工作站自动化：从 Raycast 到 Hammerspoon", author: "momo", content: "这类工具链文章很受欢迎，读完后我也想整理自己的工作流。", createdAt: "2024-05-19 12:10", likes: 11, replies: 3, status: "pending" },
      { id: "r-8", articleTitle: "（草稿）WebGPU 开启前端渲染的新篇章", author: "Luna", content: "很期待你后续补充 WebGPU 的兼容性方案。", createdAt: "2024-05-18 20:15", likes: 4, replies: 0, status: "pending" },
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
    const section = searchParams.get("section");
    if (section === "notifications") {
      setActiveSection("notifications");
    }
  }, [searchParams]);

  useEffect(() => {
    window.localStorage.setItem(BLOGGER_CENTER_STORAGE_KEY, activeSection);
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "history") return;

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await fetch("/api/user/browse-histories", { cache: "no-store" });
        if (!response.ok) throw new Error("加载浏览记录失败");
        const data = (await response.json()) as { histories: typeof historyArticles };
        setHistory(data.histories);
      } catch {
        setHistoryError("浏览记录加载失败，请稍后重试。");
      } finally {
        setHistoryLoading(false);
      }
    };

    void loadHistory();
  }, [activeSection]);

  useEffect(() => {
    setHistoryVisibleCount(4);
  }, [historySearchKeyword, history]);

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
  }, [activeSection, searchParams]);

  useEffect(() => {
    setArticlePage(1);
  }, [activeArticleTab]);

  useEffect(() => {
    setReviewPage(1);
  }, [reviewFilter]);

  const filteredHistory = useMemo(() => {
    const q = historySearchKeyword.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => [item.title, item.excerpt, item.category, ...item.tags].join(" ").toLowerCase().includes(q));
  }, [history, historySearchKeyword]);

  const visibleHistory = useMemo(() => filteredHistory.slice(0, historyVisibleCount), [filteredHistory, historyVisibleCount]);
  const hasMoreHistory = historyVisibleCount < filteredHistory.length;

  const handleClearHistory = async () => {
    setShowClearConfirm(false);
    try {
      const response = await fetch("/api/user/browse-histories", { method: "DELETE" });
      if (!response.ok) throw new Error("清空失败");
      setHistory([]);
      setHistorySearchKeyword("");
      setHistorySearchValue("");
      setHistoryVisibleCount(4);
    } catch {
      setHistoryError("清空浏览记录失败，请稍后重试。");
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearchValue.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => [user.nickname, user.email].join(" ").toLowerCase().includes(q));
  }, [userSearchValue, users]);

  const usersPerPage = 6;
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const visibleUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  useEffect(() => {
    setUserPage(1);
  }, [userSearchValue]);

  const handleToggleUserStatus = (userId: string) => {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, status: user.status === "active" ? "muted" : "active" } : user)));
  };

  const handleRequestDeleteUser = (userId: string) => {
    setUserDeleteTarget(users.find((user) => user.id === userId) ?? null);
  };

  const handleRequestDeleteReview = (reviewId: string) => {
    setReviewDeleteTarget(reviewItems.find((review) => review.id === reviewId) ?? null);
  };

  const handleRequestDeleteMessage = (messageTitle: string) => {
    setMessageDeleteTarget(initialMessages.find((message) => message.title === messageTitle) ?? null);
  };

  const handleConfirmDeleteArticle = () => {
    if (!articleDeleteTarget) return;
    setArticleDeleteTarget(null);
  };

  const handleConfirmDeleteUser = () => {
    if (!userDeleteTarget) return;
    setUsers((current) => current.filter((user) => user.id !== userDeleteTarget.id));
    setUserDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader searchValue={siteSearchValue} onSearchChange={setSiteSearchValue} />

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1440px] grid-cols-1 gap-8 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-8">
        <BloggerCenterSidebar
          activeId={activeSection}
          onSelect={(section) => {
            window.localStorage.setItem(BLOGGER_CENTER_STORAGE_KEY, section);
            setActiveSection(section);
          }}
          onNewArticleClick={() => {
            window.localStorage.removeItem(BLOGGER_CENTER_STORAGE_KEY);
            router.push("/editor");
          }}
          onLogoutClick={() => setShowLogoutConfirm(true)}
          onSettingsClick={() => setActiveSection("settings")}
          notificationBadgeCount={unreadCount}
        />

        <section className="space-y-6 pb-10">
          {activeSection === "new-article" ? null : activeSection === "articles" ? (
            <BloggerCenterArticles
              activeTab={activeArticleTab}
              onTabChange={setActiveArticleTab}
              articleTabs={articleTabs}
              visibleArticles={visibleArticles}
              activeArticleMenu={activeArticleMenu}
              activeArticleMenuPosition={activeArticleMenuPosition}
              onMenuOpen={(title, top, left) => {
                setActiveArticleMenu(title);
                setActiveArticleMenuPosition({ top, left });
              }}
              onMenuClose={() => {
                setActiveArticleMenu(null);
                setActiveArticleMenuPosition(null);
              }}
              onRequestDelete={(article) => setArticleDeleteTarget(article)}
              publishedArticlesLength={publishedArticles.length}
              draftArticlesLength={draftArticles.length}
              articlePage={articlePage}
              articlesPerPage={articlesPerPage}
              totalArticlePages={totalArticlePages}
              onPrevPage={() => setArticlePage((page) => Math.max(1, page - 1))}
              onNextPage={() => setArticlePage((page) => Math.min(totalArticlePages, page + 1))}
              onPageChange={setArticlePage}
            />
          ) : null}

          {activeSection === "comments-review" ? (
            <BloggerCenterComments
              reviewItems={filteredReviews}
              reviewFilter={reviewFilter}
              onFilterChange={setReviewFilter}
              visibleReviews={visibleReviews}
              reviewPage={reviewPage}
              totalReviewPages={totalReviewPages}
              onPrevPage={() => setReviewPage((page) => Math.max(1, page - 1))}
              onNextPage={() => setReviewPage((page) => Math.min(totalReviewPages, page + 1))}
              onPageChange={setReviewPage}
              activeMenuTitle={activeReviewMenu}
              activeMenuPosition={activeReviewMenuPosition}
              onMenuOpen={(id, top, left) => {
                setActiveReviewMenu(id);
                setActiveReviewMenuPosition({ top, left });
              }}
              onMenuClose={() => {
                setActiveReviewMenu(null);
                setActiveReviewMenuPosition(null);
              }}
              onRequestDelete={handleRequestDeleteReview}
              reviewStatusMeta={reviewStatusMeta}
              reviewActionMap={reviewActionMap}
            />
          ) : null}

          {activeSection === "send-message" ? (
            <BloggerCenterMessages
              messages={initialMessages}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              specificAudience={specificAudience}
              onSpecificAudienceChange={setSpecificAudience}
              scheduledSend={scheduledSend}
              onScheduledSendChange={setScheduledSend}
              activeMenuTitle={activeMessageMenu}
              activeMenuPosition={activeMessageMenuPosition}
              onMenuOpen={(title, top, left) => {
                setActiveMessageMenu(title);
                setActiveMessageMenuPosition({ top, left });
              }}
              onMenuClose={() => {
                setActiveMessageMenu(null);
                setActiveMessageMenuPosition(null);
              }}
              onRequestDelete={handleRequestDeleteMessage}
            />
          ) : null}

          {activeSection === "users" ? (
            <BloggerCenterUsers
              users={visibleUsers}
              activeMenuId={activeUserMenu}
              activeMenuPosition={activeUserMenuPosition}
              onToggleStatus={handleToggleUserStatus}
              onRequestDelete={handleRequestDeleteUser}
              onMenuOpen={(userId, top, left) => {
                setActiveUserMenu(userId);
                setActiveUserMenuPosition({ top, left });
              }}
              onMenuClose={() => {
                setActiveUserMenu(null);
                setActiveUserMenuPosition(null);
              }}
              searchValue={userSearchValue}
              onSearchChange={setUserSearchValue}
              page={userPage}
              pageSize={usersPerPage}
              totalPages={totalUserPages}
              onPrevPage={() => setUserPage((page) => Math.max(1, page - 1))}
              onNextPage={() => setUserPage((page) => Math.min(totalUserPages, page + 1))}
              onPageChange={setUserPage}
            />
          ) : null}

          {activeSection === "history" ? (
            <div className="space-y-4">
              <VisitorCenterToolbar
                searchValue={historySearchValue}
                onSearchChange={setHistorySearchValue}
                onSearchSubmit={setHistorySearchKeyword}
                onClearHistoryClick={() => setShowClearConfirm(true)}
              />

              {historyError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{historyError}</div> : null}
              {historyLoading ? (
                <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-12 text-center text-sm text-zinc-400">正在加载浏览记录...</div>
              ) : (
                <VisitorCenterHistory articles={visibleHistory} visibleCount={visibleHistory.length} />
              )}

              {hasMoreHistory ? (
                <div className="flex justify-center pt-4">
                  <button type="button" onClick={() => setHistoryVisibleCount((count) => Math.min(count + 4, filteredHistory.length))} className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10">
                    加载更多浏览历史
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeSection === "liked" ? (
            <div className="space-y-4">
              {likedError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{likedError}</div> : null}
              {likedLoading ? (
                <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-12 text-center text-sm text-zinc-400">正在加载我的点赞...</div>
              ) : (
                <VisitorCenterLiked articles={likedList} />
              )}
            </div>
          ) : null}
          {activeSection === "favorites" ? <VisitorCenterFavorites articles={likedList} /> : null}
          {activeSection === "comments" ? (
            <BloggerCenterComments
              reviewItems={filteredReviews}
              reviewFilter={reviewFilter}
              onFilterChange={setReviewFilter}
              visibleReviews={visibleReviews}
              reviewPage={reviewPage}
              totalReviewPages={totalReviewPages}
              onPrevPage={() => setReviewPage((page) => Math.max(1, page - 1))}
              onNextPage={() => setReviewPage((page) => Math.min(totalReviewPages, page + 1))}
              onPageChange={setReviewPage}
              activeMenuTitle={activeReviewMenu}
              activeMenuPosition={activeReviewMenuPosition}
              onMenuOpen={(id, top, left) => {
                setActiveReviewMenu(id);
                setActiveReviewMenuPosition({ top, left });
              }}
              onMenuClose={() => {
                setActiveReviewMenu(null);
                setActiveReviewMenuPosition(null);
              }}
              onRequestDelete={handleRequestDeleteReview}
              reviewStatusMeta={reviewStatusMeta}
              reviewActionMap={reviewActionMap}
            />
          ) : null}
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
        onConfirm={handleClearHistory}
      />

      <VisitorCenterConfirmModal
        open={showLogoutConfirm}
        title="确认退出登录？"
        description="退出后需要重新登录才能继续访问个人中心功能。"
        cancelLabel="取消"
        confirmLabel="确认退出"
        confirmButtonClassName="bg-[#adc6ff] text-[#001a41] hover:bg-[#c3d2ff]"
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          await logout();
          setShowLogoutConfirm(false);
          router.push("/");
          router.refresh();
        }}
      />

      <VisitorCenterConfirmModal
        open={Boolean(userDeleteTarget)}
        title="确认删除用户？"
        description={userDeleteTarget ? `确定要删除用户「${userDeleteTarget.nickname}」吗？删除后无法恢复。` : "确定要删除该用户吗？删除后无法恢复。"}
        cancelLabel="取消"
        confirmLabel="确认删除"
        confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400"
        onClose={() => setUserDeleteTarget(null)}
        onConfirm={handleConfirmDeleteUser}
      />

      <VisitorCenterConfirmModal
        open={Boolean(reviewDeleteTarget)}
        title="确认删除评论？"
        description={reviewDeleteTarget ? `确定要删除评论「${reviewDeleteTarget.articleTitle} / ${reviewDeleteTarget.author}」吗？删除后无法恢复。` : "确定要删除该评论吗？删除后无法恢复。"}
        cancelLabel="取消"
        confirmLabel="确认删除"
        confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400"
        onClose={() => setReviewDeleteTarget(null)}
        onConfirm={() => {
          if (!reviewDeleteTarget) return;
          setReviewDeleteTarget(null);
        }}
      />

      <VisitorCenterConfirmModal
        open={Boolean(articleDeleteTarget)}
        title="确认删除文章？"
        description={articleDeleteTarget ? `确定要删除文章「${articleDeleteTarget.title}」吗？删除后无法恢复。` : "确定要删除该文章吗？删除后无法恢复。"}
        cancelLabel="取消"
        confirmLabel="确认删除"
        confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400"
        onClose={() => setArticleDeleteTarget(null)}
        onConfirm={handleConfirmDeleteArticle}
      />

      <VisitorCenterConfirmModal
        open={Boolean(messageDeleteTarget)}
        title="确认删除消息？"
        description={messageDeleteTarget ? `确定要删除消息「${messageDeleteTarget.title}」吗？删除后无法恢复。` : "确定要删除该消息吗？删除后无法恢复。"}
        cancelLabel="取消"
        confirmLabel="确认删除"
        confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400"
        onClose={() => setMessageDeleteTarget(null)}
        onConfirm={() => {
          if (!messageDeleteTarget) return;
          setMessageDeleteTarget(null);
        }}
      />

      <SiteFooter />
    </div>
  );
}
