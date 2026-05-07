import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { Prisma, PostStatus, UserRole } from "@prisma/client";

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isBlogger(role: string) {
  return role === UserRole.BLOGGER;
}

function formatUpdatedAt(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeSearch(search: string | null) {
  return (search ?? "").trim();
}

function parseStatus(status: string | null) {
  if (status === "published") return PostStatus.PUBLISHED;
  if (status === "draft") return PostStatus.DRAFT;
  return null;
}

function buildWhere(params: { authorId: string; status: PostStatus | null; search: string }) {
  const where: Prisma.PostWhereInput = {
    authorId: params.authorId,
    ...(params.status ? { status: params.status } : {}),
    ...(params.search
      ? {
        OR: [
          { title: { contains: params.search, mode: "insensitive" as const } },
          { summary: { contains: params.search, mode: "insensitive" as const } },
          { category: { name: { contains: params.search, mode: "insensitive" as const } } },
          { postTags: { some: { tag: { name: { contains: params.search, mode: "insensitive" as const } } } } },
        ],
      }
      : {}),
  };

  return where;
}

function makeDraftSlug() {
  return `draft-${crypto.randomUUID().replace(/-/g, "")}`;
}

function mapArticle(post: {
  id: string;
  title: string;
  summary: string | null;
  contentMarkdown: string;
  slug?: string;
  status: PostStatus;
  updatedAt: Date;
  category: { name: string } | null;
  postTags: Array<{ tag: { name: string } }>;
}) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug ?? "",
    contentMarkdown: post.contentMarkdown,
    excerpt: post.summary ?? "暂无摘要",
    tags: post.postTags.map((item) => item.tag.name),
    updatedAt: formatUpdatedAt(post.updatedAt),
    status: post.status === PostStatus.PUBLISHED ? "published" : "draft",
    category: post.category?.name ?? "未分类",
  };
}

