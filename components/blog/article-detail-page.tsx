"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AuthModal } from "@/components/auth/auth-modal";
import { AiQuestionFloatingButton } from "@/components/blog/ai-question-floating-button";
import { CategoryPill } from "@/components/common/category-pill";
import { useAuth } from "@/components/common/auth-context";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { TagPill } from "@/components/common/tag-pill";
import { formatChinaDate, formatChinaDateTime } from "@/lib/date";
import { toPreviewHtml } from "@/lib/markdown";

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

type CommentReply = {
  id: string;
  parentId: string | null;
  author: string;
  avatarText: string;
  avatarUrl: string;
  time: string;
  content: string;
  likes: number;
  replyTo: string;
};

type CommentNode = {
  id: string;
  parentId: string | null;
  author: string;
  avatarText: string;
  avatarUrl: string;
  time: string;
  content: string;
  likes: number;
  replies?: CommentReply[];
};

type CurrentUserView = {
  name: string;
  role: "visitor" | "blogger";
  avatarUrl: string;
  avatarLabel: string;
};

type AiChatMessage = { id: string; role: "USER" | "ASSISTANT"; content: string; createdAt: string };

const renderMarkdownPreview = (content: string) => toPreviewHtml(content).replace(/\n/g, "");

const buildChatGreeting = (username: string, articleTitle: string): AiChatMessage => ({
  id: "chat-greeting",
  role: "ASSISTANT",
  content: `您好，${username}，请问是对《${articleTitle}》有什么疑问吗？`,
  createdAt: new Date().toISOString(),
});

const createTypingMessage = (): AiChatMessage => ({
  id: `typing-${Date.now()}`,
  role: "ASSISTANT",
  content: "",
  createdAt: new Date().toISOString(),
});


