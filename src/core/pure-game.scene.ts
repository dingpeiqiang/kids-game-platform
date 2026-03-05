/**
 * 纯游戏场景基类
 * 设计原则：游戏逻辑与渲染分离，游戏代码不感知单/多人模式
 * 通过事件与上层（GameController）通信
 */

import Phaser from 'phaser';
import { gameEventBus } from './events/event-bus';
import {
  PlayerId,
  Score,
  IGameConfig,
  IGameState,
  Player,
  GameMode,
} from './events/game-events';

/**
 * 场景初始化数据
 */
export interface SceneInitData {
  /** 玩家ID */
  playerId: PlayerId;
  /** 游戏ID */
  gameId: string;
  /** 游戏模式 */
  mode: GameMode;
  /** 玩家列表（多人模式） */
  players: Player[];
}

/**
 * 纯游戏场景基类
 * 子类只需关注核心游戏逻辑，通过事件与外部通信
 */
export abstract class PureGameScene extends Phaser.Scene {
  /** 游戏配置 */
  protected config!: IGameConfig;

  /** 当前玩家ID */
  protected playerId!: PlayerId;

  /** 玩家列表 */
  protected players: Player[] = [];

  /** 当前回合 */
  protected currentRound: number = 0;

  /** 玩家分数映射 */
  protected scores: Map<PlayerId, Score> = new Map();

  /** 游戏是否运行中 */
  protected isRunning: boolean = false;

  /** 场景初始化数据 */
  private initData?: SceneInitData;

  constructor(key: string) {
    super(key);
  }

  /**
   * 初始化场景
   * 由外部调用，传入配置数据
   */
  public init(data: SceneInitData): void {
    this.initData = data;
    this.playerId = data.playerId;
    this.players = data.players;

    // 从玩家列表中获取当前玩家
    const currentPlayer = this.players.find((p) => p.id === data.playerId);
    if (currentPlayer) {
      this.scores.set(data.playerId, currentPlayer.score);
    }

    // 设置游戏配置
    this.config = {
      playerCount: data.players.length,
      totalRounds: data.mode === 'single' ? 10 : 5 * data.players.length,
      mode: data.mode,
    };
  }

  /**
   * 创建场景
   */
  public create(): void {
    console.log(`[PureGameScene] 创建场景: ${this.scene.key}`);

    this.isRunning = true;

    // 绑定事件监听
    this.bindEvents();

    // 子类实现游戏初始化
    this.onCreate();

    // 开始第一回合
    this.startRound();
  }

  /**
   * 绑定事件监听
   */
  private bindEvents(): void {
    // 监听外部输入事件
    this.events.on('player:input', (data: { playerId: PlayerId; action: string; data?: unknown }) => {
      if (data.playerId === this.playerId) {
        this.handleExternalInput(data.action, data.data);
      }
    });

    // 监听停止事件
    this.events.on('game:stop', () => {
      this.stopGame();
    });

    // 监听暂停事件
    this.events.on('game:pause', () => {
      this.pauseGame();
    });

    // 监听恢复事件
    this.events.on('game:resume', () => {
      this.resumeGame();
    });

    // 场景关闭时清理
    this.events.on('shutdown', () => {
      this.cleanup();
    });
  }

  /**
   * 处理外部输入
   * 由 GameController 调用
   */
  protected handleExternalInput(action: string, data?: unknown): void {
    switch (action) {
      case 'pause':
        this.pauseGame();
        break;
      case 'resume':
        this.resumeGame();
        break;
      case 'restart':
        this.restartGame();
        break;
      default:
        this.onPlayerAction(action, data);
    }
  }

  /**
   * 玩家动作（子类实现）
   */
  protected abstract onPlayerAction(action: string, data?: unknown): void;

  /**
   * 场景创建（子类实现）
   */
  protected abstract onCreate(): void;

  /**
   * 开始回合
   */
  protected startRound(): void {
    this.currentRound++;
    console.log(`[PureGameScene] 回合开始: ${this.currentRound}/${this.config.totalRounds}`);

    // 生成新题目（子类实现）
    this.generateQuestion();
  }

  /**
   * 生成题目（子类实现）
   */
  protected abstract generateQuestion(): void;

