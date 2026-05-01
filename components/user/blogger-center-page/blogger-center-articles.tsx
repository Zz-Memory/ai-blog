"use client";

import { CategoryPill } from "@/components/common/category-pill";
import { TagPill } from "@/components/common/tag-pill";

type ArticleStatus = "published" | "draft";

type ArticleItem = {
  title: string;
  excerpt: string;
  tags: string[];
  updatedAt: string;
  status: ArticleStatus;
};

type Props = {
  activeTab: ArticleStatus;
  onTabChange: (tab: ArticleStatus) => void;
  articleTabs: Array<{ id: ArticleStatus; label: string; count: number }>;
  visibleArticles: Array<ArticleItem & { category: string }>;
  activeArticleMenu: string | null;
  activeArticleMenuPosition: { top: number; left: number } | null;
  onMenuOpen: (title: string, top: number, left: number) => void;
  onMenuClose: () => void;
  publishedArticlesLength: number;
  draftArticlesLength: number;
  articlePage: number;
  articlesPerPage: number;
  totalArticlePages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
};

export function BloggerCenterArticles({
  activeTab,
  onTabChange,
  articleTabs,
  visibleArticles,
  activeArticleMenu,
  activeArticleMenuPosition,
  onMenuOpen,
  onMenuClose,
  publishedArticlesLength,
  draftArticlesLength,
  articlePage,
  articlesPerPage,
  totalArticlePages,
  onPrevPage,
  onNextPage,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100 md:text-4xl">文章管理</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">知识的结晶就在这里</p>
        </div>
        <div className="relative w-full max-w-[320px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-zinc-500">search</span>
          <input className="w-full rounded-xl border border-white/10 bg-[#101215] py-2.5 pl-10 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[#adc6ff]/50" placeholder="搜索标题、分类或标签..." type="text" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#14161b] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="border-b border-white/8 bg-white/[0.03] px-6">
          <div className="flex gap-8">
            {articleTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)} className={`py-4 text-sm font-medium transition ${activeTab === tab.id ? "border-b-2 border-[#adc6ff] text-[#adc6ff]" : "text-zinc-500 hover:text-zinc-300"}`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-white/8 text-sm text-zinc-500">
                <th className="w-[35%] px-6 py-4 font-medium">文章标题</th>
                <th className="w-[18%] px-6 py-4 font-medium">分类</th>
                <th className="w-[22%] px-6 py-4 font-medium">标签</th>
                <th className="w-[15%] px-6 py-4 font-medium">修改时间</th>
                <th className="w-[10%] px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {visibleArticles.length > 0 ? (
                visibleArticles.map((article) => (
                  <tr key={article.title} className="group h-[73px] transition hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="mb-0.5 truncate font-medium text-white">{article.title}</div>
                      <div className="truncate text-xs text-zinc-500">{article.excerpt}</div>
                    </td>
                    <td className="px-6 py-4"><CategoryPill label={article.category} /></td>
                    <td className="px-6 py-4"><div className="flex flex-wrap gap-2">{article.tags.map((tag) => <TagPill key={tag} label={tag} />)}</div></td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{article.updatedAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex">
                        <button type="button" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const menuHeight = 132; const menuWidth = 160; const gap = 8; const pad = 12; const openUp = window.innerHeight - rect.bottom < menuHeight + gap; const top = openUp ? Math.max(pad, rect.top - menuHeight - gap) : Math.min(window.innerHeight - menuHeight - pad, rect.bottom + gap); const left = Math.min(window.innerWidth - menuWidth - pad, Math.max(pad, rect.right - menuWidth)); onMenuOpen(article.title, top, left); }} className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
                        {activeArticleMenu === article.title && activeArticleMenuPosition ? (<div className="fixed z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#161922] shadow-2xl" style={{ top: activeArticleMenuPosition.top, left: activeArticleMenuPosition.left }}>{(article.status === "published" ? ["撤回", "编辑", "删除"] : ["发布", "编辑", "删除"]).map((label) => (<button key={label} type="button" onClick={onMenuClose} className={`block w-full px-4 py-2 text-left text-sm transition ${label === "删除" ? "text-rose-300 hover:bg-rose-500/10" : label === "发布" ? "text-[#adc6ff] hover:bg-[#adc6ff]/10" : "text-zinc-100 hover:bg-white/8"}`}>{label}</button>))}</div>) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="h-[438px]"><td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">无文章</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/8 px-6 py-4 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <div>{activeTab === "published" ? `显示 ${(articlePage - 1) * articlesPerPage + 1} - ${Math.min(articlePage * articlesPerPage, publishedArticlesLength)}，共 ${publishedArticlesLength} 篇已发布文章` : `显示 ${(articlePage - 1) * articlesPerPage + 1} - ${Math.min(articlePage * articlesPerPage, draftArticlesLength)}，共 ${draftArticlesLength} 篇草稿文章`}</div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onPrevPage} className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/5 disabled:opacity-30" disabled={articlePage === 1}><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            {Array.from({ length: Math.min(totalArticlePages, 5) }, (_, index) => { const page = index + 1; return (<button key={page} type="button" onClick={() => onPageChange(page)} className={`flex h-8 w-8 items-center justify-center rounded ${articlePage === page ? "border border-[#adc6ff]/20 bg-[#182033] font-medium text-[#adc6ff]" : "hover:bg-white/5"}`}>{page}</button>); })}
            {totalArticlePages > 5 ? <span className="px-1">...</span> : null}
            {totalArticlePages > 5 ? (<button type="button" onClick={() => onPageChange(totalArticlePages)} className={`flex h-8 w-8 items-center justify-center rounded ${articlePage === totalArticlePages ? "border border-[#adc6ff]/20 bg-[#182033] font-medium text-[#adc6ff]" : "hover:bg-white/5"}`}>{totalArticlePages}</button>) : null}
            <button type="button" onClick={onNextPage} className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/5 disabled:opacity-30" disabled={articlePage === totalArticlePages}><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
