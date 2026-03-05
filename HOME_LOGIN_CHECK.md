# 首页登录验证说明

## 问题说明

之前访问 `http://localhost:3000/` 时，首页会直接显示，不会跳转到登录页面。

这是因为首页是独立的 HTML 页面（使用普通的 JavaScript/TypeScript），不是 Phaser 场景，所以不会触发 Phaser 的登录验证机制。

## 解决方案

在首页初始化时（`init()` 函数中）添加登录状态检查，如果用户未登录，则自动加载 Phaser 游戏引擎并进入登录场景。

## 实现细节

### 修改的文件

`src/pages/home/home.ts`

### 添加的函数

#### 1. `checkLoginStatus()` - 检查登录状态

```typescript
function checkLoginStatus(): void {
  console.log('[首页] 检查登录状态...');

  try {
    // 检查 localStorage 中是否有当前用户
    const currentUserData = localStorage.getItem('currentUser');

    if (!currentUserData) {
      console.log('[首页] 用户未登录，准备加载登录场景');

      // 未登录，隐藏首页内容
      document.body.classList.add('in-game');

      // 创建并加载游戏脚本（会自动进入登录场景）
      const gameScript = document.createElement('script');
      gameScript.type = 'module';
      gameScript.src = '/src/main.ts';

      gameScript.onload = () => {
        console.log('✓ 登录场景脚本加载成功');
      };

      gameScript.onerror = (error) => {
        console.error('❌ 登录场景脚本加载失败:', error);
      };

      document.body.appendChild(gameScript);
      return;
    }

    // 已登录，更新首页用户信息
    const user = JSON.parse(currentUserData);
    console.log('[首页] 用户已登录:', user.username);

    // 更新首页用户信息
    updateUserInterface(user);

  } catch (error) {
    console.error('[首页] 检查登录状态失败:', error);
    // 出错时也加载登录场景
    document.body.classList.add('in-game');
    loadGameScript('');
  }
}
```

#### 2. `updateUserInterface(user)` - 更新首页用户界面

```typescript
function updateUserInterface(user: any): void {
  // 更新用户头像
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar) {
    userAvatar.textContent = user.avatar || '🐱';
  }

  // 更新用户名
  const username = document.getElementById('username');
  if (username) {
    username.textContent = user.username || '小玩家';
  }

  // 更新用户点数
  const userPoints = document.getElementById('userPoints');
  if (userPoints) {
    userPoints.textContent = (user.points || 0).toString();
  }

  console.log('[首页] 用户界面已更新');
}
```

### 修改的函数

#### `init()` - 首页初始化函数

在 `init()` 函数的开头添加了登录检查：

```typescript
function init(): void {
  console.log('首页初始化...');

  // ✅ 检查登录状态
  checkLoginStatus();

  // 检查是否有游戏参数
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('game');

  // ... 其他初始化逻辑
}
```

## 工作流程

### 首次访问（未登录）

1. 用户访问 `http://localhost:3000/`
2. 首页 HTML 加载
3. `init()` 函数被调用
4. `checkLoginStatus()` 检查 `localStorage.getItem('currentUser')`
5. 发现未登录
6. 隐藏首页内容（添加 `in-game` 类）
7. 加载 Phaser 游戏脚本 `/src/main.ts`
8. Phaser 初始化，自动启动 `LoginScene` 登录场景
9. 用户输入昵称登录
10. 登录成功后，跳转到 `MenuScene`

### 再次访问（已登录）

1. 用户访问 `http://localhost:3000/`
2. 首页 HTML 加载
3. `init()` 函数被调用
4. `checkLoginStatus()` 检查 `localStorage.getItem('currentUser')`
5. 发现已登录（有用户数据）
6. 调用 `updateUserInterface()` 更新首页显示的用户信息
7. 首页正常显示

### 从首页进入游戏

1. 用户点击游戏卡片
2. 检查登录状态（已在首页检查过）
3. 加载 Phaser 游戏脚本
4. 进入对应的游戏场景
5. 游戏场景内部也会再次验证登录状态（双重保护）

## 测试方法

### 测试1：首次访问（未登录）

```bash
# 清除浏览器 localStorage
localStorage.removeItem('currentUser');
localStorage.removeItem('onlineUsers');

# 刷新页面
location.reload();
```

**预期结果**：
- 首页隐藏
- 自动进入登录场景
- 可以输入昵称登录

### 测试2：已登录访问

```bash
# 先登录
# 然后刷新页面
location.reload();
```

**预期结果**：
- 首页正常显示
- 用户信息正确显示（头像、昵称、点数）
- 可以直接点击游戏进入

### 测试3：点击游戏返回首页

1. 在登录场景中点击"← 返回首页"按钮
2. 应该会返回到首页

**预期结果**：
- 返回 `http://localhost:3000/`
- 首页显示（如果已登录）
- 或再次进入登录场景（如果未登录）

## 数据流程

### 登录数据存储

```typescript
// 登录成功后，数据保存在 localStorage
localStorage.setItem('currentUser', JSON.stringify({
  id: 'user_xxx',
  username: '小明',
  avatar: '🐱',
  status: 'online',
  points: 50
}));
```

### 首页读取数据

```typescript
// 首页初始化时读取
const currentUserData = localStorage.getItem('currentUser');
if (currentUserData) {
  const user = JSON.parse(currentUserData);
  // 更新界面显示
}
```

## 注意事项

1. **登录状态持久化**：登录信息保存在 `localStorage` 中，刷新页面不会丢失
2. **双重验证**：首页和游戏场景都会验证登录状态
3. **错误处理**：如果 localStorage 读取失败，会自动进入登录场景
4. **性能考虑**：首页检查登录状态是同步的，不会影响页面加载速度

## 相关文件

- `src/pages/home/home.ts` - 首页逻辑（已修改）
- `src/scenes/login.scene.ts` - 登录场景
- `src/services/user.service.ts` - 用户服务
- `src/utils/auth.util.ts` - 认证工具
- `src/main.ts` - Phaser 主入口

## 可能的问题和解决

### 问题1：首页闪烁

**现象**：进入登录场景前看到首页短暂闪烁

**解决**：已在 `checkLoginStatus()` 中添加 `document.body.classList.add('in-game')` 立即隐藏首页

### 问题2：用户信息不更新

**现象**：登录后首页用户信息没有更新

**解决**：检查 `updateUserInterface()` 函数中的 DOM 元素 ID 是否正确

### 问题3：无法返回首页

**现象**：登录场景的返回按钮不工作

**解决**：登录场景的返回按钮会调用 `window.location.href = '/'`，应该能正常返回首页
