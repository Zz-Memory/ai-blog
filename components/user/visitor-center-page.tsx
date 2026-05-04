"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/common/auth-context";

import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";

import { commentedArticles } from "./visitor-center-page/commented-articles";
import { historyArticles } from "./visitor-center-page/history-articles";
import { likedArticles, type LikedArticle } from "./visitor-center-page/liked-articles";
import { VisitorCenterAccountSettings } from "@/components/user/visitor-center-page/visitor-center-account-settings";
import { VisitorCenterComments } from "@/components/user/visitor-center-page/visitor-center-comments";
import { VisitorCenterConfirmModal } from "@/components/user/visitor-center-page/visitor-center-confirm-modal";
import { VisitorCenterFavorites } from "@/components/user/visitor-center-page/visitor-center-favorites";
import { VisitorCenterLiked } from "@/components/user/visitor-center-page/visitor-center-liked";
import { VisitorCenterHistory } from "@/components/user/visitor-center-page/visitor-center-history";
import { VisitorCenterNotifications } from "@/components/user/visitor-center-page/visitor-center-notifications";
import { VisitorCenterSidebar } from "@/components/user/visitor-center-page/visitor-center-sidebar";
import { VisitorCenterToolbar } from "@/components/user/visitor-center-page/visitor-center-toolbar";
import { useNotificationCount } from "@/components/common/notification-context";

const VISITOR_CENTER_STORAGE_KEY = "ai-blog.visitor-center.active-section";

export function VisitorCenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  // 顶部站点级搜索框的输入值。
  // 它只服务于 `SiteHeader`，和下方“浏览记录”的搜索互不影响。
  const [siteSearchValue, setSiteSearchValue] = useState("");

  // “浏览记录”区域的搜索输入值。
  // 这个值会跟随输入框实时变化，但真正参与筛选时会在回车后写入 `historySearchKeyword`。
  const [historySearchValue, setHistorySearchValue] = useState("");

  // 浏览记录筛选关键字。
  // 只有当用户提交搜索时，才会把当前输入同步到这里，从而触发列表过滤。
  const [historySearchKeyword, setHistorySearchKeyword] = useState("");
  const [historyVisibleCount, setHistoryVisibleCount] = useState(4);

  // 当前展示的历史记录数据。
  // 之所以保存在 state 中，是为了后续支持“清空记录”等交互后直接更新列表。
  const [history, setHistory] = useState(historyArticles);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // 以下三个 state 分别控制三个独立弹窗是否可见。
  // 这样做的好处是：每个操作的确认语义都清晰，不会互相串状态。
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 从全局通知状态中读取未读数量，供左侧菜单和顶部 `SiteHeader` 共享。
  const { unreadCount, setUnreadCount } = useNotificationCount();

  // 右侧功能模块当前激活项。
  // 通过左侧悬浮菜单切换这个值，右侧区域会据此渲染不同模块。
  const [activeSection, setActiveSection] = useState("history");

  useEffect(() => {
    const savedSection = window.localStorage.getItem(VISITOR_CENTER_STORAGE_KEY);
    if (savedSection === "history" || savedSection === "liked" || savedSection === "favorites" || savedSection === "comments" || savedSection === "notifications" || savedSection === "settings") {
      setActiveSection(savedSection);
    }
  }, []);

  const [likedList, setLikedList] = useState<LikedArticle[]>(likedArticles);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedError, setLikedError] = useState<string | null>(null);

  // 当前用户“点赞”列表。
  // 这里会优先从接口加载真实数据，失败时再回退到本地示例。
  const commentedList = useMemo(() => commentedArticles, []);

  useEffect(() => {
    if (searchParams.get("section") === "notifications") {
      setActiveSection("notifications");
    }
  }, [searchParams]);

  useEffect(() => {
    const loadLikedArticles = async () => {
      if (activeSection !== "liked") return;

      setLikedLoading(true);
      setLikedError(null);

      try {
        const response = await fetch("/api/user/liked-articles", { cache: "no-store" });
        if (!response.ok) throw new Error("加载点赞文章失败");
        const data = (await response.json()) as { likedArticles: LikedArticle[] };
        setLikedList(data.likedArticles);
      } catch {
        setLikedError("我的点赞加载失败，请稍后重试。");
      } finally {
        setLikedLoading(false);
      }
    };

    void loadLikedArticles();
  }, [activeSection]);

  useEffect(() => {
    window.localStorage.setItem(VISITOR_CENTER_STORAGE_KEY, activeSection);
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
  }, [activeSection, searchParams]);

  useEffect(() => {
    setHistoryVisibleCount(4);
  }, [historySearchKeyword, history]);

  // 根据浏览记录搜索关键字过滤列表。
  // 这里使用 `useMemo` 只是为了避免在无关状态变化时重复计算，数据量变大后更有意义。
  const filteredArticles = useMemo(() => {
    const q = historySearchKeyword.trim().toLowerCase();
    if (!q) return history;

    return history.filter((item) => {
      const haystack = [item.title, item.excerpt, item.category, ...item.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [history, historySearchKeyword]);

  const visibleHistory = useMemo(() => filteredArticles.slice(0, historyVisibleCount), [filteredArticles, historyVisibleCount]);
  const hasMoreHistory = historyVisibleCount < filteredArticles.length;

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

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader searchValue={siteSearchValue} onSearchChange={setSiteSearchValue} />

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1440px] grid-cols-1 gap-8 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-8">
        <VisitorCenterSidebar
          activeId={activeSection}
          // 左侧栏只负责触发全局动作，真正的确认交给弹窗处理。
          onSelect={(section) => setActiveSection(section)}
          onLogoutClick={() => setShowLogoutConfirm(true)}
          onSettingsClick={() => setActiveSection("settings")}
          notificationBadgeCount={unreadCount}
        />

        <section className="space-y-6 pb-10">
          {activeSection === "history" ? (
            <>
              <VisitorCenterToolbar
                // 注意：这里传入的是“浏览记录搜索”状态，而不是 `SiteHeader` 的搜索状态。
                searchValue={historySearchValue}
                onSearchChange={setHistorySearchValue}
                onSearchSubmit={setHistorySearchKeyword}
                onClearHistoryClick={() => setShowClearConfirm(true)}
              />

              {historyError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{historyError}</div> : null}
              {historyLoading ? (
                <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-12 text-center text-sm text-zinc-400">
                  正在加载浏览记录...
                </div>
              ) : (
                <VisitorCenterHistory articles={visibleHistory} visibleCount={visibleHistory.length} />
              )}

              {hasMoreHistory ? (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => setHistoryVisibleCount((count) => Math.min(count + 4, filteredArticles.length))}
                    className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    加载更多浏览历史
                  </button>
                </div>
              ) : null}
            </>
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

          {activeSection === "comments" ? <VisitorCenterComments articles={commentedList} /> : null}

          {activeSection === "notifications" ? <VisitorCenterNotifications onUnreadCountChange={setUnreadCount} /> : null}

          {activeSection === "settings" ? <VisitorCenterAccountSettings /> : null}
        </section>
      </main>

      {/* 清空记录确认弹窗：确认后直接清空当前历史列表。 */}
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

      {/* 退出登录确认弹窗：这里只做关闭演示，不接入真实退出逻辑。 */}
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

      <SiteFooter />
    </div>
  );
}
