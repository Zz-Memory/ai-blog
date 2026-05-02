# 数据库设计说明

## 一、设计目标

本项目采用 `Prisma + PostgreSQL` 作为核心数据存储方案，用于支撑个人博客系统的用户认证、文章创作、标签管理、评论互动、收藏与点赞、浏览记录、消息通知以及文章详情页 AI 问答等业务场景。

数据库设计遵循以下原则：

1. **满足课题功能要求**：覆盖访客端、博主端与公共内容访问所需的核心数据。
2. **支持 Next.js 服务端访问**：所有敏感数据统一由后端接口或 Server Actions 访问，避免前端直接操作数据库。
3. **便于 Prisma 建模**：以清晰的实体关系建模，减少复杂拼接 SQL。
4. **兼顾扩展性**：为后续内容管理、消息通知、AI 问答历史等留出空间。
5. **兼顾安全性**：密码哈希存储、验证码有效期、权限控制与必要的审计字段等均纳入设计。

---

## 二、数据库总体实体

结合课题功能与设计稿页面，数据库核心实体可划分为以下几类：

- **用户与认证**：用户、邮箱验证码、会话令牌、重置密码令牌
- **内容管理**：文章、分类、标签、文章标签关联
- **资源管理**：默认头像与文章内容管理
- **互动系统**：评论、点赞、收藏、浏览历史、消息通知
- **AI 模块**：AI 问答会话、AI 问答消息

---

## 三、推荐的 Prisma 模型结构

下面给出推荐的表结构与字段设计说明。实际开发时可以按需拆分文件，但建议在 `prisma/schema.prisma` 中保持统一建模。

### 1. 用户表 `User`

用于存储所有登录用户，包括博主与访客。

#### 业务说明
- 博主账号预置在数据库中，首次登录后可修改初始密码。
- 访客通过邮箱 + 验证码方式注册。
- 匿名用户指未登录的访问者，不作为数据库中的用户记录处理。

#### 主要字段
- `id`
- `email`
- `username`
- `passwordHash`
- `role`：`BLOGGER | VISITOR`
- `intro`
- `status`：`ACTIVE | BANNED`
- `createdAt`
- `updatedAt`

#### 设计要点
- `email` 唯一
- `username` 唯一
- `passwordHash` 只保存加盐哈希后的结果
- `role` 仅区分博主与访客
- 头像统一使用默认资源，由前端按角色从 `public/` 进行兜底显示，不再支持头像修改
- 用户删除采用物理删除，删除后连同其相关数据一并清理

---

### 2. 邮箱验证码表 `VerificationCode`

用于注册、修改（找回）密码、绑定邮箱、注销账号等一次性验证场景。

#### 主要字段
- `id`
- `email`
- `code`
- `purpose`：`REGISTER | RESET_PASSWORD | BIND_EMAIL | DELETE_ACCOUNT`
- `expiresAt`
- `consumedAt`
- `createdAt`

#### 设计要点
- 验证码应短时有效
- 同一邮箱在短时间内应限流
- 验证成功后标记已使用，避免重复利用

---

### 3. 会话表 `Session`

用于保存登录会话，支持基础登录态管理。

#### 主要字段
- `id`
- `userId`
- `sessionTokenHash`
- `expiresAt`
- `createdAt`
- `updatedAt`

#### 设计要点
- 不直接存储明文 token
- 支持基础登录态管理与会话过期控制
- 退出登录时可删除会话记录或让会话自然过期

---

### 4. 文章表 `Post`

系统核心内容表，保存博客文章的主体信息。

#### 业务说明
- 支持系统内编写、Markdown 文件导入、草稿保存与发布两种文章状态管理。
- 已发布文章可以撤回，撤回后回归草稿状态。
- 每篇文章必须且只能归属一个分类。
- 访客可匿名浏览已发布文章。
- 博主可创建、编辑、保存草稿、发布、撤回和彻底删除文章。

#### 主要字段
- `id`
- `authorId`
- `categoryId`
- `title`
- `slug`
- `summary`
- `contentMarkdown`
- `contentHtml`
- `status`：`DRAFT | PUBLISHED`
- `publishedAt`
- `createdAt`
- `updatedAt`

#### 设计要点
- `slug` 用于 SEO 友好的详情页路由
- `summary` 用于列表页摘要展示、搜索结果预览和详情页开头简介
- `categoryId` 为必填外键，保证文章始终有明确分类
- `contentMarkdown` 保存原始 Markdown
- `contentHtml` 可保存渲染后的缓存结果
- `status` 用于表达文章生命周期：草稿、已发布
- 已发布文章可通过撤回动作回到草稿状态
- 删除文章不纳入状态枚举，建议通过独立的物理删除流程实现

---

### 5. 分类表 `Category`

用于文章一级归档与导航筛选。

#### 业务说明
- 所有文章都必须归属一个分类，因此分类是文章发布的前置条件。
- 分类适合作为首页频道、文章列表筛选、博主端文章管理分组的基础维度。
- 分类建议由博主统一管理，避免访客随意新增造成结构混乱。

