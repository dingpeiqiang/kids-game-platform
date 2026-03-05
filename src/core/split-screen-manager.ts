/**
 * 分屏模式管理器
 * 支持两个玩家同时在不同屏幕上游戏
 */

import { Player, PlayerId, Score } from './events/game-events';

import { navigateTo } from '@/utils/path.util';

/**
 * 分屏配置
 */
export interface SplitScreenConfig {
  /** 玩家数量（固定为2） */
  playerCount: 2;
  /** 游戏ID */
  gameId: string;
  /** 分屏方向：水平或垂直 */
  direction: 'horizontal' | 'vertical';
}

/**
 * 分屏区域配置
 */
export interface SplitZone {
  playerId: PlayerId;
  container: HTMLElement;
  gameInstance: any; // Phaser.Scene实例
}

/**
 * 分屏管理器
 */
export class SplitScreenManager {
  private static instance: SplitScreenManager;

  private container: HTMLElement | null = null;
  private zones: Map<PlayerId, SplitZone> = new Map();
  private config: SplitScreenConfig | null = null;
  private isRunning: boolean = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): SplitScreenManager {
    if (!SplitScreenManager.instance) {
      SplitScreenManager.instance = new SplitScreenManager();
    }
    return SplitScreenManager.instance;
  }

  /**
   * 初始化分屏布局
   */
  public initialize(config: SplitScreenConfig): void {
    this.config = config;
    this.container = document.getElementById('game-container');

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'game-container';
      document.body.appendChild(this.container);
    }

    // 清空现有内容
    this.clear();

    // 创建分屏布局
    this.createSplitScreenLayout(config);
    this.isRunning = true;

    console.log(`[SplitScreenManager] 分屏初始化完成: ${config.direction}`);
  }

  /**
   * 创建分屏布局
   */
  private createSplitScreenLayout(config: SplitScreenConfig): void {
    if (!this.container) return;

    // 设置容器样式
    this.container.className = 'split-screen-container';
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.style.display = 'flex';
    this.container.style.margin = '0';
    this.container.style.padding = '0';
    this.container.style.overflow = 'hidden';

    // 根据方向设置布局
    if (config.direction === 'horizontal') {
      // 水平分屏：左右两个区域
      this.container.style.flexDirection = 'row';
    } else {
      // 垂直分屏：上下两个区域
      this.container.style.flexDirection = 'column';
    }

    // 创建两个玩家的区域
    for (let i = 1; i <= 2; i++) {
      const zone = this.createZone(i as PlayerId, config);
      this.zones.set(i as PlayerId, zone);
      this.container.appendChild(zone.container);
    }
  }

  /**
   * 创建单个玩家区域
   */
  private createZone(playerId: PlayerId, config: SplitScreenConfig): SplitZone {
    const container = document.createElement('div');
    container.className = `player-zone player-${playerId}`;
    container.style.flex = '1';
    container.style.position = 'relative';
    container.style.border = config.direction === 'horizontal' ? '2px solid #333' : '2px solid #333';
    container.style.margin = '0';
    container.style.padding = '0';

    // 添加玩家标签
    const playerLabel = document.createElement('div');
    playerLabel.className = 'player-label';
    playerLabel.textContent = `玩家${playerId}`;
    playerLabel.style.position = 'absolute';
    playerLabel.style.top = '10px';
    playerLabel.style.left = '10px';
    playerLabel.style.padding = '5px 15px';
    playerLabel.style.backgroundColor = playerId === 1 ? '#FF6B6B' : '#4A90E2';
    playerLabel.style.color = 'white';
    playerLabel.style.borderRadius = '5px';
    playerLabel.style.fontWeight = 'bold';
    playerLabel.style.fontSize = '16px';
    playerLabel.style.zIndex = '1000';

    // 添加分数显示
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = `score-display score-${playerId}`;
    scoreDisplay.textContent = '分数: 0';
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '10px';
    scoreDisplay.style.right = '10px';
    scoreDisplay.style.padding = '5px 15px';
    scoreDisplay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    scoreDisplay.style.borderRadius = '5px';
    scoreDisplay.style.fontWeight = 'bold';
    scoreDisplay.style.fontSize = '16px';
    scoreDisplay.style.zIndex = '1000';

    // 创建游戏画布容器
    const gameCanvas = document.createElement('div');
    gameCanvas.className = `game-canvas canvas-${playerId}`;
    gameCanvas.style.width = '100%';
    gameCanvas.style.height = '100%';
    gameCanvas.style.margin = '0';
    gameCanvas.style.padding = '0';
    gameCanvas.style.backgroundColor = '#f0f0f0';

    container.appendChild(playerLabel);
    container.appendChild(scoreDisplay);
    container.appendChild(gameCanvas);

    return {
      playerId,
      container,
      gameInstance: null,
    };
  }

  /**
   * 获取玩家的画布容器
   */
  public getCanvasContainer(playerId: PlayerId): HTMLElement {
    const zone = this.zones.get(playerId);
    if (!zone) {
      throw new Error(`Zone not found for player ${playerId}`);
    }

    const canvas = zone.container.querySelector(`.game-canvas.canvas-${playerId}`);
    if (!canvas) {
      throw new Error(`Canvas not found for player ${playerId}`);
    }

    return canvas as HTMLElement;
  }

  /**
   * 设置游戏实例
   */
  public setGameInstance(playerId: PlayerId, instance: any): void {
    const zone = this.zones.get(playerId);
    if (zone) {
      zone.gameInstance = instance;
      console.log(`[SplitScreenManager] 玩家${playerId}的游戏实例已设置`);
    }
  }

  /**
   * 更新分数
   */
  public updateScore(playerId: PlayerId, score: Score): void {
    const zone = this.zones.get(playerId);
    if (zone) {
      const scoreDisplay = zone.container.querySelector(`.score-display.score-${playerId}`);
      if (scoreDisplay) {
        (scoreDisplay as HTMLElement).textContent = `分数: ${score}`;
      }
    }
  }

  /**
   * 显示结果
   */
  public showResult(scores: Map<PlayerId, Score>, winner?: Player): void {
    const resultModal = document.createElement('div');
    resultModal.className = 'split-screen-result-modal';
    resultModal.style.position = 'fixed';
    resultModal.style.top = '0';
    resultModal.style.left = '0';
    resultModal.style.width = '100%';
    resultModal.style.height = '100%';
    resultModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    resultModal.style.display = 'flex';
    resultModal.style.justifyContent = 'center';
    resultModal.style.alignItems = 'center';
    resultModal.style.zIndex = '9999';

    const resultContent = document.createElement('div');
    resultContent.style.backgroundColor = 'white';
    resultContent.style.padding = '40px';
    resultContent.style.borderRadius = '10px';
    resultContent.style.textAlign = 'center';
    resultContent.style.maxWidth = '500px';

    let resultText = '';
    if (scores.get(1) === scores.get(2)) {
      resultText = '🤝 平局！';
    } else if (winner) {
      resultText = `🎉 ${winner.name} 获胜！`;
    }

    resultContent.innerHTML = `
      <h2 style="margin-bottom: 20px; font-size: 32px;">${resultText}</h2>
      <div style="font-size: 24px; margin-bottom: 20px;">
        <div style="color: #FF6B6B;">玩家1: ${scores.get(1)}</div>
        <div style="color: #4A90E2;">玩家2: ${scores.get(2)}</div>
      </div>
      <button id="restart-btn" style="
        padding: 12px 24px;
        font-size: 18px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
      ">再来一局</button>
      <button id="home-btn" style="
        padding: 12px 24px;
        font-size: 18px;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
      ">返回主页</button>
    `;

    resultModal.appendChild(resultContent);
    document.body.appendChild(resultModal);

    // 绑定按钮事件
    const restartBtn = resultModal.querySelector('#restart-btn');
    restartBtn?.addEventListener('click', () => {
      resultModal.remove();
      window.dispatchEvent(new CustomEvent('game:requestRestart'));
    });

    const homeBtn = resultModal.querySelector('#home-btn');
    homeBtn?.addEventListener('click', () => {
      resultModal.remove();
      navigateTo('/');
    });
  }

  /**
   * 清理分屏
   */
  public clear(): void {
    this.zones.clear();
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.isRunning = false;
    this.config = null;
  }

  /**
   * 是否正在运行
   */
  public get running(): boolean {
    return this.isRunning;
  }
}

/** 全局分屏管理器实例 */
export const splitScreenManager = SplitScreenManager.getInstance();
