# 测试数据 Seed 设计

本文档用于根据 `prisma/schema.prisma` 生成一组可直接用于开发测试的基础数据。

## 说明

- `id` 字段由 Prisma / 数据库自动生成，文档中不再手动指定具体 `id`
- 下面使用 `email`、`username`、`slug` 等稳定字段来描述可创建的数据
- 数据目标：
  - 4 个分类：前端、后端、数据库、随笔
  - 16 篇已发布文章，每个分类至少 3 篇
  - 4 篇草稿文章
  - 13 个标签
  - 每篇已发布文章至少 1 个、至多 3 个标签
  - 1 个预置博主账号，3 个普通游客账号
  - 每篇已发布文章 3 条评论：2 条父级评论、1 条子级评论

---

## 一、基础用户数据 `User`

### 1. 预置博主账号
- `email`: `memory@example.com`
- `username`: `Memory`
- `passwordHash`: `bcrypt_hash_placeholder`
- `初始密码`: `ecut12345`
- `role`: `BLOGGER`
- `intro`: `记录数字生命轨迹。致力于探索人工智能与人类审美的交汇点，相信技术应当隐于无形，服务于心。`
- `status`: `ACTIVE`

### 2. 普通游客账号 1
- `email`: `visitor01@example.com`
- `username`: `visitor01`
- `passwordHash`: `bcrypt_hash_placeholder`
- `初始密码`: `ecut12345`
- `role`: `VISITOR`
- `intro`: `普通测试访客账号 1。`
- `status`: `ACTIVE`

### 3. 普通游客账号 2
- `email`: `visitor02@example.com`
- `username`: `visitor02`
- `passwordHash`: `bcrypt_hash_placeholder`
- `初始密码`: `ecut12345`
- `role`: `VISITOR`
- `intro`: `普通测试访客账号 2。`
- `status`: `ACTIVE`

### 4. 普通游客账号 3
- `email`: `visitor03@example.com`
- `username`: `visitor03`
- `passwordHash`: `bcrypt_hash_placeholder`
- `初始密码`: `ecut12345`
- `role`: `VISITOR`
- `intro`: `普通测试访客账号 3。`
- `status`: `ACTIVE`

---

## 二、分类数据 `Category`

### 1. 前端
- `name`: `前端`
- `slug`: `frontend`
- `description`: `前端开发相关内容，包括框架、工程化与 UI 实践。`
- `sortOrder`: `1`
- `status`: `ACTIVE`

### 2. 后端
- `name`: `后端`
- `slug`: `backend`
- `description`: `后端开发相关内容，包括接口、权限与架构设计。`
- `sortOrder`: `2`
- `status`: `ACTIVE`

### 3. 数据库
- `name`: `数据库`
- `slug`: `database`
- `description`: `数据库设计、建模与性能优化相关内容。`
- `sortOrder`: `3`
- `status`: `ACTIVE`

### 4. 随笔
- `name`: `随笔`
- `slug`: `essay`
- `description`: `记录开发过程中的思考、总结与杂记。`
- `sortOrder`: `4`
- `status`: `ACTIVE`

---

## 三、标签数据 `Tag`

共创建 13 个标签：

1. `frontend` — 前端
2. `react` — React
3. `nextjs` — Next.js
4. `typescript` — TypeScript
5. `backend` — 后端
6. `nestjs` — NestJS
7. `api` — 接口设计
8. `database` — 数据库
9. `prisma` — Prisma
10. `postgresql` — PostgreSQL
11. `optimization` — 性能优化
12. `architecture` — 架构设计
13. `essay` — 随笔

---

## 四、已发布文章数据 `Post`

> 说明：以下 16 篇文章均为 `PUBLISHED` 状态，且均已填写 `publishedAt`。

### 1. `nextjs-14-project-structure-and-routing`
- `title`: `Next.js 14 项目结构设计与路由组织`
- `summary`: `梳理 Next.js 14 项目目录结构、路由划分与组件组织方式。`
- `category`: `前端`
- `status`: `PUBLISHED`
- `tags`: `frontend`, `nextjs`, `architecture`

### 2. `react-state-management-practices`
- `title`: `React 状态管理的几种常见实践`
- `summary`: `对比本地状态、Context、Zustand 等常见状态管理方案。`
- `category`: `前端`
- `status`: `PUBLISHED`
- `tags`: `frontend`, `react`, `typescript`

### 3. `maintainable-component-splitting`
- `title`: `一个可维护的组件拆分思路`
- `summary`: `讨论如何按职责拆分组件以提升可维护性与复用性。`
- `category`: `前端`
- `status`: `PUBLISHED`
- `tags`: `frontend`, `react`, `architecture`

