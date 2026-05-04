export type HistoryArticle = {
  id: string;
  title: string;
  visitedAt: string;
  href: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { likes: number; favorites: number; comments: number };
};

export const historyArticles: HistoryArticle[] = [];
