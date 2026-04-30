export type HistoryArticle = {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { likes: number; comments: number };
};

export const historyArticles: HistoryArticle[] = [
  {
    title: "掌握 Tailwind CSS v3 中的玻璃拟态",
    date: "2024.05.24",
    category: "Web 开发",
    excerpt:
      "深入探讨如何使用现代 CSS 和 Tailwind 工具类创建高性能、美观的玻璃效果，专注于深色模式美学。",
    tags: ["Web 开发"],
    stats: { likes: 86, comments: 24 },
  },
  {
    title: "我 2024 年的极简开发者工作区",
    date: "2024.05.24",
    category: "效率提升",
    excerpt:
      "探索优化桌面和浏览器工作流的工具、硬件及视觉环境，让创作过程更加专注而高效。",
    tags: ["效率提升"],
    stats: { likes: 86, comments: 24 },
  },
  {
    title: "AI 代理的错觉",
    date: "2024.05.23",
    category: "Web 开发",
    excerpt:
      "关于我们如何给 LLM 拟人化的哲学思考，以及构建更符合用户预期的“原生 AI”界面的设计启示。",
    tags: ["Web 开发"],
    stats: { likes: 86, comments: 24 },
  },
];