### 4. `typescript-value-in-frontend-engineering`
- `title`: `TypeScript 在前端工程中的价值`
- `summary`: `总结 TypeScript 对类型约束、协作与重构的帮助。`
- `category`: `前端`
- `status`: `PUBLISHED`
- `tags`: `typescript`, `frontend`

### 5. `restful-api-design-guidelines`
- `title`: `RESTful API 设计中的几个关键约定`
- `summary`: `整理接口命名、状态码、分页与错误返回格式的建议。`
- `category`: `后端`
- `status`: `PUBLISHED`
- `tags`: `backend`, `api`, `architecture`

### 6. `nestjs-middleware-guard-usage`
- `title`: `NestJS 中间件与守卫的使用方式`
- `summary`: `介绍 NestJS 中间件、守卫与拦截器的分工。`
- `category`: `后端`
- `status`: `PUBLISHED`
- `tags`: `backend`, `nestjs`, `api`

### 7. `backend-access-control-practices`
- `title`: `后端项目中的权限控制实践`
- `summary`: `从角色、资源与操作三个层面讨论权限控制设计。`
- `category`: `后端`
- `status`: `PUBLISHED`
- `tags`: `backend`, `architecture`

### 8. `api-idempotency-and-duplicate-submit-handling`
- `title`: `接口幂等性与重复提交处理`
- `summary`: `分析常见重复提交场景以及幂等性设计思路。`
- `category`: `后端`
- `status`: `PUBLISHED`
- `tags`: `backend`, `api`, `optimization`

### 9. `prisma-schema-modeling`
- `title`: `Prisma Schema 的建模思路`
- `summary`: `从实体、关系、约束与索引角度说明 Prisma 建模。`
- `category`: `数据库`
- `status`: `PUBLISHED`
- `tags`: `database`, `prisma`, `architecture`

### 10. `postgresql-index-design-basics`
- `title`: `PostgreSQL 索引设计基础`
- `summary`: `讲解常见索引类型、联合索引与查询优化的基本原则。`
- `category`: `数据库`
- `status`: `PUBLISHED`
- `tags`: `database`, `postgresql`, `optimization`

### 11. `many-to-many-relationships-in-article-system`
- `title`: `文章系统中的多对多关系处理`
- `summary`: `以文章与标签关系为例说明中间表设计。`
- `category`: `数据库`
- `status`: `PUBLISHED`
- `tags`: `database`, `prisma`, `architecture`

### 12. `flexible-and-controllable-database-fields`
- `title`: `如何让数据库字段既灵活又可控`
- `summary`: `探讨可空字段、状态字段与软删除字段的取舍。`
- `category`: `数据库`
- `status`: `PUBLISHED`
- `tags`: `database`, `postgresql`

### 13. `first-day-building-personal-blog-system`
- `title`: `做一个个人博客系统的第一天`
- `summary`: `记录个人博客系统从设计到落地的起点。`
- `category`: `随笔`
- `status`: `PUBLISHED`
- `tags`: `essay`, `architecture`

### 14. `trade-offs-in-development-process`
- `title`: `开发过程里的取舍`
- `summary`: `总结功能实现过程中的设计取舍与原因。`
- `category`: `随笔`
- `status`: `PUBLISHED`
- `tags`: `essay`, `architecture`, `optimization`

### 15. `ui-design-and-information-density`
- `title`: `界面设计与信息密度`
- `summary`: `讨论博客后台和内容页如何平衡信息呈现。`
- `category`: `随笔`
- `status`: `PUBLISHED`
- `tags`: `essay`, `frontend`

### 16. `development-notes-small-issues`
- `title`: `开发笔记：一些容易忽视的小问题`
- `summary`: `记录在开发中遇到的一些小坑和处理方式。`
- `category`: `随笔`
- `status`: `PUBLISHED`
- `tags`: `essay`, `backend`

---

## 五、草稿文章数据 `Post`

> 说明：以下 4 篇文章均为 `DRAFT` 状态，分类可为空或暂不强制绑定。

### 1. `next-step-for-frontend-engineering`
- `title`: `前端工程化的下一步`
- `summary`: `计划整理前端工程化中的脚手架、构建与规范化实践。`
- `category`: `null`
- `status`: `DRAFT`

### 2. `unified-api-error-handling`
- `title`: `接口错误处理统一方案`
- `summary`: `准备梳理接口错误码、提示信息与前端拦截处理。`
- `category`: `null`
- `status`: `DRAFT`

### 3. `database-migration-and-version-control`
- `title`: `数据库迁移与版本控制`
- `summary`: `计划记录 Prisma migration 的使用经验。`
- `category`: `数据库`
- `status`: `DRAFT`

