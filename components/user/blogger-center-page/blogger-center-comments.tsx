"use client";

type ReviewStatus = "pending" | "approved";
type ReviewAction = "approve" | "delete";

type ReviewItem = {
  id: string;
  articleTitle: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
  status: ReviewStatus;
};

type Props = {
  reviewItems: ReviewItem[];
  reviewFilter: ReviewStatus | "all";
  onFilterChange: (filter: ReviewStatus | "all") => void;
  visibleReviews: ReviewItem[];
  reviewPage: number;
  totalReviewPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  activeMenuTitle: string | null;
  activeMenuPosition: { top: number; left: number } | null;
  onMenuOpen: (id: string, top: number, left: number) => void;
  onMenuClose: () => void;
  onRequestAction: (reviewId: string, action: ReviewAction) => void;
  reviewStatusMeta: Record<ReviewStatus, { label: string; className: string }>;
  reviewActionMap: Record<ReviewStatus, Array<{ label: string; className: string }>>;
};

export function BloggerCenterComments({ reviewItems, reviewFilter, onFilterChange, visibleReviews, reviewPage, totalReviewPages, onPrevPage, onNextPage, onPageChange, activeMenuTitle, activeMenuPosition, onMenuOpen, onMenuClose, onRequestAction, reviewStatusMeta, reviewActionMap }: Props) {
  return (
    <div className="space-y-6 rounded-[28px] border border-slate-300 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">评论管理</h1>
          <p className="mt-2 text-sm text-slate-600">集中管理文章下的用户评论，快速完成通过与删除操作。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ id: "all", label: "全部" }, { id: "pending", label: "待审核" }, { id: "approved", label: "已通过" }].map((item) => (
            <button key={item.id} type="button" onClick={() => onFilterChange(item.id as ReviewStatus | "all")} className={`rounded-full border px-4 py-2 text-sm transition ${reviewFilter === item.id ? "border-slate-400 bg-slate-100 text-slate-900" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-300 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100">
                <th className="border-r border-slate-300 px-6 py-4 text-sm font-semibold text-slate-700">文章标题</th>
                <th className="border-r border-slate-300 px-6 py-4 text-sm font-semibold text-slate-700">评论者</th>
                <th className="border-r border-slate-300 px-6 py-4 text-sm font-semibold text-slate-700">评论内容</th>
                <th className="border-r border-slate-300 px-6 py-4 text-sm font-semibold text-slate-700">评论状态</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleReviews.length ? visibleReviews.map((review, index) => (
                <tr key={review.id} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} transition hover:bg-slate-100`}>
                  <td className="border-r border-slate-200 px-6 py-4"><div className="max-w-[220px] truncate text-sm font-medium text-slate-950">{review.articleTitle}</div></td>
                  <td className="border-r border-slate-200 px-6 py-4 text-sm text-slate-700">{review.author}</td>
                  <td className="border-r border-slate-200 px-6 py-4"><div className="max-h-24 max-w-[420px] overflow-y-auto break-words text-sm leading-7 text-slate-700">{review.content}</div></td>
                  <td className="border-r border-slate-200 px-6 py-4"><span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${reviewStatusMeta[review.status].className}`}>{reviewStatusMeta[review.status].label}</span></td>
                  <td className="px-6 py-4 text-right"><div className="relative inline-flex" data-review-menu><button type="button" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); if (activeMenuTitle === review.id) { onMenuClose(); return; } const menuHeight = review.status === "approved" ? 96 : 132; const menuWidth = 160; const gap = 8; const pad = 12; const openUp = window.innerHeight - rect.bottom < menuHeight + gap; const top = openUp ? Math.max(pad, rect.top - menuHeight - gap) : Math.min(window.innerHeight - menuHeight - pad, rect.bottom + gap); const left = Math.min(window.innerWidth - menuWidth - pad, Math.max(pad, rect.right - menuWidth)); onMenuOpen(review.id, top, left); }} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>{activeMenuTitle === review.id && activeMenuPosition ? (<div className="fixed z-50 w-40 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl" style={{ top: activeMenuPosition.top, left: activeMenuPosition.left }}>{reviewActionMap[review.status].map((action) => (<button key={action.label} type="button" onClick={() => { onRequestAction(review.id, action.label === "通过" ? "approve" : "delete"); onMenuClose(); }} className={`block w-full px-4 py-2 text-left text-sm transition ${action.className}`}>{action.label}</button>))}</div>) : null}</div></td>
                </tr>
              )) : <tr className="h-[220px]"><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">当前筛选条件下没有评论</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
          <div className="text-sm text-slate-500">显示 {(reviewPage - 1) * 6 + 1} - {Math.min(reviewPage * 6, reviewItems.length)}，共 {reviewItems.length} 条评论</div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button type="button" onClick={onPrevPage} className="rounded-lg border border-cyan-100 px-3 py-1.5 text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700" disabled={reviewPage === 1}>上一页</button>
            {Array.from({ length: Math.min(totalReviewPages, 5) }, (_, index) => { const page = index + 1; return (<button key={page} type="button" onClick={() => onPageChange(page)} className={`rounded-lg border px-3 py-1.5 ${reviewPage === page ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-transparent text-slate-500 hover:bg-cyan-50 hover:text-cyan-700"}`}>{page}</button>); })}
            {totalReviewPages > 5 ? <span className="px-1 text-slate-400">...</span> : null}
            {totalReviewPages > 5 ? <button type="button" onClick={() => onPageChange(totalReviewPages)} className={`rounded-lg border px-3 py-1.5 ${reviewPage === totalReviewPages ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-transparent text-slate-500 hover:bg-cyan-50 hover:text-cyan-700"}`}>{totalReviewPages}</button> : null}
            <button type="button" onClick={onNextPage} className="rounded-lg border border-cyan-100 px-3 py-1.5 text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700" disabled={reviewPage === totalReviewPages}>下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
}
