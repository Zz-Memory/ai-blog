type BloggerCenterSidebarItem = {
  id: string;
  label: string;
  icon: string;
  badge?: number;
};

type BloggerCenterSidebarProps = {
  activeId: string;
  onSelect: (id: string) => void;
  onNewArticleClick: () => void;
  onLogoutClick: () => void;
  onSettingsClick: () => void;
  notificationBadgeCount?: number;
};

const bloggerItems: BloggerCenterSidebarItem[] = [
  { id: "new-article", label: "新建文章", icon: "edit_square" },
  { id: "articles", label: "文章管理", icon: "article" },
  { id: "comments-review", label: "评论管理", icon: "comment" },
  { id: "send-message", label: "发送消息", icon: "send" },
  { id: "users", label: "用户管理", icon: "group" },
];

const visitorItems: BloggerCenterSidebarItem[] = [
  { id: "history", label: "浏览记录", icon: "history" },
  { id: "liked", label: "我的点赞", icon: "favorite" },
  { id: "favorites", label: "我的收藏", icon: "bookmarks" },
  { id: "comments", label: "我的评论", icon: "chat_bubble" },
  { id: "notifications", label: "消息通知", icon: "notifications" },
  { id: "settings", label: "账号设置", icon: "settings" },
  { id: "logout", label: "退出登录", icon: "logout" },
];

export function BloggerCenterSidebar({ activeId, onSelect, onNewArticleClick, onLogoutClick, onSettingsClick, notificationBadgeCount = 0 }: BloggerCenterSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col">
      <div className="sticky top-24 rounded-3xl border border-cyan-100/80 bg-white/84 p-5 shadow-[0_18px_45px_rgba(56,189,248,0.12)] backdrop-blur-sm">
        <div className="text-xs tracking-[0.28em] text-cyan-700">博主专栏</div>
        <nav className="mt-6 space-y-2">
          {bloggerItems.map((item) => {
            const isNewArticle = item.id === "new-article";
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isNewArticle) {
                    onNewArticleClick();
                    return;
                  }
                  onSelect(item.id);
                }}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${isNewArticle ? "border-cyan-300/70 bg-gradient-to-r from-cyan-400/15 to-violet-400/15 text-cyan-900 shadow-[0_12px_30px_rgba(56,189,248,0.12)] hover:border-cyan-400 hover:from-cyan-400/20 hover:to-violet-400/20 hover:text-cyan-950" : isActive ? "border-cyan-300/70 bg-gradient-to-r from-cyan-400/15 to-violet-400/15 text-cyan-900 shadow-[0_12px_30px_rgba(56,189,248,0.12)]" : "border-transparent bg-transparent text-slate-500 hover:border-cyan-100 hover:bg-cyan-50/70 hover:text-cyan-900"}`}
              >
                <span className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>{item.label}</span>
                {isNewArticle ? <span className="material-symbols-outlined text-[18px] leading-none text-cyan-600/80">arrow_forward</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-cyan-100/80 pt-4">
          <div className="pb-2 text-xs tracking-[0.28em] text-cyan-700">访客工具</div>
          <nav className="space-y-2">
            {visitorItems.map((item) => {
              const isActive = item.id === activeId;
              return (
                <button key={item.id} type="button" onClick={() => { if (item.id === "logout") return onLogoutClick(); if (item.id === "settings") return onSettingsClick(); onSelect(item.id); }} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${isActive ? "border-cyan-300/70 bg-gradient-to-r from-cyan-400/15 to-violet-400/15 text-cyan-900 shadow-[0_12px_30px_rgba(56,189,248,0.12)]" : "border-transparent bg-transparent text-slate-500 hover:border-cyan-100 hover:bg-cyan-50/70 hover:text-cyan-900"}`}>
                  <span className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>{item.label}</span>
                  {item.id === "notifications" && notificationBadgeCount > 0 ? <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-2 text-xs font-semibold text-white">{notificationBadgeCount}</span> : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
