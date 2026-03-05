# 通用双屏对战系统

## 概述

通用双屏对战系统是一个创新的解决方案，允许**任何单人游戏**无需修改代码即可支持**真正的双屏对战模式**。两个玩家可以在同一个屏幕上同时游戏，实时比拼分数。

## 核心特性

### ✨ 无需修改原游戏代码
- 单人游戏场景完全不需要修改
- 通过实例克隆和容器分隔实现双屏
- 保持原游戏的所有功能和逻辑

### 🎯 真正的双屏竞技
- 两个玩家同时游戏，而不是轮流
- 每个玩家有独立的游戏画布
- 实时分数同步和排名

### 🎮 支持所有游戏
- 任何继承自 `PureGameScene` 或 `BaseScene` 的游戏
- 自动适配不同游戏类型
- 统一的游戏时长和计分规则

### 📱 灵活配置
- 水平/垂直分屏切换
- 可自定义游戏时长
- 可自定义玩家名称

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   BattleSelectScene                      │
│             (选择模式：单人/对战/双屏)                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ 选择"双屏对战"
                   ▼
┌─────────────────────────────────────────────────────────┐
│              UniversalSplitScreenScene                   │
│              (通用双屏对战场景入口)                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ 初始化双屏适配器
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  DualScreenAdapter                       │
│          (核心：双屏适配器)                               │
│  ┌────────────────────────────────────────────────┐    │
│  │  1. 创建分屏布局                                │    │
│  │  2. 为每个玩家创建独立Phaser实例                │    │
│  │  3. 克隆原游戏场景到每个玩家                    │    │
│  │  4. 同步分数和计时器                            │    │
│  │  5. 处理游戏结束和结果展示                      │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│  玩家1游戏实例   │  │  玩家2游戏实例   │
│  (原游戏场景克隆)│  │  (原游戏场景克隆)│
│  • 独立画布      │  │  • 独立画布      │
│  • 独立状态      │  │  • 独立状态      │
│  • 独立输入      │  │  • 独立输入      │
└──────────────────┘  └──────────────────┘
         │                   │
         └─────────┬─────────┘
                   ▼
┌─────────────────────────────────────────────────────────┐
│               SplitScreenManager                         │
│          (分屏布局和UI管理)                               │
│  • 分屏容器管理                                          │
│  • 玩家标签显示                                          │
│  • 分数实时更新                                          │
│  • 游戏结果展示                                          │
└─────────────────────────────────────────────────────────┘
```

## 核心组件说明

### 1. DualScreenAdapter (双屏适配器)
**文件**: `src/core/dual-screen-adapter.ts`

**职责**:
- 创建和双屏布局
- 为每个玩家创建独立的 Phaser 游戏实例
- 克隆原始游戏场景到每个玩家
- 管理全局计时器
- 同步分数和游戏状态
- 处理游戏结束和结果展示

**核心方法**:
```typescript
// 启动双屏游戏
dualScreenAdapter.startGame({
  gameId: 'color-game',
  originalSceneClass: ColorGameScene,
  duration: 60,
  direction: 'horizontal',
  player1Name: '玩家1',
  player2Name: '玩家2',
});

// 重新开始游戏
dualScreenAdapter.restartGame();

