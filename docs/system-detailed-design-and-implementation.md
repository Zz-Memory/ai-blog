第5章  系统详细设计和实现

5.1  博客内容管理模块

博客内容管理模块是本系统的核心业务模块，主要面向博主用户，承担文章草稿创建、内容编辑、自动保存、发布撤回、删除以及文章元数据维护等职责。结合前一章的总体设计，本系统将文章生命周期划分为“草稿—编辑—发布—撤回—删除”几个阶段，并通过后端接口对文章状态进行统一控制，保证文章内容在不同阶段具有清晰的流转规则。

5.1.1  文章草稿创建

当博主进入文章编辑页面时，系统首先为其准备一个可编辑的草稿记录。草稿不仅是正文内容的载体，也是后续自动保存、AI 辅助润色、发布审核和删除操作的基础。系统在创建草稿时，会先查询当前用户是否已经存在未完成的空白草稿，如果存在则直接复用，以避免重复生成无意义的文章记录；如果不存在，则新建一条状态为草稿的文章数据，并为其生成临时的 slug 标识。

文章草稿创建的核心实现位于 `app/api/blogger/articles/route.ts` 的 `POST` 方法中。其关键逻辑是先校验登录状态和博主身份，再根据 `action=create-draft` 决定是否进入草稿创建流程。若数据库中已存在符合条件的草稿，则直接返回该草稿；若不存在，则调用 Prisma 创建新文章，并初始化标题、摘要、正文、HTML 内容和状态字段。

草稿创建核心代码如下：

```typescript
// 判断当前登录用户是否存在未完成的空白草稿，
// 如果有则直接复用，避免同一用户产生多个空白草稿记录。
const existingDraft = await prisma.post.findFirst({
  where: { authorId: auth.user.id, status: PostStatus.DRAFT, title: "", contentMarkdown: "" },
  orderBy: { updatedAt: "desc" },
  select: { id: true, title: true, contentMarkdown: true },
});

if (existingDraft) {
  return NextResponse.json({
    ok: true,
    article: mapArticle({
      ...existingDraft,
      summary: null,
      status: PostStatus.DRAFT,
      updatedAt: new Date(),
      category: null,
      postTags: [],
    }),
  });
}

// 如果不存在草稿，则新建一条文章记录，状态统一设置为草稿。
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
});
```

上述实现保证了文章创作从一开始就具有明确的数据载体，后续编辑过程中的所有修改都直接作用于该草稿记录。

5.1.2  文章自动保存

为了防止博主在编辑过程中因页面刷新、网络异常或误操作而丢失内容，系统提供了自动保存机制。自动保存的本质是将编辑器中的标题、摘要、Markdown 正文、HTML 内容、分类以及标签信息实时提交到后端，以更新数据库中的文章记录。系统在保存时保持草稿状态不变，仅更新文章内容和更新时间。

自动保存逻辑同样由 `app/api/blogger/articles/route.ts` 的 `PATCH` 方法完成。当请求参数中的 `action` 为 `save` 时，接口会先确认文章归属是否属于当前博主，再执行内容更新。对于标签字段，系统采用“先清空再批量写入”的方式，避免旧标签残留导致的数据不一致。

自动保存核心代码如下：

```typescript
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
  });

  // 先删除旧的文章标签关联，再写入新的标签关联，
  // 这样可以保证当前文章的标签集合与编辑器内容保持一致。
  if (Array.isArray(body.tagIds)) {
    await prisma.postTag.deleteMany({ where: { postId: post.id } });
    if (body.tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: body.tagIds.map((tagId) => ({ postId: post.id, tagId })),
        skipDuplicates: true,
      });
    }
  }

  return NextResponse.json({ ok: true, updatedAt: updated.updatedAt.toISOString() });
}
```

该机制的设计重点在于两点：一是保证编辑状态可持续，二是保证文章内容和标签关系同步更新，从而提升文章编辑的安全性和可靠性。

5.1.3  Markdown 内容导入

系统支持博主将本地 Markdown 文件导入编辑器，以便快速迁移已有内容或进行二次创作。虽然 Markdown 导入的前端交互主要发生在编辑页中，但导入后的最终落库仍然依赖文章保存接口。也就是说，导入功能的本质是将外部 Markdown 文本统一转换为系统内部可编辑的正文内容，再通过保存接口写入数据库。

