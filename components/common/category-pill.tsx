// 分类胶囊组件。
// 用于文章卡片、详情页头部等场景，统一“分类/栏目”视觉样式。
export function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md border border-sky-300 bg-gradient-to-r from-sky-100 via-cyan-100 to-violet-100 px-2 py-1 text-xs font-medium uppercase tracking-[0.18em] text-sky-800">
      {label}
    </span>
  );
}
