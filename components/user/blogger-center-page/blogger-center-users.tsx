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
  onToggleStatus: (userId: string) => void;
  onRequestDelete: (userId: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
};

export function BloggerCenterUsers({
  users,
  onToggleStatus,
  onRequestDelete,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  page,
  pageSize,
  totalPages,
  onPrevPage,
  onNextPage,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-6 rounded-[28px] border border-slate-300 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">用户管理</h1>
          <p className="mt-2 text-sm text-slate-600">管理站点用户的活跃状态与账号记录。</p>
        </div>

        <div className="relative w-full max-w-[320px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">search</span>
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearchSubmit();
              }
            }}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
            placeholder="搜索昵称或邮箱..."
            type="text"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-300 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100">
                <th className="border-r border-slate-300 px-6 py-4 text-sm font-semibold text-slate-700">用户昵称</th>
                <th className="border-r border-slate-300 px-6 py-4 text-sm font-semibold text-slate-700">邮箱</th>
                <th className="border-r border-slate-300 px-6 py-4 text-sm font-semibold text-slate-700">加入日期</th>
                <th className="border-r border-slate-300 px-6 py-4 text-sm font-semibold text-slate-700">状态</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length ? (
                users.map((user, index) => (
                  <tr key={user.id} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} transition hover:bg-slate-100`}>
                    <td className="border-r border-slate-200 px-6 py-4 text-sm font-medium text-slate-950">{user.nickname}</td>
                    <td className="border-r border-slate-200 px-6 py-4 text-sm text-slate-700">{user.email}</td>
                    <td className="border-r border-slate-200 px-6 py-4 text-sm text-slate-700">{user.joinedAt}</td>
                    <td className="border-r border-slate-200 px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user.id)}
                        className={`inline-flex h-7 w-16 items-center rounded-full border p-1 transition ${user.status === "active" ? "border-emerald-500/40 bg-emerald-100" : "border-slate-300 bg-slate-200"}`}
                        aria-label={`切换 ${user.nickname} 状态`}
                      >
                        <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${user.status === "active" ? "translate-x-8" : "translate-x-0"}`} />
                      </button>
                      <span className="ml-3 text-xs font-medium text-slate-700">{user.status === "active" ? "活跃" : "禁言"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onRequestDelete(user.id)}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-700 transition hover:bg-rose-50"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="h-[220px]">
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    当前没有用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
          <div className="text-sm text-slate-500">
            显示 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, users.length)}，共 {users.length} 位用户
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button type="button" onClick={onPrevPage} className="rounded-lg border border-cyan-100 px-3 py-1.5 text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700" disabled={page === 1}>
              上一页
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              const currentPage = index + 1;
              return (
                <button
                  key={currentPage}
                  type="button"
                  onClick={() => onPageChange(currentPage)}
                  className={`rounded-lg border px-3 py-1.5 ${page === currentPage ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-transparent text-slate-500 hover:bg-cyan-50 hover:text-cyan-700"}`}
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
                className={`rounded-lg border px-3 py-1.5 ${page === totalPages ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-transparent text-slate-500 hover:bg-cyan-50 hover:text-cyan-700"}`}
              >
                {totalPages}
              </button>
            ) : null}
            <button type="button" onClick={onNextPage} className="rounded-lg border border-cyan-100 px-3 py-1.5 text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700" disabled={page === totalPages}>
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
