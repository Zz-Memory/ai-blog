"use client";

import { useMemo, useState } from "react";

import { ArticleCard } from "@/components/common/article-card";

import type { LikedArticle } from "./liked-articles";

type VisitorCenterFavoriteProps = {
  articles: LikedArticle[];
};

const INITIAL_VISIBLE_COUNT = 3;

// “我的点赞”功能模块。
// 这里直接复用文章卡片，用户可以快速回看自己点赞过的内容。
export function VisitorCenterFavorite({ articles }: VisitorCenterFavoriteProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const visibleArticles = useMemo(() => articles.slice(0, visibleCount), [articles, visibleCount]);
  const hasMore = visibleCount < articles.length;

  return (
    <div className="space-y-5 rounded-[28px] border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">我的点赞</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-400">这里展示你近期点过赞的文章，方便快速回看和继续阅读。</p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-zinc-500">{articles.length} 篇</span>
      </div>

      <div className="space-y-4">
        {visibleArticles.length ? (
          visibleArticles.map((article) => (
            <div key={article.title} className="rounded-[24px] border border-white/8 bg-[#17181d] p-0">
              <ArticleCard
                href="#"
                compact
                title={article.title}
                date={article.date}
                category={article.category}
                excerpt={article.excerpt}
                tags={article.tags}
                stats={article.stats}
              />
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-zinc-500">
            你还没有点赞过任何文章。
          </div>
        )}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + INITIAL_VISIBLE_COUNT, articles.length))}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
          >
            加载更多
          </button>
        </div>
      ) : null}
    </div>
  );
}
