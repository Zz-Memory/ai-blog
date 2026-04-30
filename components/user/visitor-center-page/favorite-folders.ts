export type FavoriteFolder = {
  id: string;
  name: string;
  count: number;
  isDefault?: boolean;
};

// 收藏夹示例数据：用于还原设计稿中的收藏夹区域布局。
export const favoriteFolders: FavoriteFolder[] = [
  { id: "default", name: "默认收藏夹", count: 3, isDefault: true },
  { id: "ai-design", name: "AI 设计灵感", count: 12 },
  { id: "ui-kit", name: "UI 组件库", count: 45 },
  { id: "frontend-arch", name: "前端架构", count: 8 },
];
