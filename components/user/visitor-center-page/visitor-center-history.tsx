import { ArticleCard } from "@/components/blog/article-card";

import type { HistoryArticle } from "./history-articles";

// 浏览历史组件的 props。
// 这里只接收已经处理好的文章列表，避免在展示层里再掺入筛选逻辑。
type VisitorCenterHistoryProps = {
  articles: HistoryArticle[];
};

// 浏览历史列表区域。
// 职责很单一：展示标题、数量和每条历史记录卡片，数据为空时显示空状态。
export function VisitorCenterHistory({ articles }: VisitorCenterHistoryProps) {
  return (
    <div className="space-y-5">
      <div className="relative pl-6">
        {/* 左上角的时间轴圆点，用来强化“历史轨迹”的视觉隐喻。 */}
        <div className="absolute left-0 top-3 h-3 w-3 rounded-full border border-[#6e8cff] bg-[#101215] shadow-[0_0_0_4px_rgba(110,140,255,0.18)]" />
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-zinc-100">浏览历史</h2>
          <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-zinc-500">
            {articles.length} 条记录
          </span>
        </div>

        {/* 这里用左侧竖线串起每条记录，保持和时间轴风格一致。 */}
        <div className="relative border-l border-white/8 pl-6">
          {articles.length ? (
            <div className="space-y-4 pb-4">
              {articles.map((article) => (
                <div key={article.title} className="rounded-[24px] border border-white/8 bg-[#14161b] p-0">
                  {/* 复用统一的文章卡片，避免历史列表和首页卡片在样式上出现分叉。 */}
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
