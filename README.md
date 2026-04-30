# 基于 Next.js 的 AI 辅助个人博客系统

## 项目简介

这是一个基于 `Next.js 16` 构建的 AI 辅助个人博客系统，面向访客与博主两类角色，支持博客浏览、文章详情阅读、评论互动、收藏点赞、个人中心管理，以及博主端的文章创作与 AI 辅助写作。

项目采用现代前后端一体化开发方式，前端使用 `Next.js App Router` 组织页面结构，后端接口与数据层通过服务端能力进行统一管理，适合毕业设计与课程项目开发。

---

## 技术栈

### 前端框架
- `Next.js 16.2.4`
- `React 19.2.4`
- `React DOM 19.2.4`

### 开发语言
- `TypeScript 5`

### 样式方案
- `Tailwind CSS 4`
- `@tailwindcss/postcss`
- 项目图标库Google Material Symbols

### 数据与后端
- `Prisma 6`
- `PostgreSQL`
- `Supabase`（用于数据库、Storage、可扩展的认证与文件管理）

### 代码质量与规范
- `ESLint 9`
- `eslint-config-next 16.2.4`

---

## 依赖说明

### 运行时依赖
- `next`
  - 提供页面路由、服务端渲染、静态生成、API 路由等核心能力。
- `react`
  - 用于构建组件化界面。
- `react-dom`
  - 用于将 React 渲染到浏览器。

### 开发依赖
- `typescript`
  - 提供静态类型检查，提升代码可维护性。
- `prisma`
  - 用于数据库建模、迁移与类型安全访问。
- `tailwindcss`
  - 原子化 CSS 框架，用于快速构建界面样式。
- `@tailwindcss/postcss`
  - Tailwind CSS 的 PostCSS 集成。
- `eslint`
  - 代码检查工具，用于统一代码风格与发现问题。
- `eslint-config-next`
  - Next.js 官方 ESLint 配置，适配 App Router 与 React 开发习惯。
- `@types/node`
  - Node.js 类型定义。
- `@types/react`
  - React 类型定义。
- `@types/react-dom`
  - React DOM 类型定义。

---

## 核心能力

### 访客端
- 博客首页浏览
- 文章详情阅读
- 评论发布与评论查看
- 点赞与收藏
- 个人中心管理
- 浏览记录与消息通知
- 账号设置

### 博主端
- 博客文章管理
- 新建文章与编辑文章
- Markdown 写作
- AI 辅助创作
- 评论审核
- 消息发送
- 用户管理
- 数据概览

### AI 功能
- 文章详情页 AI 问答
- 博主端文章创作辅助
- AI 仅在登录用户可用的前提下提供服务

---

## 项目结构建议

```text
app/
components/
lib/
types/
prisma/
public/
docs/
design/
```

---

## 数据与资源说明

- 用户头像统一使用 `public/` 目录中的默认资源兜底显示，不再支持头像修改
- 文章内容暂不单独设计图片资源存储方案，优先按纯文本与 Markdown 方式实现
- 数据库仅保存业务所需的内容字段与关联关系

---

## 运行脚本

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## 说明

本项目目前以架构设计与数据库设计为主，后续将逐步完善页面实现、接口联调与数据落库逻辑。
