"use client";

import { useMemo, useRef, useState } from "react";

import { AuthModal } from "@/components/auth/auth-modal";
import { CategoryPill } from "@/components/common/category-pill";
import { useAuth } from "@/components/common/auth-context";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { TagPill } from "@/components/common/tag-pill";
import { formatChinaDate, formatChinaDateTime } from "@/lib/date";

type AuthEntry = "login" | "register";

type ArticleTag = {
  id: string;
  label: string;
};

type ArticleAuthor = {
  username: string;
  intro: string | null;
  avatarUrl: string;
};

type ArticleDetailPageProps = {
  article: {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    contentHtml: string;
    publishedAt: string | null;
    category: string | null;
    author: ArticleAuthor;
    tags: ArticleTag[];
  };
  engagement: {
    likes: number;
    bookmarks: number;
    comments: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
  comments: CommentNode[];
};

type CommentNode = {
  id: string;
  author: string;
  avatarText: string;
  avatarUrl: string;
  time: string;
  content: string;
  likes: number;
  replies?: Array<{
    id: string;
    author: string;
    avatarText: string;
    avatarUrl: string;
    time: string;
    content: string;
    likes: number;
    replyTo: string;
  }>;
};

type CurrentUserView = {
  name: string;
  role: "visitor" | "blogger";
  avatarUrl: string;
  avatarLabel: string;
};

export function ArticleDetailPage({ article, engagement, comments }: ArticleDetailPageProps) {
  const [searchInput, setSearchInput] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authEntry, setAuthEntry] = useState<AuthEntry>("login");
  const [commentDraft, setCommentDraft] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [likesCount, setLikesCount] = useState(engagement.likes);
  const [bookmarksCount, setBookmarksCount] = useState(engagement.bookmarks);
  const [isLiked, setIsLiked] = useState(engagement.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(engagement.isBookmarked);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const commentsRef = useRef<HTMLElement | null>(null);
  const { user } = useAuth();

  const currentUser: CurrentUserView | null = user
    ? {
      name: user.username,
      role: user.role === "BLOGGER" ? "blogger" : "visitor",
      avatarUrl: user.role === "BLOGGER" ? "/avatars/blogger-default.png" : "/avatars/visitor-default.png",
      avatarLabel: user.role === "BLOGGER" ? "博主头像" : "访客头像",
    }
    : null;

  const readingStats = useMemo(
    () => ({
      likes: likesCount,
      bookmarks: bookmarksCount,
      comments: engagement.comments,
    }),
    [bookmarksCount, engagement.comments, likesCount]
  );

  const [actionError, setActionError] = useState<string | null>(null);

  const publishedLabel = article.publishedAt ? formatChinaDate(article.publishedAt) : "待发布";

  const articleCategory = article.category ?? "文章";
  const articleTags = article.tags.length ? article.tags : [{ id: "default-tag", label: "AI博客" }];

  const openLogin = () => {
    setAuthEntry("login");
    setAuthOpen(true);
  };

  const openRegister = () => {
    setAuthEntry("register");
    setAuthOpen(true);
  };

  const requireLogin = () => {
    if (user) return true;
    openLogin();
    return false;
  };

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shareArticle = async () => {
    const url = `${window.location.origin}/article/${article.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    window.setTimeout(() => setCopiedUrl(false), 2000);
  };

  const toggleLike = async () => {
    if (!requireLogin()) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((value) => Math.max(0, value + (nextLiked ? 1 : -1)));

    try {
      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: article.id }),
      });
      if (!response.ok) throw new Error("点赞失败");
      const data = (await response.json()) as { liked: boolean; likes: number };
      setIsLiked(data.liked);
      setLikesCount(data.likes);
      setActionError(null);
    } catch {
      setIsLiked((value) => !value);
      setLikesCount((value) => Math.max(0, value + (nextLiked ? -1 : 1)));
      setActionError("点赞失败，请稍后重试。");
    }
  };

  const toggleBookmark = async () => {
    if (!requireLogin()) return;
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    setBookmarksCount((value) => Math.max(0, value + (nextBookmarked ? 1 : -1)));

    try {
      const response = await fetch("/api/posts/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: article.id }),
      });
      if (!response.ok) throw new Error("收藏失败");
      const data = (await response.json()) as { bookmarked: boolean; bookmarks: number };
      setIsBookmarked(data.bookmarked);
      setBookmarksCount(data.bookmarks);
      setActionError(null);
    } catch {
      setIsBookmarked((value) => !value);
      setBookmarksCount((value) => Math.max(0, value + (nextBookmarked ? -1 : 1)));
      setActionError("收藏失败，请稍后重试。");
    }
  };

  const toggleCommentLike = (id: string) => {
    if (!requireLogin()) return;
    setLikedComments((current) => ({ ...current, [id]: !current[id] }));
  };

  const handleReplyClick = () => {
    if (!requireLogin()) return;
  };

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={() => undefined}
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        isAuthenticated={Boolean(user)}
      />

      <main className="relative mx-auto min-h-[calc(100vh-64px)] max-w-[1600px] px-6 py-10 lg:px-10">
        <article className="mx-auto w-full max-w-[840px]">
          <header className="max-w-[840px]">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <CategoryPill label={articleCategory} />
              <span>发布于 {publishedLabel}</span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl lg:text-[52px]">{article.title}</h1>
            <div className="mt-6 border-t border-white/8 pt-6">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 overflow-hidden rounded-full border border-amber-400/20 shadow-[0_0_0_4px_rgba(255,255,255,0.02)]">
                  <img src={article.author.avatarUrl} alt="作者头像" className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-100">{article.author.username}</div>
                  <div className="text-sm text-zinc-500">{article.author.intro ?? "独立开发者 & AI 探索者"}</div>
                </div>
              </div>
            </div>
          </header>

          {article.summary ? <p className="mt-8 max-w-[840px] text-[15px] leading-8 text-zinc-400">{article.summary}</p> : null}

          <div
            className="article-content mt-8 max-w-[840px] space-y-8 text-[15px] leading-8 text-zinc-300"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />



          {actionError ? <p className="mt-6 text-sm text-rose-400">{actionError}</p> : null}

          <div className="mt-10 flex flex-wrap gap-3 border-t border-white/8 pt-6 max-w-[840px]">
            {articleTags.map((tag) => (
              <TagPill key={tag.id} label={tag.label} />
            ))}
          </div>

          <section ref={commentsRef} id="comments" className="mt-12 max-w-[840px] scroll-mt-24">
            <h3 className="text-2xl font-semibold text-zinc-50">评论 ({readingStats.comments})</h3>
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/3 p-5 backdrop-blur-xl">
              {currentUser ? (
                <div className="flex gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                    <img src={currentUser.avatarUrl} alt={currentUser.avatarLabel} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
                      <span className="font-medium text-zinc-200">{currentUser.name}</span>
                      <span>以{currentUser.role === "blogger" ? "博主" : "访客"}身份发表评论</span>
                    </div>
                    <textarea
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      rows={4}
                      placeholder="分享你的想法..."
                      className="w-full resize-none rounded-xl border border-white/8 bg-[#181a20] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-[#7aa2ff]/50 focus:ring-1 focus:ring-[#7aa2ff]/20"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        disabled={!commentDraft.trim()}
                        className="rounded-lg bg-[#7aa2ff] px-4 py-2 text-sm font-medium text-[#10131a] transition hover:bg-[#8db1ff] disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-400"
                      >
                        发布评论
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-xl border border-dashed border-white/10 bg-[#181a20] px-5 py-6 text-sm text-zinc-400">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                    <img src="/avatars/visitor-default.png" alt="访客头像" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-zinc-300">登录后可发表评论</p>
                    <p className="mt-1 text-xs text-zinc-500">登录后即可使用评论发送功能，与作者和其他读者交流。</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                      <img src={comment.avatarUrl} alt={comment.author} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm"><span className="font-medium text-zinc-100">{comment.author}</span><span className="text-xs text-zinc-500">{formatChinaDateTime(comment.time)}</span></div>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">{comment.content}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                        <button
                          type="button"
                          onClick={() => toggleCommentLike(comment.id)}
                          className={`flex items-center gap-1 transition ${likedComments[comment.id] ? "text-[#b8c9ff]" : "hover:text-[#b8c9ff]"}`}
                          aria-label={likedComments[comment.id] ? "取消点赞评论" : "点赞评论"}
                        >
                          <span className="material-symbols-outlined text-[16px]">{likedComments[comment.id] ? "thumb_up" : "thumb_up_off_alt"}</span>
                          {comment.likes + (likedComments[comment.id] ? 1 : 0)}
                        </button>
                        <button type="button" onClick={handleReplyClick} className="flex items-center gap-1 transition hover:text-zinc-300" aria-label="回复评论"><span className="material-symbols-outlined text-[16px]">reply</span>回复</button>
                      </div>
                    </div>
                  </div>
                  {comment.replies?.length ? (
                    <div className="ml-14 space-y-4 border-l border-white/8 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-4 rounded-xl bg-white/3 p-4">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                            <img src={reply.avatarUrl} alt={reply.author} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-medium text-zinc-100">{reply.author}</span><span className="text-xs text-zinc-500">回复 {reply.replyTo}</span><span className="text-xs text-zinc-500">{formatChinaDateTime(reply.time)}</span></div>
                            <p className="mt-2 text-sm leading-7 text-zinc-400">{reply.content}</p>
                            <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                              <button
                                type="button"
                                onClick={() => toggleCommentLike(reply.id)}
                                className={`flex items-center gap-1 transition ${likedComments[reply.id] ? "text-[#b8c9ff]" : "hover:text-[#b8c9ff]"}`}
                                aria-label={likedComments[reply.id] ? "取消点赞回复" : "点赞回复"}
                              >
                                <span className="material-symbols-outlined text-[16px]">{likedComments[reply.id] ? "thumb_up" : "thumb_up_off_alt"}</span>
                                {reply.likes + (likedComments[reply.id] ? 1 : 0)}
                              </button>
                              <button type="button" onClick={handleReplyClick} className="flex items-center gap-1 transition hover:text-zinc-300" aria-label="回复回复"><span className="material-symbols-outlined text-[16px]">reply</span>回复</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="pointer-events-none fixed left-6 top-1/2 z-20 hidden -translate-y-1/2 lg:block xl:left-[max(24px,calc((100vw-1600px)/2+24px))]">
          <div className="pointer-events-auto flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-white/3 px-3 py-4 backdrop-blur-xl">
            <button
              type="button"
              onClick={toggleLike}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition ${isLiked ? "border border-[#7aa2ff]/40 bg-[#7aa2ff]/15 text-[#b8c9ff] shadow-[0_0_18px_rgba(122,162,255,0.22)]" : "text-zinc-400 hover:bg-white/5 hover:text-[#b8c9ff]"
                }`}
              aria-label={isLiked ? "取消点赞" : "点赞文章"}
            >
              <span className="material-symbols-outlined text-[24px]">{isLiked ? "favorite" : "favorite_border"}</span>
              <span className={`absolute right-0 top-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${isLiked ? "border-[#7aa2ff]/30 bg-[#7aa2ff] text-[#10131a]" : "border-white/10 bg-[#1e2026] text-zinc-100"}`}>
                {readingStats.likes}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleBookmark}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition ${isBookmarked ? "border border-[#7aa2ff]/40 bg-[#7aa2ff]/15 text-[#b8c9ff] shadow-[0_0_18px_rgba(122,162,255,0.22)]" : "text-zinc-400 hover:bg-white/5 hover:text-[#b8c9ff]"
                }`}
              aria-label={isBookmarked ? "取消收藏" : "收藏文章"}
            >
              <span className="material-symbols-outlined text-[24px]">{isBookmarked ? "bookmark" : "bookmark_border"}</span>
              <span className={`absolute right-0 top-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${isBookmarked ? "border-[#7aa2ff]/30 bg-[#7aa2ff] text-[#10131a]" : "border-white/10 bg-[#1e2026] text-zinc-100"}`}>
                {readingStats.bookmarks}
              </span>
            </button>
            <button type="button" onClick={scrollToComments} className="relative flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="定位到评论区">
              <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
              <span className="absolute right-0 top-0 rounded-full border border-white/10 bg-[#1e2026] px-1.5 py-0.5 text-[10px] font-semibold text-zinc-100">{readingStats.comments}</span>
            </button>
            <button type="button" onClick={shareArticle} className="relative flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="分享文章">
              <span className="material-symbols-outlined text-[24px]">share</span>
              {copiedUrl ? <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#10131a] px-3 py-1 text-xs text-zinc-100 shadow-lg">已复制网址</span> : null}
            </button>
          </div>
        </aside>

        <div className="hidden md:block">
          <div className="fixed bottom-24 right-6 z-50 xl:right-[max(24px,calc((100vw-1600px)/2+24px))]">
            <button
              type="button"
              onClick={() => {
                if (!requireLogin()) return;
                setChatOpen((value) => !value);
              }}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-primary-container/50 bg-surface-container-high shadow-[0_0_20px_rgba(75,142,255,0.15)] transition hover:shadow-[0_0_30px_rgba(75,142,255,0.3)]"
              aria-label="打开 AI 问答"
            >
              <div className="absolute inset-0 rounded-full bg-primary-container/20 opacity-20 animate-ping" />
              <span className="material-symbols-outlined relative z-10 text-primary-container transition group-hover:scale-110 text-[20px]">smart_toy</span>
            </button>
          </div>
        </div>

        {chatOpen ? (
          <section className="fixed bottom-40 right-6 z-40 w-[760px] max-w-[92vw] rounded-2xl border border-white/8 bg-[#181a20] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] xl:right-[max(24px,calc((100vw-1600px)/2+24px))]">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-primary">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">小智 AI 助手</h4>
                  <p className="text-xs text-zinc-500">全栈开发与AI研究导师</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChatQuestion("")}
                  className="rounded-full p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
                  aria-label="清空对话"
                  title="清空对话"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChatQuestion((value) => value.trim())}
                  className="rounded-full p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
                  aria-label="刷新对话"
                  title="刷新对话"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex justify-end gap-3">
                <div className="rounded-2xl rounded-tr-sm border border-white/8 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                  帮我总结一下这篇文章的核心观点。
                </div>
                <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                  <img src={currentUser?.avatarUrl ?? "/avatars/visitor-default.png"} alt={currentUser?.avatarLabel ?? "访客头像"} className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="flex justify-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-primary">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/8 bg-[#101215] px-4 py-3 text-sm leading-7 text-zinc-300">
                  <p>本文主要探讨了传统 RAG 架构的局限性，并介绍了微软提出的 GraphRAG 作为下一代上下文感知系统的构建范式。</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/8 bg-surface-container px-4 py-3">
              <input
                value={chatQuestion}
                onChange={(event) => setChatQuestion(event.target.value)}
                placeholder="向小智提问关于本文的任何问题..."
                className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
              />
              <button type="button" className="rounded-xl p-2 text-zinc-400 transition hover:bg-primary/10 hover:text-primary">
                <span className="material-symbols-outlined text-[24px]">send</span>
              </button>
            </div>
          </section>
        ) : null}

      </main>

      <SiteFooter />
      <AuthModal isOpen={authOpen} initialMode={authEntry} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
