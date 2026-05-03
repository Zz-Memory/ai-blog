"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-CN" className="h-full bg-[#111215]">
      <body className="min-h-full bg-[#111215] text-zinc-200">
        <div className="flex min-h-screen items-center justify-center bg-[#111215] px-6 py-16">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/8 bg-[#15161b] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-rose-400/20 bg-rose-500/10 text-rose-100">
              <span className="material-symbols-outlined text-[36px] leading-none">error</span>
            </div>

            <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Runtime Error</p>
            <h1 className="mt-3 text-3xl font-semibold text-zinc-50 sm:text-4xl">页面运行时出错了</h1>
            <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
              页面在渲染或交互过程中发生了错误，你可以返回首页继续浏览。
            </p>

            <div className="mt-8 flex justify-center">
              <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-[#b8c9ff] px-6 py-3 text-sm font-medium text-[#14161b] transition hover:bg-[#c3d2ff]">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