### 4. `next-version-ideas-for-blog-system`
- `title`: `博客系统的下一版想法`
- `summary`: `记录下一阶段想增加的功能与优化点。`
- `category`: `随笔`
- `status`: `DRAFT`

---

## 六、文章与标签关联 `PostTag`

下面列出已发布文章的标签关系。每篇已发布文章都至少有 1 个标签，且不超过 3 个标签。

### 前端文章标签
- `nextjs-14-project-structure-and-routing` → `frontend`, `nextjs`, `architecture`
- `react-state-management-practices` → `frontend`, `react`, `typescript`
- `maintainable-component-splitting` → `frontend`, `react`, `architecture`
- `typescript-value-in-frontend-engineering` → `typescript`, `frontend`

### 后端文章标签
- `restful-api-design-guidelines` → `backend`, `api`, `architecture`
- `nestjs-middleware-guard-usage` → `backend`, `nestjs`, `api`
- `backend-access-control-practices` → `backend`, `architecture`
- `api-idempotency-and-duplicate-submit-handling` → `backend`, `api`, `optimization`

### 数据库文章标签
- `prisma-schema-modeling` → `database`, `prisma`, `architecture`
- `postgresql-index-design-basics` → `database`, `postgresql`, `optimization`
- `many-to-many-relationships-in-article-system` → `database`, `prisma`, `architecture`
- `flexible-and-controllable-database-fields` → `database`, `postgresql`

### 随笔文章标签
- `first-day-building-personal-blog-system` → `essay`, `architecture`
- `trade-offs-in-development-process` → `essay`, `architecture`, `optimization`
- `ui-design-and-information-density` → `essay`, `frontend`
- `development-notes-small-issues` → `essay`, `backend`

---

## 七、评论数据 `Comment`

> 说明：每篇已发布文章都创建 3 条评论，包含 2 条父级评论和 1 条子级评论。
>
> 评论作者使用 1 个博主账号和 3 个游客账号轮流分配，便于测试评论树、回复关系与审核展示。

### 评论模板规则
对于每篇已发布文章，建议创建如下三条评论：

1. **父级评论 A**
   - `post`: 当前文章
   - `user`: 轮流使用某个游客账号
   - `parentId`: `null`
   - `content`: 对文章内容的正向反馈或提问
   - `status`: `APPROVED`

2. **父级评论 B**
   - `post`: 当前文章
   - `user`: 轮流使用另一个游客账号
   - `parentId`: `null`
   - `content`: 对文章的补充观点或讨论
   - `status`: `APPROVED`

3. **子级评论 C**
   - `post`: 当前文章
   - `user`: 博主账号或第三个游客账号
   - `parentId`: 指向“父级评论 A”
   - `content`: 对父级评论 A 的回复
   - `status`: `APPROVED`

### 示例
以 `nextjs-14-project-structure-and-routing` 为例：

- 父级评论 A：`visitor01` 提问“目录划分是否可以进一步抽象？”
- 父级评论 B：`visitor02` 反馈“实践中确实需要统一约定。”
- 子级评论 C：`Memory` 回复“可以结合路由分组和业务层拆分一起设计。”

### 评论轮换建议
可按以下方式轮换用户，确保数据分布自然：
- 父级评论 A：`visitor01` → `visitor02` → `visitor03` 循环
- 父级评论 B：`visitor02` → `visitor03` → `visitor01` 循环
- 子级评论 C：`Memory` 优先，必要时穿插 `visitor03`

### 统计结果
- 已发布文章：16 篇
- 每篇评论数：3 条
- 评论总数：48 条
- 父级评论总数：32 条
- 子级评论总数：16 条

---

## 八、可选的补充测试数据

如果后续需要进一步测试业务，可以继续增加以下数据：

- 1 个默认收藏夹
- 1~3 条点赞记录
- 2~5 条浏览历史
- 1~2 条通知
- 1 个 AI 问答会话与 3~6 条消息

这些补充数据不会影响本次基础测试目标。

---

## 九、校验结果

### 分类数量
- 前端：1
- 后端：1
- 数据库：1
- 随笔：1

### 用户数量
- 博主：1
- 游客：3

### 文章数量
- 已发布文章：16
- 草稿文章：4

### 标签数量
- 标签总数：13

### 评论数量
- 已发布文章评论总数：48
- 每篇已发布文章评论数：3

### 标签覆盖情况
- 每篇已发布文章均至少有 1 个标签
- 每篇已发布文章均不超过 3 个标签

本测试数据满足当前需求，可直接作为 seed 基础内容使用。
