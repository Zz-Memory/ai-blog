# 项目架构

## 一、设计稿页面统计

根据 `design/` 目录下的 HTML 文件与截图内容，可整理出本项目的页面与模块如下。考虑到设计稿中部分页面仅提供截图或空白 HTML 文件，但结合文件夹命名、页面标题、界面内容与课题需求，仍可明确其页面职责。

### 1. 首页 / 博客首页
- **设计稿来源**：`design/Memory的小破站-博客首页模块/`
- **页面名称**：博客首页
- **页面定位**：访客端公共首页
- **主要功能模块**：
  - 站点顶部导航栏
  - 搜索框
  - 登录 / 注册入口
  - 博主信息简介卡片
  - 热门标签展示
  - AI 小助手推荐卡
  - 博客文章列表
  - 分页组件
  - 公共页脚
- **建议组件命名**：
  - `SiteHeader`
  - `HomeSearchBar`
  - `AuthActions`
  - `BloggerProfileCard`
  - `HotTagList`
  - `AiAssistantHintCard`
  - `ArticleCard`
  - `ArticleList`
  - `Pagination`
  - `SiteFooter`

### 2. 文章详情页
- **设计稿来源**：`design/Memory的小破站-文章详情模块/`
- **页面名称**：文章详情页
- **页面定位**：访客端公共阅读页
- **主要功能模块**：
  - 站点顶部导航栏
  - 文章标题与元信息
  - 文章正文 Markdown 渲染区
  - 正文图片展示
  - 文章标签区
  - 点赞 / 评论 / 收藏 / 分享浮动操作栏
  - 评论发布区
  - 评论列表
  - 右侧目录导航
  - AI 问答悬浮球
  - AI 问答弹窗面板
  - 公共页脚
- **建议组件命名**：
  - `SiteHeader`
  - `ArticleMetaBar`
  - `ArticleContent`
  - `ArticleTagList`
  - `ArticleActionFloatBar`
  - `CommentComposer`
  - `CommentList`
  - `TableOfContents`
  - `AiChatFloatingButton`
  - `AiChatPanel`
  - `SiteFooter`

### 3. 登录与注册页
- **设计稿来源**：`design/Memory的小破站-登录与注册模块/`
- **页面名称**：统一身份认证页
- **页面定位**：登录 / 注册公共页
- **主要功能模块**：
  - 品牌标题区域
  - 登录 / 注册标签切换
  - 账号 / 邮箱登录表单
  - 邮箱验证码注册表单
  - 密码显示 / 隐藏按钮
  - 忘记密码入口
  - 条款与隐私说明
- **建议组件命名**：
  - `AuthShell`
  - `BrandBanner`
  - `AuthTabs`
  - `LoginForm`
  - `RegisterForm`
  - `VerificationCodeButton`
  - `PasswordVisibilityToggle`
  - `AuthPolicyNotice`

### 4. 访客端个人中心 - 浏览记录页
- **设计稿来源**：`design/访客端-个人中心-浏览记录模块/`
- **页面名称**：浏览记录页
- **页面定位**：访客端个人中心子页
- **主要功能模块**：
  - 顶部导航栏
  - 左侧个人中心菜单
  - 浏览记录页头部信息
  - 浏览记录搜索框
  - 按日期分组的历史记录列表
  - 加载更早记录按钮
  - 页脚
- **建议组件命名**：
  - `AccountHeader`
  - `VisitorSidebar`
  - `HistoryPageHeader`
  - `HistorySearchBar`
  - `HistoryTimeline`
  - `HistoryGroup`
  - `HistoryRecordCard`
  - `LoadMoreHistoryButton`
  - `SiteFooter`

### 5. 访客端个人中心 - 我的收藏页
- **设计稿来源**：`design/访客端-个人中心-我的收藏模块/`
- **页面名称**：我的收藏页
- **页面定位**：访客端个人中心子页
- **主要功能模块**：
  - 顶部导航栏
  - 左侧个人中心菜单
  - 收藏夹管理区
  - 新建收藏夹入口
  - 当前收藏夹文章列表
  - 收藏文章卡片
  - 收藏夹重命名 / 删除
  - 页脚
