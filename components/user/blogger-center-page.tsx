"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { useAuth } from "@/components/common/auth-context";
import { useNotificationCount } from "@/components/common/notification-context";
import { VisitorCenterAccountSettings } from "@/components/user/visitor-center-page/visitor-center-account-settings";
import { VisitorCenterComments } from "@/components/user/visitor-center-page/visitor-center-comments";
import { VisitorCenterConfirmModal } from "@/components/user/visitor-center-page/visitor-center-confirm-modal";
import { VisitorCenterFavorites } from "@/components/user/visitor-center-page/visitor-center-favorites";
import { VisitorCenterHistory } from "@/components/user/visitor-center-page/visitor-center-history";
import { VisitorCenterLiked } from "@/components/user/visitor-center-page/visitor-center-liked";
import { VisitorCenterNotifications } from "@/components/user/visitor-center-page/visitor-center-notifications";
import { VisitorCenterToolbar } from "@/components/user/visitor-center-page/visitor-center-toolbar";

import { historyArticles } from "./visitor-center-page/history-articles";
import { likedArticles } from "./visitor-center-page/liked-articles";
import { commentedArticles, type CommentedArticle } from "./visitor-center-page/commented-articles";
import { BloggerCenterArticles } from "./blogger-center-page/blogger-center-articles";
import { BloggerCenterComments } from "./blogger-center-page/blogger-center-comments";
import { BloggerCenterMessages } from "./blogger-center-page/blogger-center-messages";
import { BloggerCenterSidebar } from "./blogger-center-page/blogger-center-sidebar";
import { BloggerCenterUsers } from "./blogger-center-page/blogger-center-users";

type ArticleStatus = "published" | "draft";
type ReviewStatus = "pending" | "approved";
type UserStatus = "active" | "muted";