// 清理资源
dualScreenAdapter.cleanup();
```

### 2. UniversalSplitScreenScene (通用双屏对战场景)
**文件**: `src/scenes/universal-split-screen.scene.ts`

**职责**:
- 作为双屏对战的统一入口场景
- 根据游戏ID查找对应的原始场景类
- 初始化双屏适配器
- 处理重新开始事件

**使用方式**:
```typescript
// 在其他场景中启动双屏对战
this.scene.start('UniversalSplitScreenScene', {
  gameId: 'color-game',
  player1Name: '小明',
  player2Name: '小红',
  duration: 60,
  direction: 'horizontal',
});
```

### 3. SplitScreenManager (分屏管理器)
**文件**: `src/core/split-screen-manager.ts`

**职责**:
- 创建和管理分屏布局（水平/垂直）
- 为每个玩家创建游戏画布容器
- 显示玩家标签和分数
- 显示游戏结果弹窗

### 4. GAME_ID_MAPPING (游戏ID映射配置)
**文件**: `src/config/game-id-mapping.ts`

**职责**:
- 统一管理游戏ID和场景键名的映射
- 提供游戏信息查询接口
- 便于扩展新游戏

**配置示例**:
```typescript
export const GAME_ID_MAPPING: Record<string, GameInfo> = {
  'color-game': {
    gameId: 'color-game',
    sceneKey: 'ColorGameScene',
    resultSceneKey: 'ColorResultScene',
    displayName: '颜色游戏',
    description: '识别颜色，锻炼观察力',
    icon: '🎨',
    defaultDuration: 60,
  },
  // ... 更多游戏
};
```

## 如何使用

### 方式1: 通过对战模式选择界面

1. 用户登录后，进入游戏选择界面
2. 选择要玩的游戏（例如"颜色游戏"）
3. 进入对战模式选择界面
4. 选择"双屏对战"模式
5. 自动启动双屏对战

### 方式2: 直接在代码中启动

```typescript
import { UniversalSplitScreenScene } from './scenes/universal-split-screen.scene';

// 启动双屏对战
this.scene.start('UniversalSplitScreenScene', {
  gameId: 'color-game',          // 游戏ID
  player1Name: '玩家1',          // 玩家1名称
  player2Name: '玩家2',          // 玩家2名称
  duration: 60,                  // 游戏时长（秒）
  direction: 'horizontal',       // 分屏方向：'horizontal' 或 'vertical'
});
```

### 方式3: 通过URL参数启动

```
http://localhost:5173/?game=color-game&mode=dual-screen&duration=60&direction=horizontal
```

## 添加新游戏支持

要在双屏对战中支持新的游戏，只需要在 `GAME_ID_MAPPING` 中添加配置即可：

```typescript
// 在 src/config/game-id-mapping.ts 中添加
export const GAME_ID_MAPPING: Record<string, GameInfo> = {
  // ... 现有游戏
  'my-new-game': {
    gameId: 'my-new-game',
    sceneKey: 'MyNewGameScene',           // 对应的场景键名
    resultSceneKey: 'MyNewGameResultScene', // 可选的结果场景
    displayName: '我的新游戏',
    description: '游戏描述',
    icon: '🎮',
    defaultDuration: 60,
  },
};
```

**注意**: 游戏场景必须已经通过 `sceneRegistry` 注册。

## 游戏场景要求

为了让游戏支持双屏对战，游戏场景需要满足以下要求：

1. **继承自基础场景**:
   - `PureGameScene` (推荐)
   - `BaseScene`

2. **接受初始化数据**:
   ```typescript
   public init(data: {
     playerId: PlayerId;      // 玩家ID
     gameId: string;           // 游戏ID
     mode: GameMode;           // 游戏模式
     players: Player[];        // 玩家列表
     duration?: number;        // 游戏时长（可选）
   }): void {
     // ...
   }
   ```

3. **通过事件通信** (推荐使用 `PureGameScene`):
   - 使用 `gameEventBus.emit('player:scoreChange', ...)` 发送分数变化
   - 使用 `gameEventBus.emit('game:end', ...)` 发送游戏结束事件

4. **不依赖全局状态**: 游戏场景应该是无状态的，所有状态通过初始化数据传入。

## 已支持的游戏

目前双屏对战系统支持以下游戏：

| 游戏ID | 游戏名称 | 场景键名 | 图标 | 默认时长 |
|--------|----------|----------|------|----------|
| `color-game` | 颜色游戏 | ColorGameScene | 🎨 | 60秒 |
| `shape-game` | 形状游戏 | ShapeGameScene | ⭐ | 60秒 |
| `math-game` | 数学游戏 | GameScene | 🔢 | 60秒 |
| `demo-game` | 演示游戏 | DemoGameScene | 🎮 | 60秒 |

## 技术实现细节

### 实例克隆机制

双屏适配器通过以下方式克隆游戏实例：

1. **创建独立容器**: 使用 `SplitScreenManager` 为每个玩家创建独立的 DOM 容器
2. **创建独立游戏实例**: 为每个容器创建独立的 Phaser.Game 实例
3. **克隆场景**: 将原始场景类添加到每个游戏实例中，传入不同的玩家ID
4. **独立运行**: 两个游戏实例完全独立运行，互不干扰

### 分数同步

分数同步通过事件总线实现：

```typescript
// 游戏场景发送分数变化事件
gameEventBus.emit('player:scoreChange', {
  type: 'player:scoreChange',
  playerId: 1,
  score: 100,
});