- **建议组件命名**：
  - `AccountHeader`
  - `VisitorSidebar`
  - `CollectionPageHeader`
  - `CollectionFolderGrid`
  - `CollectionFolderCard`
  - `CreateFolderCard`
  - `BookmarkedPostCard`
  - `SiteFooter`

### 6. 访客端个人中心 - 消息通知页
- **设计稿来源**：`design/访客端-个人中心-消息通知模块/`
- **页面名称**：消息通知页
- **页面定位**：访客端个人中心子页
- **主要功能模块**：
  - 顶部导航栏
  - 左侧个人中心菜单
  - 通知分类标签页
  - 通知列表
  - 点赞 / 收藏 / 评论 / 系统消息卡片
  - 空状态 / 结束标记
  - 页脚
- **建议组件命名**：
  - `AccountHeader`
  - `VisitorSidebar`
  - `NotificationPageHeader`
  - `NotificationTabBar`
  - `NotificationItem`
  - `SystemNotificationItem`
  - `SiteFooter`

### 7. 访客端个人中心 - 账号设置页
- **设计稿来源**：`design/访客端-个人中心-账号设置模块/`
- **页面名称**：账号设置页（访客端）
- **页面定位**：访客端个人中心子页
- **主要功能模块**：
  - 个人资料编辑
  - 头像设置
  - 昵称 / 邮箱 / 密码修改
  - 绑定邮箱与安全信息管理
  - 账号注销入口
  - 二次验证或安全提示
- **建议组件命名**：
  - `AccountHeader`
  - `VisitorSidebar`
  - `ProfileCard`
  - `AvatarUploader`
  - `BasicInfoForm`
  - `SecuritySettingsForm`
  - `AccountDangerZone`
  - `SiteFooter`

### 8. 访客端个人中心 - 我的评论页
- **设计稿来源**：`design/访客端-个人中心-我的评论/`
- **页面名称**：我的评论页
- **页面定位**：访客端个人中心子页
- **主要功能模块**：
  - 我的评论列表
  - 评论所在文章信息
  - 评论时间与状态
  - 评论编辑 / 删除
  - 评论回复提醒
- **建议组件命名**：
  - `AccountHeader`
  - `VisitorSidebar`
  - `MyCommentList`
  - `MyCommentItem`
  - `CommentStatusBadge`
  - `SiteFooter`

### 9. 访客端个人中心 - 我的点赞页
- **设计稿来源**：`design/访客端-个人中心-我的点赞/`
- **页面名称**：我的点赞页
- **页面定位**：访客端个人中心子页
- **主要功能模块**：
  - 我的点赞文章列表
  - 点赞时间记录
  - 文章跳转入口
  - 取消点赞操作
- **建议组件命名**：
  - `AccountHeader`
  - `VisitorSidebar`
  - `MyLikeList`
  - `MyLikeItem`
  - `SiteFooter`

### 10. 博主端个人中心 - 数据概览页
- **设计稿来源**：`design/博主端-个人中心-数据概览模块/`
- **页面名称**：数据概览页
- **页面定位**：博主端个人中心首页
- **主要功能模块**：
  - 顶部导航栏
  - 左侧博主菜单
  - 核心数据卡片（访问量、参与率、待审核评论等）
  - 近期评论列表
  - 评论快捷处理按钮
  - 页脚
- **建议组件命名**：
  - `AdminHeader`
  - `BloggerSidebar`
  - `OverviewHeroCard`
  - `StatisticCard`
  - `RecentCommentList`
  - `CommentQuickAction`
  - `SiteFooter`

### 11. 博主端个人中心 - 文章管理页
- **设计稿来源**：`design/博主端-个人中心-文章管理模块/`
- **页面名称**：文章管理页
- **页面定位**：博主端内容管理页
- **主要功能模块**：
  - 顶部导航栏
  - 左侧博主菜单
  - 文章搜索
  - 已发布 / 草稿箱标签页
  - 文章表格列表
  - 每篇文章的发布 / 撤回 / 编辑 / 删除操作
  - 分页组件
  - 页脚
