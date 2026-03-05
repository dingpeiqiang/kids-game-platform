# 登录验证快速参考

## 系统架构

登录验证系统包含两个层面：

1. **首页层面**（HTML/JS）
   - 首页加载时检查 `localStorage`
   - 未登录则加载 Phaser 进入登录场景
   - 已登录则更新首页用户信息

2. **游戏层面**（Phaser）
   - 所有游戏场景启动时验证登录状态
   - 使用 `AuthUtil.checkLoginStatus()` 统一验证

## 验证流程图

```
用户访问首页 (http://localhost:3000/)
    ↓
首页 HTML 加载
    ↓
首页 init() 函数执行
    ↓
checkLoginStatus() 检查 localStorage
    ↓
    ├─ 未登录 → 隐藏首页 → 加载 Phaser → 进入 LoginScene
    │
    └─ 已登录 → 更新用户信息 → 显示首页
            ↓
        用户点击游戏
            ↓
        加载 Phaser
            ↓
        游戏场景检查登录状态（AuthUtil）
            ↓
        进入游戏
```

## 快速开始

### 1. 在新场景中添加登录验证

```typescript
import { BaseScene } from '@/core/scene.base';
import { AuthUtil } from '@/utils/auth.util';

export class MyScene extends BaseScene {
  constructor() {
    super('MyScene');
  }

  public create(): void {
    // ✅ 步骤1：验证登录状态
    if (!AuthUtil.checkLoginStatus(this)) {
      return; // 未登录，会自动跳转到登录场景
    }

    // ✅ 步骤2：创建场景UI
    this.createUI();
  }
}
```

### 2. 获取当前用户信息

```typescript
import { AuthUtil } from '@/utils/auth.util';

// 在任意场景或组件中
const user = AuthUtil.getCurrentUser();

if (user) {
  console.log('当前用户:', user.username);
  console.log('用户头像:', user.avatar);
  console.log('用户点数:', user.points);
}
```

### 3. 用户登出

```typescript
import { AuthUtil } from '@/utils/auth.util';

// 登出并清除登录状态
AuthUtil.logout();
// 系统会自动跳转到登录场景
```

## 已添加验证的场景

以下场景已添加登录验证，未登录时会自动跳转：

| 场景 | 文件路径 |
|------|----------|
| 登录场景 | `src/scenes/login.scene.ts` |
| 主菜单 | `src/ui/menu.scene.ts` |
| 模式选择 | `src/core/battle-select.scene.ts` |
| 对战申请 | `src/scenes/battle-request.scene.ts` |
| 颜色游戏 | `src/games/color-game/scenes/game.scene.ts` |
| 形状游戏 | `src/games/shape-game/scenes/game.scene.ts` |
| 数字游戏 | `src/games/demo-game/scenes/game.scene.ts` |

## 验证时机

### 场景启动时验证（推荐）
在 `create()` 方法开始时验证：

```typescript
public create(): void {
  if (!AuthUtil.checkLoginStatus(this)) {
    return;
  }
  // 场景创建逻辑...
}
```

### 用户操作时验证（可选）
在某些关键操作前再次验证：

```typescript
private handleCriticalAction(): void {
  // 再次验证，防止用户在游戏过程中登出
  if (!AuthUtil.checkLoginStatus(this)) {
    return;
  }
  // 执行关键操作...
}
```

## 登录状态持久化

### 自动保存
- 登录后自动保存到 `localStorage.currentUser`
- 在线用户列表保存到 `localStorage.onlineUsers`

### 清除登录状态
```typescript
// 方式1：使用 AuthUtil（推荐）
AuthUtil.logout();

// 方式2：直接操作服务
import { userService } from '@/services/user.service';
userService.logout();

// 方式3：清除 localStorage
localStorage.removeItem('currentUser');
localStorage.removeItem('onlineUsers');
```

## 常见问题

### Q: 为什么我的场景没有显示？
A: 检查是否添加了登录验证。如果没有登录，系统会自动跳转到登录场景。

### Q: 如何测试未登录的情况？
A: 打开浏览器开发者工具，在 Console 中执行：
```javascript
localStorage.removeItem('currentUser');
location.reload();
```

### Q: 结果场景需要验证吗？
A: 通常不需要，因为结果场景是由已验证的游戏场景启动的。

### Q: 如何在游戏中显示用户信息？
A: 使用 `AuthUtil.getCurrentUser()` 获取用户信息：

```typescript
const user = AuthUtil.getCurrentUser();
if (user) {
  this.add.text(x, y, `玩家: ${user.username}`, { ... });
}
```

## 安全建议

1. **双重验证**：在场景创建和关键操作时都进行验证
2. **不要在客户端存储敏感信息**：当前实现使用 localStorage，仅适用于演示
3. **定期检查**：在长时间运行的游戏中定期验证登录状态
4. **优雅处理**：未登录时提供友好的提示

## 示例：完整的游戏场景

```typescript
import { BaseScene } from '@/core/scene.base';
import { AuthUtil } from '@/utils/auth.util';
import { LogUtil } from '@/utils/log.util';

export class GameScene extends BaseScene {
  constructor() {
    super('GameScene');
  }

  public create(): void {
    LogUtil.log('GameScene: 创建场景');

    // 1. 验证登录状态
    if (!AuthUtil.checkLoginStatus(this)) {
      return;
    }

    // 2. 获取当前用户
    const user = AuthUtil.getCurrentUser();
    if (user) {
      this.createUserInfo(user);
    }

    // 3. 创建游戏UI
    this.createGameUI();

    // 4. 开始游戏
    this.startGame();
  }

  private createUserInfo(user: any): void {
    const padding = 20;
    this.add.text(padding, padding, `${user.avatar} ${user.username}`, {
      font: 'bold 24px Arial',
      color: '#333333',
    });
  }

  private createGameUI(): void {
    // 游戏UI创建逻辑...
  }

  private startGame(): void {
    // 游戏开始逻辑...
  }
}
```

## 相关文档

- [对战系统完整说明](./BATTLE_SYSTEM_README.md)
- [用户服务API](./src/services/user.service.ts)
- [认证工具API](./src/utils/auth.util.ts)
