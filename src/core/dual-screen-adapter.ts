/**
 * 双屏适配器
 * 核心设计：将任何单人游戏场景自动适配为双屏对战模式
 * 无需修改原游戏代码，通过实例克隆和容器分隔实现
 */

import Phaser from 'phaser';
import { splitScreenManager } from './split-screen-manager';
import { gameEventBus } from './events/event-bus';
import {
  Player,
  PlayerId,
  Score,
  GameMode,
} from './events/game-events';

/**
 * 双屏游戏实例
 */
interface DualScreenInstance {
  /** Phaser 游戏实例 */
  game: Phaser.Game;
  /** 玩家ID */
  playerId: PlayerId;
  /** 当前分数 */
  score: Score;
  /** 是否运行中 */
  isRunning: boolean;
}

/**
 * 双屏适配器配置
 */
export interface DualScreenConfig {
  /** 游戏ID */
  gameId: string;
  /** 原始场景类 */
  originalSceneClass: typeof Phaser.Scene;
  /** 游戏时长（秒） */
  duration?: number;
  /** 分屏方向 */
  direction?: 'horizontal' | 'vertical';
  /** 玩家1名称 */
  player1Name?: string;
  /** 玩家2名称 */
  player2Name?;
}

/**
 * 双屏适配器
 */
export class DualScreenAdapter {
  private static instance: DualScreenAdapter;

  /** 游戏实例映射 */
  private instances: Map<PlayerId, DualScreenInstance> = new Map();

  /** 玩家数据 */
  private players: Player[] = [];

  /** 当前配置 */
  private config: DualScreenConfig | null = null;

  /** 分数映射 */
  private scores: Map<PlayerId, Score> = new Map();

  /** 游戏结束标志 */
  private gameEnded: boolean = false;

  /** 总时长（毫秒） */
  private totalDuration: number = 60000;

  /** 开始时间 */
  private startTime: number = 0;

