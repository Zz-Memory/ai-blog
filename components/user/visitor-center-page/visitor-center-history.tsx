"use client";

import { useMemo } from "react";

import { formatChinaDateTime } from "@/lib/date";
import { ArticleCard } from "@/components/common/article-card";

export type HistoryArticle = {
  id: string;
  title: string;
  visitedAt: string;
  href: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { likes: number; favorites: number; comments: number };
};

type VisitorCenterHistoryProps = {
  articles: HistoryArticle[];
  visibleCount?: number;
};

export function VisitorCenterHistory({ articles, visibleCount }: VisitorCenterHistoryProps) {
  const sortedArticles = useMemo(() => [...articles].sort((left, right) => new Date(right.visitedAt).getTime() - new Date(left.visitedAt).getTime()), [articles]);
  const displayedArticles = typeof visibleCount === "number" ? sortedArticles.slice(0, visibleCount) : sortedArticles;

  return (
    <div className="space-y-5">
      <div className="relative pl-6">
        <div className="absolute left-0 top-3 h-3 w-3 rounded-full border border-[#6e8cff] bg-[#101215] shadow-[0_0_0_4px_rgba(110,140,255,0.18)]" />
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-zinc-100">浏览历史</h2>
          <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-zinc-500">{sortedArticles.length} 条记录</span>
        </div>

        <div className="relative border-l border-white/8 pl-6">
          {displayedArticles.length ? (
            <div className="space-y-4 pb-4">
              {displayedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  postId={article.id}
                  title={article.title}
                  date={article.visitedAt}
                  category={article.category}
                  excerpt={article.excerpt}
                  tags={article.tags}
                  stats={article.stats}
                  href={article.href}
                  compact={false}
                  categorySuffix={
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#101215]/90 px-2.5 py-1 text-[11px] text-zinc-400 backdrop-blur">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{formatChinaDateTime(article.visitedAt)}</span>
                    </span>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-zinc-500">
              当前没有浏览记录。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
