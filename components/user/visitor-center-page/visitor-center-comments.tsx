"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { ArticleCard } from "@/components/common/article-card";
import { formatChinaDateTime } from "@/lib/date";

import { VisitorCenterConfirmModal } from "./visitor-center-confirm-modal";
import type { CommentedArticle } from "./commented-articles";

type VisitorCenterCommentsProps = {
  articles: CommentedArticle[];
};

const PAGE_SIZE = 3;
const PREVIEW_LIMIT = 140;

function getAvatarSrc(role: CommentedArticle["authorRole"]) {
  return role === "BLOGGER" ? "/avatars/blogger-default.png" : "/avatars/visitor-default.png";
}

// 评论正文的展示逻辑：
// - 默认只展示摘要长度
// - 点击“展开全文”后在同一个评论区域内展开
function CommentContent({ content, expanded, onToggle }: { content: string; expanded: boolean; onToggle: () => void }) {
  const isLong = content.length > PREVIEW_LIMIT;
  const displayContent = expanded || !isLong ? content : `${content.slice(0, PREVIEW_LIMIT)}...`;

  return (
    <>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">{displayContent}</p>
      {isLong ? (
        <button type="button" className="mt-2 text-xs font-medium text-[#adc6ff] transition hover:text-[#c3d2ff]" onClick={onToggle}>
          {expanded ? "收起" : "展开全文"}
        </button>
      ) : null}
    </>
  );
}

export function VisitorCenterComments({ articles }: VisitorCenterCommentsProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState(articles);
  const [deleteTarget, setDeleteTarget] = useState<CommentedArticle | null>(null);

  const visibleArticles = useMemo(() => comments.slice(0, visibleCount), [comments, visibleCount]);
  const hasMore = visibleCount < comments.length;

  const toggleExpanded = (commentId: string) => {
    setExpandedMap((current) => ({ ...current, [commentId]: !current[commentId] }));
  };

  const openDeleteConfirm = (article: CommentedArticle) => setDeleteTarget(article);
  const closeDeleteConfirm = () => setDeleteTarget(null);

  const handleDeleteComment = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(`/api/user/comments/${deleteTarget.comment.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("删除失败");

      const targetId = deleteTarget.id;
      const targetCommentId = deleteTarget.comment.id;
      setComments((current) => current.filter((article) => article.id !== targetId));
      setVisibleCount((current) => Math.max(PAGE_SIZE, current - 1));
      setExpandedMap((current) => {
        const next = { ...current };
        delete next[targetCommentId];
        return next;
      });
      closeDeleteConfirm();
    } catch {
      alert("删除评论失败，请稍后重试。");
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((current) => Math.min(current + PAGE_SIZE, comments.length));
  };

  return (
    <div className="space-y-8 rounded-[28px] border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">我的评论</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-400">这里展示你曾经发表过评论的文章，以及你的评论内容与互动反馈。</p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-zinc-500">{comments.length} 条</span>
      </div>

      <div className="space-y-5">
        {visibleArticles.length ? (
          visibleArticles.map((article) => {
            const expanded = expandedMap[article.comment.id] ?? false;

            return (
              <div key={article.id} className="rounded-[24px] border border-white/8 bg-[#17181d] p-0">
                <ArticleCard
                  postId={article.postId}
                  href={article.href}
                  compact
                  title={article.title}
                  date={article.date}
                  category={article.category}
                  excerpt={article.excerpt}
                  tags={article.tags}
                  stats={article.stats}
                  isLiked={article.isLiked}
                  isBookmarked={article.isBookmarked}
                />

                <div className="border-t border-white/8 px-6 py-5 sm:px-8">
                  <div className="flex items-start gap-4">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <Image src={getAvatarSrc(article.authorRole)} alt="用户头像" fill className="object-cover" sizes="44px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>评论于 {formatChinaDateTime(article.comment.time)}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-700" />
                        <span>{article.comment.replies} 条回复</span>
                      </div>
                      <CommentContent content={article.comment.content} expanded={expanded} onToggle={() => toggleExpanded(article.comment.id)} />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-200 transition hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100"
                      onClick={() => openDeleteConfirm(article)}
                    >
                      删除评论
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-zinc-500">你还没有发表过评论。</div>
        )}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleLoadMore}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
          >
            加载更多评论
          </button>
        </div>
      ) : null}

      <VisitorCenterConfirmModal
        open={Boolean(deleteTarget)}
        title="确认删除评论"
        description={deleteTarget ? `确定要删除你在「${deleteTarget.title}」下发表的评论吗？删除后无法恢复。` : "确定要删除这条评论吗？删除后无法恢复。"}
        cancelLabel="取消"
        confirmLabel="确认删除"
        confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400"
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteComment}
      />
    </div>
  );
}