  /** 计时器ID */
  private timerId: number | null = null;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): DualScreenAdapter {
    if (!DualScreenAdapter.instance) {
      DualScreenAdapter.instance = new DualScreenAdapter();
    }
    return DualScreenAdapter.instance;
  }

  /**
   * 启动双屏游戏
   */
  public startGame(config: DualScreenConfig): void {
    console.log('[DualScreenAdapter] 启动双屏游戏:', config);

    this.config = config;
    this.gameEnded = false;
    this.totalDuration = (config.duration || 60) * 1000;
    this.scores.clear();

    // 创建玩家数据
    this.players = [
      {
        id: 1 as PlayerId,
        name: config.player1Name || '玩家1',
        score: 0 as Score,
        color: '#FF6B6B',
        isActive: true,
      },
      {
        id: 2 as PlayerId,
        name: config.player2Name || '玩家2',
        score: 0 as Score,
        color: '#4A90E2',
        isActive: true,
      },
    ];

    // 初始化分数
    this.scores.set(1 as PlayerId, 0 as Score);
    this.scores.set(2 as PlayerId, 0 as Score);

    // 初始化分屏布局
    splitScreenManager.initialize({
      playerCount: 2,
      gameId: config.gameId,
      direction: config.direction || 'horizontal',
    });

    // 启动两个玩家的游戏实例
    this.startPlayerGame(1 as PlayerId, config);
    this.startPlayerGame(2 as PlayerId, config);

    // 启动全局计时器
    this.startTimer();

    // 监听游戏结束事件
    this.setupGameEndListener();

    console.log('[DualScreenAdapter] 双屏游戏启动完成');
  }

  /**
   * 启动单个玩家的游戏
   */
  private startPlayerGame(playerId: PlayerId, config: DualScreenConfig): void {
    // 获取玩家的画布容器
    const canvasContainer = splitScreenManager.getCanvasContainer(playerId);

    // 获取容器尺寸
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;

    console.log(`[DualScreenAdapter] 启动玩家${playerId}的游戏，尺寸: ${width}x${height}`);

    // 创建独立的 Phaser 游戏实例
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: canvasContainer,
      width,
      height,
      backgroundColor: '#f0f0f0',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    // 添加原始场景到游戏实例
    // 为每个玩家创建独立的场景实例
    const sceneKey = `${config.gameId}_P${playerId}`;
    game.scene.add(sceneKey, config.originalSceneClass, true, {
      playerId,
      gameId: config.gameId,
      mode: 'dual-screen' as GameMode,
      players: this.players,
      duration: this.totalDuration,
    });

    // 创建实例对象
    const instance: DualScreenInstance = {
      game,
      playerId,
      score: 0 as Score,
      isRunning: true,
    };

    this.instances.set(playerId, instance);

    // 监听场景事件来同步分数
    const scene = game.scene.getScene(sceneKey);
    if (scene) {
      scene.events.on('shutdown', () => {
        console.log(`[DualScreenAdapter] 玩家${playerId}的场景已关闭`);
      });
    }

    splitScreenManager.setGameInstance(playerId, game);
  }

  /**
   * 启动全局计时器
   */
  private startTimer(): void {
    this.startTime = Date.now();

    // 每秒更新一次剩余时间显示
    this.timerId = window.setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, this.totalDuration - elapsed);

      // 更新每个玩家的时间显示
      this.instances.forEach((instance) => {
        const scene = instance.game.scene.getScene(instance.game.scene.scenes[0].sceneKey);
        if (scene && (scene as any).updateTimer) {
          (scene as any).updateTimer(Math.ceil(remaining / 1000));
        }
      });

      // 检查是否超时
      if (remaining <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  /**
   * 设置游戏结束监听
   */
  private setupGameEndListener(): void {
    // 监听全局游戏结束事件
    gameEventBus.on('game:end', (data) => {
      if (!this.gameEnded) {
        console.log('[DualScreenAdapter] 收到游戏结束事件:', data);
        this.endGame();
      }
    });

    // 监听分数变化事件
    gameEventBus.on('player:scoreChange', (data) => {
      this.updateScore(data.playerId, data.score);
    });
  }

  /**
   * 更新分数
   */
  private updateScore(playerId: PlayerId, score: Score): void {
    console.log(`[DualScreenAdapter] 玩家${playerId}分数更新: ${score}`);

    // 更新本地分数
    this.scores.set(playerId, score);

    // 更新分屏管理器中的分数显示
    splitScreenManager.updateScore(playerId, score);

    // 更新玩家数据
    const player = this.players.find((p) => p.id === playerId);
    if (player) {
      player.score = score;
    }

    // 更新游戏实例
    const instance = this.instances.get(playerId);
    if (instance) {
      instance.score = score;
    }
  }

  /**
   * 结束游戏
   */
  private endGame(): void {
    if (this.gameEnded) return;

    console.log('[DualScreenAdapter] 游戏结束');
    this.gameEnded = true;

    // 停止计时器
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    // 停止所有游戏实例
    this.instances.forEach((instance) => {
      instance.isRunning = false;
      try {
        instance.game.destroy(true, false);
      } catch (error) {
        console.error('[DualScreenAdapter] 销毁游戏实例失败:', error);
      }
    });

    // 计算结果
    const winner = this.calculateWinner();
    const isDraw = this.scores.get(1) === this.scores.get(2);

    console.log('[DualScreenAdapter] 游戏结果:', {
      玩家1: this.scores.get(1),
      玩家2: this.scores.get(2),
      胜利者: winner?.name || '平局',
    });

    // 显示结果
    splitScreenManager.showResult(this.scores, winner || undefined);

    // 清理资源
    setTimeout(() => {
      this.cleanup();
    }, 100);
  }

  /**
   * 计算胜利者
   */
  private calculateWinner(): Player | null {
    const score1 = this.scores.get(1) || 0;
    const score2 = this.scores.get(2) || 0;

    if (score1 > score2) {
      return this.players[0];
    } else if (score2 > score1) {
      return this.players[1];
    } else {
      return null;
    }
  }

  /**
   * 重新开始游戏
   */
  public restartGame(): void {
    console.log('[DualScreenAdapter] 重新开始游戏');

    // 清理当前游戏
    this.cleanup();

    // 延迟后重新启动
    setTimeout(() => {
      if (this.config) {
        this.startGame(this.config);
      }
    }, 100);
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    console.log('[DualScreenAdapter] 清理资源');

    // 停止计时器
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    // 销毁所有游戏实例
    this.instances.forEach((instance) => {
      try {
        instance.game.destroy(true, false);
      } catch (error) {
        console.error('[DualScreenAdapter] 销毁游戏实例失败:', error);
      }
    });

    this.instances.clear();
    this.scores.clear();
    this.players = [];
    this.gameEnded = false;
    this.config = null;

    // 清理分屏管理器
    splitScreenManager.clear();
  }

  /**
   * 获取游戏状态
   */
  public getGameState(): {
    scores: Map<PlayerId, Score>;
    remainingTime: number;
    isRunning: boolean;
  } {
    const elapsed = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.totalDuration - elapsed);

    return {
      scores: new Map(this.scores),
      remainingTime: Math.ceil(remainingTime / 1000),
      isRunning: !this.gameEnded,
    };
  }
}

/** 全局双屏适配器实例 */
export const dualScreenAdapter = DualScreenAdapter.getInstance();