export function ArticleDetailPage({ article, engagement, comments }: ArticleDetailPageProps) {
  const [searchInput, setSearchInput] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authEntry, setAuthEntry] = useState<AuthEntry>("login");
  const [commentDraft, setCommentDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(engagement.likes);
  const [bookmarksCount, setBookmarksCount] = useState(engagement.bookmarks);
  const [isLiked, setIsLiked] = useState(engagement.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(engagement.isBookmarked);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [commentNotice, setCommentNotice] = useState<string | null>(null);
  const [commentItems, setCommentItems] = useState<CommentNode[]>(comments);
  const [commentSortOrder, setCommentSortOrder] = useState<"asc" | "desc">("asc");
  const commentsRef = useRef<HTMLElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const { user } = useAuth();

  const currentUser: CurrentUserView | null = user
    ? {
      name: user.username,
      role: user.role === "BLOGGER" ? "blogger" : "visitor",
      avatarUrl: user.role === "BLOGGER" ? "/avatars/blogger-default.png" : "/avatars/visitor-default.png",
      avatarLabel: user.role === "BLOGGER" ? "博主头像" : "访客头像",
    }
    : null;

  const countCommentTree = (items: CommentNode[]): number =>
    items.reduce((sum, item) => sum + 1 + countCommentTree(item.replies ?? []), 0);

  const readingStats = useMemo(
    () => ({
      likes: likesCount,
      bookmarks: bookmarksCount,
      comments: countCommentTree(commentItems),
    }),
    [bookmarksCount, commentItems, likesCount]
  );

  const sortByTimeAsc = <T extends { time: string }>(items: T[]) =>
    [...items].sort((left, right) => new Date(left.time).getTime() - new Date(right.time).getTime());

  const sortComments = (items: CommentNode[]) =>
    [...items]
      .sort((left, right) => {
        const diff = new Date(left.time).getTime() - new Date(right.time).getTime();
        return commentSortOrder === "asc" ? diff : -diff;
      })
      .map((item) => ({
        ...item,
        replies: sortByTimeAsc(item.replies ?? []),
      }));

  const findRootCommentId = (commentId: string) => {
    for (const item of commentItems) {
      if (item.id === commentId) return item.id;
      const foundInReplies = item.replies?.some((reply) => reply.id === commentId);
      if (foundInReplies) return item.id;
    }
    return commentId;
  };

  const renderCommentReplies = (replies: CommentReply[] | undefined) => (
    replies?.length ? (
      <div className="ml-14 space-y-4 border-l border-white/8 pl-4">
        {sortByTimeAsc(replies).map((reply) => (
          <div key={reply.id} className="flex gap-4 rounded-xl bg-white/3 p-4">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
              <img src={reply.avatarUrl} alt={reply.author} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-medium text-zinc-100">{reply.author}</span><span className="text-xs text-zinc-500">回复 {reply.replyTo}</span><span className="text-xs text-zinc-500">{formatChinaDateTime(reply.time)}</span></div>
              <p className="mt-2 text-sm leading-7 text-zinc-400">{reply.content}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                <button type="button" onClick={() => handleReplyClick(reply.id, reply.author)} className="flex items-center gap-1 transition hover:text-zinc-300" aria-label="回复回复"><span className="material-symbols-outlined text-[16px]">reply</span>回复</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : null
  );

  const [actionError, setActionError] = useState<string | null>(null);

  const publishedLabel = article.publishedAt ? formatChinaDate(article.publishedAt) : "待发布";

  const articleCategory = article.category ?? "文章";
  const articleTags = article.tags.length ? article.tags : [{ id: "default-tag", label: "AI博客" }];

  const loadChatSession = async () => {
    try {
      const response = await fetch(`/api/posts/ai-chat?postId=${article.id}`);
      const data = (await response.json()) as { session: { messages: AiChatMessage[] } | null; message?: string };
      if (!response.ok) throw new Error(data.message || "加载 AI 对话失败");
      const sessionMessages = data.session?.messages ?? [];
      const greeting = buildChatGreeting(currentUser?.name ?? "访客", article.title);
      setChatMessages(sessionMessages.length ? [greeting, ...sessionMessages] : [greeting]);
      setChatError(null);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "加载 AI 对话失败");
    }
  };

  useEffect(() => {
    if (!chatOpen) return;
    let cancelled = false;

    const run = async () => {
      try {
        const response = await fetch(`/api/posts/ai-chat?postId=${article.id}`);
        const data = (await response.json()) as { session: { messages: AiChatMessage[] } | null; message?: string };
        if (!response.ok) throw new Error(data.message || "加载 AI 对话失败");
        if (!cancelled) {
          const sessionMessages = data.session?.messages ?? [];
          const greeting = buildChatGreeting(currentUser?.name ?? "访客", article.title);
          setChatMessages(sessionMessages.length ? [greeting, ...sessionMessages] : [greeting]);
          setChatError(null);
        }
      } catch (error) {
        if (!cancelled) setChatError(error instanceof Error ? error.message : "加载 AI 对话失败");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [article.id, article.title, chatOpen, currentUser?.name]);

  useEffect(() => {
    if (!chatOpen) return;
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, chatOpen, chatLoading]);

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

  const stripReplyPrefix = (value: string) => value.replace(/^回复\s+@[^：:\n]+[:：]\s*/u, "");

  const buildReplyPrefix = (author: string) => `回复 @${author}：`;

  const handleReplyClick = (id: string, author: string) => {
    if (!requireLogin()) return;
    const nextPrefix = buildReplyPrefix(author);
    setReplyTo({ id, author });
    setCommentDraft((value) => `${nextPrefix}${stripReplyPrefix(value).trimStart()}`);
    setCommentNotice(null);
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitComment = async () => {
    if (!requireLogin()) return;
    const content = stripReplyPrefix(commentDraft).trim();
    if (!content) return;

    try {
      const response = await fetch("/api/posts/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: article.id,
          content,
          parentId: replyTo?.id ?? null,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorData?.message || "评论提交失败");
      }

      const data = (await response.json()) as { comment: { id: string; status: "PENDING" | "APPROVED"; createdAt: string; message: string } };
      const authorAvatarUrl = currentUser?.role === "blogger" ? "/avatars/blogger-default.png" : "/avatars/visitor-default.png";
      const nextComment = {
        id: data.comment.id,
        parentId: replyTo ? findRootCommentId(replyTo.id) : null,
        author: currentUser?.name ?? "我",
        avatarText: (currentUser?.name ?? "我").charAt(0).toUpperCase(),
        avatarUrl: authorAvatarUrl,
        time: data.comment.createdAt,
        content,
        likes: 0,
        replies: [],
      } satisfies CommentNode;

      if (data.comment.status === "APPROVED") {
        setCommentItems((current) => {
          if (!replyTo) return sortByTimeAsc([nextComment, ...current]);

          const rootId = findRootCommentId(replyTo.id);
          return current.map((item) =>
            item.id === rootId
              ? { ...item, replies: sortByTimeAsc([...(item.replies ?? []), { ...nextComment, parentId: rootId, replyTo: item.author }]) }
              : item
          );
        });
      }

      setCommentDraft("");
      setReplyTo(null);
      setCommentNotice(data.comment.message);
    } catch (error) {
      setCommentNotice(error instanceof Error && error.message ? error.message : "评论提交失败，请稍后重试。");
    }
  };

  const refreshChatSession = async () => {
    if (!chatOpen) return;
    setChatLoading(false);
    setChatError(null);
    await loadChatSession();
  };

  const clearChatSession = async () => {
    if (!requireLogin()) return;
    setClearConfirmOpen(false);
    setChatLoading(false);
    setChatError(null);

    try {
      const response = await fetch(`/api/posts/ai-chat/clear?postId=${article.id}`, { method: "POST" });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message || "清空会话失败");
      const greeting = buildChatGreeting(currentUser?.name ?? "访客", article.title);
      setChatMessages([greeting]);
      setChatQuestion("");
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "清空会话失败");
    }
  };

  const submitChatQuestion = async () => {
    if (!requireLogin()) return;
    const question = chatQuestion.trim();
    if (!question || chatLoading) return;

    const userMessage: AiChatMessage = {
      id: `local-${Date.now()}`,
      role: "USER",
      content: question,
      createdAt: new Date().toISOString(),
    };
    const typingMessage = createTypingMessage();

    setChatMessages((current) => [...current, userMessage, typingMessage]);
    setChatQuestion("");
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch("/api/posts/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: article.id, question }),
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "发送失败");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";

      setChatMessages((current) => current.map((message) => (message.id === typingMessage.id ? { ...message, content: "思考中" } : message)));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;
            const parsed = JSON.parse(payload) as { delta?: string; done?: boolean; content?: string };
            if (parsed.delta) {
              assistantContent += parsed.delta;
              setChatMessages((current) =>
                current.map((message) => (message.id === typingMessage.id ? { ...message, content: assistantContent } : message))
              );
            }
            if (parsed.done && parsed.content) {
              assistantContent = parsed.content;
            }
          }
        }
      }

      setChatMessages((current) =>
        current.map((message) =>
          message.id === typingMessage.id
            ? { id: `assistant-${Date.now()}`, role: "ASSISTANT", content: assistantContent || "抱歉，我暂时无法生成回答。", createdAt: new Date().toISOString() }
            : message
        )
      );
    } catch (error) {
      setChatMessages((current) => current.filter((message) => message.id !== typingMessage.id));
      setChatError(error instanceof Error ? error.message : "发送失败，请稍后重试。");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6fffd] text-slate-800">
      <SiteHeader
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={() => undefined}
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        isAuthenticated={Boolean(user)}
      />

      <main className="relative mx-auto min-h-[calc(100vh-64px)] max-w-[1600px] px-6 py-10 lg:px-10">
        <article className="mx-auto w-full max-w-[840px] rounded-[32px] border border-cyan-100/80 bg-white/84 p-8 shadow-[0_18px_45px_rgba(56,189,248,0.12)] backdrop-blur-sm lg:p-10">
          <header className="max-w-[840px]">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <CategoryPill label={articleCategory} />
              <span>发布于 {publishedLabel}</span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl lg:text-[52px]">{article.title}</h1>
            <div className="mt-6 border-t border-cyan-100/80 pt-6">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 overflow-hidden rounded-full border border-cyan-100 shadow-[0_0_0_4px_rgba(255,255,255,0.5)]">
                  <img src={article.author.avatarUrl} alt="作者头像" className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{article.author.username}</div>
                  <div className="text-sm text-slate-500">{article.author.intro ?? "独立开发者 & AI 探索者"}</div>
                </div>
              </div>
            </div>
          </header>

          {article.summary ? <p className="mt-8 max-w-[840px] text-[15px] leading-8 text-slate-600">{article.summary}</p> : null}

          <div
            className="article-content mt-8 max-w-[840px] space-y-8 text-[15px] leading-8 text-slate-700"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {actionError ? <p className="mt-6 text-sm text-rose-400">{actionError}</p> : null}

          <div className="mt-10 flex flex-wrap gap-3 border-t border-white/8 pt-6 max-w-[840px]">
            {articleTags.map((tag) => (
              <TagPill key={tag.id} label={tag.label} />
            ))}
          </div>

          <section ref={commentsRef} id="comments" className="mt-12 max-w-[840px] scroll-mt-24">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold text-zinc-50">评论 ({readingStats.comments})</h3>
              <button
                type="button"
                onClick={() => setCommentSortOrder((value) => (value === "asc" ? "desc" : "asc"))}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-[#7aa2ff]/40 hover:bg-[#7aa2ff]/10 hover:text-[#b8c9ff]"
              >
                {commentSortOrder === "asc" ? "最早优先" : "最新优先"}
              </button>
            </div>
            {commentNotice ? <div className="mt-4 rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-zinc-300">{commentNotice}</div> : null}
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
                      onChange={(event) => {
                        const rawValue = event.target.value;
                        if (!replyTo) {
                          setCommentDraft(stripReplyPrefix(rawValue));
                          return;
                        }

                        const prefix = buildReplyPrefix(replyTo.author);
                        const valueWithoutPrefix = rawValue.startsWith(prefix) ? rawValue.slice(prefix.length) : stripReplyPrefix(rawValue);
                        setCommentDraft(`${prefix}${valueWithoutPrefix}`);
                      }}
                      rows={4}
                      placeholder={replyTo ? `回复 @${replyTo.author}...` : "分享你的想法..."}
                      className="w-full resize-none rounded-xl border border-white/8 bg-[#181a20] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-[#7aa2ff]/50 focus:ring-1 focus:ring-[#7aa2ff]/20"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-xs text-zinc-500">
                        {replyTo ? (
                          <button
                            type="button"
                            onClick={() => {
                              const prefix = buildReplyPrefix(replyTo.author);
                              setCommentDraft((value) => value.startsWith(prefix) ? value.slice(prefix.length) : stripReplyPrefix(value));
                              setReplyTo(null);
                            }}
                            className="text-[#8db1ff] hover:text-[#b8c9ff]"
                          >
                            回复到：@{replyTo.author}
                          </button>
                        ) : (
                          <span>访客评论将进入待审核，博主评论将直接发布。</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={submitComment}
                        disabled={!commentDraft.trim()}
                        className="rounded-lg bg-[#7aa2ff] px-4 py-2 text-sm font-medium text-[#10131a] transition hover:bg-[#8db1ff] disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-400"
                      >
                        {replyTo ? "回复评论" : "发布评论"}
                      </button>
                    </div>
                    {commentNotice ? <p className="mt-3 text-sm text-zinc-400">{commentNotice}</p> : null}
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
              {sortComments(commentItems).map((comment) => (
                <div key={comment.id} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                      <img src={comment.avatarUrl} alt={comment.author} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm"><span className="font-medium text-zinc-100">{comment.author}</span><span className="text-xs text-zinc-500">{formatChinaDateTime(comment.time)}</span></div>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">{comment.content}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                        <button type="button" onClick={() => handleReplyClick(comment.id, comment.author)} className="flex items-center gap-1 transition hover:text-zinc-300" aria-label="回复评论"><span className="material-symbols-outlined text-[16px]">reply</span>回复</button>
                      </div>
                    </div>
                  </div>
                  {renderCommentReplies(comment.replies)}
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
              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition ${isLiked ? "text-[#b8c9ff]" : "text-zinc-400 hover:bg-white/5 hover:text-[#b8c9ff]"}`}
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
              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition ${isBookmarked ? "text-[#b8c9ff]" : "text-zinc-400 hover:bg-white/5 hover:text-[#b8c9ff]"}`}
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
            <AiQuestionFloatingButton
              onClick={() => {
                if (!requireLogin()) return;
                setChatOpen((value) => !value);
              }}
            />
          </div>
        </div>

        {chatOpen ? (
          <section className="fixed bottom-40 right-6 z-40 flex h-[min(57vh,600px)] w-[760px] max-w-[92vw] flex-col rounded-3xl border border-cyan-100/80 bg-white/92 p-5 shadow-[0_24px_80px_rgba(56,189,248,0.16)] backdrop-blur-xl xl:right-[max(24px,calc((100vw-1600px)/2+24px))]">
            <div className="flex items-center justify-between border-b border-cyan-100/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50 text-cyan-700">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">小智 AI 助手</h4>
                  <p className="text-xs text-slate-500">全栈开发与AI研究导师</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClearConfirmOpen(true)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700"
                  aria-label="清空会话"
                  title="清空会话"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => void refreshChatSession()}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700"
                  aria-label="刷新会话"
                  title="刷新会话"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              </div>
            </div>

            <div ref={chatScrollRef} className="mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 pb-2">
              {chatMessages.length ? chatMessages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "USER" ? "justify-end" : "justify-start"}`}>
                  {message.role === "ASSISTANT" ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50 text-cyan-700">
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    </div>
                  ) : null}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "USER" ? "rounded-tr-sm border border-cyan-100 bg-cyan-50/70 text-slate-700" : "rounded-tl-sm border border-cyan-100 bg-white text-slate-700"}`}
                    dangerouslySetInnerHTML={{
                      __html: message.content ? renderMarkdownPreview(message.content) : chatLoading && message.role === "ASSISTANT" ? "<span class='inline-flex gap-1'><span class='h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.2s]'></span><span class='h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.1s]'></span><span class='h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400'></span></span>" : "",
                    }}
                  />
                  {message.role === "USER" ? (
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-cyan-100 bg-white">
                      <img src={currentUser?.avatarUrl ?? "/avatars/visitor-default.png"} alt={currentUser?.avatarLabel ?? "访客头像"} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                </div>
              )) : (
                <div className="text-sm text-slate-500">开始向 AI 提问，它会把内容写入数据库会话中。</div>
              )}
              {chatError ? <div className="text-sm text-rose-600">{chatError}</div> : null}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3">
              <input
                value={chatQuestion}
                onChange={(event) => setChatQuestion(event.target.value)}
                placeholder="向小智提问关于本文的任何问题..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                onKeyDown={(event) => {
                  if (event.key === "Enter") void submitChatQuestion();
                }}
              />
              <button type="button" onClick={submitChatQuestion} className="rounded-xl p-2 text-cyan-700 transition hover:bg-cyan-100 hover:text-violet-700" disabled={chatLoading}>
                <span className="material-symbols-outlined text-[24px]">send</span>
              </button>
            </div>
          </section>
        ) : null}

        {clearConfirmOpen ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-cyan-100/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(56,189,248,0.16)]">
              <h5 className="text-lg font-semibold text-slate-900">确认清空会话？</h5>
              <p className="mt-3 text-sm leading-7 text-slate-600">清空后，这篇文章下的 AI 对话记录会被删除，且无法恢复。是否继续？</p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setClearConfirmOpen(false)}
                  className="rounded-lg border border-cyan-100 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-cyan-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void clearChatSession()}
                  className="rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-105"
                >
                  确认清空
                </button>
              </div>
            </div>
          </div>
        ) : null}

      </main>

      <SiteFooter />
      <AuthModal isOpen={authOpen} initialMode={authEntry} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