#### 主要字段
- `id`
- `name`
- `description`
- `createdAt`
- `updatedAt`

#### 设计要点
- `name` 唯一
- 分类仅作为文章筛选和归档维度，不再维护路由标识
- 分类不再维护排序字段或状态字段
- 分类删除采用物理删除

---

### 6. 文章标签表 `Tag`

用于文章标签自定义管理。

#### 主要字段
- `id`
- `name`
- `createdAt`
- `updatedAt`

#### 设计要点
- `name` 唯一
- 标签仅作为文章筛选和归档维度，不再维护路由标识
- 标签支持多对多关联
- 标签删除采用物理删除

---

### 7. 文章标签关联表 `PostTag`

用于文章与标签的多对多关系。

#### 主要字段
- `postId`
- `tagId`
- `createdAt`

#### 设计要点
- 复合主键或唯一索引：`postId + tagId`
- 方便标签筛选与文章归档

---

### 9. 评论表 `Comment`

用于文章评论与回复。

#### 业务说明
- 登录用户可发表评论
- 博主可审核、删除评论
- 支持评论回复和状态控制

#### 主要字段
- `id`
- `postId`
- `userId`
- `parentId`
- `content`
- `status`：`PENDING | APPROVED`
- `likeCount`
- `createdAt`
- `updatedAt`

#### 设计要点
- `parentId` 支持评论回复树
- `status` 仅表示评论审核结果
- `content` 需做 XSS 清洗与转义
- 父评论删除时，其子评论一并物理删除

---

### 10. 点赞表 `Like`

用于保存用户对文章的点赞关系。

#### 主要字段
- `id`
- `userId`
- `postId`
- `createdAt`

#### 设计要点
- `userId + postId` 唯一约束，防止重复点赞
- 可用于统计文章热度与用户偏好

---

### 11. 收藏夹表 `CollectionFolder`

用于访客端“我的收藏”模块的收藏夹管理。

#### 主要字段
- `id`
- `userId`
- `name`
- `isDefault`
- `createdAt`
- `updatedAt`

#### 设计要点
- 每个用户可拥有多个收藏夹
- 至少保留一个默认收藏夹
- 收藏夹删除采用物理删除，删除时其内收藏文章一并取消收藏

---

### 12. 收藏记录表 `Bookmark`

用于收藏文章。

#### 主要字段
- `id`
- `userId`
- `postId`
- `folderId`
- `createdAt`

#### 设计要点
- `userId + postId` 可唯一约束
- `folderId` 可为空，默认进入默认收藏夹

---

### 13. 浏览历史表 `BrowseHistory`

用于记录用户浏览过的文章。

#### 主要字段
- `id`
- `userId`
- `postId`
- `visitedAt`
- `createdAt`

#### 设计要点
- 可记录最近浏览的文章
- 支持个人中心“浏览记录”页面

---

### 14. 通知表 `Notification`

用于站内互动提醒和系统通知。

#### 业务说明
- 点赞、收藏、评论、回复、审核结果、新用户注册提醒、系统公告等均可形成通知。
- 访客与博主均可接收通知。
- 系统类通知的 `senderId` 统一指向博主账号。
- `NEW_USER` 类型用于“新用户注册提醒”，当有新访客注册成功时自动向博主发送一条通知，`senderId` 指向该新注册用户。

#### 主要字段
- `id`
- `recipientId`
- `senderId`
- `type`：`LIKE | COMMENT | REPLY | SYSTEM | REVIEW | NEW_USER`
- `title`
- `content`
- `linkUrl`
- `status`：`PUBLISHED | DRAFT`
- `isRead`
- `createdAt`
- `readAt`

#### 设计要点
- 统一通知模型更便于扩展
- `linkUrl` 方便点击后跳转到文章或评论位置
- 草稿消息仅用于后台编辑与暂存，已发布消息才会进入用户通知列表
- 通知删除采用物理删除

---

### 15. AI 问答会话表 `AiChatSession`

用于保存一次 AI 问答会话。

#### 业务说明
- AI 问答悬浮球只出现在文章详情页。
- 只有登录用户才能使用该功能。
- 该功能不区分博主或访客身份，只按登录用户归属保存会话。
- 问答历史仅在对应文章详情页的悬浮球面板中查看，不在个人中心展示。

#### 主要字段
- `id`
- `userId`
- `postId`
- `createdAt`
- `updatedAt`

#### 设计要点
- 会话与具体文章绑定，满足文章详情页内的历史回看
- 不区分“文章上下文问答”和“通用问答”，由 AI 在运行时判断上下文
- 不需要软删除字段，会话删除即物理删除
- 不需要 `title`，会话列表也不依赖标题展示

---

### 16. AI 问答消息表 `AiChatMessage`

用于保存对话中的每一条消息。

#### 主要字段
- `id`
- `sessionId`
- `role`：`USER | ASSISTANT`
- `content`
- `createdAt`

#### 设计要点
- 支持连续对话与历史回放
- 便于流式回复和消息列表渲染
- 不单独维护 token 统计字段，按需在业务层计算或由模型调用侧记录

