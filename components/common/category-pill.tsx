// 分类胶囊组件。
// 用于文章卡片、详情页头部等场景，统一“分类/栏目”视觉样式。
export function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md border border-blue-400/20 bg-blue-400/10 px-2 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-100">
      {label}
    </span>
  );
}
