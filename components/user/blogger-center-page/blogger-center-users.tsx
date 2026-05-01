"use client";

type UserStatus = "active" | "muted";

type UserItem = {
  id: string;
  nickname: string;
  email: string;
  joinedAt: string;
  status: UserStatus;
};

type Props = {
  users: UserItem[];
  activeMenuId: string | null;
  activeMenuPosition: { top: number; left: number } | null;
  onToggleStatus: (userId: string) => void;
  onDelete: (userId: string) => void;
  onMenuOpen: (userId: string, top: number, left: number) => void;
  onMenuClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
};

export function BloggerCenterUsers({
  users,
  activeMenuId,
  activeMenuPosition,
  onToggleStatus,
  onDelete,
  onMenuOpen,
  onMenuClose,
  searchValue,
  onSearchChange,
  page,
  pageSize,
  totalPages,
  onPrevPage,
  onNextPage,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100 md:text-4xl">用户管理</h1>
          <p className="mt-2 text-sm text-zinc-400">管理站点用户的活跃状态与账号记录。</p>
        </div>

        <div className="relative w-full max-w-[320px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-zinc-500">search</span>
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#101215] py-2.5 pl-10 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[#adc6ff]/50"
            placeholder="搜索昵称或邮箱..."
            type="text"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#14161b] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03]">
                <th className="px-6 py-4 text-sm font-medium text-zinc-300">用户昵称</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-300">邮箱</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-300">加入日期</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-300">状态</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-zinc-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {users.length ? (
                users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-100">{user.nickname}</td>
                    <td className="px-6 py-4 text-sm text-zinc-300">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{user.joinedAt}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user.id)}
                        className={`inline-flex h-7 w-16 items-center rounded-full p-1 transition ${user.status === "active" ? "bg-emerald-500/20" : "bg-zinc-700/60"}`}
                        aria-label={`切换 ${user.nickname} 状态`}
                      >
                        <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${user.status === "active" ? "translate-x-8" : "translate-x-0"}`} />
                      </button>
                      <span className="ml-3 text-xs font-medium text-zinc-400">{user.status === "active" ? "活跃" : "禁言"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect();
                            const menuHeight = 64;
                            const menuWidth = 160;
                            const gap = 8;
                            const pad = 12;
                            const openUp = window.innerHeight - rect.bottom < menuHeight + gap;
                            const top = openUp ? Math.max(pad, rect.top - menuHeight - gap) : Math.min(window.innerHeight - menuHeight - pad, rect.bottom + gap);
                            const left = Math.min(window.innerWidth - menuWidth - pad, Math.max(pad, rect.right - menuWidth));
                            onMenuOpen(user.id, top, left);
                          }}
                          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>

                        {activeMenuId === user.id && activeMenuPosition ? (
                          <div className="fixed z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#161922] shadow-2xl" style={{ top: activeMenuPosition.top, left: activeMenuPosition.left }}>
                            <button
                              type="button"
                              onClick={() => {
                                onDelete(user.id);
                                onMenuClose();
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-rose-300 transition hover:bg-rose-500/10"
                            >
                              删除
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="h-[220px]">
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">
                    当前没有用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/8 px-6 py-5 sm:flex-row sm:items-center">
          <div className="text-sm text-zinc-500">
            显示 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, users.length)}，共 {users.length} 位用户
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button type="button" onClick={onPrevPage} className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-zinc-100" disabled={page === 1}>
              上一页
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              const currentPage = index + 1;
              return (
                <button
                  key={currentPage}
                  type="button"
                  onClick={() => onPageChange(currentPage)}
                  className={`rounded-lg border px-3 py-1.5 ${page === currentPage ? "border-[#6e8cff]/30 bg-[#182033] text-[#adc6ff]" : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100"}`}
                >
                  {currentPage}
                </button>
              );
            })}
            {totalPages > 5 ? <span className="px-1 text-zinc-500">...</span> : null}
            {totalPages > 5 ? (
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className={`rounded-lg border px-3 py-1.5 ${page === totalPages ? "border-[#6e8cff]/30 bg-[#182033] text-[#adc6ff]" : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100"}`}
              >
                {totalPages}
              </button>
            ) : null}
            <button type="button" onClick={onNextPage} className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-zinc-100" disabled={page === totalPages}>
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