---

## 四、核心关系说明

### 1. 用户与文章
- 一个用户可以创建多篇文章
- `User 1 - N Post`
- 用户资料统一采用默认头像显示，不再维护头像资源表
- 文章内容不再单独拆分图片资源管理

### 2. 用户与评论
- 一个用户可以发表多条评论
- `User 1 - N Comment`

### 3. 文章与评论
- 一篇文章有多条评论
- `Post 1 - N Comment`

### 4. 文章与分类
- 一篇文章必须且只能归属一个分类
- 一个分类可包含多篇文章
- `Category 1 - N Post`
- 通过 `Post.categoryId` 外键实现

### 5. 文章与标签
- 一篇文章可拥有多个标签
- 一个标签可关联多篇文章
- `Post N - N Tag`

### 6. 用户与收藏夹
- 一个用户可以有多个收藏夹
- `User 1 - N CollectionFolder`

### 6. 收藏夹与收藏记录
- 一个收藏夹可以包含多条收藏记录
- `CollectionFolder 1 - N Bookmark`

### 7. 用户与浏览历史
- 一个用户可以有多条浏览历史
- `User 1 - N BrowseHistory`

### 9. 用户与 AI 问答
- 一个用户可以有多个 AI 会话
- 一个会话可以包含多条消息
- `User 1 - N AiChatSession`
- `AiChatSession 1 - N AiChatMessage`

### 10. 用户与通知
- 一个用户可以接收多条通知
- 通知既可以来自系统，也可以来自其他用户
- `User 1 - N Notification`

---

## 五、索引与约束建议

为保证查询性能与数据一致性，建议建立如下索引：

### 用户相关
- `User.email` 唯一索引
- `User.username` 唯一索引或普通索引
- `Session.userId` 索引
- `VerificationCode.email + purpose` 索引

### 内容相关
- `Post.slug` 唯一索引
- `Post.authorId` 索引
- `Post.categoryId` 索引
- `Post.status + publishedAt` 组合索引
- `Category.name` 唯一索引
- `Category.slug` 唯一索引
- `Category.status` 索引
- `PostTag.postId + tagId` 唯一索引
- `Tag.slug` 唯一索引

### 互动相关
- `Comment.postId` 索引
- `Comment.userId` 索引
- `Comment.parentId` 索引
- `Like.userId + postId` 唯一索引
- `Bookmark.userId + postId` 唯一索引
- `BrowseHistory.userId + visitedAt` 索引
- `Notification.recipientId + createdAt` 索引

### AI 相关
- `AiChatSession.userId + createdAt` 索引
- `AiChatMessage.sessionId + createdAt` 索引

---

## 六、推荐的枚举类型

建议在 Prisma 中统一定义以下枚举：

```text
UserRole
- BLOGGER
- VISITOR

UserStatus
- ACTIVE
- DISABLED
- DELETED

PostStatus
- DRAFT
- PUBLISHED

CommentStatus
- PENDING
- APPROVED
- REJECTED
- DELETED

NotificationType
- LIKE
- COMMENT
- REPLY
- SYSTEM
- REVIEW
- NEW_USER

AiChatMode
- POST_CONTEXT
- GENERAL

AiChatRole
- USER
- ASSISTANT
- SYSTEM

VerificationPurpose
- REGISTER
- RESET_PASSWORD
- BIND_EMAIL
```

---

## 七、建议的 Prisma schema 文件组织

如果项目后续开始落地，建议使用如下结构：

```text
prisma/
├─ schema.prisma
├─ migrations/
└─ seed.ts
```

如需更细化，也可以拆分为：

```text
prisma/
├─ schema.prisma
├─ models/
│  ├─ user.prisma
│  ├─ post.prisma
│  ├─ comment.prisma
│  ├─ notification.prisma
│  └─ ai.prisma
├─ migrations/
└─ seed.ts
```

---

## 八、与设计稿和功能页面的对应关系

### 访客端页面依赖的数据
- 首页 / 博客首页：文章、标签、博主信息
- 文章详情页：文章、评论、点赞、收藏、AI 问答
- 浏览记录页：浏览历史
- 我的收藏页：收藏夹、收藏记录
- 消息通知页：通知列表
- 我的评论页：评论列表
- 我的点赞页：点赞记录
- 账号设置页：用户资料、密码、邮箱

### 博主端页面依赖的数据
- 数据概览页：文章统计、评论统计、通知统计
- 文章管理页：文章、标签、草稿、发布、撤回状态
- 评论审核页：评论审核状态、评论作者、关联文章
- 发送消息页：系统消息、接收人群
- AI 博客编辑器页：文章标题、正文、AI 辅助创作入口

---

## 九、尚需补足但可后续迭代的内容

当前数据库设计已覆盖课题的核心功能，但后续仍可继续增强：

- 更精细的草稿版本管理
- 文章修订历史
- 评论楼中楼层级缓存
- 消息已读回执与批量通知
- 全站搜索索引表
- 更精细的媒体资源管理方案（若后续需要再补）

这些扩展均可在不破坏现有结构的前提下逐步加入。
