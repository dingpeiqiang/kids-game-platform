# 对战系统使用说明

## 功能概述

本次更新实现了完整的用户登录和双人对战功能，包括：

1. **用户登录系统** - 支持用户昵称登录和快捷登录
2. **全局登录验证** - 所有需要登录的场景都会验证用户状态
3. **在线用户管理** - 模拟在线用户列表
4. **对战申请机制** - 发起、接受、拒绝对战申请
5. **实时通知** - 对战申请的弹窗通知

## 登录验证机制

### 自动验证

系统在以下场景启动时会自动验证登录状态：

- **MenuScene**（主菜单场景）- 需要登录
- **BattleSelectScene**（模式选择场景）- 需要登录
- **BattleRequestScene**（对战申请场景）- 需要登录
- **ColorGameScene**（颜色游戏场景）- 需要登录
- **ShapeGameScene**（形状游戏场景）- 需要登录
- **DemoGameScene**（数字游戏场景）- 需要登录

如果用户未登录，系统会自动跳转到 `LoginScene` 登录场景。

### 验证工具

系统提供了 `AuthUtil` 工具类来处理登录验证：

```typescript
import { AuthUtil } from '@/utils/auth.util';

// 在场景中使用
public create(): void {
  // 验证登录状态，未登录会自动跳转到登录场景
  if (!AuthUtil.checkLoginStatus(this)) {
    return;
  }

  // 其他场景创建逻辑...
}
```

### 验证流程

1. 场景启动时调用 `AuthUtil.checkLoginStatus(this)`
2. 系统检查 `userService.getCurrentUser()`
3. 如果用户已登录，返回 `true`，场景继续创建
4. 如果用户未登录，返回 `false`，自动跳转到 `LoginScene`

### 登录状态管理

用户登录后，信息保存在 `localStorage` 中：
- `currentUser` - 当前登录用户信息
- `onlineUsers` - 在线用户列表

清除 localStorage 或点击登出会移除登录状态，下次访问时需要重新登录。

## 使用流程

### 1. 用户登录

启动游戏后，会自动进入登录场景：

- **手动输入**：在输入框中输入昵称（3-10个字符），点击"开始游戏"按钮
- **快捷登录**：点击"小玩家1号"、"小玩家2号"、"小玩家3号"快速登录

登录信息会保存在本地存储中，下次访问会自动登录。

### 2. 进入游戏

登录成功后，会自动跳转到主菜单场景。

### 3. 选择游戏和对战模式

在主菜单中选择一个游戏（例如：颜色游戏、形状游戏）：

- 点击游戏卡片进入模式选择场景
- 选择"单人模式"：直接开始游戏
- 选择"双人对战"：进入对战申请场景

### 4. 发起对战

在对战申请场景中：

1. 显示当前登录用户信息
2. 显示在线用户列表（包括状态：在线/对战中）
3. 选择一个在线用户，点击"对战"按钮发起申请

### 5. 处理对战申请

**发起方**：
- 发送申请后会显示"对战申请已发送，等待对方回复..."
- 每秒检查一次申请状态
- 对方接受后，自动进入对战游戏

**接收方**：
- 收到对战申请时，会弹出对话框
- 可以选择"接受"或"拒绝"
- 接受后，双方都会进入对战游戏

### 6. 开始对战

双方都接受后，会自动启动对应游戏的场景，并将对战信息存储到全局变量中：

```typescript
(window as any).__BATTLE_INFO__ = {
  gameId: 'color-game',  // 游戏ID
  players: [              // 玩家信息
    { id: 'xxx', username: '小明' },
    { id: 'yyy', username: '小红' }
  ]
};
```

## 文件结构

```
src/
├── scenes/
│   ├── login.scene.ts           # 登录场景
│   └── battle-request.scene.ts  # 对战申请场景
├── services/
│   └── user.service.ts          # 用户管理服务
├── utils/
│   └── auth.util.ts             # 认证工具类（新增）
├── core/
│   └── battle-select.scene.ts   # 战斗模式选择场景（已更新）
├── ui/
│   └── menu.scene.ts            # 主菜单场景（已更新）
├── games/
│   ├── color-game/scenes/
│   │   └── game.scene.ts        # 颜色游戏（已更新）
│   ├── shape-game/scenes/
│   │   └── game.scene.ts        # 形状游戏（已更新）
│   └── demo-game/scenes/
│       └── game.scene.ts        # 数字游戏（已更新）
└── main.ts                      # 主入口（已更新）
```

## 核心功能模块

### AuthUtil (认证工具类)

位置：`src/utils/auth.util.ts`

主要功能：
- 提供统一的登录状态验证接口
- 自动跳转到登录场景
- 获取当前用户信息
- 用户登出

