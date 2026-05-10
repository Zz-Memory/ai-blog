# 数据库实体说明

本文根据 `docs/DB.md` 和 `prisma/schema.prisma` 整理项目中的 14 个核心实体，主要说明每个实体用于保存什么数据，以及对应字段的中文含义。

---

## 1. 用户表 `User`

### 用途
用于保存系统中的登录用户信息，包括博主和普通访客用户，是整个系统的基础身份实体。

### 属性
- `id`：用户ID
- `email`：邮箱地址
- `username`：用户名
- `passwordHash`：密码哈希值
- `role`：用户角色
- `intro`：个人简介
- `status`：用户状态
- `createdAt`：创建时间
- `updatedAt`：更新时间

---

## 2. 邮箱验证码表 `VerificationCode`

### 用途
用于保存邮箱验证码记录，支持注册、重置密码、注销账号等一次性验证场景。

### 属性
- `id`：验证码记录ID
- `email`：邮箱地址
- `code`：验证码
- `purpose`：验证码用途
- `expiresAt`：过期时间
- `consumedAt`：使用时间
- `createdAt`：创建时间

---

## 3. 会话表 `Session`

### 用途
用于保存用户登录会话信息，帮助系统识别当前登录状态，并控制会话有效期。

### 属性
- `id`：会话ID
- `userId`：所属用户ID
- `sessionTokenHash`：会话令牌哈希值
- `expiresAt`：过期时间
- `createdAt`：创建时间
- `updatedAt`：更新时间

---

## 4. 文章表 `Post`

### 用途
用于保存博客文章的主体内容，是系统最核心的内容实体，记录文章的标题、正文、状态和发布信息。

### 属性
- `id`：文章ID
- `authorId`：作者ID
- `categoryId`：分类ID
- `title`：文章标题
- `slug`：文章路由标识
- `summary`：文章摘要
- `contentMarkdown`：Markdown正文内容
- `contentHtml`：HTML正文内容
- `status`：文章状态
- `publishedAt`：发布时间
- `createdAt`：创建时间
- `updatedAt`：更新时间

---

## 5. 分类表 `Category`

### 用途
用于保存文章分类信息，给文章提供归档和筛选维度。

### 属性
- `id`：分类ID
- `name`：分类名称
- `description`：分类描述
- `createdAt`：创建时间
- `updatedAt`：更新时间

---

## 6. 标签表 `Tag`

### 用途
用于保存文章标签信息，帮助对文章进行更细粒度的分类和检索。

### 属性
- `id`：标签ID
- `name`：标签名称
- `createdAt`：创建时间
- `updatedAt`：更新时间

---

## 7. 文章标签关联表 `PostTag`

### 用途
用于保存文章与标签之间的多对多关联关系，也就是某篇文章绑定了哪些标签。

### 属性
- `postId`：文章ID
- `tagId`：标签ID
- `createdAt`：创建时间

---

## 8. 评论表 `Comment`

### 用途
用于保存文章评论和评论回复信息，记录用户对文章的互动内容。

### 属性
- `id`：评论ID
- `postId`：文章ID
- `userId`：评论用户ID
- `parentId`：父评论ID
- `content`：评论内容
- `status`：评论状态
- `createdAt`：创建时间
- `updatedAt`：更新时间

---

## 9. 点赞表 `Like`

### 用途
用于保存用户对文章的点赞记录，记录“谁给哪篇文章点过赞”。

### 属性
- `id`：点赞记录ID
- `userId`：用户ID
- `postId`：文章ID
- `createdAt`：创建时间

---

## 10. 收藏表 `Bookmark`

### 用途
用于保存用户收藏文章的记录，表示用户将某篇文章加入收藏。

### 属性
- `id`：收藏记录ID
- `userId`：用户ID
- `postId`：文章ID
- `createdAt`：创建时间

---

## 11. 浏览历史表 `BrowseHistory`

### 用途
用于保存用户的文章浏览记录，便于展示最近浏览内容和个人浏览历史。

### 属性
- `id`：浏览记录ID
- `userId`：用户ID
- `postId`：文章ID
- `visitedAt`：浏览时间
- `createdAt`：创建时间

---

## 12. 通知表 `Notification`

### 用途
用于保存站内通知消息，例如评论提醒、回复提醒、系统消息等。

### 属性
- `id`：通知ID
- `recipientId`：接收人ID
- `senderId`：发送人ID
- `type`：通知类型
- `title`：通知标题
- `content`：通知内容
- `linkUrl`：跳转链接
- `isRead`：是否已读
- `createdAt`：创建时间
- `readAt`：已读时间

---

## 13. AI 问答会话表 `AiChatSession`

### 用途
用于保存用户在文章详情页发起的 AI 问答会话，每篇文章下可以记录一段问答会话。

### 属性
- `id`：会话ID
- `userId`：用户ID
- `postId`：文章ID
- `createdAt`：创建时间
- `updatedAt`：更新时间

---

## 14. AI 问答消息表 `AiChatMessage`

### 用途
用于保存 AI 问答会话中的每一条消息，包括用户提问和 AI 回复。

### 属性
- `id`：消息ID
- `sessionId`：会话ID
- `role`：消息角色
- `content`：消息内容
- `createdAt`：创建时间

---

## 说明

以上 14 个实体覆盖了本项目的用户认证、文章管理、评论互动、收藏点赞、浏览记录、通知系统以及 AI 问答功能。每个实体的字段名称尽量与 Prisma 模型保持一致，中文含义则用于论文或文档说明时直接理解字段保存的数据内容。