在数据层面，系统将 Markdown 内容存储在 `contentMarkdown` 字段，同时保留 `contentHtml` 字段用于详情页渲染。这样的双字段设计既满足了编辑阶段对 Markdown 的直接操作需求，也满足了阅读阶段对 HTML 渲染效率的要求。

Markdown 导入后，前端通常会把文件内容直接回填到编辑器，再调用文章保存接口完成落库。其核心逻辑可以概括为“读取文件内容—解析文本—更新编辑器状态—提交保存请求”，示例代码如下：

```typescript
// 读取用户导入的 Markdown 文件内容。
const fileText = await file.text();

// 将文件内容直接写入编辑器状态，
// 供博主继续编辑、补充标题、摘要、分类与标签等信息。
setEditorState((prev) => ({
  ...prev,
  contentMarkdown: fileText,
  contentHtml: markdownToHtml(fileText),
}));

// 将当前编辑结果保存到后端，
// 后端再把 contentMarkdown / contentHtml 等字段写入数据库。
await fetch("/api/blogger/articles?action=save", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    postId: draftId,
    contentMarkdown: fileText,
    contentHtml: markdownToHtml(fileText),
  }),
});
```

5.1.4  文章发布与撤回

文章完成编辑并经博主确认后，可以从草稿状态发布为正式文章；当文章需要临时下线时，也可以从已发布状态撤回到草稿状态。发布与撤回是文章生命周期中的关键状态切换操作，因此系统在实现时会对 slug 唯一性、发布时间以及状态字段进行严格控制。

发布功能位于 `app/api/blogger/articles/route.ts` 的 `PATCH` 方法中，当 `action` 为 `publish` 时，系统首先校验 slug 是否为空，再检查数据库中是否已经存在相同 slug 的其他文章。如果存在重复 slug，则返回冲突信息，要求博主重新设置。通过校验后，系统将文章状态更新为 `PUBLISHED`，并写入发布时间。

发布核心代码如下：

```typescript
if (body.action === "publish") {
  const slug = body.slug?.trim();
  if (!slug) return NextResponse.json({ message: "Slug 为必填项。" }, { status: 400 });

  // 发布前校验 slug 是否唯一，避免文章详情页路由冲突。
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
    },
  });

  return NextResponse.json({ ok: true, updatedAt: updated.updatedAt.toISOString(), status: "published" });
}
```

撤回功能则将文章状态重新设置为草稿状态，并清空发布时间。这样处理后，文章会从首页列表中移除，但仍保留在博主后台中以便继续编辑。

5.1.5  文章删除

当草稿文章失去保存价值，或者已发布文章因内容调整不再需要时，系统提供删除功能。删除操作仅允许博主删除自己创建的文章，并在删除前校验文章归属，防止越权删除。该功能实现于 `app/api/blogger/articles/route.ts` 的 `DELETE` 方法中。

删除核心逻辑如下：

```typescript
const post = await prisma.post.findFirst({ where: { id, authorId: auth.user.id }, select: { id: true } });
if (!post) return NextResponse.json({ message: "文章不存在。" }, { status: 404 });

// 文章删除后将同时清理文章本身记录，
// 文章相关的点赞、收藏、评论等关联数据由数据库关联策略统一维护。
await prisma.post.delete({ where: { id: post.id } });
return NextResponse.json({ ok: true });
```

该设计保证了文章删除动作简洁明确，并将业务校验放在服务端，避免前端直接操作数据库导致安全问题。

5.2  文章展示与筛选模块

文章展示与筛选模块主要面向普通访客和已登录用户，负责首页文章列表、文章详情展示以及基于分类、标签和关键词的内容检索。该模块的设计目标是让用户能够快速找到感兴趣的内容，并在阅读页面中完成浏览、评论、点赞、收藏以及 AI 问答等后续交互。

5.2.1  首页文章列表

首页文章列表仅展示状态为已发布的文章，同时支持分页、排序和统计信息返回。系统通过文章更新时间倒序排列，确保用户优先看到最新内容。对于博主后台文章列表，则会按当前登录用户过滤其个人文章，前端可根据状态、关键词进行筛选。

在文章后台列表中，`app/api/blogger/articles/route.ts` 的 `GET` 方法会根据 `page`、`pageSize`、`search` 和 `status` 等参数构建查询条件，并返回文章列表与分类统计数据。