  /**
   * 提交答案
   */
  protected submitAnswer(answer: unknown): void {
    const isCorrect = this.checkAnswer(answer);
    const currentScore = this.scores.get(this.playerId) || (0 as Score);

    if (isCorrect) {
      const newScore = (currentScore + 10) as Score;
      this.scores.set(this.playerId, newScore);

      // 通知分数变化
      this.emitScoreChange(this.playerId, newScore);

      console.log(`[PureGameScene] 答对了！分数: ${newScore}`);
    } else {
      console.log(`[PureGameScene] 答错了`);
    }

    // 检查游戏是否结束
    if (this.currentRound >= this.config.totalRounds) {
      this.endGame();
    } else {
      // 通知回合完成
      this.emitRoundComplete();

      // 延迟进入下一回合
      this.time.delayedCall(800, () => {
        this.startRound();
      });
    }
  }

  /**
   * 检查答案（子类实现）
   */
  protected abstract checkAnswer(answer: unknown): boolean;

  /**
   * 发射分数变化事件
   */
  protected emitScoreChange(playerId: PlayerId, score: Score): void {
    gameEventBus.emit('player:scoreChange', {
      type: 'player:scoreChange',
      playerId,
      score,
    });
  }

  /**
   * 发射回合完成事件
   */
  protected emitRoundComplete(): void {
    gameEventBus.emit('round:complete', {
      type: 'round:complete',
      round: this.currentRound,
      scores: new Map(this.scores),
    });
  }

  /**
   * 发射游戏结束事件
   */
  protected emitGameEnd(): void {
    gameEventBus.emit('game:end', {
      type: 'game:end',
      gameId: this.initData?.gameId || '',
      scores: new Map(this.scores),
      winner: this.calculateWinner(),
      isDraw: this.checkIsDraw(),
    });
  }

  /**
   * 计算胜利者
   */
  private calculateWinner(): Player | undefined {
    if (this.config.mode === 'single') {
      return this.players.find((p) => p.id === this.playerId);
    }

    let maxScore = -1;
    let winner: Player | undefined;

    this.scores.forEach((score, playerId) => {
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
  private checkIsDraw(): boolean {
    if (this.scores.size < 2) return false;
    const scoreArray = Array.from(this.scores.values());
    return scoreArray.every((s) => s === scoreArray[0]);
  }

  /**
   * 结束游戏
   */
  protected endGame(): void {
    this.isRunning = false;
    console.log(`[PureGameScene] 游戏结束`);

    this.emitGameEnd();

    // 子类可重写用于显示结果界面
    this.onGameEnd();
  }

  /**
   * 游戏结束回调（子类可重写）
   */
  protected onGameEnd(): void {
    // 默认行为：跳转到结果场景
    // 子类可重写此方法自定义结果展示
  }

  /**
   * 暂停游戏
   */
  protected pauseGame(): void {
    this.scene.pause();
    console.log(`[PureGameScene] 游戏暂停`);
  }

  /**
   * 恢复游戏
   */
  protected resumeGame(): void {
    this.scene.resume();
    console.log(`[PureGameScene] 游戏恢复`);
  }

  /**
   * 重新开始游戏
   */
  protected restartGame(): void {
    this.scores.set(this.playerId, 0 as Score);
    this.currentRound = 0;
    this.isRunning = true;
    this.startRound();
  }

  /**
   * 停止游戏
   */
  protected stopGame(): void {
    this.isRunning = false;
    this.scene.stop();
  }

  /**
   * 获取当前游戏状态
   */
  public getGameState(): IGameState {
    return {
      currentRound: this.currentRound,
      scores: new Map(this.scores),
      isComplete: !this.isRunning,
    };
  }

  /**
   * 获取当前玩家
   */
  protected getCurrentPlayer(): Player | undefined {
    return this.players.find((p) => p.id === this.playerId);
  }

  /**
   * 清理资源
   */
  protected cleanup(): void {
    this.isRunning = false;
    this.scores.clear();
  }

  /**
   * 场景更新
   */
  public update(_time: number, _delta: number): void {
    if (!this.isRunning) return;
    this.onUpdate(_time, _delta);
  }

  /**
   * 场景更新回调（子类可重写）
   */
  protected onUpdate(_time: number, _delta: number): void {
    // 可选：子类实现实时逻辑
  }
}
