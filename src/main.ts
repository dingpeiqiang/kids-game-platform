/**
 * 游戏入口文件
 * 使用场景自动注册机制，支持模块化扩展
 */

console.log('[Main] ========== main.ts 开始加载 ==========');

import Phaser from 'phaser';

// 导入配置
import { GAME_CONFIG } from './config/game.config';

// 导入核心模块
import { DeviceAdapter, DeviceDetector } from './core/device';
import { gameController } from './core';
import { sceneRegistry } from './core/scene-registry';
import { gameEventBus } from './core/events/event-bus';

// 导入场景（通过自动注册）
import { BootScene } from './games/demo-game/scenes/boot.scene';
import { MenuScene } from './ui/menu.scene';
import { BattleSelectScene } from './core/battle-select.scene';
import { LoginScene } from './scenes/login.scene';
import { Player2LoginScene } from './scenes/player2-login.scene';
import { SplitScreenBattleScene } from './scenes/split-screen-battle.scene';
import { BattleRequestScene } from './scenes/battle-request.scene';
import { UniversalSplitScreenScene } from './scenes/universal-split-screen.scene';
import { GameScene as ColorGameScene, ResultScene as ColorResultScene, ColorGameSplitScreenScene } from './games/color-game';
import { GameScene as ShapeGameScene, ResultScene as ShapeResultScene, ShapeGameSplitScreenScene } from './games/shape-game';
import { GameScene as DemoGameScene, ResultScene as DemoResultScene, DemoGameSplitScreenScene } from './games/demo-game';

// 导入工具
import { LogUtil } from './utils/log.util';

/**
 * 获取URL参数
 */
function getUrlParams(): { gameId?: string; scene?: string; mode?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    gameId: params.get('game') || undefined,
    scene: params.get('scene') || undefined,
    mode: params.get('mode') || undefined,
  };
}

/**
 * 获取最优屏幕尺寸
 */
function getOptimalScreenSize(): { width: number; height: number } {
  return DeviceAdapter.getOptimalGameResolution();
}

/**
 * 注册所有场景
 */
function registerAllScenes(): void {
  // 基础场景（优先级高）
  sceneRegistry.register('BootScene', BootScene, true, 100);
  sceneRegistry.register('LoginScene', LoginScene, false, 95); // 登录场景
  sceneRegistry.register('Player2LoginScene', Player2LoginScene, false, 93); // 玩家2登录场景
  sceneRegistry.register('SplitScreenBattleScene', SplitScreenBattleScene, false, 92); // 分屏对战场景
  sceneRegistry.register('BattleRequestScene', BattleRequestScene, false, 91); // 战斗请求场景
  sceneRegistry.register('UniversalSplitScreenScene', UniversalSplitScreenScene, false, 90); // 通用双屏对战场景
  sceneRegistry.register('MenuScene', MenuScene, false, 89);

  // 游戏场景
  sceneRegistry.register('DemoGameScene', DemoGameScene, false, 50);
  sceneRegistry.register('DemoResultScene', DemoResultScene, false, 50);
  sceneRegistry.register('ColorGameScene', ColorGameScene, false, 50);
  sceneRegistry.register('ColorResultScene', ColorResultScene, false, 50);
  sceneRegistry.register('ShapeGameScene', ShapeGameScene, false, 50);
  sceneRegistry.register('ShapeResultScene', ShapeResultScene, false, 50);

  // 分屏游戏场景
  sceneRegistry.register('ColorGameSplitScreenScene', ColorGameSplitScreenScene, false, 48);
  sceneRegistry.register('ShapeGameSplitScreenScene', ShapeGameSplitScreenScene, false, 48);
  sceneRegistry.register('DemoGameSplitScreenScene', DemoGameSplitScreenScene, false, 48);

  // 战斗选择场景
  sceneRegistry.register('BattleSelectScene', BattleSelectScene, false, 80);

  LogUtil.log(`[Main] 已注册 ${sceneRegistry.size} 个场景`);
}

/**
 * 初始化设备
 */
