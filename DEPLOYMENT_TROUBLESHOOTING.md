# GitHub Pages 部署问题诊断与修复指南

## 当前状态

### 已修复的问题
✅ 修复了 index.html 中的无效脚本引用（/src/main.ts）
✅ 更新了所有配置文件的路径（/kids-game-platform/）
✅ 修复了 post-build.js 脚本，确保 404.html 和 .nojekyll 被复制

### 发现的问题
⚠️ main.js 只有 43.89 KB，疑似未包含 Phaser
⚠️ Phaser 和 vendor chunks 是空的（只有 1B）

## 详细诊断步骤

### 1. 检查 GitHub Actions 部署状态

访问以下链接查看部署状态：
```
https://github.com/dingpeiqiang/kids-game-platform/actions
```

**检查项：**
- [ ] Build 作业是否成功（绿色勾号）
- [ ] Deploy 作业是否成功（绿色勾号）
- [ ] 查看构建日志是否有错误

### 2. 检查构建产物

在 GitHub Actions 的 Build 作业日志中，查找：
```
[Post-Build] 构建产物目录:
📄 .nojekyll (0 B)
📄 404.html (1.02 KB)
📁 assets/
  📄 main-*.js
  📄 main-*.css
  📄 phaser-*.js
  📄 vendor-*.js
📄 index.html
```

**关键检查：**
- ✅ .nojekyll 文件存在
- ✅ 404.html 文件存在
- ✅ index.html 存在
- ✅ assets 目录包含所有必需的文件

### 3. 检查 GitHub Pages 设置

访问仓库的 Pages 设置：
```
https://github.com/dingpeiqiang/kids-game-platform/settings/pages
```

**正确的配置：**
- Source: GitHub Actions
- Branch: (应该显示 github-pages)

### 4. 检查实际部署的文件

使用 GitHub CLI 或浏览器检查：

**方法 1：使用 GitHub CLI**
```bash
# 检查部署的文件
gh api repos/dingpeiqiang/kids-game-platform/pages
```

**方法 2：直接访问文件**
```
https://dingpeiqiang.github.io/kids-game-platform/
https://dingpeiqiang.github.io/kids-game-platform/index.html
https://dingpeiqiang.github.io/kids-game-platform/.nojekyll
```

**预期结果：**
- `index.html` - 应该显示 HTML 内容（不是 404）
- `.nojekyll` - 应该是空文件或显示 "Not Found"（正常）
- `/assets/main-*.js` - 应该下载文件（不是 404）

## 常见问题与解决方案

### 问题 1：页面空白，控制台报错 "Failed to fetch imported module"

**原因：** 资源文件路径不正确或文件不存在

**解决步骤：**
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 面板
3. 刷新页面
4. 查找红色（失败）的请求

**检查以下文件：**
- ✅ `/kids-game-platform/assets/main-*.js` - 应该返回 200
- ✅ `/kids-game-platform/assets/main-*.css` - 应该返回 200

**如果文件返回 404：**
1. 检查 GitHub Actions 部署是否成功
2. 确认 dist 目录中的文件结构
3. 重新构建和部署

### 问题 2：Phaser 未加载或加载失败

**症状：**
- 游戏无法启动
- 控制台报错：`Phaser is not defined`
- 控制台报错：`Failed to fetch imported module: /phaser-*.js`

**原因分析：**
1. Phaser chunk 是空的（0B 或 1B）
2. Phaser 被打包到 main.js 中，但文件太小
3. 动态导入 Phaser 失败

**诊断：**
```javascript
// 在浏览器控制台执行
console.log('Phaser:', typeof Phaser);
console.log('main.js size:', performance.getEntriesByType('resource')
  .find(r => r.name.includes('main-'))?.transferSize);
```

**解决方案：**

#### 方案 A：检查 Phaser 是否被打包到 main.js
1. 在 main.js 中搜索 "phaser" 字符串
2. 如果找到，说明 Phaser 已被打包到 main.js

#### 方案 B：确保 Phaser chunk 不为空
修改 `vite.config.ts`，调整 manualChunks 配置：

```typescript
manualChunks: {
  phaser: ['phaser'],
  vendor: ['js-cookie'],
}
```