列表查询核心代码如下：

```typescript
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
```

该实现将分页、筛选、统计与数据加载统一处理，减少前端重复请求，提升了后台管理效率。

5.2.2  文章详情展示

用户点击文章后进入详情页，系统需要完整展示文章标题、作者信息、发布时间、正文、分类、标签以及互动区内容。对于详情页所需的文章正文，系统会优先使用 `contentHtml` 进行渲染，同时保留 Markdown 原文供 AI 问答与编辑回溯使用。

在文章详情相关接口中，系统按照文章唯一标识或 slug 获取文章内容，并返回评论、点赞、收藏等关联状态，以便前端一次性完成页面渲染。其核心代码如下：

```typescript
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
```

5.2.3  分类与标签筛选

系统在文章列表和博主文章管理中都支持关键词、分类和标签筛选。关键词搜索会在标题、摘要、分类名称和标签名称中进行模糊匹配，从而提高检索覆盖面。筛选逻辑主要通过 Prisma 的条件拼接完成，保证查询表达式简洁清晰。

筛选条件构建的核心实现如下：

```typescript
function buildWhere(params: { authorId: string; status: PostStatus | null; search: string }) {
  const where: Prisma.PostWhereInput = {
    authorId: params.authorId,
    // 按状态过滤文章，避免与搜索条件互相干扰
    ...(params.status ? { status: params.status } : {}),
    // 关键词为空时不追加 OR 条件，避免生成多余的查询分支
    ...(params.search
      ? {
          OR: [
            // 标题模糊匹配
            { title: { contains: params.search, mode: "insensitive" as const } },
            // 摘要模糊匹配
            { summary: { contains: params.search, mode: "insensitive" as const } },
            // 分类名称模糊匹配
            { category: { name: { contains: params.search, mode: "insensitive" as const } } },
            // 标签名称模糊匹配
            { postTags: { some: { tag: { name: { contains: params.search, mode: "insensitive" as const } } } } },
          ],
        }
      : {}),
  };

  return where;
}
```

这种写法使得系统能够在单次查询中完成多维度筛选，减少接口复杂度，也提升了数据查询的可维护性。

5.3  用户认证与权限模块

用户认证与权限模块负责系统账号体系的建立、登录状态维护、密码找回、个人信息修改、账号注销及角色控制等功能。系统将用户划分为博主与访客两类角色，不同角色在功能权限上存在明确边界，例如博主可以进行文章编辑与管理，普通用户则以浏览、评论、点赞、收藏和 AI 问答为主。

5.3.1  用户注册

注册功能用于为系统创建新用户账号。用户注册时需要填写昵称、邮箱、验证码、密码和确认密码。系统在后端会先校验邮箱格式、密码强度、两次密码一致性，然后检查邮箱是否已被注册，最后验证验证码是否有效且未过期。若所有条件均满足，则创建新用户并将验证码标记为已使用。

注册功能位于 `app/api/auth/register/route.ts`。其核心处理过程采用事务完成，以确保“创建用户”和“消费验证码”两个操作同时成功或同时失败，避免出现验证码已消耗但用户未成功创建的异常状态。

注册核心代码如下：

```typescript
// 查找与注册邮箱匹配、未消费且未过期的验证码记录，
// 只有通过这个校验后才能进入注册创建流程。
const codeRecord = await prisma.verificationCode.findFirst({
  where: {
    email,
    code: verification,
    purpose: VerificationPurpose.REGISTER,
    consumedAt: null,
    expiresAt: { gt: new Date() },
  },
  orderBy: { createdAt: "desc" },
});

// 事务内完成“创建用户”和“消费验证码”两个动作，
// 保证注册流程的数据一致性。
const user = await prisma.$transaction(async (tx) => {
  const createdUser = await tx.user.create({
    data: {
      email,
      username: nickname,
      passwordHash: hashPassword(password),
    },
  });

  await tx.verificationCode.update({
    where: { id: codeRecord.id },
    data: { consumedAt: new Date() },
  });

  return createdUser;
});
```

5.3.2  用户登录

