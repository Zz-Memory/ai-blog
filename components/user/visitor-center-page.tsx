"use client";

import { useMemo, useState } from "react";

import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";

import { historyArticles } from "./visitor-center-page/history-articles";
import { likedArticles } from "./visitor-center-page/liked-articles";
import { VisitorCenterConfirmModal } from "@/components/user/visitor-center-page/visitor-center-confirm-modal";
import { VisitorCenterFavorite } from "@/components/user/visitor-center-page/visitor-center-favorite";
import { VisitorCenterHistory } from "@/components/user/visitor-center-page/visitor-center-history";
import { VisitorCenterSidebar } from "@/components/user/visitor-center-page/visitor-center-sidebar";
import { VisitorCenterToolbar } from "@/components/user/visitor-center-page/visitor-center-toolbar";

export function VisitorCenterPage() {
  // 顶部站点级搜索框的输入值。
  // 它只服务于 `SiteHeader`，和下方“浏览记录”的搜索互不影响。
  const [siteSearchValue, setSiteSearchValue] = useState("");

  // “浏览记录”区域的搜索输入值。
  // 这个值会跟随输入框实时变化，但真正参与筛选时会在回车后写入 `historySearchKeyword`。
  const [historySearchValue, setHistorySearchValue] = useState("");

  // 浏览记录筛选关键字。
  // 只有当用户提交搜索时，才会把当前输入同步到这里，从而触发列表过滤。
  const [historySearchKeyword, setHistorySearchKeyword] = useState("");

  // 当前展示的历史记录数据。
  // 之所以保存在 state 中，是为了后续支持“清空记录”等交互后直接更新列表。
  const [history, setHistory] = useState(historyArticles);

  // 以下三个 state 分别控制三个独立弹窗是否可见。
  // 这样做的好处是：每个操作的确认语义都清晰，不会互相串状态。
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettingsNote, setShowSettingsNote] = useState(false);

  // 右侧功能模块当前激活项。
  // 通过左侧悬浮菜单切换这个值，右侧区域会据此渲染不同模块。
  const [activeSection, setActiveSection] = useState("history");

  // 当前用户“点赞”列表。
  // 这里先使用静态数据，后续可以替换为接口返回值或用户态缓存。
  const likedList = useMemo(() => likedArticles, []);

  // 根据浏览记录搜索关键字过滤列表。
  // 这里使用 `useMemo` 只是为了避免在无关状态变化时重复计算，数据量变大后更有意义。
  const filteredArticles = useMemo(() => {
    const q = historySearchKeyword.trim().toLowerCase();
    if (!q) return history;

    return history.filter((item) => {
      // 把一条记录里可能被搜索到的字段统一拼接，再做包含判断。
      // 这样可以同时命中标题、摘要、分类和标签。
      const haystack = [item.title, item.excerpt, item.category, ...item.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [history, historySearchKeyword]);

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader
        searchValue={siteSearchValue}
        onSearchChange={setSiteSearchValue}
        // 目前站点级搜索框暂时还没有接入实际检索逻辑，因此先保留空实现。
        onSearchSubmit={() => undefined}
        onLoginClick={() => undefined}
        onRegisterClick={() => undefined}
        isAuthenticated
      />

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1440px] grid-cols-1 gap-8 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-8">
        <VisitorCenterSidebar
          activeId={activeSection}
          // 左侧栏只负责触发全局动作，真正的确认交给弹窗处理。
          onSelect={setActiveSection}
          onLogoutClick={() => setShowLogoutConfirm(true)}
          onSettingsClick={() => setShowSettingsNote(true)}
        />

        <section className="space-y-6 pb-10">
          {activeSection === "liked" ? (
            <VisitorCenterFavorite articles={likedList} />
          ) : (
            <>
              <VisitorCenterToolbar
                // 注意：这里传入的是“浏览记录搜索”状态，而不是 `SiteHeader` 的搜索状态。
                searchValue={historySearchValue}
                onSearchChange={setHistorySearchValue}
                onSearchSubmit={setHistorySearchKeyword}
                onClearHistoryClick={() => setShowClearConfirm(true)}
              />

              <VisitorCenterHistory articles={filteredArticles} />

              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
                >
                  加载更早的记录
                </button>
              </div>
            </>
          )}
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
        onConfirm={() => {
          setHistory([]);
          setShowClearConfirm(false);
        }}
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
        onConfirm={() => setShowLogoutConfirm(false)}
      />

      {/* 账号设置提示弹窗：当前作为占位说明，后续可替换成真正的设置页入口。 */}
      <VisitorCenterConfirmModal
        open={showSettingsNote}
        title="账号设置"
        description="这里后续可以接入头像、昵称、密码和偏好设置页面。"
        cancelLabel=""
        confirmLabel="我知道了"
        confirmButtonClassName="bg-[#adc6ff] text-[#001a41] hover:bg-[#c3d2ff]"
        hideCancelButton
        onClose={() => setShowSettingsNote(false)}
        onConfirm={() => setShowSettingsNote(false)}
      />

      <SiteFooter />
    </div>
  );
}
