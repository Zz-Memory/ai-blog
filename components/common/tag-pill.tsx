// 标签胶囊组件。
// 用于首页热门标签和文章标签，统一标签视觉与交互样式。
export function TagPill({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-white/8 bg-white/5 px-3 py-1 text-[12px] text-zinc-300 transition hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-100">
      # {label}
    </span>
  );
}
