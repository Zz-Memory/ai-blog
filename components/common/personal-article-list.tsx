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
    <div className="space-y-5 rounded-[28px] border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-400">{description}</p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-zinc-500">{items.length} 篇</span>
      </div>

      <div className="space-y-4">
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <div key={item.postId} className="rounded-[24px] border border-white/8 bg-[#17181d] p-0">
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
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-zinc-500">{emptyText}</div>
        )}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + initialVisibleCount, items.length))}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
          >
            {loadMoreLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
