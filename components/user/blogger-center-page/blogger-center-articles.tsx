"use client";

import { CategoryPill } from "@/components/common/category-pill";
import { TagPill } from "@/components/common/tag-pill";

type ArticleStatus = "published" | "draft";

export type ArticleItem = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  updatedAt: string;
  status: ArticleStatus;
  category: string;
};

type Props = {
  activeTab: ArticleStatus;
  onTabChange: (tab: ArticleStatus) => void;
  articleTabs: Array<{ id: ArticleStatus; label: string; count: number }>;
  visibleArticles: ArticleItem[];
  activeArticleMenu: string | null;
  activeArticleMenuPosition: { top: number; left: number } | null;
  onMenuToggle: (title: string, top: number, left: number) => void;
  onMenuClose: () => void;
  onRequestEdit: (article: ArticleItem) => void;
  onRequestDelete: (article: ArticleItem) => void;
  onRequestToggleStatus: (article: ArticleItem) => void;
  publishedArticlesLength: number;
  draftArticlesLength: number;
  articlePage: number;
  articlesPerPage: number;
  totalArticlePages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function BloggerCenterArticles({
  activeTab,
  onTabChange,
  articleTabs,
  visibleArticles,
  activeArticleMenu,
  activeArticleMenuPosition,
  onMenuToggle,
  onMenuClose,
  onRequestEdit,
  onRequestDelete,
  onRequestToggleStatus,
  publishedArticlesLength,
  draftArticlesLength,
  articlePage,
  articlesPerPage,
  totalArticlePages,
  onPrevPage,
  onNextPage,
  onPageChange,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  loading,
  error,
}: Props) {
  return (
    <div className="space-y-6 rounded-[28px] border border-slate-300 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">文章管理</h1>
          <p className="mt-2 text-sm text-slate-600">知识的结晶就在这里</p>
        </div>
        <div className="relative w-full max-w-[320px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">search</span>
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
            placeholder="搜索标题、分类或标签..."
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") onSearchSubmit(); }}
          />
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

      <div className="overflow-hidden rounded-[24px] border border-slate-300 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 bg-slate-100 px-6">
          <div className="flex gap-8">
            {articleTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)} className={`py-4 text-sm font-medium transition ${activeTab === tab.id ? "border-b-2 border-slate-950 text-slate-950" : "text-slate-600 hover:text-slate-950"}`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-sm text-slate-700">
                <th className="w-[35%] border-r border-slate-300 px-6 py-4 font-semibold">文章标题</th>
                <th className="w-[18%] border-r border-slate-300 px-6 py-4 font-semibold">分类</th>
                <th className="w-[22%] border-r border-slate-300 px-6 py-4 font-semibold">标签</th>
                <th className="w-[15%] border-r border-slate-300 px-6 py-4 font-semibold">修改时间</th>
                <th className="w-[10%] px-6 py-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr className="h-[438px]"><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">正在加载文章...</td></tr>
              ) : visibleArticles.length > 0 ? (
                visibleArticles.map((article, index) => (
                  <tr key={article.id} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} transition hover:bg-slate-100`}>
                    <td className="border-r border-slate-200 px-6 py-4 align-top">
                      <div className="mb-0.5 truncate font-medium text-slate-950">{article.title?.trim() ? article.title : "无标题"}</div>
                      <div className="truncate text-xs text-slate-600">{article.excerpt?.trim() ? article.excerpt : "无摘要"}</div>
                    </td>
                    <td className="border-r border-slate-200 px-6 py-4 align-top"><CategoryPill label={article.category} /></td>
                    <td className="border-r border-slate-200 px-6 py-4 align-top"><div className="flex flex-wrap gap-2">{article.tags.map((tag) => <TagPill key={tag} label={tag} />)}</div></td>
                    <td className="border-r border-slate-200 px-6 py-4 align-top text-xs text-slate-700">{article.updatedAt}</td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="relative inline-flex">
                        <button type="button" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const menuHeight = 132; const menuWidth = 160; const gap = 8; const pad = 12; const openUp = window.innerHeight - rect.bottom < menuHeight + gap; const top = openUp ? Math.max(pad, rect.top - menuHeight - gap) : Math.min(window.innerHeight - menuHeight - pad, rect.bottom + gap); const left = Math.min(window.innerWidth - menuWidth - pad, Math.max(pad, rect.right - menuWidth)); onMenuToggle(article.id, top, left); }} className="rounded-lg border border-transparent p-2 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
                        {activeArticleMenu === article.id && activeArticleMenuPosition ? (<div data-article-menu className="fixed z-50 w-40 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl" style={{ top: activeArticleMenuPosition.top, left: activeArticleMenuPosition.left }}>{(article.status === "published" ? ["撤回", "编辑", "删除"] : ["发布", "编辑", "删除"]).map((label) => (<button key={label} type="button" onClick={() => { if (label === "编辑") onRequestEdit(article); if (label === "删除") onRequestDelete(article); if (label === "发布" || label === "撤回") onRequestToggleStatus(article); onMenuClose(); }} className={`block w-full px-4 py-2 text-left text-sm transition ${label === "删除" ? "text-rose-700 hover:bg-rose-50" : label === "发布" ? "text-slate-950 hover:bg-slate-100" : label === "撤回" ? "text-amber-700 hover:bg-amber-50" : "text-slate-700 hover:bg-slate-100"}`}>{label}</button>))}</div>) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="h-[438px]"><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">无文章</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 px-6 py-4 text-xs text-slate-600 sm:flex-row sm:items-center">
          <div>{activeTab === "published" ? `显示 ${(articlePage - 1) * articlesPerPage + 1} - ${Math.min(articlePage * articlesPerPage, publishedArticlesLength)}，共 ${publishedArticlesLength} 篇已发布文章` : `显示 ${(articlePage - 1) * articlesPerPage + 1} - ${Math.min(articlePage * articlesPerPage, draftArticlesLength)}，共 ${draftArticlesLength} 篇草稿文章`}</div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onPrevPage} className="flex h-8 w-8 items-center justify-center rounded border border-transparent text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 disabled:opacity-30" disabled={articlePage === 1}><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            {Array.from({ length: Math.min(totalArticlePages, 5) }, (_, index) => { const page = index + 1; return (<button key={page} type="button" onClick={() => onPageChange(page)} className={`flex h-8 w-8 items-center justify-center rounded border ${articlePage === page ? "border-slate-400 bg-slate-950 font-medium text-white" : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"}`}>{page}</button>); })}
            {totalArticlePages > 5 ? <span className="px-1 text-slate-500">...</span> : null}
            {totalArticlePages > 5 ? (<button type="button" onClick={() => onPageChange(totalArticlePages)} className={`flex h-8 w-8 items-center justify-center rounded border ${articlePage === totalArticlePages ? "border-slate-400 bg-slate-950 font-medium text-white" : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"}`}>{totalArticlePages}</button>) : null}
            <button type="button" onClick={onNextPage} className="flex h-8 w-8 items-center justify-center rounded border border-transparent text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 disabled:opacity-30" disabled={articlePage === totalArticlePages}><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
