import Image from "next/image";

import { SidebarCard } from "@/components/blog/sidebar-card";
import { TagPill } from "@/components/blog/tag-pill";

// 侧边栏数据保持独立，便于后续接入真实接口。
// 目前先写死为设计稿中的示例内容，之后可替换成数据库动态数据。
const hotTags = [
  "人工智能",
  "极简设计",
  "大模型架构",
  "效率工具",
  "随笔",
  "代码片段",
  "认知科学",
];

// 首页左侧信息栏。
// 这里汇总了作者简介、热门标签和 AI 小助手提示三个模块。
export function HomeSidebar() {
  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-6">
      <section className="rounded-2xl border border-white/8 bg-[#17181d] p-8 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-[#20222a] bg-[#111215]">
          <Image
            src="/avatars/blogger-default.png"
            alt="博主头像"
            width={96}
            height={96}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-zinc-50">Memory</h2>
        <p className="mt-2 text-sm font-medium text-blue-200">独立开发者 & AI 探索者</p>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          记录数字生命轨迹，致力于探索人工智能与人类审美的交汇点，相信技术应当既无形，服务于心。
        </p>
        <a
          href="https://github.com/Memory"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5"
        >
          <span className="material-symbols-outlined text-[16px] leading-none">link</span>
          github.com/Memory
        </a>
      </section>

      {/* 热门标签：用于快速进入标签分类内容。 */}
      <SidebarCard title="热门标签" icon="tag">
        <div className="flex flex-wrap gap-3">
          {hotTags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>
      </SidebarCard>

      {/* AI 小助手提示卡：设计稿中的推荐入口模块。 */}
      <section className="rounded-2xl border border-white/8 bg-[#17181d] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-200">
            <span className="material-symbols-outlined text-[16px] leading-none">smart_toy</span>
          </div>
          <div>
            <h3 className="text-base font-medium text-zinc-100">小智</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              好无聊啊，要不我们来学习吧，今天学什么好呢？让我来给你一步推荐吧
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
