import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { Player, PlayerId, Score } from './events/game-events';
import { splitScreenManager } from './split-screen-manager';

/**
 * 分屏游戏配置
 */
export interface SplitScreenGameConfig {
  /** 当前玩家的ID */
  playerId: PlayerId;
  /** 游戏方向：horizontal或vertical */
  direction: 'horizontal' | 'vertical';
  /** 游戏时长（秒） */
  duration: number;
}

/**
 * 分屏游戏场景基类
 * 支持两个玩家同时在各自的屏幕上游戏
 */
export abstract class SplitScreenScene extends BaseScene {
  /** 当前玩家ID */
  protected playerId: PlayerId = 1 as PlayerId;

  /** 游戏配置 */
  protected config: SplitScreenGameConfig = {
    playerId: 1 as PlayerId,
    direction: 'horizontal',
    duration: 60,
  };

  /** 玩家分数 */
  protected score: Score = 0 as Score;

  /** 游戏计时器 */
  protected gameTimer: Phaser.Time.TimerEvent | null = null;

  /** 剩余时间 */
  protected remainingTime: number = 60;

  /** 时间显示文本 */
  protected timeText: Phaser.GameObjects.Text | null = null;

  /** 分数显示文本 */
  protected scoreText: Phaser.GameObjects.Text | null = null;

  /** 游戏是否结束 */
  protected isGameEnded: boolean = false;

  /**
   * 初始化场景
   */
  public init(data: any): void {
    super.init(data);

    // 获取玩家ID
    if (data.playerId) {
      this.playerId = data.playerId as PlayerId;
      this.config.playerId = data.playerId as PlayerId;
    }

    // 获取分屏方向
    if (data.direction) {
      this.config.direction = data.direction;
    }

    LogUtil.log(`[SplitScreenScene] 玩家${this.playerId}初始化, 方向: ${this.config.direction}`);
  }

  /**
   * 创建场景
   */
  public create(): void {
    super.create();

    // 获取玩家画布容器
    const canvasContainer = splitScreenManager.getCanvasContainer(this.playerId);
    if (canvasContainer) {
      // 设置场景的父容器
      this.scale.setParent(canvasContainer);
    }

    // 创建分数显示
    this.createScoreDisplay();

    // 创建计时器显示
    this.createTimerDisplay();

    // 开始游戏计时
    this.startGameTimer();

    // 调用子类的游戏逻辑
    this.createGame();

    LogUtil.log(`[SplitScreenScene] 玩家${this.playerId}游戏开始`);
  }

  /**
   * 创建分数显示
   */
  protected createScoreDisplay(): void {
    const padding = 10;
    const fontSize = 24;

    this.scoreText = this.add.text(
      this.scale.width - padding,
      60,
      `分数: ${this.score}`,
      {
        font: `bold ${fontSize}px Arial`,
        color: this.playerId === 1 ? '#FF6B6B' : '#4A90E2',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: { x: 15, y: 8 },
        stroke: '#333',
        strokeThickness: 2,
      }
    );
    this.scoreText.setOrigin(1, 0);
    this.scoreText.setDepth(1000);
  }

  /**
   * 创建计时器显示
   */
  protected createTimerDisplay(): void {
    const padding = 10;
    const fontSize = 28;

    this.timeText = this.add.text(
      this.scale.width / 2,
      30,
      `时间: ${this.remainingTime}s`,
      {
        font: `bold ${fontSize}px Arial`,
        color: '#333333',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: { x: 15, y: 8 },
        stroke: '#333',
        strokeThickness: 2,
      }
    );
    this.timeText.setOrigin(0.5, 0);
    this.timeText.setDepth(1000);
  }

  /**
   * 开始游戏计时器
   */
  protected startGameTimer(): void {
    this.remainingTime = this.config.duration;

    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true,
    });

    LogUtil.log(`[SplitScreenScene] 玩家${this.playerId}计时器开始, 时长: ${this.remainingTime}秒`);
  }

  /**
   * 计时器每秒回调
   */
  protected onTimerTick(): void {
    this.remainingTime--;

    // 更新时间显示
    if (this.timeText) {
      this.timeText.setText(`时间: ${this.remainingTime}s`);

      // 时间少于10秒时显示红色
      if (this.remainingTime <= 10) {
        this.timeText.setColor('#FF0000');
        // 添加闪烁效果
        this.timeText.setVisible(Math.floor(Date.now() / 500) % 2 === 0);
      }
    }

    // 时间到
    if (this.remainingTime <= 0) {
      this.endGame();
    }
  }

  /**
   * 添加分数
   */
  protected addScore(points: number): void {
    this.score = (this.score + points) as Score;
    this.updateScoreDisplay();

    // 通知分屏管理器更新分数
    splitScreenManager.updateScore(this.playerId, this.score);

    // 发送分数变化事件
    this.events.emit('player:scoreChange', {
      playerId: this.playerId,
      score: this.score,
    });
  }

  /**
   * 更新分数显示
   */
  protected updateScoreDisplay(): void {
    if (this.scoreText) {
      this.scoreText.setText(`分数: ${this.score}`);
    }
  }

  /**
   * 结束游戏
   */
  protected endGame(): void {
    if (this.isGameEnded) return;
    this.isGameEnded = true;

    // 停止计时器
    if (this.gameTimer) {
      this.gameTimer.destroy();
      this.gameTimer = null;
    }

    LogUtil.log(`[SplitScreenScene] 玩家${this.playerId}游戏结束, 最终分数: ${this.score}`);

    // 发送游戏结束事件
    this.events.emit('player:gameEnd', {
      playerId: this.playerId,
      score: this.score,
    });
  }

  /**
   * 显示游戏结束提示
   */
  protected showGameEndMessage(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const endText = this.add.text(centerX, centerY, `⏱️ 时间到！\n最终分数: ${this.score}`, {
      font: `bold 36px Arial`,
      color: '#333333',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: { x: 30, y: 20 },
      stroke: '#333',
      strokeThickness: 3,
      align: 'center',
    });
    endText.setOrigin(0.5, 0.5);
    endText.setDepth(1000);

    // 添加缩放动画
    this.tweens.add({
      targets: endText,
      scale: { from: 0.5, to: 1.0 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.Out',
    });
  }

  /**
   * 子类实现：创建游戏逻辑
   */
  protected abstract createGame(): void;

  /**
   * 更新场景
   */
  public update(time: number, delta: number): void {
    // 子类可以重写此方法
  }

  /**
   * 销毁场景
   */
  public destroy(): void {
    if (this.gameTimer) {
      this.gameTimer.destroy();
      this.gameTimer = null;
    }

    super.destroy();
  }
}
