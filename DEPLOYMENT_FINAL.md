# GitHub Pages 部署完整指南

## 已完成的优化

### 1. Vite 配置优化
- ✅ 正确设置生产环境 `base: '/kids-game-platform/'`
- ✅ 移除了 `game.html` 输入（只保留 `index.html`）
- ✅ 配置了代码分割（Phaser 独立 chunk）
- ✅ 启用了 `copyPublicDir` 以复制 public 目录文件
- ✅ 优化了输出文件命名

### 2. 构建优化
- ✅ 将内联 CSS 提取到 `src/index-styles.css`
- ✅ 确保所有资源路径正确
- ✅ 生成的文件使用带 hash 的命名，避免缓存问题

### 3. GitHub Pages 配置
- ✅ 创建了 `404.html` 用于 SPA 路由重定向
- ✅ 创建了 `.nojekyll` 文件防止 Jekyll 处理
- ✅ 更新了 GitHub Actions 工作流
- ✅ 配置了正确的权限和并发控制

### 4. 代码优化
- ✅ 优化了 `index.html` 中的脚本引用
- ✅ 修改了 `main.ts` 以支持登录检查和首页模块动态加载
- ✅ 移除了硬编码的 `/src/` 路径

## 部署步骤

### 1. 确保代码已提交
```bash
git add .
git commit -m "优化 GitHub Pages 部署配置"
git push origin main
```

### 2. 验证 GitHub Actions 运行
1. 访问 GitHub 仓库的 Actions 页面
2. 等待 workflow 运行完成
3. 检查 Build 和 Deploy 作业是否成功

### 3. 配置 GitHub Pages（如果还没配置）

#### 方法 1: 通过 Web 界面
1. 进入仓库 → Settings → Pages
2. 在 **Build and deployment** 下选择 **Source**: GitHub Actions
3. 保存

#### 方法 2: 使用 GitHub CLI
```bash
gh api --method PUT \
  -H "Accept: application/vnd.github.v3+json" \
  /repos/YOUR_USERNAME/kids-game-platform/pages \
  -f build_type="workflow_dispatch"
```

### 4. 访问部署的网站
```
https://YOUR_USERNAME.github.io/kids-game-platform/
```

## 本地测试构建

### 1. 构建项目
```bash
npm run build
```

### 2. 预览构建（使用 http-server）
```bash
npx http-server dist -p 8080 -c-1
```
访问: `http://localhost:8080/`

**注意**: http-server 不支持 `/kids-game-platform/` 路径测试，需要配置 Nginx 或使用 Vercel 等平台测试完整路径。

### 3. 检查构建产物
```bash
ls -la dist/
```

应该包含:
- `index.html`
- `404.html`
- `.nojekyll`
- `assets/` 目录（包含所有 JS 和 CSS 文件）

## 测试清单

### 基础功能
- [ ] 页面正常加载，无空白
- [ ] 浏览器控制台无错误
- [ ] 所有 JS 文件加载成功（检查 Network 面板）
- [ ] 所有 CSS 文件加载成功
- [ ] Phaser.js 加载成功（约 1.4MB）

### 路由和导航
- [ ] 首页: `https://YOUR_USERNAME.github.io/kids-game-platform/`
- [ ] 游戏链接: `https://YOUR_USERNAME.github.io/kids-game-platform/?game=color-game`
- [ ] 刷新页面不出现 404
- [ ] 返回首页按钮工作正常

### 用户功能
- [ ] 未登录时显示登录界面
- [ ] 登录后显示首页内容
- [ ] localStorage 数据正确保存
- [ ] 用户信息正确显示

### 游戏功能
- [ ] 点击游戏卡片可以进入游戏
- [ ] 游戏加载无错误
- [ ] 游戏交互正常
- [ ] 可以返回首页

## 常见问题解决

### 问题 1: 页面加载后控制台报错 "Failed to fetch imported module"

**检查**:
1. 打开浏览器开发者工具（F12）
2. 查看 Network 面板
3. 查找红色的（失败的）请求

**解决**:
- 确认所有资源路径都以 `/kids-game-platform/` 开头
- 检查 `vite.config.ts` 中的 `base` 配置
- 重新构建并部署

### 问题 2: 页面空白，没有任何内容

**可能原因**:
1. JavaScript 加载失败
2. CSS 加载失败
3. 游戏容器被隐藏

**解决**:
- 检查控制台错误
- 确认所有资源加载状态
- 检查 `body.in-game` 类是否被错误添加

### 问题 3: Phaser 游戏无法加载

**检查**:
- Network 面板中 `phaser-*.js` 文件是否加载成功
- 文件大小应该是约 1.4MB

**解决**:
- 等待 Phaser 完全加载（可能需要几秒钟）
- 检查网络连接
- 考虑使用 CDN 加载 Phaser

### 问题 4: 刷新页面后 404

**原因**: GitHub Pages 默认不处理 SPA 路由

**解决**:
- 确认已上传 `404.html`
- 检查 `404.html` 中的重定向逻辑
- 确保 GitHub Pages 设置使用 GitHub Actions

### 问题 5: 样式错乱或未加载

**检查**:
- Network 面板中 CSS 文件是否加载成功
- 检查 `dist/assets/` 目录下的 CSS 文件

**解决**:
- 确认 `index-styles.css` 被正确引入
- 重新构建项目
- 清除浏览器缓存后重试

## 性能优化建议

### 1. 减少首次加载时间
- 使用 CDN 加载 Phaser（目前约 1.4MB）
- 启用代码分割，按需加载游戏模块
- 压缩图片和资源

### 2. 优化缓存策略
- Vite 已经为所有文件添加了 hash
- 可以在 GitHub Pages 中设置缓存头
- 使用 Service Worker 离线缓存

### 3. 代码分割优化
当前配置:
```js
manualChunks: {
  phaser: ['phaser'],
  vendor: ['js-cookie'],
}
```

可以考虑进一步分割:
```js
manualChunks: {
  phaser: ['phaser'],
  vendor: ['js-cookie'],
  'game-core': ['./src/core'],
  'game-scenes': ['./src/scenes'],
}
```

## 监控和调试

### 查看部署日志
1. GitHub 仓库 → Actions 标签
2. 点击最近的 workflow 运行
3. 展开 Build 和 Deploy 作业查看详细日志

### 本地调试
```bash
# 构建生产版本
npm run build

# 查看生成的 HTML
cat dist/index.html

# 检查资源文件
ls -la dist/assets/
```

### 浏览器调试
- F12 打开开发者工具
- Console: 查看错误和日志
- Network: 检查资源加载
- Application: 查看 localStorage 数据
- Performance: 分析性能

## 成功部署的标志

✅ GitHub Actions 运行成功（绿色勾号）
✅ 可以访问 `https://YOUR_USERNAME.github.io/kids-game-platform/`
✅ 页面加载无控制台错误
✅ 所有资源加载成功（200 状态码）
✅ 登录功能正常工作
✅ 游戏可以正常启动和运行
✅ 刷新页面不会出现 404

## 更新部署

每次修改代码后，只需推送到 main 分支即可自动触发部署:

```bash
git add .
git commit -m "描述你的更改"
git push origin main
```

GitHub Actions 会自动构建和部署新版本。

## 回滚部署

如果新版本有问题，可以:
1. 回退代码到之前的 commit
2. 推送到 main 分支触发重新部署
3. 或者在 GitHub Pages 设置中禁用 GitHub Actions，手动上传之前的版本