登录功能仅支持邮箱登录。用户在登录页面输入邮箱和密码后，系统先校验邮箱格式，再根据邮箱查询用户记录；如果用户存在且密码校验通过，则进入登录成功流程。与单一 JWT 登录不同，本项目采用 JWT+Session 双重认证机制：Session 用于服务端持久化登录状态，JWT 用于前端请求携带身份信息，两者相互配合以保证登录安全性与可续签能力。

登录成功后，系统会同时创建会话记录和 JWT 令牌。JWT 主要用于接口身份识别，而 Session 记录则保存真实的会话凭据及有效期。当 JWT 过期时，前端会通过无感刷新接口自动携带 Session 令牌请求续签，从而重新签发新的 JWT 并保持登录状态连续，不需要用户手动重新登录。登录与刷新接口分别位于 `app/api/auth/login/route.ts` 与 `app/api/auth/refresh/route.ts`。

登录核心代码如下：

```typescript
// 登录功能仅支持邮箱方式，先校验邮箱格式，再按邮箱查询用户。
const user = await prisma.user.findUnique({ where: { email: account } });

// 用户不存在或密码错误时统一返回失败，避免泄露额外账号信息。
if (!user) return NextResponse.json({ message: "账号或密码错误。" }, { status: 401 });
if (!verifyPassword(password, user.passwordHash)) return NextResponse.json({ message: "账号或密码错误。" }, { status: 401 });

// 创建 Session 记录，Session 会作为 JWT 续签的凭据。
const sessionToken = createSessionToken();
const sessionTokenHash = hashSessionToken(sessionToken);
const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
const session = await prisma.session.create({
  data: {
    userId: user.id,
    sessionTokenHash,
    expiresAt,
  },
});

// 基于用户信息和 Session id 签发 JWT，供前端后续请求直接携带。
const jwt = signJwt(createJwtPayload(user, session.id));
const response = NextResponse.json({
  message: "登录成功。",
  user: {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  },
});

// 同时写入 JWT Cookie 与 Session Cookie，形成双重认证机制。
setAuthCookies(response, jwt, sessionToken);
```

无感刷新核心代码如下：

