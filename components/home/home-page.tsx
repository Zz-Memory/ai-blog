import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { HomeArticleList, type FeaturedPost } from "@/components/home/home-article-list";
import { HomePagination, type PaginationItem } from "@/components/home/home-pagination";
import { HomeSidebar, type HomeSidebarCategory, type HomeSidebarTag } from "@/components/home/home-sidebar";
import { HomeAuthModal } from "@/components/home/home-auth-modal";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  q?: string;
  tag?: string;
  category?: string;
  page?: string;
  auth?: string;
};

type HomePageProps = {
  searchParams?: Promise<SearchParams>;
};

const PAGE_SIZE = 4;

function formatDate(date: Date | null) {
  if (!date) return "未发布";
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date).replaceAll("/", ".");
}

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

function buildQueryHref(params: { q?: string; category?: string; tag?: string; page?: number; auth?: string }) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.category) searchParams.set("category", params.category);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.page && params.page > 1) searchParams.set("page", String(params.page));
  if (params.auth) searchParams.set("auth", params.auth);
  const query = searchParams.toString();
  return query ? `/?${query}` : "/";
}

async function getSidebarData(current: { q?: string; category?: string; tag?: string }) {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
    }),
    prisma.tag.findMany({
      where: { postTags: { some: { post: { status: "PUBLISHED" } } } },
      orderBy: [{ postTags: { _count: "desc" } }, { name: "asc" }],
      take: 10,
      include: { _count: { select: { postTags: { where: { post: { status: "PUBLISHED" } } } } } },
    }),
  ]);

  const categoryItems: HomeSidebarCategory[] = [
    { name: "全部", count: categories.reduce((sum, item) => sum + item._count.posts, 0), active: !current.category, href: buildQueryHref({ q: current.q, tag: current.tag }) },
    ...categories.map((item) => ({
      name: item.name,
      count: item._count.posts,
      active: current.category === item.name,
      href: buildQueryHref({ q: current.q, category: item.name, tag: current.tag }),
    })),
  ];

  const tagItems: HomeSidebarTag[] = tags
    .filter((item) => item._count.postTags > 0)
    .map((item) => ({
      name: item.name,
      count: item._count.postTags,
      active: current.tag === item.name,
      href: current.tag === item.name ? buildQueryHref({ q: current.q, category: current.category }) : buildQueryHref({ q: current.q, category: current.category, tag: item.name }),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 10);

  return { categories: categoryItems, hotTags: tagItems };
}

async function getHomePosts(params: { q?: string; category?: string; tag?: string; page: number; userId?: string | null }): Promise<{ posts: FeaturedPost[]; totalCount: number }> {
  const { q, category, tag, page, userId } = params;
  const andConditions = [] as Record<string, unknown>[];
  if (category) andConditions.push({ category: { name: category } });
  if (tag) andConditions.push({ postTags: { some: { tag: { name: tag } } } });
  if (q) {
    andConditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
        { postTags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    });
  }

  const where = { status: "PUBLISHED" as const, ...(andConditions.length ? { AND: andConditions } : {}) };

  const [totalCount, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        category: true,
        postTags: { include: { tag: true } },
        _count: { select: { likes: true, bookmarks: true, comments: true } },
        likes: userId ? { where: { userId } } : false,
        bookmarks: userId ? { where: { userId } } : false,
      },
    }),
  ]);

  return {
    totalCount,
    posts: posts.map((post) => ({
      postId: post.id,
      title: post.title,
      date: formatDate(post.publishedAt ?? post.createdAt),
      category: post.category?.name ?? "未分类",
      excerpt: post.summary ?? post.contentMarkdown.slice(0, 160),
      tags: post.postTags.map((item) => item.tag.name).slice(0, 4),
      stats: { views: formatCount(post._count.likes * 18 + post._count.comments * 12 + post._count.bookmarks * 8 + 360), likes: post._count.likes, favorites: post._count.bookmarks, comments: post._count.comments },
      href: `/article/${post.slug}`,
      isLiked: userId ? post.likes.length > 0 : false,
      isBookmarked: userId ? post.bookmarks.length > 0 : false,
    })),
  };
}

export async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const q = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const tag = params.tag?.trim() || "";
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const showAuthModal = params.auth === "login" || params.auth === "register";
  const initialAuthMode = params.auth === "register" ? "register" : "login";

  const auth = await getAuthUser();
  const userId = auth?.user.id ?? null;

  const [{ posts, totalCount }, sidebarData] = await Promise.all([
    getHomePosts({ q, category, tag, page: currentPage, userId }),
    getSidebarData({ q, category, tag }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const startPage = Math.max(1, Math.min(currentPage - 1, Math.max(1, totalPages - 2)));
  const endPage = Math.min(totalPages, startPage + 2);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  const paginationItems: PaginationItem[] = pages.map((page) => ({ page, href: buildQueryHref({ q, category, tag, page }), isCurrent: page === currentPage }));

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader searchValue={q} />

      <main className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-10">
        <HomeSidebar categories={sidebarData.categories} hotTags={sidebarData.hotTags} />

        <section className="space-y-8">
          <HomeArticleList posts={posts} />
          <HomePagination
            currentPage={currentPage}
            totalPages={totalPages}
            items={paginationItems}
            prevHref={currentPage > 1 ? buildQueryHref({ q, category, tag, page: currentPage - 1 }) : undefined}
            nextHref={currentPage < totalPages ? buildQueryHref({ q, category, tag, page: currentPage + 1 }) : undefined}
          />
        </section>
      </main>

      <SiteFooter />
      {showAuthModal ? <HomeAuthModal isOpen={showAuthModal} initialMode={initialAuthMode} /> : null}
    </div>
  );
}
