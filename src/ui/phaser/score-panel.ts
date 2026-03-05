/**
 * Phaser 分数面板组件
 * 统一的分数显示实现，支持单人和多人模式
 */

import Phaser from 'phaser';

/** 分数面板选项 */
export interface ScorePanelOptions {
  /** 玩家ID */
  playerId?: number;
  /** 玩家名称 */
  playerName?: string;
  /** 玩家颜色 */
  playerColor?: string;
  /** 是否显示玩家名称 */
  showName?: boolean;
  /** 字体大小 */
  fontSize?: number;
  /** 显示位置 */
  position?: 'left' | 'right' | 'center';
}

/**
 * 统一分数面板组件
 */
export class ScorePanel extends Phaser.GameObjects.Container {
  private scoreText!: Phaser.GameObjects.Text;
  private nameText?: Phaser.GameObjects.Text;
  private indicator?: Phaser.GameObjects.Text;

  private score = 0;
  private playerId: number;
  private playerName: string;
  private playerColor: string;
  private isActive = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: ScorePanelOptions = {}
  ) {
    super(scene, x, y);

    const {
      playerId = 1,
      playerName = '玩家',
      playerColor = '#333333',
      showName = true,
      fontSize = 28,
      position = 'left',
    } = options;

    this.playerId = playerId;
    this.playerName = playerName;
    this.playerColor = playerColor;

    // 创建名称文本
    if (showName) {
      const nameX = position === 'right' ? -50 : position === 'center' ? 0 : 50;
      this.nameText = scene.add.text(nameX, 0, playerName, {
        font: `bold ${fontSize}px Arial`,
        color: playerColor,
      });
      this.nameText.setOrigin(position === 'right' ? 1 : position === 'center' ? 0.5 : 0, 0.5);
      this.add(this.nameText);
    }

    // 创建分数文本
    const scoreX = position === 'right' ? -50 : position === 'center' ? 0 : 50;
    const scoreY = showName ? fontSize + 10 : 0;
    this.scoreText = scene.add.text(scoreX, scoreY, '0', {
      font: `bold ${fontSize * 1.5}px Arial`,
      color: playerColor,
    });
    this.scoreText.setOrigin(position === 'right' ? 1 : position === 'center' ? 0.5 : 0, 0.5);
    this.add(this.scoreText);

    scene.add.existing(this);
  }

  /**
   * 设置分数
   */
  setScore(score: number): this {
    this.score = score;
    this.scoreText.setText(score.toString());
    return this;
  }

  /**
   * 增加分数
   */
  addScore(points: number): this {
    this.setScore(Math.max(0, this.score + points));
    return this;
  }

  /**
   * 获取当前分数
   */
  getScore(): number {
    return this.score;
  }

  /**
   * 设置活跃状态
   */
  setActive(active: boolean): this {
    this.isActive = active;

    if (active) {
      // 创建或显示指示器
      if (!this.indicator) {
        this.indicator = this.scene.add.text(-30, 0, '👤', {
          font: '24px Arial',
        });
        this.indicator.setOrigin(0.5, 0.5);
        this.add(this.indicator);

        // 闪烁动画
        this.scene.tweens.add({
          targets: this.indicator,
          alpha: { from: 1, to: 0.3 },
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
      } else {
        this.indicator.setVisible(true);
      }

      // 高亮效果
      this.setScale(1.1);
    } else {
      // 隐藏指示器
      if (this.indicator) {
        this.indicator.setVisible(false);
      }
      // 取消高亮
      this.setScale(1);
    }

    return this;
  }

  /**
   * 更新玩家信息
   */
  updatePlayerInfo(name: string, color: string): this {
    this.playerName = name;
    this.playerColor = color;

    if (this.nameText) {
      this.nameText.setText(name);
      this.nameText.setColor(color);
    }

    this.scoreText.setColor(color);

    return this;
  }

  /**
   * 获取玩家ID
   */
  getPlayerId(): number {
    return this.playerId;
  }
}

/**
 * 多人分数面板管理器
 */
export class ScorePanelManager extends Phaser.GameObjects.Container {
  private panels: Map<number, ScorePanel> = new Map();

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
  }

  /**
   * 创建分数面板
   */
  createPanel(playerId: number, options: ScorePanelOptions): ScorePanel {
    // 移除已存在的面板
    if (this.panels.has(playerId)) {
      this.panels.get(playerId)?.destroy();
    }

    const panel = new ScorePanel(this.scene, 0, 0, {
      ...options,
      playerId,
    });

    this.panels.set(playerId, panel);
    this.add(panel);

    return panel;
  }

  /**
   * 布局所有面板
   */
  layoutPanels(position: 'horizontal' | 'vertical' = 'horizontal'): void {
    const panels = Array.from(this.panels.values());
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;
    const padding = 20;

    if (position === 'horizontal') {
      const totalWidth = panels.reduce((sum, p) => sum + p.width, 0) + padding * (panels.length - 1);
      let currentX = (screenWidth - totalWidth) / 2;

      panels.forEach((panel) => {
        panel.setPosition(currentX, padding);
        currentX += panel.width + padding;
      });
    } else {
      const totalHeight = panels.reduce((sum, p) => sum + p.height, 0) + padding * (panels.length - 1);
      let currentY = (screenHeight - totalHeight) / 2;

      panels.forEach((panel) => {
        panel.setPosition(padding, currentY);
        currentY += panel.height + padding;
      });
    }
  }

  /**
   * 更新分数
   */
  updateScore(playerId: number, score: number): void {
    const panel = this.panels.get(playerId);
    if (panel) {
      panel.setScore(score);
    }
  }

  /**
   * 设置活跃玩家
   */
  setActivePlayer(playerId: number): void {
    this.panels.forEach((panel, id) => {
      panel.setActive(id === playerId);
    });
  }

  /**
   * 获取面板
   */
  getPanel(playerId: number): ScorePanel | undefined {
    return this.panels.get(playerId);
  }

  /**
   * 获取所有面板
   */
  getAllPanels(): ScorePanel[] {
    return Array.from(this.panels.values());
  }

  /**
   * 销毁所有面板
   */
  destroyAll(): void {
    this.panels.forEach((panel) => panel.destroy());
    this.panels.clear();
  }
}
