# GitHub Pages 设置指南

## 问题分析

### 症状
访问 `https://dingpeiqiang.github.io/kids-game-platform/` 或 `https://dingpeiqiang.github.io/?game=puzzle-2` 都返回 404。

### 可能的原因

1. **GitHub Pages Source 设置不正确**
2. **GitHub Actions 部署失败或未运行**
3. **仓库名与部署路径不匹配**

## 诊断步骤

### 步骤 1：检查 GitHub Pages 设置

1. 访问：https://github.com/dingpeiqiang/kids-game-platform/settings/pages

2. 查看当前设置：
   ```
   Build and deployment
   Source: _________________
   ```

   **正确的设置应该是：**
   ```
   Source: GitHub Actions
   ```

   **如果显示的是：**
   ```
   Source: Deploy from a branch
   Branch: gh-pages / (root)
   ```

   需要更改为 "GitHub Actions"

### 步骤 2：检查 GitHub Actions 是否运行

1. 访问：https://github.com/dingpeiqiang/kids-game-platform/actions

2. 查看最近的 workflow 运行记录：
   - 是否有 "Deploy to GitHub Pages" 工作流
   - 是否成功完成（绿色勾号）
   - 是否有错误信息

### 步骤 3：检查部署状态

在 Actions 页面中，点击最新的工作流运行，查看：

**Build 作业：**
```
✓ Checkout
✓ Setup Node.js
✓ Install dependencies
✓ Build project
✓ Copy 404.html
✓ Create .nojekyll
✓ Upload artifact
```

**Deploy 作业：**
```
✓ Deploy to GitHub Pages
```

### 步骤 4：验证部署文件

在工作流日志的末尾，应该看到：
```
Pages deployment url: https://dingpeiqiang.github.io/kids-game-platform/
```

## 解决方案

### 方案 1：更改 GitHub Pages 设置为 GitHub Actions（推荐）

#### 步骤：
1. 访问：https://github.com/dingpeiqiang/kids-game-platform/settings/pages
2. 在 "Build and deployment" 下，找到 "Source"
3. 将 "Source" 从 "Deploy from a branch" 更改为 "GitHub Actions"
4. 点击保存

#### 为什么选择 GitHub Actions？
- 自动化部署流程
- 更灵活的配置
- 支持环境变量和 secrets
- 更好的错误日志

### 方案 2：如果 Source 已经是 GitHub Actions，重新触发部署

#### 步骤：
1. 访问：https://github.com/dingpeiqiang/kids-game-platform/actions
2. 找到 "Deploy to GitHub Pages" 工作流
3. 点击右侧的 "Run workflow" 按钮
4. 点击绿色的 "Run workflow" 按钮

### 方案 3：使用 gh-pages 分支手动部署

如果 GitHub Actions 无法使用，可以使用传统方法：

#### 步骤 1：安装 gh-pages 工具
```bash
npm install -g gh-pages
```

#### 步骤 2：构建项目
```bash
npm run build
```

#### 步骤 3：手动部署到 gh-pages 分支
```bash
cd dist
gh-pages -d . -b gh-pages
cd ..
```

#### 步骤 4：推送 gh-pages 分支
```bash
git push origin gh-pages
```

#### 步骤 5：配置 GitHub Pages
1. 访问：https://github.com/dingpeiqiang/kids-game-platform/settings/pages
2. 设置 Source 为：Deploy from a branch
3. 设置 Branch 为：gh-pages / (root)
4. 保存

## URL 访问路径说明

### 正确的访问路径

**首页：**
```
https://dingpeiqiang.github.io/kids-game-platform/
```

**带游戏参数：**
```
https://dingpeiqiang.github.io/kids-game-platform/?game=puzzle-2
https://dingpeiqiang.github.io/kids-game-platform/?game=color-game
```

**直接访问文件：**
```
https://dingpeiqiang.github.io/kids-game-platform/index.html
https://dingpeiqiang.github.io/kids-game-platform/404.html
```

**错误的路径（会导致 404）：**
```
https://dingpeiqiang.github.io/                          ❌
https://dingpeiqiang.github.io/?game=puzzle-2            ❌
https://dingpeiqiang.github.io/kids-game/                ❌
```

