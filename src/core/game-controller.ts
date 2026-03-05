/**
 * 游戏控制器
 * 职责：管理游戏生命周期、玩家数据、多人模式控制
 * 核心设计原则：游戏代码不感知单/多人模式，由上层统一控制
 */

import Phaser from 'phaser';
import { gameEventBus } from './events/event-bus';
import {
  GameMode,
  Player,
  PlayerId,
  Score,
  IGameConfig,
  IGameState,
  GameEventData,
} from './events/game-events';
import { LayoutManager } from './layout-manager';

/**
 * 游戏实例
 * 包装单个 Phaser 游戏场景
 */
class GameInstance {
  public scene: Phaser.Scene | null = null;
  public container: HTMLElement | null = null;
  private isRunning = false;

  constructor(
    public gameId: string,
    public playerId: PlayerId
  ) {}

  /**
   * 启动游戏实例
   */
  start(config: IGameConfig, container: HTMLElement): void {
    this.container = container;
    this.isRunning = true;
    // 游戏启动逻辑由外部传入的场景管理器处理
  }

  /**
   * 停止游戏实例
   */
  stop(): void {
    this.isRunning = false;
    if (this.scene) {
      this.scene.events.emit('game:stop');
    }
  }

  /**
   * 销毁游戏实例
   */
  destroy(): void {
    this.stop();
    this.scene = null;
    this.container = null;
  }

  /**
   * 发送玩家输入到游戏
   */
  sendInput(action: string, data?: unknown): void {
    if (this.scene && this.isRunning) {
      this.scene.events.emit('player:input', { playerId: this.playerId, action, data });
    }
  }

  get running(): boolean {
    return this.isRunning;
  }
}

/**
 * 游戏控制器配置
 */
export interface GameControllerConfig {
  /** 游戏类型ID */
  gameId: string;
  /** 游戏模式 */
  mode: GameMode;
  /** 玩家数量 */
  playerCount: number;
  /** 总回合数 */
  totalRounds: number;
  /** 玩家名称前缀 */
  playerNamePrefix?: string;
  /** 玩家颜色列表 */
  playerColors?: string[];
}

/**
 * 游戏控制器
 * 统一管理单人和多人游戏
 */
export class GameController {
  private static instance: GameController;

  // 游戏实例映射
  private gameInstances: Map<PlayerId, GameInstance> = new Map();

  // 玩家数据
  private players: Player[] = [];

  // 当前游戏状态
  private currentGameId: string = '';
  private currentRound: number = 0;
  private totalRounds: number = 0;
  private isGameRunning: boolean = false;
  private isPaused: boolean = false;

  // 布局管理器
  private layoutManager: LayoutManager;

  // Phaser 游戏实例
  private phaserGame: Phaser.Game | null = null;

