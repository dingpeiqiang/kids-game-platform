# 分屏同时游戏模式使用指南

## 概述

分屏同时游戏模式允许两个玩家同时在各自的屏幕上玩游戏，无需轮流对战。这是通过将屏幕分成两个独立的区域实现的。

## 已实现的功能

### 1. 核心组件

- **SplitScreenManager** - 分屏布局管理器
  - 支持水平分屏（左右）和垂直分屏（上下）
  - 独立的玩家区域和分数显示
  - 游戏结束结果展示

- **SplitScreenScene** - 分屏游戏场景基类
  - 独立的玩家ID管理
  - 独立的计时器和分数系统
  - 游戏结束自动判定

- **SplitScreenGameManager** - 分屏游戏管理器
  - 管理两个独立的 Phaser 游戏实例
  - 处理玩家游戏结束事件
  - 计算胜负并显示结果

- **SplitScreenSelectScene** - 分屏模式选择界面
  - 选择分屏方向（水平/垂直）
  - 友好的UI界面

### 2. 游戏实现

已为颜色配对游戏实现了分屏模式：
- **ColorGameSplitScreenScene** (`src/games/color-game/scenes/split-screen.game.scene.ts`)
  - 两个玩家同时在各自的屏幕上识别颜色
  - 独立的60秒倒计时
  - 独立的计分系统
  - 答对+10分，答错-5分

## 如何使用

### 方式一：在主菜单中选择

1. 在主菜单中选择支持分屏模式的游戏（目前只有颜色配对游戏）
2. 进入模式选择界面
3. 选择分屏模式而非对战模式

### 方式二：直接调用代码

```typescript
import { splitScreenGameManager } from '@/core/split-screen-game';
import { ColorGameSplitScreenScene } from '@/games/color-game/scenes/split-screen.game.scene';

// 启动分屏游戏
splitScreenGameManager.startGame({
  gameId: 'color-game',
  player1Scene: ColorGameSplitScreenScene,
  player2Scene: ColorGameSplitScreenScene,
  direction: 'horizontal', // 或 'vertical'
  duration: 60, // 游戏时长（秒）
});
```

## 分屏方向

### 水平分屏（horizontal）
- 屏幕分成左右两个区域
- 适合宽屏显示器
- 玩家1在左侧，玩家2在右侧

### 垂直分屏（vertical）
- 屏幕分成上下两个区域
- 适合竖屏或手机
- 玩家1在上方，玩家2在下方

## 游戏流程

1. **游戏开始** - 两个玩家同时开始游戏
2. **独立游戏** - 每个玩家在自己的区域独立操作
3. **计时器** - 两个玩家共享相同的游戏时长
4. **独立计分** - 答对加10分，答错扣5分
5. **游戏结束** - 时间到后自动结束
6. **结果展示** - 显示双方得分和胜负结果

## 与对战模式的区别

| 特性 | 分屏模式 | 对战模式 |
|------|---------|---------|
| 游戏方式 | 同时进行 | 轮流进行 |
| 玩家数量 | 2人（固定） | 2-4人 |
| 游戏时长 | 60秒 | 10回合 |
| 操作方式 | 同时操作 | 轮流操作 |
| 互动性 | 无直接互动 | 有轮换互动 |
| 适用场景 | 竞速、同时挑战 | 对抗、竞技 |

## 技术实现

### 架构设计

```
SplitScreenGameManager
├── SplitScreenManager (布局管理)
├── Player 1 Phaser Game Instance
│   └── SplitScreenScene
├── Player 2 Phaser Game Instance
│   └── SplitScreenScene
└── Score & Result Management
```

### 核心文件

- `src/core/split-screen-manager.ts` - 分屏布局管理
- `src/core/split-screen.scene.ts` - 分屏场景基类
- `src/core/split-screen-game.ts` - 分屏游戏管理器
- `src/core/split-screen-select.scene.ts` - 分屏模式选择界面
- `src/games/color-game/scenes/split-screen.game.scene.ts` - 颜色游戏分屏实现

### 事件系统

- `player:gameEnd` - 玩家游戏结束事件
- `game:end` - 所有玩家游戏结束事件
- `player:scoreChange` - 分数变化事件
- `game:requestRestart` - 重新开始请求

## 扩展指南

### 为其他游戏添加分屏模式

1. 继承 `SplitScreenScene` 基类
2. 实现 `createGame()` 方法
3. 管理自己的游戏逻辑

示例：

```typescript
import { SplitScreenScene } from '@/core/split-screen.scene';

export class MyGameSplitScreenScene extends SplitScreenScene {
  protected createGame(): void {
    // 创建你的游戏逻辑
    // 使用 this.playerId 区分玩家
    // 使用 this.addScore() 添加分数
    // 时间到时会自动调用 this.endGame()
  }
}
```

### 注意事项

1. 每个玩家区域的大小是屏幕的一半
2. 两个玩家完全独立，互不影响
3. 必须在 `endGame()` 时调用父类方法
4. 使用 `this.playerId` 来区分不同的玩家
5. 游戏结束后会自动触发结果展示

## 已知限制

1. 目前只支持颜色配对游戏的分屏模式
2. 固定2人游戏，不支持更多玩家
3. 游戏时长固定为60秒，不可自定义
4. 不支持实时互动（如抢答）

## 未来改进

- [ ] 为形状游戏添加分屏模式
- [ ] 支持自定义游戏时长
- [ ] 添加实时互动功能（如抢答）
- [ ] 支持更多玩家（3-4人）
- [ ] 添加语音提示和音效
