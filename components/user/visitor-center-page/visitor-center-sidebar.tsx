// 侧边栏单项数据结构：统一管理图标、标题、徽标和激活态。
type VisitorCenterSidebarItem = {
  label: string;
  icon: string;
  badge?: number;
  active?: boolean;
};

// 侧边栏对外暴露的交互回调。
// 这个组件本身不处理业务逻辑，只负责在用户点击时通知父组件。
type VisitorCenterSidebarProps = {
  onLogoutClick: () => void;
  onSettingsClick: () => void;
};

// 侧边栏配置数据：把菜单项抽成常量，便于后续增删和统一维护。
const sidebarItems: VisitorCenterSidebarItem[] = [
  { label: "浏览历史", active: true, icon: "history" },
  { label: "我的点赞", icon: "favorite" },
  { label: "我的收藏", icon: "bookmark" },
  { label: "我的评论", icon: "chat_bubble" },
  { label: "消息通知", icon: "notifications", badge: 3 },
  { label: "账号设置", icon: "settings" },
  { label: "退出登录", icon: "logout" },
];

// 访客中心左侧导航栏。
// 当前版本只保留了视觉和入口能力，真正的页面跳转可在后续接入路由时补上。
export function VisitorCenterSidebar({ onLogoutClick, onSettingsClick }: VisitorCenterSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col">
      {/* 使用 sticky 是为了让侧边栏在滚动内容较长时保持可见。 */}
      <div className="sticky top-24 rounded-3xl border border-white/8 bg-[#14161b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="text-xs tracking-[0.28em] text-zinc-500">访客专栏</div>
        <nav className="mt-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                // 这里仅处理两个“需要父组件参与”的动作，其余菜单项保持占位状态。
                if (item.label === "退出登录") onLogoutClick();
                if (item.label === "账号设置") onSettingsClick();
              }}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${item.active
                ? "border-[#6e8cff]/40 bg-[#182033] text-blue-100 shadow-[inset_0_0_0_1px_rgba(110,140,255,0.12)]"
                : "border-transparent bg-transparent text-zinc-500 hover:border-white/8 hover:bg-white/5 hover:text-zinc-200"
                }`}
            >
              {/* 左侧图标 + 文案，形成统一的菜单入口视觉。 */}
              <span className="flex items-center gap-3 text-sm font-medium">
                <span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>
                {item.label}
              </span>

              {/* 仅在需要提醒时展示角标，比如未读通知。 */}
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
  );
}
