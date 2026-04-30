import { TagPill } from "@/components/blog/tag-pill";

// 文章卡片所展示的统计信息类型。
export type ArticleStats = {
  views: string;
  likes: number;
  comments: number;
};

// 文章卡片的入参类型。
export type ArticleCardProps = {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  stats: ArticleStats;
};

// 统计项小组件。
// 这里将图标 + 数值的展示逻辑集中封装，避免在卡片内重复书写。
function Stat({ icon, value }: { icon: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5 text-zinc-400">
      <span className="material-symbols-outlined text-[16px] leading-none">{icon}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

// 首页中的单篇文章卡片。
// 该卡片保留了“标题、摘要、标签、时间、阅读/点赞/评论数”这些设计稿中的核心信息。
export function ArticleCard({ title, date, excerpt, tags, stats }: ArticleCardProps) {
  return (
    <article className="rounded-2xl border border-white/8 bg-[#17181d] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition duration-300 hover:border-blue-400/20 hover:bg-[#1a1b21]">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-[28px] font-medium tracking-tight text-zinc-100">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-zinc-400">
            {excerpt}
          </p>
        </div>
        <time className="shrink-0 pt-1 text-sm text-zinc-500">{date}</time>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <TagPill key={tag} label={tag} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-6 text-sm">
        <Stat icon="visibility" value={stats.views} />
        <Stat icon="favorite" value={stats.likes} />
        <Stat icon="chat_bubble" value={stats.comments} />
      </div>
    </article>
  );
}