关键方法：
```typescript
// 验证登录状态（推荐在场景的 create() 方法中使用）
AuthUtil.checkLoginStatus(scene: Phaser.Scene): boolean

// 获取当前用户
AuthUtil.getCurrentUser(): User | null

// 用户登出
AuthUtil.logout(): void

// 创建场景混入方法（可选）
const mixin = AuthUtil.createSceneMixin(scene);
mixin.checkAuth();      // 验证登录
mixin.getCurrentUser(); // 获取用户
```

### UserService (用户管理服务)

位置：`src/services/user.service.ts`

主要功能：
- 用户登录/登出
- 在线用户管理
- 对战申请的发送、接受、拒绝
- 事件通知机制

关键方法：
```typescript
// 获取单例
userService = UserService.getInstance();

// 登录
userService.login(username: string): User

// 登出
userService.logout(): void

// 获取当前用户
userService.getCurrentUser(): User | null

// 获取在线用户列表
userService.getOnlineUsers(): User[]

// 发送对战申请
userService.sendBattleRequest(targetUserId: string, gameId: string): BattleRequest

// 接受对战申请
userService.acceptBattleRequest(requestId: string): BattleRequest

// 拒绝对战申请
userService.rejectBattleRequest(requestId: string): BattleRequest

// 获取收到的申请
userService.getReceivedRequests(): BattleRequest[]

// 获取发送的申请
userService.getSentRequests(): BattleRequest[]

// 事件监听
userService.on(event: string, callback: Function): void
```

### LoginScene (登录场景)

位置：`src/scenes/login.scene.ts`

功能：
- 用户昵称输入
- 快捷登录按钮
- 登录验证
- 跳转到主菜单

### BattleRequestScene (对战申请场景)

位置：`src/scenes/battle-request.scene.ts`

功能：
- 显示当前用户信息
- 显示在线用户列表
- 发起对战申请
- 显示对战申请对话框
- 处理申请的接受/拒绝
- 开始对战游戏

## 数据结构

### User（用户信息）

```typescript
interface User {
  id: string;                      // 用户ID
  username: string;                // 用户昵称
  avatar: string;                  // 用户头像（emoji）
  status: 'online' | 'offline' | 'in-battle';  // 用户状态
  points: number;                  // 用户点数
}
```

### BattleRequest（对战申请）

```typescript
interface BattleRequest {
  id: string;                      // 申请ID
  fromUserId: string;              // 发起者用户ID
  fromUsername: string;           // 发起者用户昵称
  toUserId: string;                // 接收者用户ID
  gameId: string;                 // 游戏ID
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';  // 申请状态
  timestamp: number;              // 时间戳
}
```

## 注意事项

1. **模拟数据**：当前系统使用本地存储和模拟数据，不涉及真实的后端服务器
2. **单机多窗口测试**：要在两个不同的浏览器窗口中测试对战功能，需要使用不同的浏览器或无痕模式
3. **持久化存储**：用户登录信息和在线用户列表保存在 localStorage 中
4. **状态同步**：5秒自动刷新一次在线用户列表

## 测试对战功能的步骤

### 方式一：两个浏览器窗口

1. 在浏览器A中打开项目，使用昵称"小明"登录
2. 在浏览器B中打开项目（或使用无痕模式），使用昵称"小红"登录
3. 在浏览器A中选择游戏，选择"双人对战"模式
4. 选择"小红"发起对战
5. 在浏览器B中看到对战申请弹窗，点击"接受"
6. 两个窗口都进入游戏

### 方式二：使用模拟用户

1. 使用任意昵称登录
2. 选择游戏，选择"双人对战"模式
3. 选择模拟用户（小明、小红、小华等）发起对战
4. 由于模拟用户不会响应，申请会超时

## 后续扩展建议

1. **真实后端集成**：使用 WebSocket 实现实时通信
2. **用户匹配系统**：添加自动匹配功能
3. **房间系统**：支持多人房间和观战模式
4. **好友系统**：添加好友、黑名单功能
5. **排行榜**：添加战绩和排行榜功能
6. **聊天系统**：添加游戏内聊天功能

## 事件系统

UserService 支持以下事件：

```typescript
// 用户登录
userService.on('user:login', (user: User) => { ... })

// 用户登出
userService.on('user:logout', () => { ... })

// 用户上线
userService.on('user:online', (user: User) => { ... })

// 用户下线
userService.on('user:offline', (userId: string) => { ... })

// 收到对战申请
userService.on('battle:request', (request: BattleRequest) => { ... })

// 对战申请被接受
userService.on('battle:accepted', (request: BattleRequest) => { ... })

// 对战申请被拒绝
userService.on('battle:rejected', (request: BattleRequest) => { ... })

// 对战申请被取消
userService.on('battle:cancelled', (request: BattleRequest) => { ... })
```

## 问题排查

### 登录失败

- 检查昵称长度（3-10个字符）
- 检查是否有特殊字符

### 对战申请无响应

- 确认对方用户状态为"在线"
- 确认对方在同一网络环境下（如果使用真实网络）

### 场景跳转失败

- 检查场景是否在 main.ts 中正确注册
- 检查场景键名是否正确