type UserItem = { id: string; nickname: string; email: string; joinedAt: string; status: UserStatus };
type ArticleItem = { title: string; excerpt: string; tags: string[]; updatedAt: string; status: ArticleStatus };
type ArticleRow = ArticleItem & { category: string };
type ReviewItem = { id: string; articleTitle: string; author: string; content: string; createdAt: string; likes: number; replies: number; status: ReviewStatus; href: string };

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
  const [bookmarkedList, setBookmarkedList] = useState(likedArticles);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedError, setLikedError] = useState<string | null>(null);
  const [bookmarkedLoading, setBookmarkedLoading] = useState(false);
  const [bookmarkedError, setBookmarkedError] = useState<string | null>(null);
  const [activeArticleTab, setActiveArticleTab] = useState<ArticleStatus>("published");
  const [articlePage, setArticlePage] = useState(1);
  const [activeArticleMenu, setActiveArticleMenu] = useState<string | null>(null);
  const [activeArticleMenuPosition, setActiveArticleMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeReviewMenu, setActiveReviewMenu] = useState<string | null>(null);
  const [activeReviewMenuPosition, setActiveReviewMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [reviewActionTarget, setReviewActionTarget] = useState<{ review: ReviewItem; action: "approve" | "delete" } | null>(null);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | "all">("all");
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [commentedList, setCommentedList] = useState<CommentedArticle[]>(commentedArticles);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [commentedLoading, setCommentedLoading] = useState(false);
  const [commentedError, setCommentedError] = useState<string | null>(null);
  const [articleDeleteTarget, setArticleDeleteTarget] = useState<ArticleRow | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userDeleteTarget, setUserDeleteTarget] = useState<UserItem | null>(null);
  const [userSearchValue, setUserSearchValue] = useState("");
  const [userSearchKeyword, setUserSearchKeyword] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const { unreadCount, setUnreadCount } = useNotificationCount();

  useEffect(() => {
    const savedSection = window.localStorage.getItem(BLOGGER_CENTER_STORAGE_KEY);
    if (savedSection === "new-article") {
      router.push("/editor");
      return;
    }
    if (["articles", "comments-review", "send-message", "users", "history", "liked", "favorites", "comments", "notifications", "settings"].includes(savedSection ?? "")) {
      setActiveSection(savedSection as string);
    }
  }, [router]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "notifications") setActiveSection("notifications");
  }, [searchParams]);

  useEffect(() => { window.localStorage.setItem(BLOGGER_CENTER_STORAGE_KEY, activeSection); }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "liked") return;
    const loadLikedArticles = async () => {
      setLikedLoading(true); setLikedError(null);
      try { const r = await fetch("/api/user/liked-articles", { cache: "no-store" }); if (!r.ok) throw new Error(); setLikedList((await r.json()).likedArticles); } catch { setLikedError("我的点赞加载失败，请稍后重试。"); } finally { setLikedLoading(false); }
    };
    void loadLikedArticles();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "favorites") return;
    const loadBookmarkedArticles = async () => {
      setBookmarkedLoading(true); setBookmarkedError(null);
      try { const r = await fetch("/api/user/bookmarked-articles", { cache: "no-store" }); if (!r.ok) throw new Error(); setBookmarkedList((await r.json()).bookmarkedArticles); } catch { setBookmarkedError("我的收藏加载失败，请稍后重试。"); } finally { setBookmarkedLoading(false); }
    };
    void loadBookmarkedArticles();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "comments" && activeSection !== "comments-review") return;
    const loadCommentedArticles = async () => {
      setCommentedLoading(true); setCommentedError(null);
      try { const r = await fetch("/api/user/comments", { cache: "no-store" }); if (!r.ok) throw new Error(); setCommentedList((await r.json()).comments); } catch { setCommentedError("我的评论加载失败，请稍后重试。"); } finally { setCommentedLoading(false); }
    };
    void loadCommentedArticles();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "comments-review") return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-review-menu]")) return;
      setActiveReviewMenu(null);
      setActiveReviewMenuPosition(null);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "comments-review") return;
    const loadReviewComments = async () => {
      setReviewLoading(true);
      setReviewError(null);
      try {
        const response = await fetch("/api/blogger/comments", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = (await response.json()) as { comments: ReviewItem[] };
        setReviewItems(data.comments);
      } catch {
        setReviewError("评论管理加载失败，请稍后重试。");
      } finally {
        setReviewLoading(false);
      }
    };
    void loadReviewComments();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "history") return;
    const loadHistory = async () => {
      setHistoryLoading(true); setHistoryError(null);
      try { const r = await fetch("/api/user/browse-histories", { cache: "no-store" }); if (!r.ok) throw new Error(); setHistory((await r.json()).histories); } catch { setHistoryError("浏览记录加载失败，请稍后重试。"); } finally { setHistoryLoading(false); }
    };
    void loadHistory();
  }, [activeSection]);

  useEffect(() => { setHistoryVisibleCount(4); }, [historySearchKeyword, history]);
  useEffect(() => { setArticlePage(1); }, [activeArticleTab]);
  useEffect(() => { setUserPage(1); }, [userSearchKeyword]);
  useEffect(() => { setReviewPage(1); }, [reviewFilter]);

  useEffect(() => {
    if (activeSection !== "users") return;
    const loadUsers = async () => {
      setUserLoading(true);
      setUserError(null);
      try {
        const response = await fetch(`/api/blogger/users?page=${userPage}&pageSize=6&search=${encodeURIComponent(userSearchKeyword.trim())}`, { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = (await response.json()) as { users: UserItem[] };
        setUsers(data.users);
      } catch {
        setUserError("用户管理加载失败，请稍后重试。");
      } finally {
        setUserLoading(false);
      }
    };
    void loadUsers();
  }, [activeSection, userPage, userSearchKeyword]);

  const articleRows: ArticleRow[] = useMemo(() => [
    { title: "AI 原生极简主义：界面即智能容器", category: "设计", excerpt: "探讨在人工智能时代，如何通过大量留白和精准排版重塑阅读体验...", tags: ["UI/UX", "AI"], updatedAt: "2024-05-20 14:30", status: "published" },
    { title: "2024 个人年度数字足迹图鉴", category: "随笔", excerpt: "整理过去一年使用过的 SaaS 工具、阅读过的好书及开源贡献...", tags: ["年度回顾"], updatedAt: "2024-05-10 09:15", status: "published" },
    { title: "前端工程化的下一个十年", category: "前端", excerpt: "从构建工具到云端 IDE，探讨开发者生产力的极限边界...", tags: ["前端", "工程化"], updatedAt: "2024-04-28 16:45", status: "published" },
    { title: "构建响应式设计系统的新范式", category: "CSS", excerpt: "基于 Container Queries 和逻辑属性的现代布局方案实践...", tags: ["CSS", "设计系统"], updatedAt: "2024-04-15 11:20", status: "published" },
    { title: "（草稿）LLM 推理优化指南：KV Cache 深度解析", category: "AI", excerpt: "探讨如何在有限的显存资源下，通过 KV Cache 量化和 PagedAttention 提升吞吐量...", tags: ["AI", "技术底层"], updatedAt: "2024-05-22 11:30", status: "draft" },
    { title: "（草稿）Framer Motion 进阶：复杂序列动画编排", category: "前端", excerpt: "利用 useAnimate 和 Variants 实现极具表现力的页面入场动效...", tags: ["前端", "动效"], updatedAt: "2024-05-21 09:00", status: "draft" },
    { title: "（草稿）个人工作站自动化：从 Raycast 到 Hammerspoon", category: "效率工具", excerpt: "如何通过 Lua 脚本接管 macOS 的每一个窗口，打造极致效率环境...", tags: ["自动化", "效率工具"], updatedAt: "2024-05-19 15:45", status: "draft" },
    { title: "（草稿）WebGPU 开启前端渲染的新篇章", category: "图形学", excerpt: "脱离 WebGL 的限制，直接在浏览器中进行大规模通用计算和图形渲染...", tags: ["图形学", "WebGPU"], updatedAt: "2024-05-18 10:00", status: "draft" },
  ], []);

  const publishedArticles = articleRows.filter((article) => article.status === "published");
  const draftArticles = articleRows.filter((article) => article.status === "draft");
  const activeArticles = activeArticleTab === "published" ? publishedArticles : draftArticles;
  const articlesPerPage = 6;
  const totalArticlePages = Math.max(1, Math.ceil(activeArticles.length / articlesPerPage));
  const visibleArticles = activeArticles.slice((articlePage - 1) * articlesPerPage, articlePage * articlesPerPage);

  const filteredReviews = reviewItems.filter((review) => (reviewFilter === "all" ? true : review.status === reviewFilter));
  const reviewsPerPage = 6;
  const totalReviewPages = Math.max(1, Math.ceil(filteredReviews.length / reviewsPerPage));
  const safeReviewPage = Math.min(reviewPage, totalReviewPages);
  const visibleReviews = filteredReviews.slice((safeReviewPage - 1) * reviewsPerPage, safeReviewPage * reviewsPerPage);

  const filteredHistory = useMemo(() => { const q = historySearchKeyword.trim().toLowerCase(); return q ? history.filter((item) => [item.title, item.excerpt, item.category, ...item.tags].join(" ").toLowerCase().includes(q)) : history; }, [history, historySearchKeyword]);
  const visibleHistory = useMemo(() => filteredHistory.slice(0, historyVisibleCount), [filteredHistory, historyVisibleCount]);
  const hasMoreHistory = historyVisibleCount < filteredHistory.length;

  const usersPerPage = 6;

  const handleClearHistory = async () => { setShowClearConfirm(false); await fetch("/api/user/browse-histories", { method: "DELETE" }).then((r) => { if (!r.ok) throw new Error(); }).then(() => { setHistory([]); setHistorySearchKeyword(""); setHistorySearchValue(""); setHistoryVisibleCount(4); }).catch(() => setHistoryError("清空浏览记录失败，请稍后重试。")); };
  const handleUserSearchSubmit = () => {
    setUserSearchKeyword(userSearchValue.trim());
    setUserPage(1);
  };
  const refreshUsers = async (page = userPage) => {
    setUserLoading(true);
    setUserError(null);
    try {
      const response = await fetch(`/api/blogger/users?page=${page}&pageSize=${usersPerPage}&search=${encodeURIComponent(userSearchKeyword.trim())}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as { users: UserItem[]; totalPages: number; page: number };
      setUsers(data.users);
      if (data.page !== page) setUserPage(data.page);
      return data;
    } catch {
      setUserError("用户管理加载失败，请稍后重试。");
      return null;
    } finally {
      setUserLoading(false);
    }
  };
  const handleToggleUserStatus = async (userId: string) => {
    setUserActionLoading(true);
    try {
      const response = await fetch("/api/blogger/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: userId, action: "toggle-status" }) });
      if (!response.ok) throw new Error();
      await refreshUsers();
    } catch {
      setUserError("切换用户状态失败，请稍后重试。");
    } finally {
      setUserActionLoading(false);
    }
  };
  const handleConfirmDeleteUser = async () => { if (!userDeleteTarget) return; setUserActionLoading(true); try { const response = await fetch(`/api/blogger/users?id=${userDeleteTarget.id}`, { method: "DELETE" }); if (!response.ok) throw new Error(); setUserDeleteTarget(null); await refreshUsers(); } catch { setUserError("删除用户失败，请稍后重试。"); } finally { setUserActionLoading(false); } };
  const handleConfirmDeleteArticle = () => setArticleDeleteTarget(null);
  const handleReviewAction = async () => {
    if (!reviewActionTarget) return;
    setReviewActionLoading(true);
    try {
      const response = reviewActionTarget.action === "approve"
        ? await fetch("/api/blogger/comments", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: reviewActionTarget.review.id, action: "approve" }),
          })
        : await fetch(`/api/blogger/comments?id=${reviewActionTarget.review.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      const refreshed = await fetch("/api/blogger/comments", { cache: "no-store" });
      if (refreshed.ok) {
        const data = (await refreshed.json()) as { comments: ReviewItem[] };
        setReviewItems(data.comments);
      }
      setReviewActionTarget(null);
      setReviewPage(1);
    } catch {
      setReviewError(reviewActionTarget.action === "approve" ? "通过评论失败，请稍后重试。" : "删除评论失败，请稍后重试。");
    } finally {
      setReviewActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader searchValue={siteSearchValue} onSearchChange={setSiteSearchValue} />
      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1440px] grid-cols-1 gap-8 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-8">
        <BloggerCenterSidebar activeId={activeSection} onSelect={(section) => { window.localStorage.setItem(BLOGGER_CENTER_STORAGE_KEY, section); setActiveSection(section); }} onNewArticleClick={() => { window.localStorage.removeItem(BLOGGER_CENTER_STORAGE_KEY); router.push("/editor"); }} onLogoutClick={() => setShowLogoutConfirm(true)} onSettingsClick={() => setActiveSection("settings")} notificationBadgeCount={unreadCount} />
        <section className="space-y-6 pb-10">
          {activeSection === "articles" ? <BloggerCenterArticles activeTab={activeArticleTab} onTabChange={setActiveArticleTab} articleTabs={articleTabs} visibleArticles={visibleArticles} activeArticleMenu={activeArticleMenu} activeArticleMenuPosition={activeArticleMenuPosition} onMenuOpen={(title, top, left) => { setActiveArticleMenu(title); setActiveArticleMenuPosition({ top, left }); }} onMenuClose={() => { setActiveArticleMenu(null); setActiveArticleMenuPosition(null); }} onRequestDelete={(article) => setArticleDeleteTarget(article)} publishedArticlesLength={publishedArticles.length} draftArticlesLength={draftArticles.length} articlePage={articlePage} articlesPerPage={articlesPerPage} totalArticlePages={totalArticlePages} onPrevPage={() => setArticlePage((page) => Math.max(1, page - 1))} onNextPage={() => setArticlePage((page) => Math.min(totalArticlePages, page + 1))} onPageChange={setArticlePage} /> : null}
          {activeSection === "comments-review" ? <div className="space-y-4">{reviewError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{reviewError}</div> : null}{reviewLoading ? <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-12 text-center text-sm text-zinc-400">正在加载评论管理...</div> : <BloggerCenterComments reviewItems={filteredReviews} reviewFilter={reviewFilter} onFilterChange={setReviewFilter} visibleReviews={visibleReviews} reviewPage={safeReviewPage} totalReviewPages={totalReviewPages} onPrevPage={() => setReviewPage((page) => Math.max(1, page - 1))} onNextPage={() => setReviewPage((page) => Math.min(totalReviewPages, page + 1))} onPageChange={setReviewPage} activeMenuTitle={activeReviewMenu} activeMenuPosition={activeReviewMenuPosition} onMenuOpen={(id, top, left) => { setActiveReviewMenu(id); setActiveReviewMenuPosition({ top, left }); }} onMenuClose={() => { setActiveReviewMenu(null); setActiveReviewMenuPosition(null); }} onRequestAction={(reviewId, action) => { const review = reviewItems.find((item) => item.id === reviewId) ?? filteredReviews.find((item) => item.id === reviewId); if (!review) return; setReviewActionTarget({ review, action }); }} reviewStatusMeta={reviewStatusMeta} reviewActionMap={reviewActionMap} />}{reviewActionLoading ? <div className="text-sm text-zinc-500">正在执行操作...</div> : null}</div> : null}
          {activeSection === "comments" ? <div className="space-y-4">{commentedError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{commentedError}</div> : null}{commentedLoading ? <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-12 text-center text-sm text-zinc-400">正在加载我的评论...</div> : <VisitorCenterComments articles={commentedList} />}</div> : null}
          {activeSection === "send-message" ? <BloggerCenterMessages /> : null}
          {activeSection === "users" ? <div className="space-y-4">{userError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{userError}</div> : null}{userLoading ? <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-12 text-center text-sm text-zinc-400">正在加载用户管理...</div> : <BloggerCenterUsers users={users} onToggleStatus={handleToggleUserStatus} onRequestDelete={(userId) => setUserDeleteTarget(users.find((user) => user.id === userId) ?? null)} searchValue={userSearchValue} onSearchChange={setUserSearchValue} onSearchSubmit={handleUserSearchSubmit} page={userPage} pageSize={6} totalPages={Math.max(1, Math.ceil(users.length / 6))} onPrevPage={() => setUserPage((page) => Math.max(1, page - 1))} onNextPage={() => setUserPage((page) => Math.min(Math.max(1, Math.ceil(users.length / 6)), page + 1))} onPageChange={setUserPage} />}{userActionLoading ? <div className="text-sm text-zinc-500">正在执行用户操作...</div> : null}</div> : null}
          {activeSection === "history" ? <div className="space-y-4"><VisitorCenterToolbar searchValue={historySearchValue} onSearchChange={setHistorySearchValue} onSearchSubmit={setHistorySearchKeyword} onClearHistoryClick={() => setShowClearConfirm(true)} />{historyError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{historyError}</div> : null}{historyLoading ? <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-12 text-center text-sm text-zinc-400">正在加载浏览记录...</div> : <VisitorCenterHistory articles={visibleHistory} visibleCount={visibleHistory.length} />}{hasMoreHistory ? <div className="flex justify-center pt-4"><button type="button" onClick={() => setHistoryVisibleCount((count) => Math.min(count + 4, filteredHistory.length))} className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10">加载更多浏览历史</button></div> : null}</div> : null}
          {activeSection === "liked" ? <div className="space-y-4">{likedError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{likedError}</div> : null}{likedLoading ? <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-12 text-center text-sm text-zinc-400">正在加载我的点赞...</div> : <VisitorCenterLiked articles={likedList} />}</div> : null}
          {activeSection === "favorites" ? <div className="space-y-4">{bookmarkedError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{bookmarkedError}</div> : null}{bookmarkedLoading ? <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-12 text-center text-sm text-zinc-400">正在加载我的收藏...</div> : <VisitorCenterFavorites articles={bookmarkedList} />}</div> : null}
          {activeSection === "notifications" ? <VisitorCenterNotifications onUnreadCountChange={setUnreadCount} /> : null}
          {activeSection === "settings" ? <VisitorCenterAccountSettings /> : null}
        </section>
      </main>
      <VisitorCenterConfirmModal open={showClearConfirm} title="确认清空浏览记录？" description="此操作会永久删除当前浏览记录，且无法恢复。" cancelLabel="取消" confirmLabel="确认清空" confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400" onClose={() => setShowClearConfirm(false)} onConfirm={handleClearHistory} />
      <VisitorCenterConfirmModal open={showLogoutConfirm} title="确认退出登录？" description="退出后需要重新登录才能继续访问个人中心功能。" cancelLabel="取消" confirmLabel="确认退出" confirmButtonClassName="bg-[#adc6ff] text-[#001a41] hover:bg-[#c3d2ff]" onClose={() => setShowLogoutConfirm(false)} onConfirm={async () => { await logout(); setShowLogoutConfirm(false); router.push("/"); router.refresh(); }} />
      <VisitorCenterConfirmModal open={Boolean(userDeleteTarget)} title="确认删除用户？" description={userDeleteTarget ? `确定要删除用户「${userDeleteTarget.nickname}」吗？删除后无法恢复。` : "确定要删除该用户吗？删除后无法恢复。"} cancelLabel="取消" confirmLabel="确认删除" confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400" onClose={() => setUserDeleteTarget(null)} onConfirm={handleConfirmDeleteUser} />
      <VisitorCenterConfirmModal open={Boolean(articleDeleteTarget)} title="确认删除文章？" description={articleDeleteTarget ? `确定要删除文章「${articleDeleteTarget.title}」吗？删除后无法恢复。` : "确定要删除该文章吗？删除后无法恢复。"} cancelLabel="取消" confirmLabel="确认删除" confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400" onClose={() => setArticleDeleteTarget(null)} onConfirm={handleConfirmDeleteArticle} />
      <VisitorCenterConfirmModal open={Boolean(reviewActionTarget)} title={reviewActionTarget?.action === "approve" ? "确认通过评论？" : "确认删除评论？"} description={reviewActionTarget ? reviewActionTarget.action === "approve" ? `确定要通过评论「${reviewActionTarget.review.articleTitle} / ${reviewActionTarget.review.author}」吗？` : `确定要删除评论「${reviewActionTarget.review.articleTitle} / ${reviewActionTarget.review.author}」吗？删除后无法恢复。` : "确定要执行该操作吗？"} cancelLabel="取消" confirmLabel={reviewActionTarget?.action === "approve" ? "确认通过" : "确认删除"} confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400" onClose={() => setReviewActionTarget(null)} onConfirm={handleReviewAction} />
      <SiteFooter />
    </div>
  );
}
