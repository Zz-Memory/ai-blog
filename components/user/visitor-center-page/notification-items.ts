export type NotificationType = "all" | "likes" | "comments" | "system";

export type NotificationItem = {
  id: string;
  type: Exclude<NotificationType, "all">;
  userName: string;
  userAvatarText: string;
  time: string;
  title: string;
  message: string;
  targetArticle: string;
  unread?: boolean;
};

// “消息通知”模块的数据源。
// 这里按照设计稿模拟点赞、评论和系统通知三类消息，方便后续替换为真实接口数据。
export const notificationItems: NotificationItem[] = [
  {
    id: "n-1",
    type: "comments",
    userName: "Alex Chen",
    userAvatarText: "A",
    time: "10 分钟前",
    title: "评论了你的博客",
    message: "“文章开头对 AI 交互范式的定义非常准确，希望能看到更多这类深度内容。”",
    targetArticle: "探索 AI 时代的交互设计范式",
    unread: true,
  },
  {
    id: "n-2",
    type: "likes",
    userName: "Sarah",
    userAvatarText: "S",
    time: "2 小时前",
    title: "点赞了你的博客",
    message: "“探讨 AI 时代的交互设计范式”获得了新的点赞，内容正在被更多读者看到。",
    targetArticle: "探索 AI 时代的交互设计范式",
    unread: true,
  },
  {
    id: "n-3",
    type: "likes",
    userName: "Emily Watson",
    userAvatarText: "E",
    time: "2 小时前",
    title: "点赞了你的博客",
    message: "你的文章《探索 AI 时代的交互设计范式》继续收到点赞反馈。",
    targetArticle: "探索 AI 时代的交互设计范式",
  },
  {
    id: "n-4",
    type: "likes",
    userName: "Michael Zhang",
    userAvatarText: "M",
    time: "3 小时前",
    title: "点赞了你的博客",
    message: "有人对你关于交互设计的观点表示认可。",
    targetArticle: "探索 AI 时代的交互设计范式",
  },
  {
    id: "n-5",
    type: "comments",
    userName: "Li Wei",
    userAvatarText: "L",
    time: "5 小时前",
    title: "回复了你的评论",
    message: "“非常赞同你对极简主义的看法！留白确实是提升数字空间高级感的关键因素...”",
    targetArticle: "极简主义在复杂系统中的重构",
  },
  {
    id: "n-6",
    type: "comments",
    userName: "John Doe",
    userAvatarText: "J",
    time: "昨天 10:20",
    title: "点赞了你的评论",
    message: "“我认为大语言模型在创意写作中的角色更像是辅助而不是替代。”",
    targetArticle: "AI 代理的错觉",
  },
  {
    id: "n-7",
    type: "system",
    userName: "Memory",
    userAvatarText: "M",
    time: "昨天 14:30",
    title: "系统更新完成",
    message: "Memory 平台已成功升级至 v2.4，本次更新优化了深度阅读模式的排版渲染效率，并修复了部分设备上的显示问题。",
    targetArticle: "系统公告",
    unread: false,
  },
];
