# AI 辅助个人博客系统总体设计

## 1. 项目概述

本项目是一个基于 `Next.js 16 + React 19 + TypeScript + Prisma + PostgreSQL` 构建的 AI 辅助个人博客系统，面向两类核心角色：

- **博主（Blogger）**：负责博客内容的创建、编辑、发布以及评论审核、用户管理等后台运营工作。
- **访客（Visitor）**：负责浏览文章、登录注册、评论互动、收藏/点赞/历史记录查看，以及使用文章详情页中的 AI 问答能力。

系统将“内容创作 + 内容发布 + 内容互动 + AI 辅助”整合在同一套 Web 应用中，通过数据库持久化、会话认证、流式 AI 接口和组件化 UI，实现一站式博客平台体验。

---

## 2. 系统总体架构设计

### 2.1 技术架构分层

系统整体采用典型的 Web 应用分层结构：

1. **表现层（UI / 页面层）**
   - 使用 Next.js App Router 构建页面。
   - 主要由 `app/` 目录下的页面入口和 `components/` 目录下的业务组件组成。
   - 客户端交互主要依赖 React Hooks、Context、表单事件与异步请求。

2. **业务层（接口 / 服务层）**
   - 通过 `app/api/**/route.ts` 提供 REST 风格 API。
   - 负责登录认证、文章管理、评论、点赞、收藏、通知、AI 调用等业务逻辑。
   - 部分接口使用流式响应（SSE）返回 AI 结果。

3. **数据层（持久化层）**
   - 通过 Prisma 访问 PostgreSQL 数据库。
   - 数据模型集中定义在 `prisma/schema.prisma`。
   - 由 `lib/prisma.ts` 提供 Prisma Client 单例封装。

4. **基础支撑层**
   - `lib/` 下封装认证、密码哈希、Markdown 转换、日期格式化、邮件发送等通用能力。
   - `middleware.ts` 用于全局权限与请求拦截。

### 2.2 核心设计特点

- **前后端一体化**：页面、接口、认证和数据访问统一在 Next.js 工程内完成。
- **角色权限清晰**：博主与访客拥有不同权限边界，匿名用户仅可浏览公开内容。
- **AI 能力内嵌**：标题生成、正文润色、文章问答均以 AI 接口形式接入，且仅在后端调用密钥。
- **数据驱动**：文章、评论、点赞、收藏、浏览历史、通知、AI 会话全部由数据库持久化。
- **组件化复用**：首页、文章详情、博主中心、访客中心、编辑器等模块均采用独立组件组织。

---

## 3. 项目目录与技术栈对应关系

### 3.1 顶层目录

- `app/`：Next.js 页面与 API 路由入口。
- `components/`：可复用 UI 组件和页面级业务组件。
- `lib/`：通用工具函数、认证、数据库、Markdown、邮件等。
- `prisma/`：数据库 schema、seed 数据和初始化脚本。
- `public/`：静态资源，如默认头像、图标等。
- `docs/`：项目文档。

### 3.2 主要技术与对应位置

- **Next.js App Router / SSR / API Route**：`app/`
- **React 19 组件化与状态管理**：`components/`
- **TypeScript 类型系统**：全项目 `.ts/.tsx`
- **Prisma ORM**：`prisma/schema.prisma`、`lib/prisma.ts`、`app/api/**`
- **PostgreSQL 数据库**：`prisma/schema.prisma` 对应的数据模型
- **JWT + Session 双重认证**：`lib/auth.ts`、`app/api/auth/**`、`middleware.ts`
- **密码加盐哈希**：`lib/password.ts`
- **Markdown 解析与预览**：`lib/markdown.ts`
- **邮件验证码能力**：`lib/email.ts`
- **DeepSeek AI 接入**：`app/api/title-generation/route.ts`、`app/api/text-polish/route.ts`、`app/api/posts/ai-chat/route.ts`
- **SSE 流式响应**：`app/api/posts/ai-chat/route.ts`、`app/api/text-polish/route.ts`

---

## 4. 系统功能模块总体设计

## 4.1 首页与文章浏览模块

### 功能说明

首页负责展示公开文章列表，并支持搜索、分类筛选、标签筛选、分页浏览等能力。访客无需登录即可阅读文章详情。

### 主要实现文件

- `app/page.tsx`
- `components/home/home-page.tsx`
- `components/home/home-article-list.tsx`
- `components/home/home-pagination.tsx`
- `components/home/home-sidebar.tsx`
- `components/home/sidebar-card.tsx`
- `components/common/article-card.tsx`
- `components/common/category-pill.tsx`
- `components/common/tag-pill.tsx`
- `components/common/site-header.tsx`
- `components/common/site-footer.tsx`
- `app/article/[slug]/page.tsx`
- `components/blog/article-detail-page.tsx`

### 使用技术

