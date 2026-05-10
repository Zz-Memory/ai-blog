"use client";

import { useEffect, useMemo, useState } from "react";

import { ArticleCard } from "@/components/common/article-card";

export type PersonalArticleListItem = {
  postId: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { likes: number; favorites: number; comments: number };
  href: string;
  isLiked: boolean;
  isBookmarked: boolean;
};

type PersonalArticleListProps = {
  title: string;
  description: string;
  emptyText: string;
  items: PersonalArticleListItem[];
  initialVisibleCount?: number;
  loadMoreLabel?: string;
};

export function PersonalArticleList({
  title,
  description,
  emptyText,
  items,
  initialVisibleCount = 3,
  loadMoreLabel = "点击加载更多",
}: PersonalArticleListProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  useEffect(() => {
    setVisibleCount(initialVisibleCount);
  }, [items, initialVisibleCount]);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  return (
    <div className="space-y-5 rounded-[28px] border border-cyan-100/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(56,189,248,0.12)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        </div>
        <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs text-slate-600">{items.length} 篇</span>
      </div>

      <div className="space-y-4">
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <div key={item.postId} className="rounded-[24px] border border-cyan-100 bg-cyan-50/50 p-0">
              <ArticleCard
                href={item.href}
                compact
                postId={item.postId}
                title={item.title}
                date={item.date}
                category={item.category}
                excerpt={item.excerpt}
                tags={item.tags}
                stats={item.stats}
                isLiked={item.isLiked}
                isBookmarked={item.isBookmarked}
              />
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-cyan-100 bg-cyan-50/50 px-6 py-12 text-center text-sm text-slate-500">{emptyText}</div>
        )}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + initialVisibleCount, items.length))}
            className="rounded-full border border-cyan-100 bg-white px-5 py-2.5 text-sm font-medium text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            {loadMoreLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