// 双屏适配器接收并更新UI
gameEventBus.on('player:scoreChange', (data) => {
  splitScreenManager.updateScore(data.playerId, data.score);
});
```

### 游戏结束处理

当任一玩家完成游戏或超时时：

1. 双屏适配器停止所有游戏实例
2. 计算最终分数和排名
3. 调用 `SplitScreenManager.showResult()` 显示结果
4. 提供"再来一局"和"返回主页"选项

## 性能优化

1. **资源共享**: 游戏资源由 Phaser 缓存管理，多个实例共享
2. **独立渲染**: 每个玩家只渲染自己的画布，避免重复渲染
3. **事件驱动**: 使用事件总线解耦，减少直接依赖
4. **资源清理**: 游戏结束时及时销毁游戏实例，释放内存

## 测试建议

1. **功能测试**:
   - 测试每个游戏的双屏对战功能
   - 验证分数同步是否正确
   - 验证计时器是否准确
   - 验证游戏结束和结果展示

2. **性能测试**:
   - 测试在不同设备上的性能表现
   - 监控内存使用情况
   - 测试长时间运行是否稳定

3. **兼容性测试**:
   - 测试在不同浏览器上的兼容性
   - 测试在不同屏幕尺寸下的适配
   - 测试触摸和键盘控制

## 已知问题和解决方案

### 问题1: 两个玩家的游戏进度不同步

**原因**: 两个游戏实例完全独立，各自独立生成题目

**解决方案**: 这是设计预期，双屏对战中每个玩家独立游戏，不要求进度同步

### 问题2: 分数更新延迟

**原因**: 事件总线可能有轻微延迟

**解决方案**: 优化事件监听器，减少延迟

### 问题3: 内存占用较高

**原因**: 同时运行两个 Phaser 游戏实例

**解决方案**: 及时清理资源，优化游戏逻辑

## 未来扩展

1. **支持更多玩家**: 扩展支持3-4人同屏对战
2. **网络对战**: 结合现有的在线对战功能，支持跨屏对战
3. **更多游戏类型**: 支持更多游戏类型的双屏对战
4. **自定义主题**: 允许玩家自定义分屏主题和样式
5. **回放功能**: 记录和回放游戏过程

## 总结

通用双屏对战系统通过创新的架构设计，实现了"**任何单人游戏无需修改即可支持双屏对战**"的目标。核心思想是通过实例克隆和容器分隔，为每个玩家创建独立的游戏实例，同时通过事件总线实现分数同步和状态管理。

这个系统具有以下优势：

✅ **零侵入**: 原游戏代码无需修改
✅ **高复用**: 一套代码支持所有游戏
✅ **易扩展**: 添加新游戏只需配置
✅ **高性能**: 独立实例，互不干扰
✅ **易维护**: 清晰的架构和职责分离

通过这个系统，开发者可以轻松地为任何单人游戏添加双屏对战功能，大大提升了游戏的可玩性和趣味性。
