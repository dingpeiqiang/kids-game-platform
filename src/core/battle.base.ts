import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { DeviceUtil } from '@/utils/device.util';

/**
 * 对战模式类型
 */
export enum BattleMode {
  SINGLE = 'single', // 单人模式
  BATTLE = 'battle', // 双人对战
}

/**
 * 玩家信息
 */
export interface Player {
  id: number;
  name: string;
  score: number;
  color: string;
  isActive: boolean;
}

/**
 * 对战基础场景
 * 提供双人对战的通用逻辑
 */
export abstract class BaseBattleScene extends BaseScene {
  /** 对战模式 */
  protected battleMode: BattleMode = BattleMode.SINGLE;

  /** 玩家1 */
  protected player1: Player = {
    id: 1,
    name: '玩家1',
    score: 0,
    color: '#FF6B6B',
    isActive: true,
  };

  /** 玩家2 */
  protected player2: Player = {
    id: 2,
    name: '玩家2',
    score: 0,
    color: '#4A90E2',
    isActive: false,
  };

  /** 当前活跃玩家 */
  protected currentPlayer: Player = this.player1;

  /** 是否为对战模式 */
  protected get isBattleMode(): boolean {
    return this.battleMode === BattleMode.BATTLE;
  }

  /**
   * 设置对战模式
   */
  public setBattleMode(mode: BattleMode): void {
    this.battleMode = mode;
    if (mode === BattleMode.BATTLE) {
      this.player2.isActive = false;
    }
  }

  /**
   * 切换玩家（对战模式）
   */
  protected switchPlayer(): void {
    if (!this.isBattleMode) return;

    // 切换当前玩家
    if (this.currentPlayer.id === 1) {
      this.currentPlayer = this.player2;
      this.player1.isActive = false;
      this.player2.isActive = true;
    } else {
      this.currentPlayer = this.player1;
      this.player1.isActive = true;
      this.player2.isActive = false;
    }

    LogUtil.log(`BaseBattleScene: 切换到 ${this.currentPlayer.name}`);

    // 显示切换提示
    this.showPlayerSwitchEffect();
  }

  /**
   * 显示玩家切换效果
   */
  protected showPlayerSwitchEffect(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const switchText = this.add.text(centerX, centerY, `🔄 ${this.currentPlayer.name} 的回合！`, {
      font: `bold ${DeviceUtil.getOptimalFontSize(48)}px Arial`,
      fill: this.currentPlayer.color,
      backgroundColor: 'rgba(255,255,255,0.95)',
      padding: { x: DeviceUtil.getOptimalFontSize(40), y: DeviceUtil.getOptimalFontSize(20) },
    });
    switchText.setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: switchText,
      scale: { from: 0.5, to: 1.2 },
      alpha: { from: 1, to: 0 },
      duration: 1200,
      ease: 'Quad.Out',
      onComplete: () => switchText.destroy(),
    });
  }

  /**
   * 添加分数
   */
  protected addScore(points: number): void {
    this.currentPlayer.score = Math.max(0, this.currentPlayer.score + points);
    this.updateScoreDisplay();
  }

  /**
   * 更新分数显示
   */
  protected abstract updateScoreDisplay(): void;

  /**
   * 获取对战结果
   */
  protected getBattleResult(): { winner: Player | null; isDraw: boolean } {
    if (this.player1.score > this.player2.score) {
      return { winner: this.player1, isDraw: false };
    } else if (this.player2.score > this.player1.score) {
      return { winner: this.player2, isDraw: false };
    }
    return { winner: null, isDraw: true };
  }

  /**
   * 创建双人分数面板
   */
  protected createBattleScorePanel(): void {
    const padding = DeviceUtil.getOptimalFontSize(20);
    const fontSize = DeviceUtil.getOptimalFontSize(28);

    // 玩家1分数（左上）
    this.player1.scoreText = this.add.text(padding, padding, `${this.player1.name}: 0`, {
      font: `bold ${fontSize}px Arial`,
      fill: this.player1.color,
    });

    // 玩家2分数（右上）
    this.player2.scoreText = this.add.text(this.scale.width - padding, padding, `${this.player2.name}: 0`, {
      font: `bold ${fontSize}px Arial`,
      fill: this.player2.color,
    });
    this.player2.scoreText.setOrigin(1, 0);

    // 更新活跃玩家指示
    this.updateActivePlayerIndicator();
  }

  /**
   * 更新活跃玩家指示
   */
  protected updateActivePlayerIndicator(): void {
    if (!this.isBattleMode) return;

    // 移除旧的指示器
    if (this.player1.indicator) {
      this.player1.indicator.destroy();
      this.player1.indicator = undefined;
    }
    if (this.player2.indicator) {
      this.player2.indicator.destroy();
      this.player2.indicator = undefined;
    }

    // 为活跃玩家添加指示器
    const activePlayer = this.currentPlayer;
    const padding = DeviceUtil.getOptimalFontSize(20);

    const indicator = this.add.text(
      activePlayer.id === 1 ? padding + 150 : this.scale.width - padding - 150,
      padding + fontSize / 2,
      '👤',
      {
        font: `${DeviceUtil.getOptimalFontSize(24)}px Arial`,
      }
    );
    indicator.setOrigin(0.5, 0.5);

    // 添加闪烁动画
    this.tweens.add({
      targets: indicator,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    if (activePlayer.id === 1) {
      this.player1.indicator = indicator;
    } else {
      this.player2.indicator = indicator;
    }
  }
}

/**
 * 扩展 Player 接口添加额外属性
 */
declare module '@/core/battle.base' {
  interface Player {
    scoreText?: Phaser.GameObjects.Text;
    indicator?: Phaser.GameObjects.Text;
  }
}
