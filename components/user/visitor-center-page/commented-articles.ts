export type CommentedArticle = {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { likes: number; favorites: number; comments: number };
  comment: {
    content: string;
    time: string;
    likes: number;
    replies: number;
  };
};

// “我的评论”模块的示例数据。
// 这里模拟用户在不同文章下发表过的评论，后续可以替换为真实接口数据。
export const commentedArticles: CommentedArticle[] = [
  {
    title: "超越 RAG：探索下一代上下文感知 AI 系统的构建范式",
    date: "2024.05.24",
    category: "后端",
    excerpt:
      "在当前的大语言模型应用落地中，RAG 几乎成了标配，但它在多跳推理和全局语境上仍有局限。",
    tags: ["大模型", "架构设计"],
    stats: { likes: 102, favorites: 45, comments: 31 },
    comment: {
      content: "这篇文章把 GraphRAG 的价值讲得很清楚，尤其是对全局上下文和多跳推理的解释很有启发。",
      time: "2 小时前",
      likes: 12,
      replies: 3,
    },
  },
  {
    title: "让界面“隐形”：AI 时代的 UI 交互原则",
    date: "2024.05.12",
    category: "前端",
    excerpt:
      "当系统具备理解意图的能力后，UI 不再只是按钮和页面，而是承载智能体验的容器。",
    tags: ["交互设计", "极简主义"],
    stats: { likes: 86, favorites: 32, comments: 24 },
    comment: {
      content: "非常认同“隐形 UI”的方向，未来的界面应该更多表达意图，而不是让用户学习复杂流程。",
      time: "昨天",
      likes: 8,
      replies: 1,
    },
  },
  {
    title: "打造个人数字大脑：工作流自动化的再重构",
    date: "2024.04.28",
    category: "随笔",
    excerpt:
      "从信息摄入、自动打标签到核心观点提取，记录一套围绕 AI 能力构建的知识工作流闭环。",
    tags: ["自动化", "PKM"],
    stats: { likes: 73, favorites: 21, comments: 12 },
    comment: {
      content: "这套工作流很适合知识管理型用户，尤其是自动化标签和回顾机制的部分。",
      time: "3 天前",
      likes: 5,
      replies: 0,
    },
  },
  {
    title: "从 0 到 1 搭建个人知识库：我如何让信息流动起来",
    date: "2024.04.16",
    category: "数据库",
    excerpt:
      "一个优秀的知识库不只是存储信息，更重要的是让信息之间建立联系。",
    tags: ["知识管理", "效率工具"],
    stats: { likes: 52, favorites: 18, comments: 12 },
    comment: {
      content: "关于知识库结构设计的部分很实用，我最喜欢的是标签和归档策略的拆解。",
      time: "5 天前",
      likes: 4,
      replies: 1,
    },
  },
  {
    title: "神经形态排版：让文字流动起来",
    date: "2024.01.12",
    category: "设计",
    excerpt:
      "利用可变字体和上下文调整算法，让文字在屏幕上呈现出仿佛有生命般的呼吸感。",
    tags: ["Typography"],
    stats: { likes: 31, favorites: 9, comments: 6 },
    comment: {
      content: "这篇对可变字体和动态排版的讨论很有意思，尤其是和界面情绪表达结合的部分。",
      time: "1 周前",
      likes: 3,
      replies: 0,
    },
  },
];
