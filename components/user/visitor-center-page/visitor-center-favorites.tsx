"use client";

import { useMemo, useState } from "react";

import { ArticleCard } from "@/components/common/article-card";

import { VisitorCenterConfirmModal } from "./visitor-center-confirm-modal";
import { favoriteFolders, type FavoriteFolder } from "./favorite-folders";
import type { LikedArticle } from "./liked-articles";

// “我的收藏”功能模块使用的数据结构。
// 这里让“收藏夹”和“文章列表”同时存在，以匹配设计稿中的收藏管理布局。
type VisitorCenterFavoritesProps = {
  articles: LikedArticle[];
};

type FolderDialogMode = "create" | "rename";

type DeleteConfirmState = {
  open: boolean;
  folder: FavoriteFolder | null;
};

function FolderCard({
  folder,
  active = false,
  onRename,
  onDelete,
}: {
  folder: FavoriteFolder;
  active?: boolean;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group relative flex min-h-[110px] flex-col justify-between rounded-xl border p-5 transition-all ${active
        ? "border-[#adc6ff]/40 bg-[#161a26] shadow-[inset_0_0_0_1px_rgba(173,198,255,0.12)]"
        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/5"
        }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`material-symbols-outlined text-[28px] ${active ? "text-[#adc6ff]" : "text-zinc-400"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {folder.isDefault ? "folder_open" : "folder"}
        </span>
        <span className={`text-lg font-medium transition-colors ${active ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
          {folder.name}
        </span>
      </div>
      <div className={`text-sm font-medium ${active ? "text-[#adc6ff]/80" : "text-zinc-500"}`}>{folder.count} 篇文章</div>
      {!folder.isDefault ? (
        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" className="text-zinc-400 transition-colors hover:text-white" title="重命名" onClick={onRename}>
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button type="button" className="text-zinc-400 transition-colors hover:text-red-400" title="删除" onClick={onDelete}>
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FolderDialog({
  open,
  mode,
  value,
  onChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  mode: FolderDialogMode;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const title = mode === "create" ? "新建收藏夹" : "重命名收藏夹";
  const confirmLabel = mode === "create" ? "创建" : "保存";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" aria-label={`关闭${title}`} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#18191d] p-6 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
        <h3 className="text-xl font-semibold text-zinc-100">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-400">请输入收藏夹名称，便于后续管理你保存的内容。</p>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="例如：AI 设计灵感"
          className="mt-5 w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[#adc6ff]/50"
        />
        <div className="mt-6 flex gap-3">
          <button type="button" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:bg-white/10" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-[#adc6ff] px-4 py-3 text-sm font-medium text-[#001a41] transition hover:bg-[#c3d2ff] disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-400"
            onClick={onConfirm}
            disabled={!value.trim()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// “我的收藏”功能模块。
// 右侧区域由收藏夹、当前收藏夹文章列表和操作弹窗组成。
export function VisitorCenterFavorites({ articles }: VisitorCenterFavoritesProps) {
  const [folders, setFolders] = useState(favoriteFolders);
  const [foldersCollapsed, setFoldersCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<FolderDialogMode>("create");
  const [dialogValue, setDialogValue] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState("default");
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ open: false, folder: null });

  const defaultFolderArticles = useMemo(() => articles.slice(0, 3), [articles]);
  const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? folders[0];

  const openCreateDialog = () => {
    setDialogMode("create");
    setDialogValue("");
    setEditingFolderId(null);
    setDialogOpen(true);
  };

  const openRenameDialog = (folder: FavoriteFolder) => {
    setDialogMode("rename");
    setDialogValue(folder.name);
    setEditingFolderId(folder.id);
    setDialogOpen(true);
  };

  const openDeleteConfirm = (folder: FavoriteFolder) => {
    setDeleteConfirm({ open: true, folder });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ open: false, folder: null });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogValue("");
    setEditingFolderId(null);
  };

  const confirmDialog = () => {
    const nextName = dialogValue.trim();
    if (!nextName) return;

    if (dialogMode === "create") {
      const newFolder: FavoriteFolder = {
        id: `folder-${Date.now()}`,
        name: nextName,
        count: 0,
      };
      setFolders((current) => [...current, newFolder]);
      setActiveFolderId(newFolder.id);
    }

    if (dialogMode === "rename" && editingFolderId) {
      setFolders((current) =>
        current.map((folder) => (folder.id === editingFolderId ? { ...folder, name: nextName } : folder))
      );
    }

    closeDialog();
  };

  const confirmDeleteFolder = () => {
    const folder = deleteConfirm.folder;
    if (!folder || folder.isDefault) return;

    setFolders((current) => current.filter((item) => item.id !== folder.id));
    if (activeFolderId === folder.id) {
      setActiveFolderId("default");
    }
    closeDeleteConfirm();
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-[48px] font-bold tracking-[-0.02em] text-zinc-100">我的收藏</h2>
        <p className="max-w-2xl text-[17px] leading-8 text-zinc-400">快把宝藏文章存起来吧。</p>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-zinc-500">收藏夹管理</div>
          <button
            type="button"
            onClick={() => setFoldersCollapsed((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[18px]">{foldersCollapsed ? "expand_more" : "expand_less"}</span>
            {foldersCollapsed ? "展开" : "收起"}
          </button>
        </div>

        {!foldersCollapsed ? (
          <div className="max-h-[260px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {folders.map((folder) => (
                <div key={folder.id} onClick={() => setActiveFolderId(folder.id)}>
                  <FolderCard
                    folder={folder}
                    active={folder.id === activeFolderId}
                    onRename={() => openRenameDialog(folder)}
                    onDelete={() => openDeleteConfirm(folder)}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={openCreateDialog}
                className="flex min-h-[110px] flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-transparent p-5 text-zinc-400 transition-all hover:border-white/40 hover:bg-white/5 hover:text-white"
              >
                <span className="material-symbols-outlined mb-2 text-[28px]">create_new_folder</span>
                <span className="text-sm font-medium">新建收藏夹</span>
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-zinc-100">
            <span className="material-symbols-outlined text-[#adc6ff]">folder_open</span>
            {activeFolder?.name ?? "默认收藏夹"}
          </h3>
          <div className="text-sm text-zinc-500">共 {defaultFolderArticles.length} 篇</div>
        </div>

        <div className="space-y-4">
          {defaultFolderArticles.length ? (
            defaultFolderArticles.map((article) => (
              <div key={article.title} className="rounded-xl border border-white/8 bg-[#17181d] p-0">
                <ArticleCard
                  href="#"
                  compact
                  title={article.title}
                  date={article.date}
                  category={article.category}
                  excerpt={article.excerpt}
                  tags={article.tags}
                  stats={article.stats}
                />
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-zinc-500">
              当前收藏夹里还没有文章。
            </div>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
          >
            加载更多
          </button>
        </div>
      </section>

      <FolderDialog open={dialogOpen} mode={dialogMode} value={dialogValue} onChange={setDialogValue} onClose={closeDialog} onConfirm={confirmDialog} />

      <VisitorCenterConfirmModal
        open={deleteConfirm.open}
        title="确认删除收藏夹"
        description={deleteConfirm.folder ? `确定要删除收藏夹「${deleteConfirm.folder.name}」吗？删除后该收藏夹将无法恢复。` : "确定要删除这个收藏夹吗？删除后该收藏夹将无法恢复。"}
        cancelLabel="取消"
        confirmLabel="确认删除"
        confirmButtonClassName="bg-rose-500 text-white hover:bg-rose-400"
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteFolder}
      />
    </div>
  );
}