如果上述配置无效，尝试强制将所有 Phaser 相关代码打包到 phaser chunk：

```typescript
manualChunks: {
  phaser: (id) => {
    if (id.includes('phaser')) {
      return 'phaser';
    }
  },
  vendor: ['js-cookie'],
}
```

#### 方案 C：使用 CDN 加载 Phaser（推荐）

在 `index.html` 中添加 CDN 引用：

```html
<!-- 在 head 中添加 -->
<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
```

然后在 `vite.config.ts` 中配置 external：

```typescript
build: {
  rollupOptions: {
    external: ['phaser'],
  },
}
```

**优点：**
- 减小构建产物大小
- 利用 CDN 缓存
- 加快首次加载速度

### 问题 3：登录功能不正常

**症状：**
- 页面一直显示加载动画
- 点击登录按钮无反应
- 登录后无法显示首页

**诊断步骤：**

1. 检查 localStorage：
```javascript
// 在浏览器控制台执行
console.log('currentUser:', localStorage.getItem('currentUser'));
```

2. 检查控制台日志：
```javascript
// 应该看到以下日志
[登录检查] 页面开始加载
[登录检查] localStorage中的currentUser: ...
[登录检查] 等待主脚本处理登录流程
[Main] ========== main.ts 开始加载 ==========
```

3. 检查 network 请求：
- `/kids-game-platform/assets/main-*.js` - 200 OK
- `/kids-game-platform/assets/main-*.css` - 200 OK

**解决方案：**

#### 清除 localStorage
```javascript
localStorage.clear();
location.reload();
```

#### 检查 main.js 内容
确保 main.js 包含：
- `checkLoginStatus()` 函数
- `initGame()` 函数
- 登录场景相关代码

### 问题 4：首页功能不正常（游戏卡片无法点击等）

**症状：**
- 页面显示正常，但游戏卡片无法点击
- 轮播 Banner 不工作
- 页面交互无响应

**原因：** home.ts 或 config-manager.ts 未正确加载

**诊断：**

1. 检查 main.js 是否包含首页代码：
```javascript
// 在浏览器控制台执行
fetch('/kids-game-platform/assets/main-*.js')
  .then(r => r.text())
  .then(code => {
    console.log('包含 home.ts:', code.includes('学龄选择'));
    console.log('包含 config-manager:', code.includes('configManager'));
  });
```

2. 检查控制台日志：
```javascript
// 应该看到以下日志
[Home] ========== 首页初始化开始 ==========
[Home] ✓ 学龄选择器初始化完成
[Home] ✓ 轮播 Banner 初始化完成
```

**解决方案：**

如果首页代码未被打包，检查：
1. `index.html` 中是否有 `<script type="module" src="/src/pages/home/home.ts">`
2. Vite 构建日志中是否显示警告

### 问题 5：刷新页面后 404

**原因：** 404.html 未正确配置或 GitHub Pages 路由问题

**诊断：**

1. 访问非根路径：
```
https://dingpeiqiang.github.io/kids-game-platform/?game=color-game
```

2. 刷新页面，检查是否显示 404 或重定向到首页

**解决方案：**

#### 检查 404.html 内容
确保 404.html 包含正确的重定向脚本：
```javascript
if (path !== '/kids-game-platform/' && path !== '/kids-game-platform') {
  window.location.replace('/kids-game-platform/' + search + hash);
}
```

#### 检查 .nojekyll 文件
GitHub Pages 默认使用 Jekyll 处理 `_` 开头的文件和目录。`.nojekyll` 文件可以禁用此行为。

确保构建产物包含 `.nojekyll` 文件。

#### 修改 GitHub Pages 设置
```
Settings → Pages → Source → GitHub Actions
```

## 手动部署步骤

如果 GitHub Actions 部署失败，可以手动部署：

### 1. 本地构建
```bash
cd kids-game-platform
npm run build
```

### 2. 验证构建产物
```bash
ls -la dist/
```

应该看到：
```
index.html
404.html
.nojekyll
assets/
  main-*.js
  main-*.css
  phaser-*.js
  vendor-*.js
```

