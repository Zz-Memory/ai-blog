"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/common/auth-context";
import { useNotificationCount } from "@/components/common/notification-context";

export type SiteHeaderProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isAuthenticated?: boolean;
};

export function SiteHeader({
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  onLoginClick,
  onRegisterClick,
}: SiteHeaderProps) {
  const router = useRouter();
  usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(searchValue);
  const { unreadCount } = useNotificationCount();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const profileHref = user?.role === "BLOGGER" ? "/blogger-center" : "/visitor-center";
  const notificationHref = user?.role === "BLOGGER" ? "/blogger-center?section=notifications" : "/visitor-center?section=notifications";
  const avatarSrc = user?.role === "BLOGGER" ? "/avatars/blogger-default.png" : "/avatars/visitor-default.png";

  function commitSearch(nextValue: string) {
    onSearchChange?.(nextValue);
    onSearchSubmit?.(nextValue);
    setInputValue(nextValue);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (nextValue.trim()) params.set("q", nextValue.trim());
    else params.delete("q");
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  function openAuth(mode: "login" | "register") {
    onLoginClick?.();
    onRegisterClick?.();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("auth", mode);
    router.push(`/?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#111215]/90 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[1200px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-6 lg:px-8">
        <Link href="/" className="flex items-center text-zinc-100 transition hover:text-white">
          <span className="text-[22px] font-semibold tracking-wide">Memory的小破站</span>
        </Link>

        <form
          className="hidden justify-self-center md:block"
          onSubmit={(event) => {
            event.preventDefault();
            commitSearch(inputValue);
          }}
        >
          <label htmlFor="site-search" className="flex items-center rounded-full border border-outline-variant/50 bg-surface-container/50 px-3 py-1.5 text-sm text-zinc-500 transition focus-within:border-blue-400/30 focus-within:bg-[#1b1d24]">
            <span className="material-symbols-outlined mr-2 text-[18px] leading-none text-zinc-600">search</span>
            <input
              id="site-search"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                onSearchChange?.(event.target.value);
              }}
              placeholder="搜索标题/摘要/分类/标签"
              className="w-64 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
            />
            {inputValue ? (
              <button
                type="button"
                aria-label="清空搜索内容"
                onClick={() => commitSearch("")}
                className="ml-2 rounded-full px-1.5 py-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-[16px] leading-none">close</span>
              </button>
            ) : null}
          </label>
        </form>

        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <Link href={notificationHref} aria-label="消息通知" className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
                <span className="material-symbols-outlined text-[20px] leading-none">notifications</span>
                {unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#adc6ff] px-1.5 text-[10px] font-semibold text-[#10131a]">{unreadCount}</span> : null}
              </Link>
              <Link href={profileHref} aria-label="用户中心" className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-blue-400/20 bg-[#b8c9ff] transition hover:scale-[1.02]">
                <Image src={avatarSrc} alt="用户头像" width={44} height={44} className="h-full w-full object-cover" />
              </Link>
            </>
          ) : (
            <>
              <button type="button" onClick={() => openAuth("login")} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/5">
                登录
              </button>
              <button type="button" onClick={() => openAuth("register")} className="rounded-xl bg-[#b8c9ff] px-5 py-2.5 text-sm font-medium text-[#14161b] shadow-[0_12px_30px_rgba(112,143,255,0.25)] transition hover:bg-[#c3d2ff]">
                注册
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
