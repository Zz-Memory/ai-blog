export type HistoryArticle = {
  id: string;
  postId: string;
  title: string;
  visitedAt: string;
  href: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { likes: number; favorites: number; comments: number };
  isLiked?: boolean;
  isBookmarked?: boolean;
};

export const historyArticles: HistoryArticle[] = [];
