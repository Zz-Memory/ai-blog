// 首页分页区域。
// 当前先使用静态分页样式，后续接入文章数据后可替换为真实页码逻辑。
export function HomePagination() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-[#15161b] px-6 py-8 lg:flex-row lg:justify-center">
      <div className="flex items-center gap-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-[#17181d] text-zinc-400 transition hover:border-white/20 hover:bg-white/5">
          <span className="material-symbols-outlined text-[16px] leading-none">chevron_left</span>
        </button>
        {['1', '2', '3'].map((item, index) => (
          <button
            key={item}
            className={`h-10 w-10 rounded-full border text-sm transition ${
              index === 0
                ? 'border-blue-300/30 bg-[#b8c9ff] text-[#14161b]'
                : 'border-white/8 bg-[#17181d] text-zinc-300 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            {item}
          </button>
        ))}
        <span className="px-2 text-zinc-500">...</span>
        <button className="h-10 w-10 rounded-full border border-white/8 bg-[#17181d] text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
          8
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-[#17181d] text-zinc-400 transition hover:border-white/20 hover:bg-white/5">
          <span className="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <span>前往</span>
        <input
          className="h-10 w-16 rounded-lg border border-white/10 bg-[#111215] px-3 text-center text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-blue-400/40"
          defaultValue={1}
        />
        <span>页</span>
        <button className="rounded-lg border border-white/10 px-4 py-2 text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
          确定
        </button>
      </div>
    </div>
  );
}
