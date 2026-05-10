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
    if (mode === "login") onLoginClick?.();
    if (mode === "register") onRegisterClick?.();

    if (!onLoginClick && !onRegisterClick) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      params.set("auth", mode);
      router.push(`/?${params.toString()}`);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-cyan-100/70 bg-white/82 shadow-[0_12px_35px_rgba(56,189,248,0.1)] backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[1200px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-6 lg:px-8">
        <Link href="/" className="flex items-center text-cyan-950 transition hover:text-cyan-700">
          <span className="text-[22px] font-semibold tracking-wide">Memory的小破站</span>
        </Link>

        <form
          className="hidden justify-self-center md:block"
          onSubmit={(event) => {
            event.preventDefault();
            commitSearch(inputValue);
          }}
        >
          <label htmlFor="site-search" className="flex items-center rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1.5 text-sm text-slate-600 transition focus-within:border-cyan-300/70 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.12)]">
            <span className="material-symbols-outlined mr-2 text-[18px] leading-none text-cyan-600">search</span>
            <input
              id="site-search"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                onSearchChange?.(event.target.value);
              }}
              placeholder="搜索标题/摘要/分类/标签"
              className="w-64 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            {inputValue ? (
              <button
                type="button"
                aria-label="清空搜索内容"
                onClick={() => commitSearch("")}
                className="ml-2 rounded-full px-1.5 py-1 text-slate-400 transition hover:bg-cyan-100 hover:text-cyan-800"
              >
                <span className="material-symbols-outlined text-[16px] leading-none">close</span>
              </button>
            ) : null}
          </label>
        </form>

        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <Link href={notificationHref} aria-label="消息通知" className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100 bg-white text-cyan-600 shadow-[0_10px_28px_rgba(56,189,248,0.12)] transition hover:border-cyan-300/70 hover:bg-cyan-50 hover:text-violet-600">
                <span className="material-symbols-outlined text-[20px] leading-none">notifications</span>
                {unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-1.5 text-[10px] font-semibold text-white">{unreadCount}</span> : null}
              </Link>
              <Link href={profileHref} aria-label="用户中心" className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-cyan-100 bg-gradient-to-br from-cyan-50 to-violet-50 transition hover:scale-[1.02]">
                <Image src={avatarSrc} alt="用户头像" width={44} height={44} className="h-full w-full object-cover" />
              </Link>
            </>
          ) : (
            <>
              <button type="button" onClick={() => openAuth("login")} className="rounded-xl border border-cyan-100 px-5 py-2.5 text-sm text-cyan-950 transition hover:bg-cyan-50 hover:shadow-[0_10px_24px_rgba(34,211,238,0.12)]">
                登录
              </button>
              <button type="button" onClick={() => openAuth("register")} className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(34,211,238,0.26)] transition hover:brightness-105">
                注册
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
