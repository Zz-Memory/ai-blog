"use client";

import { useMemo, useState } from "react";

import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { HomeArticleList, featuredPosts } from "@/components/home/home-article-list";
import { HomePagination } from "@/components/home/home-pagination";
import { AuthModal } from "@/components/auth/auth-modal";

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
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const filteredPosts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return featuredPosts;

    return featuredPosts.filter((post) => {
      const haystack = [post.title, post.excerpt, post.category, ...post.tags].join(" ").toLowerCase();
      return haystack.includes(keyword);
    });
  }, [searchKeyword]);

  const isAuthenticated = false;

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={(value) => setSearchKeyword(value)}
        onLoginClick={() => {
          setAuthEntry("login");
          setAuthOpen(true);
        }}
        onRegisterClick={() => {
          setAuthEntry("register");
          setAuthOpen(true);
        }}
        isAuthenticated={isAuthenticated}
      />

      {/* 主内容区：左侧固定栏 + 右侧文章流 */}
      <main className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-10">
        <HomeSidebar />

        <section className="space-y-8">
          <HomeArticleList posts={filteredPosts} />
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
