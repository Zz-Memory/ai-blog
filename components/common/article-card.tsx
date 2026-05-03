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
};

// 统计项小组件。
// 这里将图标 + 数值的展示逻辑集中封装，避免在卡片内重复书写。
function Stat({ icon, value, active = false, onClick, ariaLabel }: { icon: string; value: string | number; active?: boolean; onClick?: () => void; ariaLabel: string }) {
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
}: ArticleCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authEntry, setAuthEntry] = useState<"login" | "register">("login");
  const [likesCount, setLikesCount] = useState(stats.likes);
  const [bookmarksCount, setBookmarksCount] = useState(stats.favorites);
  const [commentsCount] = useState(stats.comments);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
    setLikesCount((value) => value + (nextLiked ? 1 : -1));
    await fetch("/api/posts/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
  };

  const toggleBookmark = async (event: React.MouseEvent) => {
    if (!requireLogin(event)) return;
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    setBookmarksCount((value) => value + (nextBookmarked ? 1 : -1));
    await fetch("/api/posts/bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
  };

  const goToComments = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`${href}#comments`);
  };

  return (
    <>
      <Link
        href={href}
        aria-label={`查看文章：${title}`}
        className="group block rounded-2xl border border-white/8 bg-[#17181d] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition duration-300 hover:border-blue-400/20 hover:bg-[#1a1b21]"
      >
        <article className="transition-transform duration-300 group-hover:-translate-y-0.5">
            <div className={`flex items-start justify-between gap-6 ${compact ? "gap-4" : ""}`}>
            <div className="min-w-0">
              {category ? <CategoryPill label={category} /> : null}
              <h2 className={`${compact ? "mt-2 text-2xl" : "mt-3 text-[28px]"} font-medium tracking-tight text-zinc-100 transition-colors duration-300 group-hover:text-blue-100`}>
                {title}
              </h2>
              <p className={`${compact ? "mt-3 max-w-2xl text-sm leading-6" : "mt-4 max-w-3xl text-[15px] leading-7"} text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300`}>
                {excerpt}
              </p>
            </div>
            <time className="shrink-0 pt-1 text-sm text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
              {formatChinaDate(date)}
            </time>
          </div>

          <div className={`mt-5 flex flex-wrap items-center justify-between gap-4 ${compact ? "mt-4" : ""}`}>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Stat icon="favorite" value={likesCount} active={isLiked} onClick={toggleLike} ariaLabel={isLiked ? "取消点赞" : "点赞文章"} />
              <Stat icon="bookmark" value={bookmarksCount} active={isBookmarked} onClick={toggleBookmark} ariaLabel={isBookmarked ? "取消收藏" : "收藏文章"} />
              <Stat icon="chat_bubble" value={commentsCount} onClick={goToComments} ariaLabel="查看文章评论" />
            </div>
          </div>
        </article>
      </Link>

      <AuthModal isOpen={authOpen} initialMode={authEntry} onClose={() => setAuthOpen(false)} />
    </>
  );
}
