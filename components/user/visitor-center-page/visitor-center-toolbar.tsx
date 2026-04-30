// 浏览记录工具栏的 props。
// 这里包含搜索框状态和“清空记录”动作，是整块区域的核心交互接口。
type VisitorCenterToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  onClearHistoryClick: () => void;
};

// 浏览记录顶部工具栏。
// 它负责承载页面标题、搜索输入和清空按钮，是用户操作历史列表的主要入口。
export function VisitorCenterToolbar({ searchValue, onSearchChange, onSearchSubmit, onClearHistoryClick }: VisitorCenterToolbarProps) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-[#14161b] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:px-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="text-sm tracking-[0.32em] text-zinc-500">个人中心</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">浏览记录</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">你在 Memory 数字空间的近期足迹。</p>
        </div>

        {/* 清空记录是高风险操作，因此通过按钮触发确认弹窗，而不是直接执行。 */}
        <button
          type="button"
          onClick={onClearHistoryClick}
          className="rounded-full border border-rose-400/20 bg-rose-500/10 px-5 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100"
        >
          清空记录
        </button>
      </div>

      {/* 搜索框只负责输入和提交，不直接操纵列表数据。 */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/8 bg-[#101215] px-4 py-3 text-sm text-zinc-500">
        <span className="material-symbols-outlined text-[20px] text-zinc-600">search</span>
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSearchSubmit(searchValue);
            }
          }}
          placeholder="在浏览记录中搜索..."
          className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
        />
      </div>
    </div>
  );
}
