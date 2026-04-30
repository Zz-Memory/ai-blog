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
    <section className="rounded-2xl border border-white/8 bg-[#17181d] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <h3 className="mb-5 flex items-center gap-2 text-[18px] font-medium text-zinc-100">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/15 text-blue-200">
          <span className="material-symbols-outlined text-[16px] leading-none">{icon}</span>
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}
