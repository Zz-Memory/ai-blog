"use client";

import { useState } from "react";

import { SiteFooter } from "@/components/blog/site-footer";
import { SiteHeader } from "@/components/blog/site-header";
import { HomeSidebar } from "@/components/blog/home-sidebar";
import { HomeArticleList } from "@/components/blog/home-article-list";
import { HomePagination } from "@/components/blog/home-pagination";
import { AuthModal } from "@/components/blog/auth-modal";

type AuthEntry = "login" | "register";

// 首页是由多个相对独立的模块拼接而成：
// 1. 顶部导航栏
// 2. 左侧作者信息 / 标签 / AI 助手侧栏
// 3. 右侧文章列表
// 4. 分页区域
// 5. 底部版权栏
// 这样拆分后，后续可以直接复用这些模块到文章详情页、搜索页或标签页。
export function HomePage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authEntry, setAuthEntry] = useState<AuthEntry>("login");

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader
        onLoginClick={() => {
          setAuthEntry("login");
          setAuthOpen(true);
        }}
        onRegisterClick={() => {
          setAuthEntry("register");
          setAuthOpen(true);
        }}
      />

      {/* 主内容区：左侧固定栏 + 右侧文章流 */}
      <main className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-10">
        <HomeSidebar />

        <section className="space-y-8">
          <HomeArticleList />
          <HomePagination />
        </section>
      </main>

      <SiteFooter />
      <AuthModal
        isOpen={authOpen}
        initialMode={authEntry}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
