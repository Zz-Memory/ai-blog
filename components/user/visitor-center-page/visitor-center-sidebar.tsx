// 侧边栏单项数据结构：统一管理图标、标题、徽标和激活态。
type VisitorCenterSidebarItem = {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  active?: boolean;
};

// 侧边栏对外暴露的交互回调。
// 这个组件本身不处理业务逻辑，只负责在用户点击时通知父组件。
type VisitorCenterSidebarProps = {
  activeId: string;
  onSelect: (id: string) => void;
  onLogoutClick: () => void;
  onSettingsClick: () => void;
  notificationBadgeCount?: number;
};

// 侧边栏配置数据：把菜单项抽成常量，便于后续增删和统一维护。
const sidebarItems: VisitorCenterSidebarItem[] = [
  { id: "history", label: "浏览历史", active: true, icon: "history" },
  { id: "liked", label: "我的点赞", icon: "favorite" },
  { id: "favorites", label: "我的收藏", icon: "bookmark" },
  { id: "comments", label: "我的评论", icon: "chat_bubble" },
  { id: "notifications", label: "消息通知", icon: "notifications" },
  { id: "settings", label: "账号设置", icon: "settings" },
  { id: "logout", label: "退出登录", icon: "logout" },
];

// 访客中心左侧导航栏。
// 当前版本负责切换右侧模块，同时保留账号设置和退出登录两个全局动作。
export function VisitorCenterSidebar({ activeId, onSelect, onLogoutClick, onSettingsClick, notificationBadgeCount = 0 }: VisitorCenterSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col">
      {/* 使用 sticky 是为了让侧边栏在滚动内容较长时保持可见。 */}
      <div className="sticky top-24 rounded-3xl border border-cyan-100/80 bg-white/84 p-5 shadow-[0_18px_45px_rgba(56,189,248,0.12)] backdrop-blur-sm">
        <div className="text-xs tracking-[0.28em] text-cyan-700">访客专栏</div>
        <nav className="mt-6 space-y-2">
          {sidebarItems.map((item) => {
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
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${isActive
                  ? "border-cyan-300/70 bg-gradient-to-r from-cyan-400/15 to-violet-400/15 text-cyan-900 shadow-[0_12px_30px_rgba(56,189,248,0.12)]"
                  : "border-transparent bg-transparent text-slate-500 hover:border-cyan-100 hover:bg-cyan-50/70 hover:text-cyan-900"
                  }`}
              >
                {/* 左侧图标 + 文案，形成统一的菜单入口视觉。 */}
                <span className="flex items-center gap-3 text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>
                  {item.label}
                </span>

                {/* 仅在未读消息数大于 0 时展示角标。 */}
                {item.id === "notifications" && notificationBadgeCount > 0 ? (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-2 text-xs font-semibold text-white">
                    {notificationBadgeCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
