// 站点顶部导航栏。
// 这个区域负责放品牌标识、搜索入口，以及登录 / 注册操作。
// 由于当前项目的身份认证是弹出式交互，因此这里只保留按钮触发位，
// 后续可以在这里接入弹窗状态控制逻辑。
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#111215]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-zinc-100 transition hover:text-white">
          <span className="text-[22px] font-semibold tracking-wide">
            Memory的小破站
          </span>
        </Link>

        <div className="hidden w-[360px] items-center rounded-full border border-white/10 bg-[#181a20] px-4 py-2.5 text-sm text-zinc-500 shadow-inner shadow-black/20 md:flex">
          <span className="material-symbols-outlined mr-3 text-[16px] leading-none text-zinc-600">
            search
          </span>
          <span>搜索内容或标签</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/5">
            登录
          </button>
          <button className="rounded-xl bg-[#b8c9ff] px-5 py-2.5 text-sm font-medium text-[#14161b] shadow-[0_12px_30px_rgba(112,143,255,0.25)] transition hover:bg-[#c3d2ff]">
            注册
          </button>
        </div>
      </div>
    </header>
  );
}
