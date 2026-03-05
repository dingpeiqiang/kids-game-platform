/**
 * 核心模块导出
 */

// 基础场景
export { BaseScene } from './scene.base';

// 事件系统
export { gameEventBus } from './events/event-bus';
export * from './events/game-events';

// 场景注册
export { sceneRegistry, registerScene, bootstrapScenes, createGameWithScenes } from './scene-registry';

// 对战模式
export { BaseBattleScene, BattleMode } from './battle.base';
export { BattleSelectScene } from './battle-select.scene';

// 分屏模式
export { SplitScreenScene } from './split-screen.scene';
export { SplitScreenSelectScene } from './split-screen-select.scene';
export { splitScreenManager, SplitScreenManager } from './split-screen-manager';
export { splitScreenGameManager, SplitScreenGameManager } from './split-screen-game';

// 游戏控制器
export { gameController, GameController } from './game-controller';
export type { GameControllerConfig } from './game-controller';

// 布局管理器
export { LayoutManager } from './layout-manager';
