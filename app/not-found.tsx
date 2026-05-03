"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111215] px-6 py-16 text-zinc-200">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/8 bg-[#15161b] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-100">
          <span className="material-symbols-outlined text-[36px] leading-none">search_off</span>
        </div>

        <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">404 Not Found</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-50 sm:text-4xl">页面不存在</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
          你访问的页面可能已被删除、移动，或者输入的地址有误。你可以返回首页继续浏览文章。
        </p>

        <div className="mt-8 flex justify-center">
          <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-[#b8c9ff] px-6 py-3 text-sm font-medium text-[#14161b] transition hover:bg-[#c3d2ff]">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
