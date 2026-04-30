export type LikedArticle = {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { likes: number; favorites: number; comments: number };
};

// “我的点赞”模块的数据源。
// 这里先用静态示例数据模拟真实用户的点赞列表，方便展示分页/加载更多效果。
export const likedArticles: LikedArticle[] = [
  {
    title: "让界面“隐形”：AI 时代的 UI 交互原则",
    date: "2024.05.12",
    category: "前端",
    excerpt:
      "当系统具备了理解意图的能力，传统的按钮、菜单和页面结构需要重新审视，UI 应该更像承载智能体验的透明容器。",
    tags: ["交互设计", "极简主义"],
    stats: { likes: 86, favorites: 32, comments: 24 },
  },
  {
    title: "超越 RAG：探索下一代上下文感知 AI 系统的构建范式",
    date: "2024.05.24",
    category: "后端",
    excerpt:
      "围绕 GraphRAG、知识图谱与全局上下文检索展开，讨论如何构建更适合复杂推理的下一代 AI 应用架构。",
    tags: ["大模型", "架构设计"],
    stats: { likes: 102, favorites: 45, comments: 31 },
  },
  {
    title: "打造个人数字大脑：工作流自动化的再重构",
    date: "2024.04.28",
    category: "随笔",
    excerpt:
      "从信息摄入、自动打标签到核心观点提取，记录一套围绕 AI 能力构建的知识工作流闭环。",
    tags: ["自动化", "PKM"],
    stats: { likes: 73, favorites: 21, comments: 12 },
  },
  {
    title: "从 0 到 1 搭建个人知识库：我如何让信息流动起来",
    date: "2024.04.16",
    category: "数据库",
    excerpt:
      "一个优秀的知识库不只是存储信息，更重要的是让信息之间建立联系。本文记录了我从表结构设计到检索优化的完整过程。",
    tags: ["知识管理", "效率工具"],
    stats: { likes: 52, favorites: 18, comments: 12 },
  },
  {
    title: "AI 代理的错觉",
    date: "2024.05.23",
    category: "Web 开发",
    excerpt:
      "关于我们如何给 LLM 拟人化的哲学思考，以及构建更符合用户预期的“原生 AI”界面的设计启示。",
    tags: ["Web 开发"],
    stats: { likes: 61, favorites: 14, comments: 9 },
  },
];