- **建议组件命名**：
  - `AdminHeader`
  - `BloggerSidebar`
  - `ArticleManageHeader`
  - `ArticleStatusTabs`
  - `ArticleTable`
  - `ArticleTableRow`
  - `ArticleOperationMenu`
  - `Pagination`
  - `SiteFooter`

### 12. 博主端个人中心 - 评论审核页
- **设计稿来源**：`design/博主端-个人中心-评论审核模块/`
- **页面名称**：评论审核页
- **页面定位**：博主端互动管理页
- **主要功能模块**：
  - 顶部导航栏
  - 左侧博主菜单
  - 审核标签页（全部 / 待审核 / 已通过）
  - 评论审核列表
  - 通过审核 / 违规删除操作
  - 分页组件
  - 页脚
- **建议组件命名**：
  - `AdminHeader`
  - `BloggerSidebar`
  - `CommentReviewHeader`
  - `ReviewTabBar`
  - `ReviewCommentCard`
  - `ReviewActionGroup`
  - `Pagination`
  - `SiteFooter`

### 13. 博主端 AI 博客编辑器页
- **设计稿来源**：`design/博主端-AI博客编辑器模块/`
- **页面名称**：AI 博客编辑器页 / 新建文章页
- **页面定位**：博主端独立创作页，仅博主可访问，由“新建文章”跳转进入
- **权限说明**：该页为博主专属页面，使用独立的 Header 与 Footer 组件，和个人中心公共布局分离
- **主要功能模块**：
  - 独立编辑页顶部栏
  - 文章标题输入
  - 保存状态提示
  - AI 开关与小智助手入口
  - 草稿箱入口
  - 发布文章按钮
  - Markdown 工具栏
  - 目录 / 导入 / 编辑模式 / 预览模式切换
  - Markdown 文本编辑区
  - Markdown 预览区
  - 图片插入与展示
  - 图片引用删除后自动清理
  - 独立底部状态栏
- **建议组件命名**：
  - `EditorHeader`
  - `EditorTitleInput`
  - `EditorStatusIndicator`
  - `AiAssistantSwitch`
  - `DraftBoxButton`
  - `PublishArticleButton`
  - `MarkdownToolbar`
  - `MarkdownToolbarGroup`
  - `EditorModeActions`
  - `MarkdownEditorPane`
  - `MarkdownPreviewPane`
  - `EditorFooterStatusBar`

### 14. 博主端个人中心 - 访客工具组
- **设计稿来源**：
  - `design/博主端-个人中心-数据概览模块/`
  - `design/博主端-个人中心-文章管理模块/`
  - `design/博主端-个人中心-评论审核模块/`
  - `design/博主端-个人中心-发送消息模块/`
- **页面名称**：访客工具分组
- **页面定位**：博主端个人中心侧边栏分组
- **主要功能模块**：
  - 浏览记录
  - 我的点赞
  - 我的收藏
  - 我的评论
  - 消息通知
  - 账号设置
  - 退出登录
- **建议组件命名**：
  - `VisitorToolGroup`
  - `VisitorHistoryNavItem`
  - `VisitorLikeNavItem`
  - `VisitorCollectionNavItem`
  - `VisitorCommentNavItem`
  - `VisitorNotificationNavItem`
  - `VisitorSettingsNavItem`
  - `LogoutNavItem`

### 15. 博主端个人中心 - 创作者中心组
- **设计稿来源**：
  - `design/博主端-个人中心-数据概览模块/`
  - `design/博主端-个人中心-文章管理模块/`
  - `design/博主端-个人中心-评论审核模块/`
  - `design/博主端-个人中心-发送消息模块/`
- **页面名称**：创作者中心分组
- **页面定位**：博主端个人中心侧边栏分组
- **主要功能模块**：
  - 新建文章
  - 数据概览
  - 发送消息
  - 文章管理
  - 评论审核
  - 用户管理
  - 账号设置
  - 退出登录
- **建议组件命名**：
  - `CreatorCenterGroup`
  - `CreatePostButton`
  - `DashboardNavItem`
  - `MessageNavItem`
  - `PostManageNavItem`
  - `ReviewNavItem`
  - `UserManageNavItem`
  - `LogoutNavItem`

