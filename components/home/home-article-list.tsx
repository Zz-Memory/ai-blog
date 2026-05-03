import { ArticleCard } from "@/components/common/article-card";

export type FeaturedPost = {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { views: string; likes: number; favorites: number; comments: number };
  href?: string;
};

// 右侧文章流区域，负责承载首页主内容。
export function HomeArticleList({ posts }: { posts: FeaturedPost[] }) {
  if (!posts.length) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#15161b] px-6 py-12 text-center">
        <div>
          <p className="text-lg font-medium text-zinc-100">暂无符合要求的文章</p>
          <p className="mt-2 text-sm text-zinc-500">请尝试调整搜索条件、分类或标签后再查看。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {posts.map((post) => (
        <ArticleCard key={post.href ?? post.title} {...post} />
      ))}
    </div>
  );
}