function initDevice(): void {
  // 获取设备信息
  const deviceInfo = DeviceDetector.getDeviceInfo();
  LogUtil.log('[Main] 设备信息:', deviceInfo);

  // 禁用默认行为
  DeviceAdapter.disableScroll();

  // 智能电视：自动进入全屏模式
  if (DeviceAdapter.needsRemoteControlMode()) {
    LogUtil.log('[Main] 检测到智能电视，尝试进入全屏模式');
    DeviceAdapter.enableFullscreen().catch((err) => {
      LogUtil.warn('[Main] 全屏模式启用失败:', err);
    });
  }
}

/**
 * 创建游戏实例
 */
function createGame(): Phaser.Game {
  const screenSize = getOptimalScreenSize();
  LogUtil.log(`[Main] 屏幕尺寸: ${screenSize.width}x${screenSize.height}`);

  // 获取已注册的场景
  const scenes = sceneRegistry.getAllScenes();

  // 创建游戏配置（不在这里传递场景，避免重复注册）
  const config: Phaser.Types.Core.GameConfig = {
    type: GAME_CONFIG.type,
    width: screenSize.width,
    height: screenSize.height,
    parent: GAME_CONFIG.parent,
    backgroundColor: GAME_CONFIG.backgroundColor,
    pixelArt: GAME_CONFIG.pixelArt,
    roundPixels: GAME_CONFIG.roundPixels,
    fps: GAME_CONFIG.fps,
    input: GAME_CONFIG.input,
    audio: GAME_CONFIG.audio,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: screenSize.width,
      height: screenSize.height,
    },
    // 不在这里传递场景，稍后通过 registerToGame 添加
  };

  // 创建游戏实例
  const game = new Phaser.Game(config);

  // 注册场景到游戏（统一在这里注册，避免重复）
  sceneRegistry.registerToGame(game);

  // 设置游戏控制器
  gameController.setPhaserGame(game);

  return game;
}

/**
 * 启动场景
 */
function startScene(game: Phaser.Game): void {
  const urlParams = getUrlParams();

  // 监听游戏就绪
  game.events.once('ready', () => {
    LogUtil.log('[Main] 游戏引擎准备就绪');

    // 延迟隐藏加载动画，确保场景初始化完成
    setTimeout(() => {
      hideLoadingOverlay();
    }, 1000);

    // 根据URL参数决定启动场景
    if (urlParams.scene && sceneRegistry.has(urlParams.scene)) {
      LogUtil.log(`[Main] 直接启动场景: ${urlParams.scene}`);
      game.scene.start(urlParams.scene);
    } else if (urlParams.gameId) {
      // 如果有游戏参数，先启动主菜单，然后存储游戏ID供后续使用
      // 这样可以让用户先看到主菜单，然后选择模式
      const gameMap: Record<string, string> = {
        // 简写ID映射到游戏类型
        'color-game': 'color-game',
        'shape-game': 'shape-game',
        'math-game': 'demo-game',
        // 首页配置的游戏ID - creative类（颜色游戏）
        'creative-1': 'color-game',
        'creative-2': 'color-game',
        // 首页配置的游戏ID - puzzle类（形状游戏）
        'puzzle-1': 'shape-game',
        'puzzle-2': 'shape-game',
        // 首页配置的游戏ID - math类（Demo游戏）
        'math-1': 'demo-game',
        'math-2': 'demo-game',
        'math-3': 'demo-game',
        'math-4': 'demo-game',
        // 首页配置的游戏ID - adventure类（暂时用Demo游戏）
        'adventure-1': 'demo-game',
        'adventure-2': 'demo-game',
        'adventure-3': 'demo-game',
        'adventure-4': 'demo-game',
      };

      const gameType = gameMap[urlParams.gameId];

      if (!gameType) {
        LogUtil.error(`[Main] 未找到游戏ID对应场景: ${urlParams.gameId}`);
        LogUtil.warn(`[Main] 可用场景: ${sceneRegistry.getSceneKeys().join(', ')}`);
        // 显示错误信息
        showErrorMessage(`游戏 ${urlParams.gameId} 暂未上线，敬请期待～`);
        return;
      }

      // 存储选中的游戏类型到全局变量，供主菜单使用
      (window as any).__SELECTED_GAME_TYPE__ = gameType;

      LogUtil.log(`[Main] 通过游戏ID启动: ${urlParams.gameId} -> ${gameType}，将进入主菜单`);

      // 如果有模式参数，也存储到全局
      if (urlParams.mode === 'battle') {
        (window as any).__GAME_BATTLE_MODE__ = 'battle';
      }

      // 先启动登录场景（会检查登录后跳转到主菜单）
      LogUtil.log('[Main] 启动登录场景');
      game.scene.start('LoginScene');
    } else {
      // 默认启动登录场景
      LogUtil.log('[Main] 启动默认场景: LoginScene');
      game.scene.start('LoginScene');
    }
  });

  // 监听场景启动失败
  game.events.on(' scenemanager-create-error', (error: Error) => {
    LogUtil.error('[Main] 场景创建失败:', error);
    showErrorMessage('游戏加载失败，请刷新页面重试～');
  });

  // 设置超时检测（15秒后如果游戏还没加载完成，显示错误）
  const timeoutId = setTimeout(() => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
      LogUtil.error('[Main] 游戏加载超时');
      showErrorMessage('游戏加载超时，请检查网络后重试～');
    }
  }, 15000);

  // 清理超时定时器
  game.events.once('ready', () => {
    clearTimeout(timeoutId);
  });
}

