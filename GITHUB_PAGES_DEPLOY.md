# GitHub Pages 部署配置

## 部署步骤

### 1. 修改基础路径（已完成）
- `vite.config.ts` 中已配置 `base: '/kids-game-platform/'`
- 这个路径会自动应用到 GitHub Pages 部署

### 2. GitHub Actions 工作流（已创建）
- 文件位置：`.github/workflows/deploy.yml`
- 触发条件：
  - 推送到 `main` 分支
  - Pull Request 到 `main` 分支
  - 手动触发

### 3. 配置 GitHub 仓库设置

#### 方法 1：通过 GitHub Web 界面配置（推荐）
1. 进入 GitHub 仓库页面
2. 点击 **Settings** → **Pages**
3. 在 **Source** 下选择：
   - **Build and deployment** → **GitHub Actions**
4. 保存设置

#### 方法 2：通过 GitHub CLI 配置
```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github.v3+json" \
  /repos/YOUR_USERNAME/kids-game-platform/pages \
  -f build_type="workflow_dispatch"
```

### 4. 推送代码触发部署

```bash
git add .
git commit -m "添加 GitHub Actions 部署配置"
git push origin main
```

推送后，GitHub Actions 会自动执行构建和部署流程。

### 5. 访问部署后的网站

部署成功后，你的网站将在以下地址可访问：

```
https://YOUR_USERNAME.github.io/kids-game-platform/
```

将 `YOUR_USERNAME` 替换为你的 GitHub 用户名。

## 自定义域名（可选）

如果你想使用自定义域名：

1. 在 **Settings** → **Pages** 中配置自定义域名
2. 在项目根目录创建 `public/CNAME` 文件，内容为你的域名

## 环境变量配置

如果需要配置环境变量，在仓库的 **Settings** → **Secrets and variables** → **Actions** → **Variables** 中添加：

- `VITE_BASE_PATH`: `/kids-game/`（已在工作流中设置）

## 调试部署问题

### 查看部署日志
1. 进入仓库的 **Actions** 标签
2. 查看最近的 workflow 运行记录
3. 点击具体的运行查看详细日志

### 常见问题

**问题 1：构建失败**
- 检查 `npm run build` 命令在本地是否能正常执行
- 查看构建日志中的错误信息

**问题 2：部署后 404 错误**
- 确认 `vite.config.ts` 中的 `base` 路径正确
- 确认 GitHub Pages 设置中选择了 GitHub Actions 作为构建源

**问题 3：资源加载失败**
- 检查 `index.html` 中的资源路径是否使用了相对路径
- 确保所有静态资源都在正确的目录中

## 本地预览生产构建

在部署前，你可以本地预览生产构建：

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

这会在本地启动一个服务器，模拟生产环境的效果。

## 工作流说明

`.github/workflows/deploy.yml` 包含两个作业：

1. **Build 作业**：
   - 检出代码
   - 安装依赖（使用 `npm ci` 以确保一致性）
   - 构建项目
   - 上传构建产物

2. **Deploy 作业**：
   - 部署到 GitHub Pages
   - 生成可访问的 URL

## 注意事项

- 首次部署可能需要几分钟时间
- 每次推送到 `main` 分支都会触发自动部署
- 如果需要手动触发部署，可以在 Actions 页面点击 "Run workflow" 按钮
