# 基于 Next.js 的 AI 辅助个人博客系统


## 启动事项
- 1. 安装依赖：`pnpm i`
- 2. 配置环境变量：在本地配置文件`.env`中配置项目所需的环境变量
    - 数据库连接`DATABASE_URL`
    - SMTP服务配置（包括`SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS`、`SMTP_SECURE`）
    - DeepSeek api密钥`DEEPSEEK_API_KEY`
- 3. 初始化数据库（首次启动）
    - 如果是首次启动，请你先执行prisma迁移`pnpm prisma migrate dev`
    - 同步prisma结构`pnpm prisma db push`
    - 如果数据库中没有数据，可以导入初始测试种子数据`pnpm prisma db seed`
- 4. 完成以上前置配置，即可开始启动项目：
    - 如果是启动开发环境：`pnpm dev`
    - 如果是启动生产环境：先执行`pnpm build`，然后再执行`pnpm start`