- Next.js 服务端页面渲染与动态路由
- Prisma 查询发布文章、分类、标签、评论和互动数据
- React 客户端组件展示文章卡片与交互区域
- Markdown 转 HTML 后预览/渲染

---

## 4.2 文章详情与互动模块

### 功能说明

文章详情页展示文章内容、作者信息、分类标签、评论树、点赞、收藏、评论输入框，并集成 AI 问答悬浮球。

### 主要实现文件

- `app/article/[slug]/page.tsx`
- `components/blog/article-detail-page.tsx`
- `components/blog/ai-question-floating-button.tsx`
- `components/auth/auth-modal.tsx`
- `components/common/auth-context.tsx`
- `components/common/notification-context.tsx`

### 使用技术

- 动态路由 `app/article/[slug]`
- 服务端读取文章详情与评论树
- 客户端状态管理处理登录弹窗、评论、点赞、收藏、AI 聊天
- 悬浮按钮组件实现常驻交互入口

---

## 4.3 博主创作与内容管理模块

### 功能说明

博主可在编辑器中创建草稿、实时编辑、自动保存、上传 Markdown 文件、预览内容、生成标题、润色文本，并对文章进行发布、撤回、删除。

### 主要实现文件

- `app/editor/page.tsx`
- `components/user/editor-page.tsx`
- `app/api/blogger/articles/route.ts`
- `app/api/title-generation/route.ts`
- `app/api/text-polish/route.ts`
- `lib/markdown.ts`
- `app/api/autocomplete/route.ts`

### 使用技术

- React Hook 状态管理与自动保存机制
- 本地 Markdown 文件读取与解析
- Prisma 对文章、发布状态进行 CRUD
- DeepSeek AI 标题生成与文本润色
- 富交互编辑器内的局部选中文本处理、预览转换、光标辅助写作

### 说明

编辑器页面实际承担“系统内创作”这一核心功能，支持：

- 新建草稿
- 保存草稿
- 预览 Markdown
- 发布文章
- 更新文章基础信息
- 上传本地 Markdown 文件导入内容
- AI 标题生成
- AI 内容续写/补全辅助
- AI 文本润色

---

## 4.4 用户认证与账号管理模块

### 功能说明

系统支持登录、注册、退出、会话恢复、重置密码、邮箱验证码验证等认证流程。博主账号由种子数据预置，访客可自行注册。

### 主要实现文件

- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/session/route.ts`
- `app/api/auth/refresh/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/auth/verification/route.ts`
- `app/api/user/account-settings/route.ts`
- `app/api/user/account-settings/password/route.ts`
- `app/api/user/account-settings/delete-account/route.ts`
- `app/api/user/account-settings/verification/route.ts`
- `components/auth/auth-modal.tsx`
- `components/common/auth-context.tsx`
- `lib/auth.ts`
- `lib/password.ts`
- `lib/email.ts`
- `prisma/seeds/admin.seed.ts`
- `prisma/seeds/visitor.seed.ts`

### 使用技术

- JWT 与 Session 双重认证
- Prisma 访问用户、会话、验证码表
- 密码哈希存储与校验
- 邮箱验证码注册 / 重置 / 注销验证
- Context 统一管理前端登录态

---

## 4.5 访客个人中心模块

### 功能说明

访客中心用于管理个人信息、收藏、点赞、评论、浏览历史、通知等数据，并支持账号设置与注销流程。

### 主要实现文件

- `app/visitor-center/page.tsx`
- `components/user/visitor-center-page.tsx`
- `components/user/visitor-center-page/visitor-center-sidebar.tsx`
- `components/user/visitor-center-page/visitor-center-toolbar.tsx`
- `components/user/visitor-center-page/visitor-center-account-settings.tsx`
- `components/user/visitor-center-page/visitor-center-notifications.tsx`
- `components/user/visitor-center-page/visitor-center-history.tsx`
- `components/user/visitor-center-page/visitor-center-comments.tsx`
- `components/user/visitor-center-page/visitor-center-liked.tsx`
- `components/user/visitor-center-page/visitor-center-favorites.tsx`
- `components/user/visitor-center-page/visitor-center-confirm-modal.tsx`
- `app/api/user/comments/route.ts`
- `app/api/user/liked-articles/route.ts`
- `app/api/user/bookmarked-articles/route.ts`
- `app/api/user/browse-histories/route.ts`
- `app/api/user/notifications/route.ts`
- `app/api/user/blogger-messages/route.ts`

### 使用技术

- React 组件拆分不同数据页签
- Prisma 读取用户维度的评论、点赞、收藏、浏览历史、通知数据
- 前端局部刷新与确认弹窗控制
- 通知中心与账号中心联动

---

## 4.6 博主中心模块

### 功能说明

博主中心用于管理博客文章、评论审核、站内消息、用户互动数据等，是博主日常运营后台。

### 主要实现文件

- `app/blogger-center/page.tsx`
- `components/user/blogger-center-page.tsx`
- `components/user/blogger-center-page/blogger-center-sidebar.tsx`
- `components/user/blogger-center-page/blogger-center-articles.tsx`
- `components/user/blogger-center-page/blogger-center-comments.tsx`
- `components/user/blogger-center-page/blogger-center-users.tsx`
- `components/user/blogger-center-page/blogger-center-messages.tsx`
- `app/api/blogger/articles/route.ts`
- `app/api/blogger/comments/route.ts`
- `app/api/blogger/users/route.ts`
- `app/api/user/blogger-messages/route.ts`

### 使用技术

- 角色权限校验，限制仅博主访问
- 文章草稿与发布状态管理
- 评论审核、删除、列表筛选
- 用户与消息管理数据查询

---

## 4.7 评论与互动通知模块

### 功能说明

系统支持文章评论、回复、审核、删除，并在收到评论、系统消息时生成通知提醒。

### 主要实现文件

- `app/api/posts/comments/route.ts`
- `app/api/blogger/comments/route.ts`
- `app/api/user/comments/route.ts`
- `app/api/user/notifications/route.ts`
- `app/api/user/blogger-messages/route.ts`
- `components/common/notification-context.tsx`
- `components/user/visitor-center-page/notification-items.ts`

### 使用技术

- Prisma 评论树关系设计
- 评论状态流转（待审核 / 已审核）
- 通知表驱动的站内提醒机制
- 前端通知上下文管理未读状态

---

## 4.8 点赞、收藏、浏览历史模块

### 功能说明

访客对文章可执行点赞、收藏、历史浏览记录保存等操作，这些行为会同步写入数据库，并用于个人中心展示。

### 主要实现文件

- `app/api/posts/like/route.ts`
- `app/api/posts/bookmark/route.ts`
- `app/api/user/liked-articles/route.ts`
- `app/api/user/bookmarked-articles/route.ts`
- `app/api/user/browse-histories/route.ts`
- `components/user/visitor-center-page/liked-articles.ts`
- `components/user/visitor-center-page/history-articles.ts`
- `components/user/visitor-center-page/commented-articles.ts`

### 使用技术

- Prisma 唯一约束避免重复点赞/收藏
- 文章详情页访问时自动记录浏览历史
- 个人中心汇总用户交互痕迹

---

## 4.9 AI 问答模块（访客端）

### 功能说明

在文章详情页常驻 AI 问答悬浮球。登录访客可以就当前文章进行提问，也可以咨询通用问题。系统会保存用户的 AI 对话历史，并支持查看与清除。

### 主要实现文件

- `components/blog/ai-question-floating-button.tsx`
- `app/api/posts/ai-chat/route.ts`
- `app/api/posts/ai-chat/clear/route.ts`
- `prisma/schema.prisma` 中的 `AiChatSession`、`AiChatMessage`

### 使用技术

- DeepSeek 大模型接口接入
- SSE 流式响应返回回答内容
- 以文章正文 + 标题构造系统提示词
- Prisma 持久化 AI 会话和消息记录
- 登录校验后才允许使用

---

## 5. 数据库与数据模型设计

### 5.1 技术选型

- 数据库：**PostgreSQL**
- ORM：**Prisma**

### 5.2 主要数据表

数据库模型定义在 `prisma/schema.prisma`，核心表包括：

- `User`：用户表，保存博主和访客基础信息
- `Session`：会话表，保存登录会话 token 哈希
- `VerificationCode`：验证码表
- `Post`：文章表
- `Category`：分类表
- `Tag`：标签表
- `PostTag`：文章-标签关联表
- `Comment`：评论表
- `Like`：点赞表
- `Bookmark`：收藏表
- `BrowseHistory`：浏览历史表
- `Notification`：通知表
- `AiChatSession`：AI 问答会话表
- `AiChatMessage`：AI 问答消息表

### 5.3 设计特点

- 使用外键和级联删除维护数据一致性。
- 使用联合唯一索引避免重复点赞、重复收藏、重复会话等问题。
- 使用索引优化常见查询场景，如文章筛选、评论加载、通知列表、AI 历史会话等。

---

## 6. 认证、安全与权限控制设计

### 6.1 认证机制

系统采用 **JWT + Session 双重机制**：

- JWT：用于前端身份识别和请求携带用户信息。
- Session：用于服务端会话持久化和登录状态管理。

相关实现：

- `lib/auth.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/session/route.ts`
- `app/api/auth/refresh/route.ts`
- `middleware.ts`

### 6.2 密码与账号安全

- 密码哈希由 `lib/password.ts` 处理。
- 账号找回、注册、注销等敏感操作通过邮箱验证码验证。
- AI 接口密钥仅在后端环境变量中使用，前端不可直接访问。

### 6.3 权限控制

- **匿名用户**：允许浏览文章。
- **登录访客**：允许评论、点赞、收藏、AI 问答、个人中心访问。
- **博主用户**：允许文章创作、编辑、发布、撤回、删除、评论审核等。

---

## 7. Markdown 与内容处理设计

### 7.1 主要能力

- Markdown 文件导入
- Markdown 编辑
- Markdown 转 HTML 预览
- 内容续写辅助
- 文本润色

### 7.2 主要实现文件

- `lib/markdown.ts`
- `components/user/editor-page.tsx`
- `components/blog/article-detail-page.tsx`

### 7.3 技术实现

- 编辑器直接维护 Markdown 源文本。
- 保存时同步保存 Markdown 与 HTML 预览结果。
- 文章详情页使用 HTML 渲染提升阅读体验。

---

## 8. 邮件与验证码能力设计

### 8.1 用途

- 邮箱注册验证码
- 找回密码验证码
- 注销账号验证码
- 账号设置验证

### 8.2 主要实现文件

- `lib/email.ts`
- `app/api/auth/verification/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/user/account-settings/verification/route.ts`
- `app/api/user/account-settings/delete-account/route.ts`
- `app/api/auth/register/route.ts`

### 8.3 技术说明

系统通过验证码表记录验证码有效期、消费状态和用途，并结合邮件服务完成安全验证闭环。

---

## 9. 静态资源与界面支撑

### 9.1 目录说明

- `public/avatars/`：默认头像资源
- `public/*.svg`：站点静态图标资源
- `app/globals.css`：全局样式

### 9.2 相关组件

- `components/common/site-header.tsx`
- `components/common/site-footer.tsx`
- `components/common/article-card.tsx`
- `components/common/auth-context.tsx`
- `components/common/notification-context.tsx`

这些组件共同构成统一的站点视觉语言和交互基础。

---

## 10. 种子数据与初始化设计

### 10.1 功能

系统提供初始化种子脚本，用于快速构建演示环境和开发环境中的基础数据。

### 10.2 主要实现文件

- `prisma/seed.ts`
- `prisma/seeds/admin.seed.ts`
- `prisma/seeds/visitor.seed.ts`
- `prisma/seeds/category.seed.ts`
- `prisma/seeds/tag.seed.ts`
- `prisma/seeds/post.seed.ts`
- `prisma/seeds/comment.seed.ts`
- `prisma/seeds/helpers.ts`

### 10.3 内容

- 预置博主账号
- 预置访客账号
- 预置分类、标签、文章、评论等基础数据

---

## 11. 项目核心实现位置总览

| 功能模块 | 关键文件夹 / 文件 |
| --- | --- |
| 首页与文章浏览 | `app/page.tsx`，`components/home/`，`components/common/` |
| 文章详情与互动 | `app/article/[slug]/page.tsx`，`components/blog/` |
| 博主创作与管理 | `app/editor/`，`components/user/editor-page.tsx`，`app/api/blogger/articles/route.ts` |
| 账号认证 | `app/api/auth/`，`lib/auth.ts`，`lib/password.ts` |
| 访客个人中心 | `app/visitor-center/`，`components/user/visitor-center-page/`，`app/api/user/` |
| 博主中心 | `app/blogger-center/`，`components/user/blogger-center-page/`，`app/api/blogger/` |
| AI 标题生成 | `app/api/title-generation/route.ts` |
| AI 文本润色 | `app/api/text-polish/route.ts` |
| AI 文章问答 | `app/api/posts/ai-chat/route.ts`，`components/blog/ai-question-floating-button.tsx` |
| 评论 / 点赞 / 收藏 / 历史 / 通知 | `app/api/posts/`，`app/api/user/`，`components/user/visitor-center-page/` |
| 数据库模型 | `prisma/schema.prisma` |
| 通用工具 | `lib/` |
| 静态资源 | `public/` |

---

## 12. 总结

本项目的总体设计可以概括为：以 `Next.js` 为前后端一体化框架，以 `Prisma + PostgreSQL` 为数据底座，以 `JWT + Session` 为认证体系，以 `DeepSeek` 为 AI 能力引擎，围绕“博主创作、访客阅读、AI 辅助、互动通知、个人中心”五大场景构建完整的 AI 辅助个人博客系统。

从实现上看，项目已经形成较清晰的模块边界：

- **内容生产链路**：编辑器 + 草稿 + 发布 + Markdown 导入
- **内容消费链路**：首页列表 + 文章详情 + 评论互动 + 收藏点赞
- **智能增强链路**：标题生成 + 文本润色 + 文章问答
- **用户运营链路**：登录注册 + 个人中心 + 通知消息 + 数据统计

这些模块共同支撑了一个可用于展示、答辩和进一步扩展的 AI 个人博客平台。