```typescript
// 从请求 Cookie 中读取 Session 令牌，作为 JWT 续签的依据。
const sessionToken = request.headers.get("cookie")?.match(/(?:^|;\s*)session_token=([^;]+)/)?.[1];

if (!sessionToken) {
  return NextResponse.redirect(new URL("/?auth=login", url.origin));
}

// 通过 Session 哈希查找服务端会话，并校验是否仍在有效期内。
const session = await prisma.session.findUnique({
  where: { sessionTokenHash: hashSessionToken(sessionToken) },
  include: { user: true },
});

if (!session || session.expiresAt.getTime() <= Date.now()) {
  const response = NextResponse.redirect(new URL("/?auth=login", url.origin));
  response.headers.append("Set-Cookie", `${AUTH_JWT_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
  response.headers.append("Set-Cookie", `${AUTH_SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
  return response;
}

// 会话有效时重新签发 JWT，实现无感刷新和登录态续期。
const jwt = signJwt(createJwtPayload(session.user, session.id));
const response = NextResponse.redirect(new URL(returnTo, url.origin));
setAuthCookies(response, jwt, sessionToken);
```

5.3.3  密码找回

当用户忘记密码时，系统提供重置密码接口。重置流程通常包括验证码验证、新旧密码替换和重置结果反馈。系统通过统一的验证码表记录不同用途的验证码，保证注册、找回密码等场景互不干扰。

密码找回功能的实现位于 `app/api/auth/reset-password/route.ts`。接口会先校验邮箱格式、验证码和新密码强度，再确认验证码是否属于找回密码用途且仍在有效期内，最后在事务中同时完成密码更新与验证码消费，避免重复使用。

密码重置核心代码如下：

```typescript
// 校验找回密码验证码是否有效，
// 只有用途匹配、未消费且未过期的验证码才允许继续重置。
const codeRecord = await prisma.verificationCode.findFirst({
  where: {
    email,
    code: verificationCode,
    purpose: VerificationPurpose.RESET_PASSWORD,
    consumedAt: null,
    expiresAt: { gt: new Date() },
  },
  orderBy: { createdAt: "desc" },
});

if (!codeRecord) {
  return NextResponse.json({ message: "验证码错误或已过期。" }, { status: 400 });
}

// 在事务中同时更新密码和验证码状态，
// 防止验证码已使用但密码未修改，或密码已修改但验证码未消费。
await prisma.$transaction(async (tx) => {
  await tx.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(password) },
  });

  await tx.verificationCode.update({
    where: { id: codeRecord.id },
    data: { consumedAt: new Date() },
  });
});
```

5.3.4  个人信息修改

用户可在个人中心修改昵称等基础信息。系统在修改时仍需先校验当前登录身份，再更新对应用户记录，防止越权修改其他用户数据。

个人信息修改接口位于 `app/api/user/account-settings/route.ts`。系统先读取当前登录用户，再对昵称长度进行限制，随后更新 `username` 字段并返回最新的用户信息。

个人信息修改核心代码如下：

```typescript
// 获取当前登录用户，只有登录后才允许修改个人资料。
const auth = await getAuthUser();
if (!auth) {
  return NextResponse.json({ message: "请先登录。" }, { status: 401 });
}

const nickname = body.nickname?.trim();
if (!nickname) {
  return NextResponse.json({ message: "昵称不能为空。" }, { status: 400 });
}

// 对昵称长度做基础约束，避免过短或过长影响展示。
if (nickname.length < 2 || nickname.length > 24) {
  return NextResponse.json({ message: "昵称长度需在 2 到 24 个字符之间。" }, { status: 400 });
}

const updatedUser = await prisma.user.update({
  where: { id: auth.user.id },
  data: { username: nickname },
});
```

5.3.5  账号注销

账号注销功能用于用户主动关闭账户。系统在注销前会进行必要的安全验证，并清理会话信息，避免注销后继续访问系统。

账号注销接口位于 `app/api/user/account-settings/delete-account/route.ts`。系统在确认邮箱与当前登录用户一致、验证码有效后，会在事务中依次清理会话、通知、点赞、收藏、浏览历史、AI 会话、评论和文章等关联数据，最后删除用户记录。

账号注销核心代码如下：

```typescript
// 校验注销验证码是否存在且未过期，
// 只有通过验证码验证后才允许执行不可逆的账号注销操作。
const codeRecord = await prisma.verificationCode.findFirst({
  where: {
    email,
    code: verificationCode,
    purpose: VerificationPurpose.DELETE_ACCOUNT,
    consumedAt: null,
    expiresAt: { gt: new Date() },
  },
  orderBy: { createdAt: "desc" },
});

// 通过事务集中删除当前用户相关数据，
// 这样可以避免删除一半时出现孤立数据或外键残留。
await prisma.$transaction(async (tx) => {
  await tx.session.deleteMany({ where: { userId: auth.user.id } });
  await tx.notification.deleteMany({ where: { recipientId: auth.user.id } });
  await tx.notification.deleteMany({ where: { senderId: auth.user.id } });
  await tx.like.deleteMany({ where: { userId: auth.user.id } });
  await tx.bookmark.deleteMany({ where: { userId: auth.user.id } });
  await tx.browseHistory.deleteMany({ where: { userId: auth.user.id } });
  await tx.aiChatMessage.deleteMany({ where: { session: { userId: auth.user.id } } });
  await tx.aiChatSession.deleteMany({ where: { userId: auth.user.id } });
  await tx.comment.deleteMany({ where: { userId: auth.user.id } });
  await tx.post.deleteMany({ where: { authorId: auth.user.id } });
  await tx.user.delete({ where: { id: auth.user.id } });
  await tx.verificationCode.update({ where: { id: codeRecord.id }, data: { consumedAt: new Date() } });
});
```

5.3.6  权限控制

系统通过用户角色字段对权限进行控制。博主拥有文章管理、AI 创作辅助等能力，而普通登录用户主要拥有互动与浏览能力。接口层在每次请求时都会调用统一的身份获取函数，再根据角色决定是否允许访问。

例如，文章管理接口中会通过如下方式限制访问：

```typescript
const auth = await getAuthUser();
// 未登录时直接拒绝访问
if (!auth) return NextResponse.json({ message: "请先登录。" }, { status: 401 });
// 非博主角色禁止访问该接口
if (!isBlogger(auth.user.role)) return NextResponse.json({ message: "无权限访问。" }, { status: 403 });
```

该设计将权限判断前置到服务端，保证即使前端页面被篡改，未授权用户也无法直接调用敏感接口。

5.4  AI 创作辅助模块

AI 创作辅助模块主要服务于博主的内容生产过程，包括标题生成和文本润色等能力。系统将 AI 能力统一放置在服务端接口中调用 DeepSeek 模型，并通过环境变量管理 API 密钥，避免在前端暴露敏感信息。

5.4.1  标题生成

标题生成接口用于根据文章正文自动生成更适合发布的标题。系统在调用模型前会先截断输入文本，避免单次请求内容过长；在模型返回后再进行清洗和长度控制，确保输出结果简洁可用。该功能的接口位于 `app/api/title-generation/route.ts`。

标题生成的核心调用流程如下：

```typescript
// 调用大模型生成博客标题，
// 通过 system prompt 约束输出必须是简洁、可直接使用的标题。
const completion = await client.chat.completions.create({
  model: MODEL,
  stream: false,
  messages: [
    {
      role: "system",
      content:
        "你是一个中文博客标题生成器。请根据用户提供的标题、关键词和文章内容，生成一个简洁、自然、适合博客发布的标题。只输出标题本身，不要输出解释、编号、引号或多余符号。标题长度控制在 8 到 24 个汉字左右，必要时可包含少量英文或数字。",
    },
    {
      role: "user",
      content: `当前标题：${currentTitle || "未设置"}\n\n文章内容：\n${trimInput(contentMarkdown)}`,
    },
  ],
  temperature: 0.7,
});
```

该功能能够帮助博主在写作初期快速获得标题灵感，提高创作效率。

5.4.2  内容续写

内容续写功能用于在博主写作过程中，根据当前已输入的文章上下文自动补全后续内容。系统会将光标前后的文本片段作为上下文发送给大模型，再通过流式补全的方式将建议内容返回到编辑器中，帮助博主快速扩展文章段落。该功能实现于 `app/api/autocomplete/route.ts`。

内容续写接口通过 `prompt` 与 `suffix` 两个字段分别接收光标前文本和光标后文本，并将两者裁剪到合理长度后送入 DeepSeek 的补全接口。这样既保留了上下文连贯性，也避免了单次请求输入过长。其核心代码如下：

```typescript
// 读取光标前后文本作为补全上下文，
// 前后文一起输入可以帮助模型生成更自然的续写内容。
const body = await request.json().catch(() => null);
const prefix = getStringField(body, "prefix") ?? "";
const suffix = getStringField(body, "suffix") ?? "";

if (!prefix && !suffix) {
  return NextResponse.json({ message: "缺少补全上下文。" }, { status: 400 });
}

// 使用 DeepSeek 补全接口进行流式续写，
// 生成结果会实时返回给前端编辑器。
const completion = await client.completions.create({
  model: MODEL,
  prompt: trimPrefix(prefix),
  suffix: trimSuffix(suffix),
  max_tokens: MAX_COMPLETION_TOKENS,
  temperature: 0.1,
  stream: true,
});
```

5.4.3  文本润色

文本润色功能用于对选中文本或整篇文章进行语言优化，包括语法修正、语序调整和表达增强。系统支持流式返回润色结果，使用户能够边等待边查看生成内容，从而提升交互体验。该功能实现于 `app/api/text-polish/route.ts`。

润色接口在模型提示词中明确要求保留原意、保留段落结构，并直接输出润色后的正文。其流式输出核心代码如下：

```typescript
// 以流式方式调用大模型进行文本润色，
// 这样前端可以边接收边展示生成结果，提升交互体验。
const completion = await client.chat.completions.create({
  model: MODEL,
  stream: true,
  messages: [
    {
      role: "system",
      content:
        "你是一个中文博客文本润色助手。请在不改变原意的前提下，优化表达流畅度，修正复杂语法错误，统一语言风格。你必须直接输出润色后的正文，不要输出解释、分析、列表、编号、引号或 Markdown 代码块。",
    },
    {
      role: "user",
      content: [
        `文章标题：${title || "未设置"}`,
        `润色要求：${styleHint}${customPrompt.trim() ? `；${customPrompt.trim()}` : ""}`,
        mode === "full" ? "当前操作：全文润色" : "当前操作：选中文本润色",
        "请保留原有段落结构、列表结构与必要的 Markdown 标记。",
        "待润色文本如下：",
        trimInput(targetText),
      ].join("\n\n"),
    },
  ],
  temperature: 0.4,
});
```

5.5  AI 问答互动模块

AI 问答互动模块用于支持用户围绕文章内容进行智能提问。与通用聊天不同，该模块强调“以当前文章为上下文”的问答模式，因此模型回答需要尽量基于文章本身内容，避免无根据扩展。系统还会保存会话历史，以便用户在后续继续追问时，模型能够结合上下文进行回答。

5.5.1  会话获取与历史管理

用户进入文章详情页后，系统可以先查询当前文章对应的 AI 问答会话。若历史会话存在，则直接返回历史消息；若不存在，则在第一次提问时创建新会话。会话数据通过 `aiChatSession` 和 `aiChatMessage` 两张表进行管理，分别保存会话主记录和消息明细。

获取会话的核心代码如下：

```typescript
// 查询当前用户针对指定文章的历史会话，
// 并按时间升序带出消息列表，便于前端完整恢复上下文。
const session = await prisma.aiChatSession.findFirst({
  where: { postId, userId: auth.user.id },
  include: {
    messages: { orderBy: { createdAt: "asc" } },
    post: { select: { title: true, summary: true } },
  },
});
```

5.5.2  智能对话

在用户发送问题后，系统会把当前文章标题、摘要和正文拼接为系统提示词，再结合最近若干轮对话历史一并发送给模型。这样既能保证回答与文章内容相关，又能利用上下文延续多轮对话。该功能位于 `app/api/posts/ai-chat/route.ts`。

智能对话的系统提示词构建逻辑如下：

```typescript
// 将文章标题、摘要和正文拼接成系统提示词，
// 让模型优先基于文章内容回答，减少无关或编造内容。
function buildSystemPrompt(articleTitle: string, articleSummary: string | null, contentMarkdown: string) {
  return [
    "你是文章详情页内的 AI 助手，请围绕当前文章内容回答问题。",
    "回答要简洁、准确、自然，优先基于文章本身内容，不要编造。",
    `当前文章标题：${articleTitle}`,
    articleSummary ? `当前文章摘要：${articleSummary}` : "",
    "当前文章完整正文（Markdown）：",
    contentMarkdown,
    "如果用户的问题与文章无关，请礼貌提醒并尽量引导回文章内容。",
  ].filter(Boolean).join("\n\n");
}
```

系统在将用户问题保存到数据库后，会调用 DeepSeek 的流式接口生成回答，并在生成结束后把 AI 回复写回消息表，形成完整的会话链路。

5.6  互动与通知模块

互动与通知模块主要包含评论、点赞、收藏、浏览历史以及通知提醒等功能。该模块增强了博客系统的社交属性，使文章阅读不再只是单向展示，而是形成“浏览—反馈—提醒—再互动”的闭环。

5.6.1  评论互动

评论功能允许登录用户在文章下发表看法，并支持对其他评论进行回复。系统在保存评论时会先检查用户登录状态、禁言状态以及文章是否存在；如果是回复评论，还会验证父评论是否属于同一文章。

评论接口位于 `app/api/posts/comments/route.ts`。系统会根据用户角色决定评论初始状态：博主发表评论默认直接审核通过，普通用户发表评论则进入待审核状态。若评论已通过审核，系统还会自动创建通知记录提醒文章作者或被回复用户。

评论创建核心代码如下：

```typescript
// 博主评论直接通过，普通用户评论进入待审核状态。
const status = auth.user.role === UserRole.BLOGGER ? CommentStatus.APPROVED : CommentStatus.PENDING;

// 在事务中先保存评论，再根据评论状态决定是否写入通知，
// 从而避免评论与通知之间出现不一致。
const comment = await prisma.$transaction(async (tx) => {
  const created = await tx.comment.create({
    data: {
      postId,
      userId: auth.user.id,
      parentId: parentId ?? null,
      content,
      status,
    },
  });

  if (status === CommentStatus.APPROVED) {
    if (parentComment && parentComment.userId !== auth.user.id) {
      await createCommentNotification(tx, { ... });
    } else if (!parentComment && post.authorId !== auth.user.id) {
      await createCommentNotification(tx, { ... });
    }
  }

  return created;
});
```

5.6.2  点赞与收藏

点赞和收藏都采用“再次点击即取消”的切换式交互方式，便于用户快速表达偏好。系统通过联合唯一键 `userId_postId` 判断用户是否已对文章执行过该动作；如果已存在则删除记录，否则新增记录。该模式同时适用于点赞和收藏接口，分别位于 `app/api/posts/like/route.ts` 与 `app/api/posts/bookmark/route.ts`。

点赞切换的核心代码如下：

```typescript
// 通过联合唯一键判断当前用户是否已经点过赞，
// 如果已经存在则执行取消点赞，否则新增点赞记录。
const existingLike = await prisma.like.findUnique({
  where: { userId_postId: { userId: auth.user.id, postId } },
  select: { id: true },
});

if (existingLike) {
  await prisma.like.delete({
    where: { userId_postId: { userId: auth.user.id, postId } },
  });
  const likes = await prisma.like.count({ where: { postId } });
  return NextResponse.json({ liked: false, likes });
}
```

收藏功能采用同样思路，实现了文章喜好记录的轻量化管理。

5.6.3  浏览历史

浏览历史用于记录用户近期访问过的文章，方便用户在个人中心快速回看。系统通过浏览历史接口读取当前用户的访问记录，并将文章分类、标签、点赞数、收藏数和评论数等信息一并返回，便于前端构建历史列表页。

浏览历史读取接口位于 `app/api/user/browse-histories/route.ts`。查询结果会按照访问时间和创建时间倒序排列，并过滤掉已下线文章，确保展示内容仍然有效。

浏览历史查询核心代码如下：

```typescript
// 按访问时间倒序读取当前用户的浏览历史，
// 同时带出文章分类、标签以及互动统计，便于个人中心展示。
const histories = await prisma.browseHistory.findMany({
  where: { userId: auth.user.id },
  orderBy: [{ visitedAt: "desc" }, { createdAt: "desc" }],
  include: {
    post: {
      include: {
        category: true,
        postTags: { include: { tag: true } },
        _count: { select: { likes: true, bookmarks: true, comments: { where: { status: "APPROVED" } } } },
      },
    },
  },
});
```

5.6.4  通知提醒

通知提醒用于将评论回复、文章评论等互动事件及时传递给相关用户。系统在评论创建成功后会自动写入通知数据，通知中包含发送者、接收者、标题、内容、链接地址以及已读状态等字段。用户可以在个人中心查看未读通知，并在阅读后将通知标记为已读。

通知提醒功能实现于 `app/api/user/notifications/route.ts`。系统会根据当前登录用户查询其收到的通知列表，并返回未读数量；同时支持单条已读、全部已读、删除单条和清空全部通知等操作，便于用户管理消息中心。其核心代码如下：

```typescript
// 读取当前登录用户的通知列表，并按创建时间倒序排列。
const notifications = await prisma.notification.findMany({
  where: {
    recipientId: auth.user.id,
  },
  orderBy: [{ createdAt: "desc" }],
  include: { sender: { select: { username: true, role: true } } },
});

return NextResponse.json({
  notifications: notifications.map((item) => ({
    id: item.id,
    type: item.type,
    userName: item.sender?.username ?? "系统通知",
    userAvatarText: (item.sender?.username ?? "S").slice(0, 1).toUpperCase(),
    userAvatarUrl: item.sender?.role === "BLOGGER" ? "/avatars/blogger-default.png" : item.sender ? "/avatars/visitor-default.png" : "/avatars/visitor-default.png",
    time: formatTime(item.createdAt),
    title: item.title,
    message: item.content,
    targetArticle: item.linkUrl ?? item.title,
    linkUrl: item.linkUrl,
    unread: !item.isRead,
  })),
  unreadCount: notifications.filter((item) => !item.isRead).length,
});

// 将当前用户的全部未读通知一次性标记为已读，
// 便于在消息中心点击“全部已读”后快速更新状态。
if (body.action === "mark-all-read") {
  await prisma.notification.updateMany({
    where: { recipientId: auth.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
```

通过上述设计，系统将文章内容生产、内容展示、用户认证、AI 创作辅助、AI 问答互动以及评论点赞收藏等功能有机整合，形成了一个完整的 AI 辅助个人博客系统。各模块之间通过统一的接口规范、统一的数据模型和统一的权限体系协同工作，为用户提供了较为完善的博客创作与阅读体验。