### 3. 使用 gh-pages CLI 部署
```bash
# 安装 gh-pages
npm install -g gh-pages

# 部署到 gh-pages 分支
gh-pages -d dist -b gh-pages

# 推送到 GitHub
git push origin gh-pages
```

### 4. 配置 GitHub Pages
```
Settings → Pages → Source → Deploy from a branch
Branch: gh-pages
Folder: / (root)
```

## 完整的修复流程

### 步骤 1：推送到 GitHub
```bash
git add .
git commit -m "修复部署问题"
git push origin main
```

### 步骤 2：等待 GitHub Actions 完成
- 访问 Actions 页面
- 等待 Build 和 Deploy 作业完成
- 确认都是绿色勾号

### 步骤 3：测试部署
1. 访问 https://dingpeiqiang.github.io/kids-game-platform/
2. 打开浏览器开发者工具（F12）
3. 检查 Console 面板是否有错误
4. 检查 Network 面板是否所有文件加载成功

### 步骤 4：测试功能
- [ ] 未登录时显示登录界面
- [ ] 登录后显示首页
- [ ] 游戏卡片可以点击
- [ ] 游戏可以启动
- [ ] 返回首页按钮工作

### 步骤 5：如果还有问题
1. 复制控制台的错误信息
2. 复制 Network 面板的失败请求
3. 查看 GitHub Actions 的构建日志
4. 根据错误信息使用本文档的解决方案

## 调试技巧

### 1. 本地预览构建结果
```bash
npm run build
npx http-server dist -p 8080 -c-1
```

访问：http://localhost:8080

**注意：** 本地预览不能完全模拟 GitHub Pages 的路径，但可以测试基本功能。

### 2. 检查构建产物大小
```bash
du -sh dist/assets/*
```

**预期大小：**
- main-*.js: 40-50 KB（如果 Phaser 未被打包）或 1.5 MB（如果 Phaser 被打包）
- main-*.css: 25-30 KB
- phaser-*.js: 0 B（如果 Phaser 打包到 main）或 1.4 MB（如果独立）

### 3. 使用浏览器开发者工具
- **Console:** 查看错误和日志
- **Network:** 检查资源加载
- **Application:** 查看 localStorage
- **Performance:** 分析性能

### 4. 清除浏览器缓存
如果遇到缓存问题：
1. Ctrl + Shift + R (Windows) 或 Cmd + Shift + R (Mac)
2. 使用隐私/无痕模式
3. 清除浏览器缓存

## 预防措施

1. **每次推送前本地测试**
   ```bash
   npm run build
   # 检查 dist 目录
   ```

2. **使用语义化版本号**
   - 遵循 semver 规范
   - 记录重要的更改

3. **监控部署状态**
   - 定期检查 GitHub Actions
   - 查看错误日志

4. **备份重要配置**
   - GitHub Pages 设置截图
   - 记录重要的配置值

## 联系与支持

如果问题仍然无法解决：
1. 复制完整的错误信息
2. 复制 GitHub Actions 的构建日志
3. 提供浏览器控制台的截图
4. 描述复现步骤

## 附录：文件清单

### 部署必需文件
```
dist/
├── .nojekyll              # 禁用 Jekyll
├── 404.html              # SPA 路由重定向
├── index.html            # 主页面
└── assets/
    ├── main-*.js         # 主脚本
    ├── main-*.css        # 主样式
    ├── phaser-*.js       # Phaser 引擎（可能为空）
    └── vendor-*.js       # 第三方库（可能为空）
```

### 源文件清单
```
src/
├── main.ts               # 主入口
├── pages/
│   └── home/
│       ├── home.ts       # 首页逻辑
│       └── config-manager/
│           └── config-manager.ts
├── games/
│   ├── color-game/
│   ├── demo-game/
│   └── shape-game/
├── scenes/
├── core/
└── config/
```

### 配置文件清单
```
vite.config.ts            # Vite 配置
package.json              # 项目配置
tsconfig.json             # TypeScript 配置
.github/workflows/deploy.yml  # GitHub Actions 工作流
404.html                  # 404 页面
scripts/post-build.js     # 构建后处理脚本
```
