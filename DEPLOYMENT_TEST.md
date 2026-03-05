# GitHub Pages 部署测试指南

## 部署后访问地址

将 `YOUR_USERNAME` 替换为你的 GitHub 用户名：
```
https://YOUR_USERNAME.github.io/kids-game/
```

## 本地预览生产构建

### 1. 构建生产版本
```bash
npm run build
```

### 2. 使用 http-server 预览（推荐）
```bash
npx http-server dist -p 8080 -c-1
```
访问: `http://localhost:8080/`

### 3. 使用 Vite preview（不支持 base 路径测试）
```bash
npm run preview
```
注意: Vite preview 无法正确模拟 GitHub Pages 的 `/kids-game/` 基础路径

## 测试清单

### 1. 基础功能测试
- [ ] 页面加载无错误（检查浏览器控制台）
- [ ] CSS 样式正确加载
- [ ] JavaScript 模块正确加载
- [ ] Phaser 游戏引擎正确加载

### 2. 路由测试
- [ ] 首页访问: `https://YOUR_USERNAME.github.io/kids-game/`
- [ ] 直接访问 index.html: `https://YOUR_USERNAME.github.io/kids-game/index.html`
- [ ] 游戏链接: `https://YOUR_USERNAME.github.io/kids-game/?game=color-game`
- [ ] 场景链接: `https://YOUR_USERNAME.github.io/kids-game/?scene=LoginScene`

### 3. 资源加载测试
打开浏览器开发者工具（F12）检查：
- [ ] Network 面板中没有 404 错误
- [ ] 所有 JS 文件加载成功（200 状态码）
- [ ] 所有 CSS 文件加载成功
- [ ] Phaser.js 加载成功（约 1.4MB）

### 4. 功能测试
- [ ] 未登录时显示登录界面
- [ ] 登录后显示首页内容
- [ ] 点击游戏卡片可以进入游戏
- [ ] 返回首页按钮工作正常
- [ ] localStorage 数据正确保存和读取

### 5. 性能测试
- [ ] 首次加载时间 < 5秒
- [ ] 页面交互响应流畅
- [ ] 游戏运行无卡顿

## 常见问题排查

### 问题 1: 页面空白，控制台报错 "Failed to load module"

**原因**: 资源路径不正确

**解决**:
- 检查 `vite.config.ts` 中的 `base` 配置是否为 `/kids-game/`
- 重新构建项目: `npm run build`
- 检查生成的 `dist/index.html` 中的资源路径是否包含 `/kids-game/`

### 问题 2: Phaser 加载失败

**原因**: Phaser 文件过大或 CDN 问题

**解决**:
- 检查 Network 面板中 Phaser.js 的加载状态
- 确保手动 chunk 配置正确
- 考虑使用 CDN 加载 Phaser

### 问题 3: 页面刷新后 404

**原因**: SPA 路由问题

**解决**:
- 确保已上传 `404.html`
- 检查 `404.html` 中的重定向逻辑
- 使用 GitHub Pages 的自定义 404 页面

### 问题 4: 样式未加载

**原因**: CSS 路径问题或构建失败

**解决**:
- 检查 `dist/assets/` 目录下是否有 CSS 文件
- 确认 `index-styles.css` 被正确引入
- 重新构建项目

### 问题 5: localStorage 数据丢失

**原因**: 生产环境可能使用不同的子域

**解决**:
- 确保 localStorage 使用相同的域名和端口
- 考虑使用 sessionStorage 作为替代方案

## GitHub Actions 部署日志查看

1. 访问 GitHub 仓库的 Actions 页面
2. 查看最近的 workflow 运行记录
3. 检查 Build 和 Deploy 作业的日志
4. 确认部署成功（绿色勾号）

## 部署成功指标

- ✅ Actions 运行成功
- ✅ 部署 URL 可以访问
- ✅ 无控制台错误
- ✅ 所有资源加载成功
- ✅ 核心功能正常工作

## 性能优化建议

1. **代码分割**: 使用动态 import() 进一步分割代码
2. **资源预加载**: 对关键资源添加 `<link rel="preload">`
3. **CDN 加速**: 将 Phaser 等大型库通过 CDN 加载
4. **图片优化**: 压缩和延迟加载游戏图片
5. **缓存策略**: 配置正确的 HTTP 缓存头
