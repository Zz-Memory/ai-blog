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
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-cyan-100/80 bg-white/84 px-6 py-8 shadow-[0_18px_45px_rgba(56,189,248,0.12)] lg:flex-row lg:justify-center">
      <div className="flex items-center gap-2">
        <Link aria-disabled={!prevHref} href={prevHref ?? "#"} className={`flex h-10 w-10 items-center justify-center rounded-full border text-cyan-700 transition ${prevHref ? "border-cyan-100 bg-cyan-50 hover:border-cyan-300 hover:bg-cyan-100" : "pointer-events-none border-cyan-100/50 bg-cyan-50/40 opacity-40"}`}>
          <span className="material-symbols-outlined text-[16px] leading-none">chevron_left</span>
        </Link>

        {items.map((item) => (
          <Link key={item.page} href={item.href} className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm transition ${item.isCurrent ? "border-cyan-300 bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-[0_10px_25px_rgba(56,189,248,0.22)]" : "border-cyan-100 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"}`}>
            {item.page}
          </Link>
        ))}

        <span className="px-2 text-slate-500">共 {totalPages} 页 · 当前第 {currentPage} 页</span>

        <Link aria-disabled={!nextHref} href={nextHref ?? "#"} className={`flex h-10 w-10 items-center justify-center rounded-full border text-cyan-700 transition ${nextHref ? "border-cyan-100 bg-cyan-50 hover:border-cyan-300 hover:bg-cyan-100" : "pointer-events-none border-cyan-100/50 bg-cyan-50/40 opacity-40"}`}>
          <span className="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
        </Link>
      </div>
    </div>
  );
}
