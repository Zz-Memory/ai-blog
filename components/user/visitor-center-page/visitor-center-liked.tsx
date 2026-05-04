"use client";

import { PersonalArticleList } from "@/components/common/personal-article-list";

import type { LikedArticle } from "./liked-articles";

type VisitorCenterLikedProps = {
  articles: LikedArticle[];
};

// “我的点赞”模块：通过通用文章列表组件展示点赞过的文章。
export function VisitorCenterLiked({ articles }: VisitorCenterLikedProps) {
  return (
    <PersonalArticleList
      title="我的点赞"
      description="这里展示你近期点过赞的文章，方便快速回看和继续阅读。"
      emptyText="你还没有点赞过任何文章。"
      items={articles}
    />
  );
}
