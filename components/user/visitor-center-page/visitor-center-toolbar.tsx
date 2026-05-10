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
    <div className="rounded-[28px] border border-cyan-100/80 bg-white/84 px-6 py-7 shadow-[0_18px_45px_rgba(56,189,248,0.12)] backdrop-blur-sm sm:px-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="text-sm tracking-[0.32em] text-cyan-700">个人中心</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">浏览记录</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">你在 Memory 数字空间的近期足迹。</p>
        </div>

        {/* 清空记录是高风险操作，因此通过按钮触发确认弹窗，而不是直接执行。 */}
        <button
          type="button"
          onClick={onClearHistoryClick}
          className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700"
        >
          清空记录
        </button>
      </div>

      {/* 搜索框只负责输入和提交，不直接操纵列表数据。 */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm text-slate-500">
        <span className="material-symbols-outlined text-[20px] text-cyan-600">search</span>
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
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
