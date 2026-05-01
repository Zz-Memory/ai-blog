type BloggerCenterSidebarItem = {
  id: string;
  label: string;
  icon: string;
  badge?: number;
};

type BloggerCenterSidebarProps = {
  activeId: string;
  onSelect: (id: string) => void;
  onLogoutClick: () => void;
  onSettingsClick: () => void;
  notificationBadgeCount?: number;
};

const bloggerItems: BloggerCenterSidebarItem[] = [
  { id: "new-article", label: "新建文章", icon: "edit_square" },
  { id: "articles", label: "文章管理", icon: "article" },
  { id: "comments-review", label: "评论管理", icon: "comment" },
  { id: "send-message", label: "消息管理", icon: "send" },
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

export function BloggerCenterSidebar({
  activeId,
  onSelect,
  onLogoutClick,
  onSettingsClick,
  notificationBadgeCount = 0,
}: BloggerCenterSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col">
      <div className="sticky top-24 rounded-3xl border border-white/8 bg-[#14161b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="text-xs tracking-[0.28em] text-zinc-500">博主专栏</div>

        <nav className="mt-6 space-y-2">
          {bloggerItems.map((item) => {
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-[#6e8cff]/40 bg-[#182033] text-blue-100 shadow-[inset_0_0_0_1px_rgba(110,140,255,0.12)]"
                    : "border-transparent bg-transparent text-zinc-500 hover:border-white/8 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-white/8 pt-4">
          <div className="pb-2 text-xs tracking-[0.28em] text-zinc-500">访客工具</div>
          <nav className="space-y-2">
            {visitorItems.map((item) => {
              const isActive = item.id === activeId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === "logout") {
                      onLogoutClick();
                      return;
                    }

                    if (item.id === "settings") {
                      onSettingsClick();
                      return;
                    }

                    onSelect(item.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-[#6e8cff]/40 bg-[#182033] text-blue-100 shadow-[inset_0_0_0_1px_rgba(110,140,255,0.12)]"
                      : "border-transparent bg-transparent text-zinc-500 hover:border-white/8 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>
                    {item.label}
                  </span>

                  {item.id === "notifications" && notificationBadgeCount > 0 ? (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#9db2ff] px-2 text-xs font-semibold text-[#10131a]">
                      {notificationBadgeCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
