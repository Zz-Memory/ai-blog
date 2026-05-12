import { ArticleCard } from "@/components/common/article-card";

export type FeaturedPost = {
  postId: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { views: string; likes: number; favorites: number; comments: number };
  href?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
};

// 右侧文章流区域，负责承载首页主内容。
export function HomeArticleList({ posts }: { posts: FeaturedPost[] }) {
  if (!posts.length) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-6 py-12 text-center shadow-sm shadow-sky-100/60">
        <div className="max-w-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600 ring-1 ring-sky-200/70">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.7]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-900">暂无符合要求的文章</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">请尝试调整搜索条件、分类或标签后再查看。</p>
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
