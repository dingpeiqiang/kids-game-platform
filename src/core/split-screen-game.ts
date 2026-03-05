import Phaser from 'phaser';
import { splitScreenManager, SplitScreenConfig } from './split-screen-manager';
import { gameEventBus } from './events/event-bus';
import { PlayerId, Score } from './events/game-events';

/**
 * 分屏游戏管理器
 * 管理两个独立的 Phaser 游戏实例
 */
export class SplitScreenGameManager {
  private games: Map<PlayerId, Phaser.Game> = new Map();
  private scores: Map<PlayerId, Score> = new Map();
  private isGameRunning: boolean = false;
  private gameEndedPlayers: Set<PlayerId> = new Set();

  /**
   * 启动分屏游戏
   */
  public async startGame(config: {
    gameId: string;
    player1Scene: any;
    player2Scene: any;
    direction: 'horizontal' | 'vertical';
    duration: number;
  }): Promise<void> {
    this.isGameRunning = true;
    this.gameEndedPlayers.clear();
    this.scores.clear();

    // 初始化分屏布局
    const splitScreenConfig: SplitScreenConfig = {
      playerCount: 2,
      gameId: config.gameId,
      direction: config.direction,
    };
    splitScreenManager.initialize(splitScreenConfig);

    console.log('[SplitScreenGameManager] 开始启动分屏游戏...');

    // 启动玩家1的游戏
    await this.startPlayerGame(1 as PlayerId, config.player1Scene, config);

    // 启动玩家2的游戏
    await this.startPlayerGame(2 as PlayerId, config.player2Scene, config);

    console.log('[SplitScreenGameManager] 分屏游戏启动完成');
  }

  /**
   * 启动单个玩家的游戏
   */
  private async startPlayerGame(
    playerId: PlayerId,
    sceneClass: any,
    config: any
  ): Promise<void> {
    const canvasContainer = splitScreenManager.getCanvasContainer(playerId);

    const gameConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: canvasContainer,
      width: canvasContainer.clientWidth,
      height: canvasContainer.clientHeight,
      backgroundColor: '#f0f0f0',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    // 创建游戏实例
    const game = new Phaser.Game(gameConfig);

    // 添加场景
    game.scene.add(`GameScene_${playerId}`, sceneClass, true, {
      playerId,
      direction: config.direction,
      duration: config.duration,
    });

    this.games.set(playerId, game);
    this.scores.set(playerId, 0 as Score);

    // 监听游戏结束事件
    game.events.on('ready', () => {
      const scene = game.scene.getScene(`GameScene_${playerId}`);
      if (scene) {
        scene.events.on('player:gameEnd', (data: any) => {
          this.onPlayerGameEnd(data.playerId, data.score);
        });
      }
    });

    // 注册到分屏管理器
    splitScreenManager.setGameInstance(playerId, game);

    console.log(`[SplitScreenGameManager] 玩家${playerId}的游戏已启动`);
  }

  /**
   * 处理玩家游戏结束
   */
  private onPlayerGameEnd(playerId: PlayerId, score: Score): void {
    this.scores.set(playerId, score);
    this.gameEndedPlayers.add(playerId);

    console.log(`[SplitScreenGameManager] 玩家${playerId}游戏结束, 分数: ${score}`);

    // 检查是否所有玩家都结束了
    if (this.gameEndedPlayers.size === 2) {
      this.onAllGamesEnd();
    }
  }

  /**
   * 所有游戏结束时的处理
   */
  private onAllGamesEnd(): void {
    this.isGameRunning = false;

    const player1Score = this.scores.get(1 as PlayerId) || 0;
    const player2Score = this.scores.get(2 as PlayerId) || 0;

    // 确定胜者
    let winner: any;
    if (player1Score > player2Score) {
      winner = { id: 1 as PlayerId, name: '玩家1' };
    } else if (player2Score > player1Score) {
      winner = { id: 2 as PlayerId, name: '玩家2' };
    }

    // 显示结果
    splitScreenManager.showResult(this.scores, winner);

    // 发送游戏结束事件
    gameEventBus.emit('game:end', {
      gameId: 'splitscreen-game',
      scores: this.scores,
      winner,
      isDraw: player1Score === player2Score,
    });

    console.log('[SplitScreenGameManager] 所有游戏结束, 显示结果');
  }

  /**
   * 重新开始游戏
   */
  public restartGame(config: {
    gameId: string;
    player1Scene: any;
    player2Scene: any;
    direction: 'horizontal' | 'vertical';
    duration: number;
  }): void {
    this.stopGame();
    this.startGame(config);
  }

  /**
   * 停止游戏
   */
  public stopGame(): void {
    this.games.forEach((game, playerId) => {
      game.destroy(true);
      console.log(`[SplitScreenGameManager] 玩家${playerId}的游戏已销毁`);
    });

    this.games.clear();
    this.scores.clear();
    this.gameEndedPlayers.clear();
    this.isGameRunning = false;

    // 清理分屏管理器
    splitScreenManager.clear();

    console.log('[SplitScreenGameManager] 分屏游戏已停止');
  }

  /**
   * 获取分数
   */
  public getScores(): Map<PlayerId, Score> {
    return new Map(this.scores);
  }

  /**
   * 检查游戏是否正在运行
   */
  public get running(): boolean {
    return this.isGameRunning;
  }
}

/** 全局分屏游戏管理器实例 */
export const splitScreenGameManager = new SplitScreenGameManager();
