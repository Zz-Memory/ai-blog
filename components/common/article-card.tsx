"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

import { AuthModal } from "@/components/auth/auth-modal";
import { CategoryPill } from "@/components/common/category-pill";
import { TagPill } from "@/components/common/tag-pill";
import { useAuth } from "@/components/common/auth-context";
import { formatChinaDate } from "@/lib/date";

// 文章卡片所展示的统计信息类型。
export type ArticleStats = {
  likes: number;
  comments: number;
  favorites: number;
};

// 文章卡片的入参类型。
export type ArticleCardProps = {
  postId: string;
  title: string;
  date: string;
  category?: string;
  excerpt: string;
  tags: string[];
  stats: ArticleStats;
  href?: string;
  compact?: boolean;
  likesCount?: number;
  bookmarksCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  categorySuffix?: React.ReactNode;
};

// 统计项小组件。
// 这里将图标 + 数值的展示逻辑集中封装，避免在卡片内重复书写。
function Stat({ icon, value, active = false, onClick, ariaLabel }: { icon: string; value: string | number; active?: boolean; onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>; ariaLabel: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex items-center gap-1.5 transition ${active ? "text-[#b8c9ff]" : "text-zinc-400 hover:text-zinc-200"}`}
    >
      <span className="material-symbols-outlined text-[16px] leading-none">{icon}</span>
      <span className="text-sm">{value}</span>
    </button>
  );
}

// 首页中的单篇文章卡片。
// 该卡片保留了“标题、摘要、标签、时间、点赞 / 收藏 / 评论数”这些设计稿中的核心信息。
export function ArticleCard({
  postId,
  title,
  date,
  category,
  excerpt,
  tags,
  stats,
  href = "#",
  compact = false,
  likesCount: initialLikes = stats.likes,
  bookmarksCount: initialBookmarks = stats.favorites,
  categorySuffix,
  commentsCount: initialComments = stats.comments,
  isLiked: initialIsLiked = false,
  isBookmarked: initialIsBookmarked = false,
}: ArticleCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authEntry, setAuthEntry] = useState<"login" | "register">("login");
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [bookmarksCount, setBookmarksCount] = useState(initialBookmarks);
  const [commentsCount] = useState(initialComments);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  const openLogin = () => {
    setAuthEntry("login");
    setAuthOpen(true);
  };

  const requireLogin = (event: React.MouseEvent) => {
    if (user) return true;
    event.preventDefault();
    event.stopPropagation();
    openLogin();
    return false;
  };

  const toggleLike = async (event: React.MouseEvent) => {
    if (!requireLogin(event)) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((value) => Math.max(0, value + (nextLiked ? 1 : -1)));

    try {
      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (!response.ok) throw new Error("点赞失败");
      const data = (await response.json()) as { liked: boolean; likes: number };
      setIsLiked(data.liked);
      setLikesCount(data.likes);
    } catch {
      setIsLiked((value) => !value);
      setLikesCount((value) => Math.max(0, value + (nextLiked ? -1 : 1)));
    }
  };

  const toggleBookmark = async (event: React.MouseEvent) => {
    if (!requireLogin(event)) return;
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    setBookmarksCount((value) => Math.max(0, value + (nextBookmarked ? 1 : -1)));

    try {
      const response = await fetch("/api/posts/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (!response.ok) throw new Error("收藏失败");
      const data = (await response.json()) as { bookmarked: boolean; bookmarks: number };
      setIsBookmarked(data.bookmarked);
      setBookmarksCount(data.bookmarks);
    } catch {
      setIsBookmarked((value) => !value);
      setBookmarksCount((value) => Math.max(0, value + (nextBookmarked ? -1 : 1)));
    }
  };

  const goToComments = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`${href}#comments`);
  };

  return (
    <>
      <article className="group rounded-2xl border border-cyan-100/80 bg-white/82 p-6 shadow-[0_18px_45px_rgba(56,189,248,0.12)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-white">
        <div className={`flex items-start justify-between gap-6 ${compact ? "gap-4" : ""}`}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {category ? <CategoryPill label={category} /> : null}
              {categorySuffix}
            </div>
            <Link href={href} aria-label={`查看文章：${title}`} className={`${compact ? "mt-2 text-2xl" : "mt-3 text-[28px]"} block font-medium tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-cyan-700`}>
              {title}
            </Link>
            <p className={`${compact ? "mt-3 max-w-2xl text-sm leading-6" : "mt-4 max-w-3xl text-[15px] leading-7"} text-slate-600 transition-colors duration-300 group-hover:text-slate-700`}>
              {excerpt}
            </p>
          </div>
          <time className="shrink-0 pt-1 text-sm text-slate-500 transition-colors duration-300 group-hover:text-cyan-700">
            {formatChinaDate(date)}
          </time>
        </div>

        <div className={`mt-5 flex flex-wrap items-center justify-between gap-4 ${compact ? "mt-4" : ""}`}>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Stat icon="favorite" value={likesCount} active={isLiked} onClick={toggleLike} ariaLabel={isLiked ? "取消点赞" : "点赞文章"} />
            <Stat icon="bookmark" value={bookmarksCount} active={isBookmarked} onClick={toggleBookmark} ariaLabel={isBookmarked ? "取消收藏" : "收藏文章"} />
            <Stat icon="chat_bubble" value={commentsCount} onClick={goToComments} ariaLabel="查看文章评论" />
          </div>
        </div>
      </article>

      <AuthModal isOpen={authOpen} initialMode={authEntry} onClose={() => setAuthOpen(false)} />
    </>
  );
}
