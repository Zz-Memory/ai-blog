// 分类胶囊组件。
// 用于文章卡片、详情页头部等场景，统一“分类/栏目”视觉样式。
export function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md border border-cyan-300/40 bg-gradient-to-r from-cyan-400/15 via-sky-400/15 to-violet-400/15 px-2 py-1 text-xs font-medium uppercase tracking-[0.18em] text-sky-700">
      {label}
    </span>
  );
}