  private constructor() {
    this.layoutManager = new LayoutManager();
    this.setupEventListeners();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController();
    }
    return GameController.instance;
  }

  /**
   * 设置 Phaser 游戏实例
   */
  public setPhaserGame(game: Phaser.Game): void {
    this.phaserGame = game;
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听分数变化事件
    gameEventBus.on('player:scoreChange', (data) => {
      this.handleScoreChange(data.playerId, data.score);
    });

    // 监听回合完成事件
    gameEventBus.on('round:complete', (data) => {
      this.handleRoundComplete(data.round, data.scores);
    });

    // 监听游戏结束事件
    gameEventBus.on('game:end', (data) => {
      this.handleGameEnd(data);
    });
  }

  /**
   * 启动游戏
   */
  public startGame(config: GameControllerConfig): void {
    const { gameId, mode, playerCount, totalRounds, playerNamePrefix, playerColors } = config;

    // 保存游戏配置
    this.currentGameId = gameId;
    this.currentRound = 0;
    this.totalRounds = totalRounds;
    this.isGameRunning = true;

    // 创建玩家数据
    this.players = this.createPlayers(playerCount, playerNamePrefix, playerColors);

    // 创建布局
    this.layoutManager.createLayout(this.players);

    // 为每个玩家创建游戏实例
    this.players.forEach((player) => {
      const container = this.layoutManager.getPlayerContainer(player.id);
      const instance = new GameInstance(gameId, player.id);
      instance.start({ playerCount, totalRounds, mode }, container);
      this.gameInstances.set(player.id, instance);
    });

    // 启动所有游戏实例
    this.startAllGameInstances(config);

    // 发布游戏开始事件
    gameEventBus.emit('game:start', {
      gameId,
      mode,
      players: this.players,
    });

    console.log(`[GameController] 游戏开始: ${gameId}, 模式: ${mode}, 玩家数: ${playerCount}`);
  }

  /**
   * 创建玩家数据
   */
  private createPlayers(
    count: number,
    prefix?: string,
    colors?: string[]
  ): Player[] {
    const defaultColors: string[] = ['#FF6B6B', '#4A90E2', '#95E1D3', '#FFE66D'];
    const playerColors = colors || defaultColors;
    const playerPrefix = prefix || '玩家';

    const players: Player[] = [];
    for (let i = 0; i < count; i++) {
      players.push({
        id: (i + 1) as PlayerId,
        name: `${playerPrefix}${i + 1}`,
        score: 0 as Score,
        color: playerColors[i % playerColors.length] as `#${string}`,
        isActive: i === 0, // 第一个玩家先手
      });
    }
    return players;
  }

  /**
   * 启动所有游戏实例
   */
  private startAllGameInstances(config: GameControllerConfig): void {
    const sceneKey = this.getSceneKey(config.gameId);

    this.players.forEach((player) => {
      const instance = this.gameInstances.get(player.id);
      if (instance && this.phaserGame) {
        // 使用 Phaser 场景管理器启动场景
        const scene = this.phaserGame.scene.start(sceneKey, {
          playerId: player.id,
          gameId: config.gameId,
          mode: config.mode,
          players: this.players,
        });
        instance.scene = scene;
      }
    });
  }

  /**
   * 获取场景键名
   */
  private getSceneKey(gameId: string): string {
    const sceneMap: Record<string, string> = {
      'color-game': 'ColorGameScene',
      'shape-game': 'ShapeGameScene',
      'math-game': 'GameScene',
    };
    return sceneMap[gameId] || 'GameScene';
  }

  /**
   * 处理分数变化
   */
  private handleScoreChange(playerId: PlayerId, score: Score): void {
    const player = this.players.find((p) => p.id === playerId);
    if (player) {
      player.score = score;
      this.layoutManager.updateScore(playerId, score);
    }
  }

  /**
   * 处理回合完成
   */
  private handleRoundComplete(round: number, scores: Map<PlayerId, Score>): void {
    this.currentRound = round;
    this.layoutManager.updateRoundIndicator(round, this.totalRounds);

    // 多人模式：切换玩家
    if (this.players.length > 1) {
      const currentPlayer = this.players.find((p) => p.isActive);
      if (currentPlayer) {
        currentPlayer.isActive = false;
      }

      // 找出下一个玩家
      const currentIndex = this.players.indexOf(currentPlayer!);
      const nextIndex = (currentIndex + 1) % this.players.length;
      const nextPlayer = this.players[nextIndex];
      nextPlayer.isActive = true;

      // 高亮当前玩家
      this.layoutManager.highlightPlayer(nextPlayer.id);

      // 发布回合切换事件
      gameEventBus.emit('player:turnChange', {
        currentPlayerId: nextPlayer.id,
      });
    }
  }

  /**
   * 处理游戏结束
   */
  private handleGameEnd(event: Extract<GameEventData, { type: 'game:end' }>): void {
    this.isGameRunning = false;

    // 计算结果
    const winner = this.calculateWinner(event.scores);
    const isDraw = this.checkIsDraw(event.scores);

    // 显示结果
    this.layoutManager.showResult(winner || undefined, isDraw, event.scores);

    console.log(`[GameController] 游戏结束: ${winner?.name || '平局'}`);
  }

  /**
   * 计算胜利者
   */
  private calculateWinner(scores: Map<PlayerId, Score>): Player | null {
    let maxScore = -1;
    let winner: Player | null = null;

    scores.forEach((score, playerId) => {
      const player = this.players.find((p) => p.id === playerId);
      if (player && score > maxScore) {
        maxScore = score;
        winner = player;
      }
    });

    return winner;
  }

  /**
   * 检查是否平局
   */
  private checkIsDraw(scores: Map<PlayerId, Score>): boolean {
    const scoreArray = Array.from(scores.values());
    return scoreArray.length > 1 && scoreArray.every((s) => s === scoreArray[0]);
  }

  /**
   * 暂停游戏
   */
  public pauseGame(): void {
    if (!this.isPaused && this.isGameRunning) {
      this.isPaused = true;
      this.gameInstances.forEach((instance) => instance.sendInput('pause'));
      gameEventBus.emit('game:pause', { type: 'game:pause' });
    }
  }

  /**
   * 恢复游戏
   */
  public resumeGame(): void {
    if (this.isPaused && this.isGameRunning) {
      this.isPaused = false;
      this.gameInstances.forEach((instance) => instance.sendInput('resume'));
      gameEventBus.emit('game:resume', { type: 'game:resume' });
    }
  }

  /**
   * 重新开始游戏
   */
  public restartGame(): void {
    const config: GameControllerConfig = {
      gameId: this.currentGameId,
      mode: this.players.length === 1 ? 'single' : 'battle',
      playerCount: this.players.length,
      totalRounds: this.totalRounds,
    };
    this.stopGame();
    this.startGame(config);
    gameEventBus.emit('game:restart', { type: 'game:restart' });
  }

  /**
   * 停止游戏
   */
  public stopGame(): void {
    this.isGameRunning = false;
    this.isPaused = false;
    this.gameInstances.forEach((instance) => instance.destroy());
    this.gameInstances.clear();
    this.layoutManager.clear();
    this.players = [];
    this.currentRound = 0;
  }

  /**
   * 获取玩家数据
   */
  public getPlayers(): Player[] {
    return [...this.players];
  }

  /**
   * 获取当前活跃玩家
   */
  public getActivePlayer(): Player | undefined {
    return this.players.find((p) => p.isActive);
  }

  /**
   * 获取游戏状态
   */
  public getGameState(): IGameState {
    const scores = new Map<PlayerId, Score>();
    this.players.forEach((p) => scores.set(p.id, p.score));

    return {
      currentRound: this.currentRound,
      scores,
      isComplete: !this.isGameRunning,
    };
  }

  /**
   * 检查游戏是否运行中
   */
  public get running(): boolean {
    return this.isGameRunning;
  }

  /**
   * 检查游戏是否暂停
   */
  public get paused(): boolean {
    return this.isPaused;
  }
}

/** 全局游戏控制器实例 */
export const gameController = GameController.getInstance();
