# Deployment Guide - Render (Backend) + Vercel (Frontend)

## 已修复的问题

### 1. 前端 `.env.production` 文件损坏（最关键）
- **问题**：文件编码损坏，`production` 变成 `pr?ducti?n?`，导致 `VITE_API_ROOT` 无法正确读取
- **修复**：已重写文件，内容恢复正常

### 2. 生产环境不自动运行数据库迁移
- **问题**：之前只有开发环境才自动迁移，生产环境部署后数据库表不存在，所有 API 报错
- **修复**：添加了 `AutoMigrate` 环境变量，默认启用自动迁移
- **控制方式**：设置 `AutoMigrate=false` 可禁用（如需手动通过 CI 运行迁移）

### 3. CORS 配置依赖环境变量
- **问题**：如果 Render 上没配置 `AllowedOrigins`，只有 localhost 被允许，Vercel 前端会被 CORS 拦截
- **修复**：添加了启动日志，方便在 Render 日志中查看配置的 origins
- **新增**：Preflight 请求缓存 1 小时，减少 OPTIONS 请求

### 4. 反向代理（Forwarded Headers）未配置
- **问题**：Render 是反向代理，后端不知道自己在 HTTPS 下运行，导致 cookie 的 Secure 属性可能异常
- **修复**：添加了 `ForwardedHeaders` 中间件，正确处理 `X-Forwarded-Proto`

### 5. PORT 环境变量支持
- **问题**：Render 会设置 `PORT` 环境变量，但 ASP.NET Core 默认不读取它
- **修复**：添加了对 `PORT` 环境变量的自动检测和配置

### 6. Program.cs 中的 bug
- **问题**：`builder.Configuration` 在 `builder.Build()` 之后被使用，会导致异常
- **修复**：改为使用 `app.Configuration`

---

## Render 后端配置

### Environment Variables（必须设置）

在 Render Dashboard → Your Service → Environment → Environment Variables 中添加：

| Key | Value | 说明 |
|-----|-------|------|
| `ASPNETCORE_ENVIRONMENT` | `Production` | 运行环境 |
| `ConnectionStrings__DefaultConnection` | `Host=xxx;Port=5432;Database=xxx;Username=xxx;Password=xxx;SSL Mode=Require` | PostgreSQL 连接字符串 |
| `AllowedOrigins` | `https://your-vercel-app.vercel.app` | Vercel 前端域名（多个用分号分隔） |
| `AutoMigrate` | `true` | 是否自动运行数据库迁移（默认 true，可不设） |

### 重要：AllowedOrigins 格式
- 单个域名：`https://myapp.vercel.app`
- 多个域名：`https://app1.vercel.app;https://app2.vercel.app`
- **不要**加末尾的 `/`
- **必须**包含 `https://` 前缀

### PostgreSQL 连接字符串格式
```
Host=your-db-host.render.com;Port=5432;Database=your_db_name;Username=your_user;Password=your_password;SSL Mode=Require
```

### Docker 设置
- **Dockerfile Path**: `backend/Dockerfile`
- **Build Context**: `backend`
- **Port**: 自动（Render 会设置 PORT 环境变量）

---

## Vercel 前端配置

### Environment Variables（必须设置）

在 Vercel Dashboard → Your Project → Settings → Environment Variables 中添加：

| Key | Value | 环境 |
|-----|-------|------|
| `VITE_API_ROOT` | `https://your-render-app.onrender.com/api` | Production, Preview, Development |

### 重要说明
- `VITE_API_ROOT` 必须以 `/api` 结尾
- 必须是完整的 HTTPS URL
- 不要加末尾的 `/`（例如 `.../api` 而不是 `.../api/`）

### Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Framework Preset
Vite（Vercel 会自动检测）

---

## 部署后验证步骤

### 1. 验证后端启动
查看 Render 日志，确认：
- 没有数据库连接错误
- 看到 `[DB] Database migrations applied successfully.`
- 看到 `[CORS] Configured allowed origins: ...` 且包含你的 Vercel 域名

### 2. 验证后端 API
在浏览器访问：`https://your-render-app.onrender.com/api/scores/leaderboard`
- 应该返回 JSON 数组（可能是空数组）
- 如果返回 500 错误，检查数据库连接和迁移

### 3. 验证前端连接
打开 Vercel 部署的网站：
- 尝试注册一个新用户
- 如果注册成功，说明前后端连通正常
- 如果报 CORS 错误，检查 `AllowedOrigins` 配置

### 4. 验证登录状态
- 注册/登录后刷新页面
- 如果保持登录状态，说明 cookie 跨域正常工作

---

## 常见问题排查

### 问题：前端报 CORS 错误
**检查**：
1. Render 上的 `AllowedOrigins` 是否正确设置
2. 域名是否完全匹配（包括 https://）
3. 查看 Render 日志中的 `[CORS]` 输出

### 问题：注册/登录后刷新就退出登录
**原因**：跨域 cookie 没有正确设置
**检查**：
1. 后端是否在 HTTPS 下运行（Render 免费版支持 HTTPS）
2. ForwardedHeaders 是否正确配置（已修复）
3. 浏览器控制台 → Application → Cookies 中是否有 `UserId` cookie

### 问题：所有 API 都返回 500
**原因**：数据库表不存在
**检查**：
1. 查看 Render 日志中是否有迁移相关错误
2. 确认 `AutoMigrate` 没有被设为 `false`
3. 确认 PostgreSQL 连接字符串正确

### 问题：前端页面空白
**检查**：
1. 浏览器控制台是否有 JS 错误
2. `VITE_API_ROOT` 是否正确设置
3. 重新部署 Vercel（环境变量修改后需要重新部署才生效）

---

## 本地开发

```bash
# 后端
cd backend
dotnet run

# 前端
cd frontend
npm install
npm run dev
```

本地开发时：
- 后端运行在 `http://localhost:5000`
- 前端运行在 `http://localhost:5173`
- CORS 自动允许 localhost 来源
