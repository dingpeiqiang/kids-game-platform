# 场景重复注册问题修复

## 问题描述

点击"图形世界"等游戏时，出现以下错误：

```
Uncaught Error: Cannot add Scene with duplicate key: BootScene
```

## 根本原因

场景被重复注册了两次：

1. **第一次注册**：在 `createGame()` 函数中，创建 Phaser 游戏配置时，通过 `scene: scenes` 参数传递了所有场景，Phaser 会自动注册这些场景。

2. **第二次注册**：紧接着调用 `sceneRegistry.registerToGame(game)`，又尝试手动注册相同的场景。

Phaser 不允许同一个场景键名被注册两次，因此抛出错误。

## 修复方案

### 1. 移除游戏配置中的 scene 参数

**文件**: `src/main.ts`

**修改前**:
```typescript
const config: Phaser.Types.Core.GameConfig = {
  // ... 其他配置
  scene: scenes,  // ❌ 这里会自动注册场景
};
```

**修改后**:
```typescript
const config: Phaser.Types.Core.GameConfig = {
  // ... 其他配置
  // 不传递 scene 参数，避免自动注册
};
```

### 2. 增强重复注册检测

**文件**: `src/core/scene-registry.ts`

**改进**:
- 添加了更详细的日志记录
- 统计成功注册和跳过的场景数量
- 添加了 try-catch 错误处理
- 在每次注册前检查场景是否已存在

**修改后的代码**:
```typescript
public registerToGame(game: Phaser.Game): void {
  if (this.registered) {
    LogUtil.warn('[SceneRegistry] 场景已注册到游戏，跳过重复注册');
    return;
  }

  const sceneManager = game.scene;

  let registeredCount = 0;
  let skippedCount = 0;

  this.scenes.forEach(({ key, scene }) => {
    if (!sceneManager.getScene(key)) {
      try {
        sceneManager.add(key, scene, false);
        registeredCount++;
      } catch (error) {
        LogUtil.error(`[SceneRegistry] 注册场景 ${key} 失败:`, error);
      }
    } else {
      LogUtil.warn(`[SceneRegistry] 场景 ${key} 已存在，跳过注册`);
      skippedCount++;
    }
  });

  this.registered = true;
  LogUtil.log(`[SceneRegistry] 成功注册 ${registeredCount} 个场景，跳过 ${skippedCount} 个重复场景`);
}
```

## 测试验证

### 预期的控制台输出

```
[Main] ===== 游戏启动 =====
[Main] 设备信息: {...}
[Main] 屏幕尺寸: 800x600
[Main] 已注册 9 个场景
[SceneRegistry] 成功注册 9 个场景，跳过 0 个重复场景
[Main] 游戏引擎准备就绪
[Main] 通过游戏ID启动: puzzle-2 -> ShapeGameScene
```

### 测试步骤

1. **清除缓存**: 清除浏览器缓存和 localStorage
2. **刷新页面**: 确保使用最新代码
3. **点击游戏**: 点击任意游戏卡片（如"图形世界"）
4. **检查日志**: 确认没有重复注册错误
5. **验证跳转**: 确认游戏能正常加载

## 场景注册流程

### 正确的注册流程

```
1. DOMContentLoaded 触发
   ↓
2. registerAllScenes() - 注册到 sceneRegistry
   ├─ BootScene (autoStart: true)
   ├─ MenuScene
   ├─ DemoGameScene, DemoResultScene
   ├─ ColorGameScene, ColorResultScene
   ├─ ShapeGameScene, ShapeResultScene
   └─ BattleSelectScene
   ↓
3. createGame() - 创建游戏实例
   ├─ 创建 Phaser.Game 配置（不包含 scene 参数）
   └─ 实例化游戏
   ↓
4. sceneRegistry.registerToGame(game) - 统一注册到游戏
   └─ 将所有场景添加到游戏
   ↓
5. startScene(game) - 启动场景
   └─ 根据 URL 参数启动对应场景
```

## 相关文件

- `src/main.ts` - 游戏入口文件
- `src/core/scene-registry.ts` - 场景注册表
- `src/games/demo-game/scenes/boot.scene.ts` - 启动场景

## 常见问题

### Q: 为什么不在游戏配置中直接传递 scene？

A: 如果在游戏配置中传递 `scene: scenes`，Phaser 会立即注册这些场景。之后如果再调用 `sceneRegistry.registerToGame()`，就会导致重复注册错误。

### Q: 如何确保场景只注册一次？

A:
1. 在 `sceneRegistry` 中维护一个 `registered` 标志
2. 在注册前检查场景是否已存在
3. 统一通过 `registerToGame()` 方法注册，不要在游戏配置中传递 scene 参数

### Q: 如果看到重复注册警告怎么办？

A:
1. 检查是否有多个地方调用 `registerToGame()`
2. 确保页面不会重复加载
3. 清除浏览器缓存重试

## 后续优化建议

1. **单例保护**: 在 `registerAllScenes()` 中添加检查，防止重复调用
2. **开发模式警告**: 在开发环境下，对重复注册给出更明显的警告
3. **场景生命周期管理**: 实现场景的动态加载和卸载
4. **性能优化**: 只加载当前需要的场景

## 版本信息

- 修复日期：2025-03-05
- 修复版本：v1.1.1
- 修复人：AI Assistant