export async function GET(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ articles: [], page: 1, pageSize: 6, total: 0, totalPages: 1, counts: { published: 0, draft: 0 } }, { status: 401 });
  }

  if (!isBlogger(auth.user.role)) {
    return NextResponse.json({ message: "无权限访问。" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const post = await prisma.post.findFirst({
      where: { id, authorId: auth.user.id },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        contentMarkdown: true,
        contentHtml: true,
        status: true,
        updatedAt: true,
        category: { select: { id: true, name: true } },
        postTags: { select: { tag: { select: { id: true, name: true } } } },
      },
    });

    if (!post) return NextResponse.json({ message: "文章不存在。" }, { status: 404 });

    return NextResponse.json({
      article: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary ?? "",
        contentMarkdown: post.contentMarkdown,
        contentHtml: post.contentHtml ?? "",
        status: post.status === PostStatus.PUBLISHED ? "published" : "draft",
        updatedAt: formatUpdatedAt(post.updatedAt),
        category: post.category,
        tags: post.postTags.map((item) => item.tag),
      },
    });
  }

  const meta = url.searchParams.get("meta") === "1";
  if (meta) {
    const [categories, tags] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.tag.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);
    return NextResponse.json({ categories, tags });
  }

  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.max(1, Math.min(20, Number(url.searchParams.get("pageSize") ?? "6") || 6));
  const search = normalizeSearch(url.searchParams.get("search"));
  const status = parseStatus(url.searchParams.get("status"));
  const skip = (page - 1) * pageSize;

  const where = buildWhere({ authorId: auth.user.id, status, search });

  const [total, counts, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.groupBy({
      by: ["status"],
      where: { authorId: auth.user.id, ...(search ? buildWhere({ authorId: auth.user.id, status: null, search }) : {}) },
      _count: { _all: true },
    }),
    prisma.post.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        summary: true,
        contentMarkdown: true,
        status: true,
        updatedAt: true,
        category: { select: { name: true } },
        postTags: { select: { tag: { select: { name: true } } } },
      },
    }),
  ]);

  return NextResponse.json({
    articles: posts.map(mapArticle),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    counts: {
      published: counts.find((item) => item.status === PostStatus.PUBLISHED)?._count._all ?? 0,
      draft: counts.find((item) => item.status === PostStatus.DRAFT)?._count._all ?? 0,
    },
  });
}

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  if (!isBlogger(auth.user.role)) return NextResponse.json({ message: "无权限访问。" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { id?: string; action?: string } | null;
  if (body?.action !== "create-draft") return NextResponse.json({ message: "不支持的操作。" }, { status: 400 });

  const existingDraft = await prisma.post.findFirst({
    where: { authorId: auth.user.id, status: PostStatus.DRAFT, title: "", contentMarkdown: "" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, contentMarkdown: true },
  });

  if (existingDraft) {
    return NextResponse.json({ ok: true, article: mapArticle({ ...existingDraft, summary: null, status: PostStatus.DRAFT, updatedAt: new Date(), category: null, postTags: [] }) });
  }

  const created = await prisma.post.create({
    data: {
      authorId: auth.user.id,
      title: "",
      slug: makeDraftSlug(),
      summary: null,
      contentMarkdown: "",
      contentHtml: "",
      status: PostStatus.DRAFT,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      contentMarkdown: true,
      status: true,
      updatedAt: true,
      category: { select: { name: true } },
      postTags: { select: { tag: { select: { name: true } } } },
    },
  });

  return NextResponse.json({ ok: true, article: mapArticle(created) });
}

export async function PATCH(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  if (!isBlogger(auth.user.role)) return NextResponse.json({ message: "无权限访问。" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    action?: string;
    title?: string;
    contentMarkdown?: string;
    contentHtml?: string;
    slug?: string;
    summary?: string;
    categoryId?: string | null;
    tagIds?: string[];
  } | null;
  if (!body?.id || !body.action) return NextResponse.json({ message: "缺少必要参数。" }, { status: 400 });

  const post = await prisma.post.findFirst({ where: { id: body.id, authorId: auth.user.id }, select: { id: true, status: true, slug: true } });
  if (!post) return NextResponse.json({ message: "文章不存在。" }, { status: 404 });

  if (body.action === "save") {
    const updated = await prisma.post.update({
      where: { id: post.id },
      data: {
        title: body.title ?? "",
        slug: body.slug ?? makeDraftSlug(),
        summary: body.summary ?? body.contentMarkdown?.slice(0, 120) ?? null,
        contentMarkdown: body.contentMarkdown ?? "",
        contentHtml: body.contentHtml ?? "",
        ...(body.categoryId ? { categoryId: body.categoryId } : {}),
      },
      select: { updatedAt: true },
    });

    if (Array.isArray(body.tagIds)) {
      await prisma.postTag.deleteMany({ where: { postId: post.id } });
      if (body.tagIds.length > 0) {
        await prisma.postTag.createMany({ data: body.tagIds.map((tagId) => ({ postId: post.id, tagId })), skipDuplicates: true });
      }
    }

    return NextResponse.json({ ok: true, updatedAt: updated.updatedAt.toISOString() });
  }

  if (body.action === "publish") {
    const slug = body.slug?.trim();
    if (!slug) return NextResponse.json({ message: "Slug 为必填项。" }, { status: 400 });

    const duplicate = await prisma.post.findFirst({
      where: { slug, NOT: { id: post.id } },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ message: "Slug 已存在，请更换后再发布。" }, { status: 409 });
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: {
        title: body.title ?? "",
        slug,
        summary: body.summary ?? body.contentMarkdown?.slice(0, 120) ?? null,
        contentMarkdown: body.contentMarkdown ?? "",
        contentHtml: body.contentHtml ?? "",
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        ...(body.categoryId ? { categoryId: body.categoryId } : {}),
      },
      select: { updatedAt: true },
    });

    await prisma.postTag.deleteMany({ where: { postId: post.id } });
    if (Array.isArray(body.tagIds) && body.tagIds.length > 0) {
      await prisma.postTag.createMany({ data: body.tagIds.map((tagId) => ({ postId: post.id, tagId })), skipDuplicates: true });
    }

    return NextResponse.json({ ok: true, updatedAt: updated.updatedAt.toISOString(), status: "published" });
  }

  if (body.action !== "publish" && body.action !== "retract") {
    return NextResponse.json({ message: "不支持的操作。" }, { status: 400 });
  }

  const nextStatus = body.action === "publish" ? PostStatus.PUBLISHED : PostStatus.DRAFT;
  await prisma.post.update({ where: { id: post.id }, data: { status: nextStatus, publishedAt: nextStatus === PostStatus.PUBLISHED ? new Date() : null } });
  return NextResponse.json({ ok: true, status: nextStatus === PostStatus.PUBLISHED ? "published" : "draft" });
}

export async function DELETE(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  if (!isBlogger(auth.user.role)) return NextResponse.json({ message: "无权限访问。" }, { status: 403 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ message: "缺少文章标识。" }, { status: 400 });

  const post = await prisma.post.findFirst({ where: { id, authorId: auth.user.id }, select: { id: true } });
  if (!post) return NextResponse.json({ message: "文章不存在。" }, { status: 404 });

  await prisma.post.delete({ where: { id: post.id } });
  return NextResponse.json({ ok: true });
}
