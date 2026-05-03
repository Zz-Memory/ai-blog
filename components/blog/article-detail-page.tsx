"use client";

import { useMemo, useState } from "react";

import { AuthModal } from "@/components/auth/auth-modal";
import { CategoryPill } from "@/components/common/category-pill";
import { useAuth } from "@/components/common/auth-context";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { TagPill } from "@/components/common/tag-pill";

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
  };
  comments: CommentNode[];
};

type CommentNode = {
  id: string;
  author: string;
  avatarText: string;
  time: string;
  content: string;
  likes: number;
  replies?: Array<{
    id: string;
    author: string;
    avatarText: string;
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
      likes: engagement.likes,
      bookmarks: engagement.bookmarks,
      comments: engagement.comments,
    }),
    [engagement.bookmarks, engagement.comments, engagement.likes]
  );

  const publishedLabel = article.publishedAt
    ? new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(article.publishedAt))
    : "待发布";

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



          <div className="mt-10 flex flex-wrap gap-3 border-t border-white/8 pt-6 max-w-[840px]">
            {articleTags.map((tag) => (
              <TagPill key={tag.id} label={tag.label} />
            ))}
          </div>

          <section className="mt-12 max-w-[840px]">
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
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-sm font-semibold text-zinc-200"><div className="flex h-full w-full items-center justify-center">{comment.avatarText}</div></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm"><span className="font-medium text-zinc-100">{comment.author}</span><span className="text-xs text-zinc-500">{comment.time}</span></div>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">{comment.content}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                        <button className="flex items-center gap-1 transition hover:text-[#b8c9ff]"><span className="material-symbols-outlined text-[16px]">thumb_up</span>{comment.likes}</button>
                        <button className="flex items-center gap-1 transition hover:text-zinc-300"><span className="material-symbols-outlined text-[16px]">reply</span>回复</button>
                      </div>
                    </div>
                  </div>
                  {comment.replies?.length ? (
                    <div className="ml-14 space-y-4 border-l border-white/8 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-4 rounded-xl bg-white/3 p-4">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-sm font-semibold text-zinc-200"><div className="flex h-full w-full items-center justify-center">{reply.avatarText}</div></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-medium text-zinc-100">{reply.author}</span><span className="text-xs text-zinc-500">回复 {reply.replyTo}</span><span className="text-xs text-zinc-500">{reply.time}</span></div>
                            <p className="mt-2 text-sm leading-7 text-zinc-400">{reply.content}</p>
                            <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                              <button className="flex items-center gap-1 transition hover:text-[#b8c9ff]"><span className="material-symbols-outlined text-[16px]">thumb_up</span>{reply.likes}</button>
                              <button className="flex items-center gap-1 transition hover:text-zinc-300"><span className="material-symbols-outlined text-[16px]">reply</span>回复</button>
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
            <button className="relative flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="点赞文章">
              <span className="material-symbols-outlined text-[24px]">favorite</span>
              <span className="absolute right-0 top-0 rounded-full border border-white/10 bg-[#1e2026] px-1.5 py-0.5 text-[10px] font-semibold text-zinc-100">{readingStats.likes}</span>
            </button>
            <button className="relative flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="收藏文章">
              <span className="material-symbols-outlined text-[24px]">bookmark</span>
              <span className="absolute right-0 top-0 rounded-full border border-white/10 bg-[#1e2026] px-1.5 py-0.5 text-[10px] font-semibold text-zinc-100">{readingStats.bookmarks}</span>
            </button>
            <button className="relative flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="评论文章">
              <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
              <span className="absolute right-0 top-0 rounded-full border border-white/10 bg-[#1e2026] px-1.5 py-0.5 text-[10px] font-semibold text-zinc-100">{readingStats.comments}</span>
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="分享文章"><span className="material-symbols-outlined text-[24px]">share</span></button>
          </div>
        </aside>

        <div className="hidden md:block">
          <div className="fixed bottom-24 right-6 z-50 xl:right-[max(24px,calc((100vw-1600px)/2+24px))]">
            <button
              type="button"
              onClick={() => setChatOpen((value) => !value)}
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