### URL 路径规则

GitHub Pages 的 URL 格式为：
```
https://[用户名].github.io/[仓库名]/[路径]
```

- 用户名：dingpeiqiang
- 仓库名：kids-game-platform
- 路径：index.html 或 ?game=xxx

## 验证部署成功

### 检查清单

- [ ] 访问 https://dingpeiqiang.github.io/kids-game-platform/ 可以看到页面
- [ ] 浏览器控制台（F12）没有错误
- [ ] Network 面板所有文件返回 200
- [ ] 页面样式正常显示
- [ ] 未登录时显示登录界面
- [ ] 登录后可以进入游戏

### 测试脚本

在浏览器控制台运行以下命令：

```javascript
// 检查页面是否加载
console.log('页面标题:', document.title);
console.log('页面路径:', window.location.pathname);

// 检查脚本是否加载
console.log('main.js:', performance.getEntriesByType('resource')
  .find(r => r.name.includes('main-'))?.responseStatus);

// 检查 localStorage
console.log('用户数据:', localStorage.getItem('currentUser'));
```

## 常见问题

### Q1: GitHub Actions 运行成功，但访问还是 404

**可能原因：**
1. GitHub Pages 设置不正确
2. 部署还在进行中（需要等待 2-5 分钟）
3. 浏览器缓存

**解决方法：**
1. 检查 Settings → Pages → Source 是否为 "GitHub Actions"
2. 等待 5 分钟后刷新页面
3. 清除浏览器缓存或使用隐私模式

### Q2: Source 无法更改为 GitHub Actions

**原因：** GitHub 可能没有完全迁移到新的部署系统

**解决方法：** 使用方案 3（gh-pages 分支）

### Q3: 部署后样式错乱

**原因：** CSS 文件路径不正确

**检查：**
```javascript
// 在控制台检查 CSS 是否加载
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('.css'))
  .forEach(r => console.log(r.name, r.responseStatus));
```

**解决：**
确保 `dist/assets/main-*.css` 文件存在且可访问

### Q4: Phaser 游戏无法启动

**检查：**
1. 控制台是否有 "Phaser is not defined" 错误
2. Phaser 文件是否加载（应该约 1.4MB）

**解决：**
在 `index.html` 中添加 CDN：
```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
```

## 监控部署状态

### 查看 GitHub Pages 部署历史

访问：https://github.com/dingpeiqiang/kids-game-platform/settings/pages

在页面底部可以看到：
- 最近的部署记录
- 每次部署的 commit
- 部署时间和状态

### 查看 GitHub Pages 日志

在 Actions 页面中，可以查看详细的构建和部署日志。

## 最佳实践

### 1. 推送前本地测试
```bash
npm run build
npx http-server dist -p 8080
```

### 2. 使用有意义的 commit 消息
```bash
git commit -m "feat: 添加颜色配对游戏"
git commit -m "fix: 修复登录功能"
git commit -m "docs: 更新部署文档"
```

### 3. 监控部署状态
- 每次推送后检查 Actions 是否成功
- 定期检查网站是否正常运行

### 4. 备份重要配置
- 截图保存 GitHub Pages 设置
- 记录重要的环境变量

## 紧急恢复

如果部署后出现问题：

### 回滚到上一个版本
```bash
git log --oneline
git checkout [上一个commit的hash]
git push -f origin main
```

### 使用 gh-pages 分支恢复
```bash
git checkout gh-pages
git reset --hard [上一个稳定的commit]
git push -f origin gh-pages
```

## 联系与支持

如果问题仍然无法解决，请提供：
1. GitHub Actions 的完整构建日志
2. 浏览器控制台的错误信息
3. GitHub Pages 设置的截图
4. 具体的访问 URL 和返回的错误

## 附录：文件结构

### 部署后的文件结构
```
gh-pages 分支或 GitHub Pages:
├── .nojekyll
├── 404.html
├── index.html
└── assets/
    ├── main-*.js
    ├── main-*.css
    ├── phaser-*.js (可能为空)
    └── vendor-*.js (可能为空)
```

### 源码分支结构
```
main 分支:
├── src/
├── public/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── 404.html
├── index.html
├── vite.config.ts
└── package.json
```