## 二、设计稿页面总数

结合目录命名与已读取的 HTML / 截图内容，可归纳为以下 **15 个页面或页面级模块**：

1. 博客首页
2. 文章详情页
3. 统一身份认证页
4. 浏览记录页
5. 我的收藏页
6. 消息通知页
7. 账号设置页（访客端）
8. 我的评论页
9. 我的点赞页
10. 数据概览页
11. 文章管理页
12. 评论审核页
13. AI 博客编辑器页 / 新建文章页
14. 访客工具分组
15. 创作者中心组

> 说明：其中第 14、15 项属于**博主端个人中心侧边栏内的功能分组**，严格来说不是独立页面，但为了完整整理设计稿结构，单独列出。

## 三、推荐的 Next.js 16 项目结构

### 1. `app/` 路由树
```text
app/
├─ layout.tsx
├─ page.tsx
├─ globals.css
├─ favicon.ico
├─ not-found.tsx
├─ loading.tsx
├─ error.tsx
│
├─ (public)/
│  ├─ page.tsx
│  ├─ posts/
│  │  ├─ page.tsx
│  │  └─ [slug]/
│  │     └─ page.tsx
│  ├─ tags/
│  │  └─ [slug]/
│  │     └─ page.tsx
│  ├─ categories/
│  │  └─ [slug]/
│  │     └─ page.tsx
│  └─ search/
│     └─ page.tsx
│
├─ (auth)/
│  ├─ login/
│  │  └─ page.tsx
│  ├─ register/
│  │  └─ page.tsx
│  ├─ forgot-password/
│  │  └─ page.tsx
│  ├─ reset-password/
│  │  └─ page.tsx
│  └─ logout/
│     └─ route.ts
│
├─ (visitor)/
│  └─ account/
│     ├─ layout.tsx
│     ├─ page.tsx
│     ├─ history/
│     │  └─ page.tsx
│     ├─ likes/
│     │  └─ page.tsx
│     ├─ collections/
│     │  └─ page.tsx
│     ├─ comments/
│     │  └─ page.tsx
│     ├─ notifications/
│     │  └─ page.tsx
│     ├─ settings/
│     │  └─ page.tsx
│     └─ ai-history/
│        └─ page.tsx
│
├─ (blogger)/
│  └─ dashboard/
│     ├─ layout.tsx
│     ├─ page.tsx
│     ├─ overview/
│     │  └─ page.tsx
│     ├─ posts/
│     │  ├─ page.tsx
│     │  ├─ new/
│     │  │  └─ page.tsx
│     │  └─ [id]/
│     │     ├─ edit/
│     │     │  └─ page.tsx
│     │     └─ page.tsx
│     ├─ comments/
│     │  └─ review/
│     │     └─ page.tsx
│     ├─ messages/
│     │  └─ page.tsx
│     ├─ users/
│     │  └─ page.tsx
│     ├─ ai/
│     │  ├─ title/
│     │  │  └─ page.tsx
│     │  ├─ expand/
│     │  │  └─ page.tsx
│     │  ├─ polish/
│     │  │  └─ page.tsx
│     │  └─ chat/
│     │     └─ page.tsx
│     ├─ categories/
│     │  └─ page.tsx
│     ├─ tags/
│     │  └─ page.tsx
│     └─ settings/
│        └─ page.tsx
│
├─ api/
│  ├─ auth/
│  │  ├─ login/route.ts
│  │  ├─ register/route.ts
│  │  ├─ logout/route.ts
│  │  ├─ verify-code/route.ts
│  │  ├─ forgot-password/route.ts
│  │  └─ reset-password/route.ts
│  ├─ posts/
│  │  ├─ route.ts
│  │  ├─ [id]/
│  │  │  ├─ route.ts
│  │  │  ├─ publish/route.ts
│  │  │  ├─ withdraw/route.ts
│  │  │  └─ draft/route.ts
│  │  ├─ like/route.ts
│  │  ├─ bookmark/route.ts
│  │  └─ browse/route.ts
│  ├─ comments/
│  │  ├─ route.ts
│  │  └─ [id]/
│  │     ├─ approve/route.ts
│  │     ├─ reject/route.ts
│  │     └─ delete/route.ts
│  ├─ notifications/
│  │  ├─ route.ts
│  │  └─ [id]/route.ts
│  ├─ collections/
│  │  └─ route.ts
│  ├─ ai/
│  │  ├─ title/route.ts
│  │  ├─ expand/route.ts
│  │  ├─ polish/route.ts
│  │  └─ chat/route.ts
│  ├─ users/
│  │  ├─ route.ts
│  │  ├─ me/route.ts
│  │  ├─ settings/route.ts
│  │  └─ [id]/route.ts
│  ├─ admin/
│  │  ├─ overview/route.ts
│  │  ├─ stats/route.ts
│  │  └─ send-message/route.ts
│  └─ upload/
│     └─ image/route.ts
└─ sitemap.ts
```

