/**
 * 场景自动注册机制
 * 解决手动注册场景的繁琐问题
 */

import Phaser from 'phaser';
import { LogUtil } from '@/utils/log.util';

/** 场景类 */
export type GameSceneClass = new (...args: unknown[]) => Phaser.Scene;

/** 场景注册项 */
interface SceneRegistryItem {
  key: string;
  scene: GameSceneClass;
  autoStart?: boolean;
  priority?: number;
}

/**
 * 场景注册表
 * 提供场景的自动发现和注册功能
 */
export class SceneRegistry {
  private static instance: SceneRegistry;

  private scenes: Map<string, SceneRegistryItem> = new Map();
  private registered = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): SceneRegistry {
    if (!SceneRegistry.instance) {
      SceneRegistry.instance = new SceneRegistry();
    }
    return SceneRegistry.instance;
  }

  /**
   * 注册场景
   * @param key 场景键名
   * @param scene 场景类
   * @param autoStart 是否自动启动
   * @param priority 优先级（越高越先注册）
   */
  public register(
    key: string,
    scene: GameSceneClass,
    autoStart = false,
    priority = 0
  ): this {
    if (this.scenes.has(key)) {
      LogUtil.warn(`[SceneRegistry] 场景 ${key} 已存在，将被覆盖`);
    }

    this.scenes.set(key, {
      key,
      scene,
      autoStart,
      priority,
    });

    return this;
  }

  /**
   * 批量注册场景
   */
  public registerMany(items: Array<{ key: string; scene: GameSceneClass }>): this {
    items.forEach(({ key, scene }) => {
      this.register(key, scene);
    });
    return this;
  }

  /**
   * 获取所有已注册的场景
   */
  public getAllScenes(): typeof Phaser.Scene[] {
    const sortedScenes = Array.from(this.scenes.values()).sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );

    return sortedScenes.map((item) => item.scene);
  }

  /**
   * 获取场景键名列表
   */
  public getSceneKeys(): string[] {
    return Array.from(this.scenes.keys());
  }

  /**
   * 获取场景类
   */
  public getSceneClass(key: string): GameSceneClass | undefined {
    return this.scenes.get(key)?.scene;
  }

  /**
   * 创建 Phaser 游戏配置
   */
  public createGameConfig(): Partial<Phaser.Types.Core.GameConfig> {
    const scenes = this.getAllScenes();

    return {
      scene: scenes,
    };
  }

  /**
   * 注册到 Phaser 游戏
   */
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

  /**
   * 启动场景
   */
  public startScene(game: Phaser.Game, key: string, ...args: unknown[]): void {
    const scene = game.scene.getScene(key);
    if (scene) {
      game.scene.start(key, ...args);
    } else {
      LogUtil.error(`[SceneRegistry] 场景 ${key} 不存在`);
    }
  }

  /**
   * 启动需要自动开始的场景
   */
  public startAutoScenes(game: Phaser.Game): void {
    const autoScenes = Array.from(this.scenes.values())
      .filter((item) => item.autoStart)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    if (autoScenes.length > 0) {
      const first = autoScenes[0];
      game.scene.start(first.key);
    }
  }

  /**
   * 检查场景是否存在
   */
  public has(key: string): boolean {
    return this.scenes.has(key);
  }

  /**
   * 移除场景
   */
  public remove(key: string): boolean {
    return this.scenes.delete(key);
  }

  /**
   * 清空所有场景
   */
  public clear(): void {
    this.scenes.clear();
    this.registered = false;
  }

  /**
   * 获取注册的场景数量
   */
  public get size(): number {
    return this.scenes.size;
  }
}

/**
 * 场景自动注册装饰器
 * 用于自动注册场景类
 */
export function registerScene(key?: string, autoStart = false, priority = 0) {
  return function <T extends GameSceneClass>(constructor: T): T {
    const sceneKey = key || constructor.name;
    SceneRegistry.getInstance().register(sceneKey, constructor, autoStart, priority);
    return constructor;
  };
}

/**
 * 引导场景注册
 * 用于入口文件快速注册所有场景
 */
export function bootstrapScenes(bootstrapFn: (registry: SceneRegistry) => void): void {
  const registry = SceneRegistry.getInstance();
  bootstrapFn(registry);
}

// ===== 便捷函数 =====

/**
 * 创建游戏并注册场景
 */
export function createGameWithScenes(
  gameConfig: Phaser.Types.Core.GameConfig,
  bootstrapFn: (registry: SceneRegistry) => void
): Phaser.Game {
  const registry = SceneRegistry.getInstance();

  // 执行场景注册
  bootstrapFn(registry);

  // 合并场景配置
  const finalConfig = {
    ...gameConfig,
    ...registry.createGameConfig(),
  };

  // 创建游戏
  const game = new Phaser.Game(finalConfig);

  // 注册场景到游戏
  registry.registerToGame(game);

  return game;
}

/** 全局场景注册表实例 */
export const sceneRegistry = SceneRegistry.getInstance();
