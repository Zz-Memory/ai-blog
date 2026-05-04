export type CommentedArticle = {
  id: string;
  postId: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  href: string;
  stats: { likes: number; favorites: number; comments: number };
  isLiked: boolean;
  isBookmarked: boolean;
  authorRole: "BLOGGER" | "VISITOR";
  comment: {
    id: string;
    content: string;
    time: string;
    likes: number;
    replies: number;
  };
};

// “我的评论”模块的示例数据。
// 这里模拟用户在不同文章下发表过的评论，后续可以替换为真实接口数据。
export const commentedArticles: CommentedArticle[] = [];
