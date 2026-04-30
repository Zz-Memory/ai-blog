import { ArticleCard } from "@/components/common/article-card";

import type { LikedArticle } from "./liked-articles";

type VisitorCenterLikedProps = {
  articles: LikedArticle[];
};

// “我的点赞”模块：展示当前用户点赞过的文章列表。
// 该区域与“浏览历史”相互独立，后续可以接入真实接口或点赞态同步逻辑。
export function VisitorCenterLiked({ articles }: VisitorCenterLikedProps) {
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
        {articles.length ? (
          articles.map((article) => (
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
            你还没有喜欢过任何文章。
          </div>
        )}
      </div>
    </div>
  );
}
