import Link from "next/link";

export type PaginationItem = { page: number; isCurrent?: boolean; href: string };

type HomePaginationProps = {
  currentPage: number;
  totalPages: number;
  items: PaginationItem[];
  prevHref?: string;
  nextHref?: string;
};

export function HomePagination({ currentPage, totalPages, items, prevHref, nextHref }: HomePaginationProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-[#15161b] px-6 py-8 lg:flex-row lg:justify-center">
      <div className="flex items-center gap-2">
        <Link aria-disabled={!prevHref} href={prevHref ?? "#"} className={`flex h-10 w-10 items-center justify-center rounded-full border text-zinc-400 transition ${prevHref ? "border-white/8 bg-[#17181d] hover:border-white/20 hover:bg-white/5" : "pointer-events-none border-white/5 bg-white/3 opacity-40"}`}>
          <span className="material-symbols-outlined text-[16px] leading-none">chevron_left</span>
        </Link>

        {items.map((item) => (
          <Link key={item.page} href={item.href} className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm transition ${item.isCurrent ? "border-blue-300/30 bg-[#b8c9ff] text-[#14161b]" : "border-white/8 bg-[#17181d] text-zinc-300 hover:border-white/20 hover:bg-white/5"}`}>
            {item.page}
          </Link>
        ))}

        <span className="px-2 text-zinc-500">共 {totalPages} 页 · 当前第 {currentPage} 页</span>

        <Link aria-disabled={!nextHref} href={nextHref ?? "#"} className={`flex h-10 w-10 items-center justify-center rounded-full border text-zinc-400 transition ${nextHref ? "border-white/8 bg-[#17181d] hover:border-white/20 hover:bg-white/5" : "pointer-events-none border-white/5 bg-white/3 opacity-40"}`}>
          <span className="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
        </Link>
      </div>
    </div>
  );
}