/**
 * 设置全局事件监听
 */
function setupEventListeners(_game: Phaser.Game): void {
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    DeviceAdapter.refreshDeviceInfo();
    LogUtil.log('[Main] 窗口大小改变，重新适配');
    // 可以在这里触发场景重新布局
  });

  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    LogUtil.log('[Main] 全屏状态改变:', DeviceAdapter.isFullscreen());
  });

  // 监听游戏请求重启
  window.addEventListener('game:requestRestart', () => {
    gameController.restartGame();
  });

  // 错误处理
  window.addEventListener('error', (error) => {
    LogUtil.error('[Main] 全局错误:', error);
    showErrorMessage('游戏加载失败，请刷新页面重试～');
  });

  window.addEventListener('unhandledrejection', (event) => {
    LogUtil.error('[Main] 未处理的Promise错误:', event.reason);
  });
}

/**
 * 显示错误信息
 */
function showErrorMessage(message: string): void {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');

  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
  }

  if (errorMessage && errorText) {
    errorText.textContent = message;
    errorMessage.classList.add('show');
  }
}

/**
 * 隐藏加载动画
 */
function hideLoadingOverlay(): void {
  console.log('[Main] 隐藏加载动画');
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
    console.log('[Main] 加载动画已隐藏');
  } else {
    console.error('[Main] 找不到 loadingOverlay 元素');
  }
}

// ===== 入口 =====

// 初始化游戏
async function initGame(): Promise<void> {
  console.log('[Main] ===== 开始初始化 =====');
  LogUtil.log('[Main] ===== 游戏启动 =====');

  try {
    // 1. 初始化设备
    console.log('[Main] 步骤1: 初始化设备');
    initDevice();
    console.log('[Main] ✓ 设备初始化完成');

    // 2. 注册所有场景
    console.log('[Main] 步骤2: 注册场景');
    registerAllScenes();
    console.log('[Main] ✓ 场景注册完成');

    // 3. 创建游戏实例
    console.log('[Main] 步骤3: 创建游戏实例');
    const game = createGame();
    console.log('[Main] ✓ 游戏实例创建完成');

    // 4. 设置事件监听
    console.log('[Main] 步骤4: 设置事件监听');
    setupEventListeners(game);
    console.log('[Main] ✓ 事件监听器设置完成');

    // 5. 启动场景
    console.log('[Main] 步骤5: 启动场景');
    startScene(game);
    console.log('[Main] ✓ 场景启动完成');

    LogUtil.log('[Main] 游戏初始化完成');
  } catch (error) {
    console.error('[Main] 游戏初始化失败:', error);
    LogUtil.error('[Main] 游戏初始化失败:', error);
    alert('游戏加载出错啦，请刷新页面重试～');
  }
}

// 如果 DOM 已经加载完成，直接初始化；否则等待 DOM 加载
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('[Main] DOM 已就绪，立即初始化');
  initGame();
} else {
  console.log('[Main] 等待 DOM 加载完成');
  document.addEventListener('DOMContentLoaded', initGame);
}
