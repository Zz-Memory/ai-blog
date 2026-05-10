import Image from "next/image";
import Link from "next/link";

import { SidebarCard } from "@/components/home/sidebar-card";
import { TagPill } from "@/components/common/tag-pill";

export type HomeSidebarCategory = { name: string; count: number; active?: boolean; href: string };
export type HomeSidebarTag = { name: string; count: number; active?: boolean; href: string };

type HomeSidebarProps = {
  categories: HomeSidebarCategory[];
  hotTags: HomeSidebarTag[];
};

export function HomeSidebar({ categories, hotTags }: HomeSidebarProps) {
  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-6">
      <section className="rounded-2xl border border-cyan-100/80 bg-white/82 p-8 text-center shadow-[0_18px_45px_rgba(56,189,248,0.12)] backdrop-blur-sm">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-cyan-100 bg-cyan-50">
          <Image src="/avatars/blogger-default.png" alt="博主头像" width={96} height={96} className="h-full w-full object-cover" priority />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-slate-900">Memory</h2>
        <p className="mt-2 text-sm font-medium text-cyan-700">独立开发者 & AI 探索者</p>
        <p className="mt-4 text-sm leading-7 text-slate-600">记录数字生命轨迹，致力于探索人工智能与人类审美的交汇点，相信技术应当既无形，服务于心。</p>
        <a href="https://github.com/Zz-Memory" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-cyan-700">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          https://github.com/Zz-Memory
        </a>
      </section>

      <SidebarCard title="分类" icon="folder">
        <div className="space-y-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${category.active ? "border-cyan-300/70 bg-gradient-to-r from-cyan-400/15 to-violet-400/15 text-cyan-800" : "border-cyan-100/80 bg-cyan-50/70 text-slate-600 hover:border-cyan-300/70 hover:bg-white hover:text-cyan-900"}`}
            >
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-xs text-current/70">{category.count}</span>
            </Link>
          ))}
        </div>
      </SidebarCard>

      <SidebarCard title="热门标签" icon="tag">
        <div className="flex flex-wrap gap-3">
          {hotTags.map((tag) => (
            <Link key={tag.name} href={tag.href}>
              <TagPill label={tag.name} active={tag.active} count={tag.count} />
            </Link>
          ))}
        </div>
      </SidebarCard>
    </aside>
  );
}
