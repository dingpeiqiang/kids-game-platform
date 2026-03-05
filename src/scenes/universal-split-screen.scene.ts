/**
 * 通用双屏对战场景
 * 任何单人游戏都可以通过此场景实现双屏对战
 * 无需为每个游戏单独创建双屏版本
 */

import Phaser from 'phaser';
import { dualScreenAdapter } from '../core/dual-screen-adapter';
import { sceneRegistry } from '../core/scene-registry';
import { getGameInfo } from '../config/game-id-mapping';

import { navigateTo } from '@/utils/path.util';

/**
 * 通用双屏对战场景
 */
export class UniversalSplitScreenScene extends Phaser.Scene {
  /** 游戏ID */
  private gameId: string = '';

  /** 玩家1名称 */
  private player1Name: string = '玩家1';

  /** 玩家2名称 */
  private player2Name: string = '玩家2';

  /** 游戏时长 */
  private duration: number = 60;

  /** 分屏方向 */
  private direction: 'horizontal' | 'vertical' = 'horizontal';

  constructor() {
    super('UniversalSplitScreenScene');
  }

  /**
   * 初始化场景
   */
  public init(data: {
    gameId: string;
    player1Name?: string;
    player2Name?: string;
    duration?: number;
    direction?: 'horizontal' | 'vertical';
  }): void {
    this.gameId = data.gameId;
    this.player1Name = data.player1Name || '玩家1';
    this.player2Name = data.player2Name || '玩家2';
    this.duration = data.duration || 60;
    this.direction = data.direction || 'horizontal';

    console.log('[UniversalSplitScreenScene] 初始化:', data);
  }

  /**
   * 创建场景
   */
  public create(): void {
    console.log('[UniversalSplitScreenScene] 创建场景');

    // 清空背景
    this.cameras.main.setBackgroundColor('#000000');

    // 获取原始场景类
    const originalSceneClass = this.getOriginalSceneClass(this.gameId);

    if (!originalSceneClass) {
      console.error('[UniversalSplitScreenScene] 未找到游戏场景类:', this.gameId);
      this.showSceneNotFound();
      return;
    }

    // 启动双屏适配器
    dualScreenAdapter.startGame({
      gameId: this.gameId,
      originalSceneClass,
      duration: this.duration,
      direction: this.direction,
      player1Name: this.player1Name,
      player2Name: this.player2Name,
    });

    // 监听重新开始事件
    window.addEventListener('game:requestRestart', this.handleRestartRequest);
  }

  /**
   * 获取原始场景类
   */
  private getOriginalSceneClass(gameId: string): typeof Phaser.Scene | null {
    // 使用配置文件获取场景键名
    const gameInfo = getGameInfo(gameId);
    if (!gameInfo) {
      console.error('[UniversalSplitScreenScene] 未找到游戏信息:', gameId);
      return null;
    }

    // 从场景注册表中获取场景类
    return sceneRegistry.getSceneClass(gameInfo.sceneKey) || null;
  }

  /**
   * 显示场景未找到错误
   */
  private showSceneNotFound(): void {
    const errorText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      '未找到游戏场景！\n请检查游戏ID是否正确。',
      {
        fontSize: '32px',
        color: '#FF0000',
        align: 'center',
      }
    );
    errorText.setOrigin(0.5);

    const backBtn = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2 + 100,
      200,
      50,
      0x4A90E2
    );
    backBtn.setInteractive({ useHandCursor: true });

    const backText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 100,
      '返回主页',
      {
        fontSize: '20px',
        color: '#FFFFFF',
      }
    );
    backText.setOrigin(0.5);

    backBtn.on('pointerdown', () => {
      navigateTo('/');
    });
  }

  /**
   * 处理重新开始请求
   */
  private handleRestartRequest = (): void => {
    console.log('[UniversalSplitScreenScene] 收到重新开始请求');
    dualScreenAdapter.restartGame();
  };

  /**
   * 场景关闭时清理
   */
  public shutdown(): void {
    console.log('[UniversalSplitScreenScene] 场景关闭');

    // 移除事件监听
    window.removeEventListener('game:requestRestart', this.handleRestartRequest);

    // 清理双屏适配器
    dualScreenAdapter.cleanup();
  }
}
