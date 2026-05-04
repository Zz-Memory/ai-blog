"use client";

import { PersonalArticleList, type PersonalArticleListItem } from "@/components/common/personal-article-list";

type VisitorCenterFavoritesProps = {
  articles: PersonalArticleListItem[];
};

// “我的收藏”模块：通过通用文章列表组件展示收藏过的文章。
export function VisitorCenterFavorites({ articles }: VisitorCenterFavoritesProps) {
  return (
    <PersonalArticleList
      title="我的收藏"
      description="这里展示你收藏过的文章，方便快速回看和继续阅读。"
      emptyText="你还没有收藏过任何文章。"
      items={articles}
    />
  );
}
