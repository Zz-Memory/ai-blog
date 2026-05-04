export type LikedArticle = {
  postId: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { likes: number; favorites: number; comments: number };
  href: string;
  isLiked: boolean;
  isBookmarked: boolean;
};

// “我的点赞”模块的离线兜底数据。
// 当接口请求失败或用户未登录时，会用它保证界面仍然有内容可展示。
export const likedArticles: LikedArticle[] = [];