### 2. `components/` 组件目录树
```text
components/
├─ ui/
│  ├─ button.tsx
│  ├─ input.tsx
│  ├─ textarea.tsx
│  ├─ modal.tsx
│  ├─ dialog.tsx
│  ├─ dropdown.tsx
│  ├─ tabs.tsx
│  ├─ badge.tsx
│  ├─ avatar.tsx
│  ├─ tooltip.tsx
│  ├─ pagination.tsx
│  ├─ skeleton.tsx
│  └─ empty-state.tsx
├─ layout/
│  ├─ site-header.tsx
│  ├─ site-footer.tsx
│  ├─ auth-shell.tsx
│  ├─ public-shell.tsx
│  ├─ visitor-shell.tsx
│  ├─ blogger-shell.tsx
│  ├─ sidebar.tsx
│  ├─ sidebar-group.tsx
│  ├─ top-bar.tsx
│  └─ page-container.tsx
├─ blog/
│  ├─ article-card.tsx
│  ├─ article-list.tsx
│  ├─ article-meta.tsx
│  ├─ article-content.tsx
│  ├─ article-tags.tsx
│  ├─ article-toolbar.tsx
│  ├─ article-search.tsx
│  ├─ article-filter.tsx
│  ├─ article-pagination.tsx
│  ├─ toc.tsx
│  └─ markdown-renderer.tsx
├─ editor/
│  ├─ editor-header.tsx
│  ├─ editor-footer-status.tsx
│  ├─ editor-title-input.tsx
│  ├─ markdown-toolbar.tsx
│  ├─ markdown-toolbar-group.tsx
│  ├─ markdown-editor-pane.tsx
│  ├─ markdown-preview-pane.tsx
│  ├─ editor-mode-switch.tsx
│  ├─ editor-draft-button.tsx
│  ├─ editor-publish-button.tsx
│  ├─ editor-save-status.tsx
│  └─ editor-ai-toggle.tsx
├─ ai/
│  ├─ ai-assistant-chip.tsx
│  ├─ ai-assistant-fab.tsx
│  ├─ ai-chat-panel.tsx
│  ├─ ai-chat-input.tsx
│  ├─ ai-chat-history.tsx
│  ├─ ai-title-generator.tsx
│  ├─ ai-loading.tsx
│  └─ ai-answer-card.tsx
├─ auth/
│  ├─ login-form.tsx
│  ├─ register-form.tsx
│  ├─ forgot-password-form.tsx
│  ├─ reset-password-form.tsx
│  ├─ verification-code-input.tsx
│  ├─ password-field.tsx
│  └─ auth-policy-notice.tsx
├─ visitor/
│  ├─ visitor-sidebar.tsx
│  ├─ history-timeline.tsx
│  ├─ history-record-card.tsx
│  ├─ like-list.tsx
│  ├─ like-item.tsx
│  ├─ collection-grid.tsx
│  ├─ collection-folder-card.tsx
│  ├─ bookmarked-post-card.tsx
│  ├─ comment-list.tsx
│  ├─ comment-item.tsx
│  ├─ notification-list.tsx
│  ├─ notification-item.tsx
│  ├─ settings-form.tsx
│  └─ account-danger-zone.tsx
├─ blogger/
│  ├─ blogger-sidebar.tsx
│  ├─ overview-stat-card.tsx
│  ├─ overview-insight-panel.tsx
│  ├─ overview-recent-comment-list.tsx
│  ├─ post-table.tsx
│  ├─ post-table-row.tsx
│  ├─ post-action-menu.tsx
│  ├─ comment-review-list.tsx
│  ├─ comment-review-card.tsx
│  ├─ review-action-group.tsx
│  ├─ message-form.tsx
│  ├─ message-manage-table.tsx
│  ├─ user-table.tsx
│  ├─ category-manager.tsx
│  ├─ tag-manager.tsx
│  └─ blogger-settings-form.tsx
├─ notifications/
│  ├─ notification-bell.tsx
│  ├─ notification-panel.tsx
│  ├─ notification-badge.tsx
│  └─ notification-toast.tsx
├─ media/
│  ├─ avatar-picker.tsx
│  ├─ image-uploader.tsx
│  ├─ image-picker.tsx
│  ├─ media-library.tsx
│  └─ file-dropzone.tsx
└─ shared/
   ├─ search-bar.tsx
   ├─ confirm-dialog.tsx
   ├─ status-chip.tsx
   ├─ section-title.tsx
   ├─ card.tsx
   ├─ divider.tsx
   ├─ scroll-area.tsx
   └─ provider.tsx
```

