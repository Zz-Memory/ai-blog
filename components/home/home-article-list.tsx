import { ArticleCard } from "@/components/common/article-card";

export type FeaturedPost = {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  stats: { views: string; likes: number; favorites: number; comments: number };
};

// 首页文章列表数据。
// 当前先使用静态示例数据，后续可替换为数据库查询结果或接口返回值。
export const featuredPosts: FeaturedPost[] = [
  {
    title: "超越 RAG：探索下一代上下文感知 AI 系统的构建范式",
    date: "2024.05.24",
    category: "后端",
    excerpt:
      "在当前的大语言模型应用落地中，RAG（检索增强生成）几乎成了标配。然而，单纯的向量相似度检索在处理复杂逻辑和跨文档推理时仍显得捉襟见肘。本文尝试探讨从简单的文档外检索到具备图结构认知和记忆机制的新型架构。",
    tags: ["大模型", "架构设计"],
    stats: { views: "1.2k", likes: 86, favorites: 32, comments: 24 },
  },
  {
    title: "让界面“隐形”：AI 时代的 UI 交互原则",
    date: "2024.05.12",
    category: "前端",
    excerpt:
      "当系统具备了理解意图的能力，传统的曲菜单、按钮和多级菜单构成的重叠界面就开始显得冗余。我们正在进入一个意图驱动的时代，UI 应该退居幕后，成为承载智能对话和动态生成内容的“玻璃容器”。",
    tags: ["交互设计", "极简主义"],
    stats: { views: "1.2k", likes: 86, favorites: 28, comments: 24 },
  },
  {
    title: "打造个人数字大脑：工作流自动化的再重构",
    date: "2024.04.28",
    category: "随笔",
    excerpt:
      "碎片的知识如果不建立连接，就是信息垃圾。过去三个月，我构建了一套记录与任务管理系统，将多个 AI 能力 API 接入其中，实现了从信息摄入、自动打标签、核心观点提取到定期回顾的自动化闭环。",
    tags: ["自动化", "PKM"],
    stats: { views: "1.2k", likes: 86, favorites: 32, comments: 24 },
  },
  {
    title: "从 0 到 1 搭建个人知识库：我如何让信息流动起来",
    date: "2024.04.16",
    category: "数据库",
    excerpt:
      "一个优秀的知识库不只是存储信息，更重要的是让信息之间建立联系。本文记录了我从表结构设计、标签体系、自动归档到检索优化的完整搭建过程。",
    tags: ["知识管理", "效率工具"],
    stats: { views: "968", likes: 52, favorites: 14, comments: 12 },
  },
];

// 右侧文章流区域，负责承载首页主内容。
export function HomeArticleList({ posts }: { posts: FeaturedPost[] }) {
  return (
    <div className="flex flex-col gap-8">
      {posts.map((post) => (
        <ArticleCard key={post.title} {...post} />
      ))}
    </div>
  );
}
