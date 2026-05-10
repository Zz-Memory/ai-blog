// 侧栏卡片通用容器。
// 用于包装“热门标签”等有统一视觉风格的模块。
export function SidebarCard({
  title,
  children,
  icon,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-cyan-100/80 bg-white/82 p-6 shadow-[0_18px_45px_rgba(56,189,248,0.12)] backdrop-blur-sm">
      <h3 className="mb-5 flex items-center gap-2 text-[18px] font-medium text-slate-900">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400/20 to-violet-400/20 text-cyan-700">
          <span className="material-symbols-outlined text-[16px] leading-none">{icon}</span>
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}