### 3. `lib/`、`types/` 等辅助目录建议
```text
lib/
├─ auth/
│  ├─ session.ts
│  ├─ jwt.ts
│  ├─ permissions.ts
│  ├─ password.ts
│  └─ rate-limit.ts
├─ db/
│  ├─ prisma.ts
│  ├─ queries.ts
│  └─ seed.ts
├─ ai/
│  ├─ deepseek.ts
│  ├─ coze.ts
│  ├─ prompt.ts
│  ├─ stream.ts
│  └─ ai-helpers.ts
├─ posts/
│  ├─ markdown.ts
│  ├─ parser.ts
│  ├─ slug.ts
│  └─ excerpts.ts
├─ media/
│  ├─ upload.ts
│  ├─ cleanup.ts
│  ├─ parser.ts
│  └─ ref-tracker.ts
├─ notifications/
│  └─ notifier.ts
├─ validation/
│  ├─ auth.ts
│  ├─ post.ts
│  ├─ comment.ts
│  ├─ message.ts
│  └─ user.ts
├─ utils/
│  ├─ cn.ts
│  ├─ format-date.ts
│  ├─ truncate.ts
│  ├─ sanitize-html.ts
│  └─ sleep.ts
└─ constants/
   ├─ roles.ts
   ├─ routes.ts
   ├─ editor.ts
   └─ app.ts

types/
├─ auth.ts
├─ post.ts
├─ comment.ts
├─ notification.ts
├─ user.ts
├─ media.ts
├─ ai.ts
└─ common.ts
```

## 四、与课题要求的功能映射

### 访客端功能对应
- 浏览记录
- 我的点赞
- 我的收藏
- 我的评论
- 消息通知
- 账号设置
- 退出登录

### 博主端功能对应
- 浏览记录
- 我的点赞
- 我的收藏
- 我的评论
- 消息通知
- 账号设置
- 退出登录
- 新建文章
- 数据概览
- 发送消息
- 文章管理
- 评论审核
- 用户管理
- AI 博客编辑器

### 课题要求中尚需补足但设计稿未完全展开的内容
- 博客分类 / 标签管理
- 草稿保存 / 发布 / 撤回 / 删除的完整交互
- AI 标题生成 / 内容续写 / 内容润色的独立弹窗或抽屉组件
- 访客端 AI 问答登录校验与历史记录管理
- 评论发布与评论通知的完整交互流
- 用户注册 / 找回密码 / 注销账号等认证细节
- 图片上传与资源管理（头像与文章图片）
- 自动保存后的图片引用清理与资源回收
- 自动保存后的图片引用清理与孤儿资源回收

这些内容可以在后续开发阶段补充到页面组件中，作为与设计稿一致的功能增强部分。
