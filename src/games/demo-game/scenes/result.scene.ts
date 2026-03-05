import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';

/**
 * 示例游戏结果场景（游戏结束）
 * 儿童友好：鼓励性的反馈、简单的操作
 */
export class ResultScene extends BaseScene {
  private finalScore: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private messageText?: Phaser.GameObjects.Text;
  private restartButton?: Phaser.GameObjects.Text;
  private backButton?: Phaser.GameObjects.Text;

  constructor() {
    super('DemoResultScene');
  }

  /**
   * 创建结果场景
   */
  public create(): void {
    LogUtil.log('ResultScene: 创建场景');

    // 设置背景色（儿童友好的柔和颜色）
    this.cameras.main.setBackgroundColor('#FFD93D');

    // 创建UI元素
    this.createTitle();
    this.createScore();
    this.createMessage();
    this.createButtons();

    // 监听全局事件
    this.events.on('shutdown', this.shutdown.bind(this));
  }

  /**
   * 创建标题
   */
  private createTitle(): void {
    const centerX = this.scale.width / 2;
    const title = this.add.text(centerX, 180, '游戏结束', {
      font: 'bold 56px Arial',
      color: '#ffffff',
    });
    title.setOrigin(0.5, 0.5);
  }

  /**
   * 创建分数显示
   */
  private createScore(): void {
    const centerX = this.scale.width / 2;
    this.scoreText = this.add.text(centerX, 300, `你的分数: ${this.finalScore}`, {
      font: 'bold 48px Arial',
      color: '#ffffff',
    });
    this.scoreText.setOrigin(0.5, 0.5);
  }

  /**
   * 创建鼓励消息
   */
  private createMessage(): void {
    const centerX = this.scale.width / 2;
    const message = this.getEncouragementMessage();
    this.messageText = this.add.text(centerX, 380, message, {
      font: '32px Arial',
      color: '#ffffff',
      align: 'center',
    });
    this.messageText.setOrigin(0.5, 0.5);
  }

  /**
   * 获取鼓励消息
   */
  private getEncouragementMessage(): string {
    if (this.finalScore >= 100) {
      return '太棒了！你是数学小天才！🌟';
    } else if (this.finalScore >= 50) {
      return '做得很好！继续加油！💪';
    } else {
      return '没关系，再试一次！你可以的！😊';
    }
  }

  /**
   * 创建按钮组
   */
  private createButtons(): void {
    const centerX = this.scale.width / 2;

    // 重新开始按钮
    this.restartButton = this.add.text(centerX - 120, 550, '再玩一次', {
      font: 'bold 36px Arial',
      color: '#ffffff',
      backgroundColor: '#4ECDC4',
      padding: { x: 30, y: 20 },
    });
    this.restartButton.setOrigin(0.5, 0.5);
    this.restartButton.setInteractive({ useHandCursor: true });

    this.restartButton.on('pointerdown', () => this.restartGame());
    this.restartButton.on('pointerover', () => this.restartButton?.setStyle({ backgroundColor: '#6EDDD4' }));
    this.restartButton.on('pointerout', () => this.restartButton?.setStyle({ backgroundColor: '#4ECDC4' }));

    // 返回首页按钮
    this.backButton = this.add.text(centerX + 120, 550, '← 首页', {
      font: 'bold 36px Arial',
      color: '#ffffff',
      backgroundColor: '#FF6B6B',
      padding: { x: 30, y: 20 },
    });
    this.backButton.setOrigin(0.5, 0.5);
    this.backButton.setInteractive({ useHandCursor: true });

    this.backButton.on('pointerdown', () => this.backToHome());
    this.backButton.on('pointerover', () => this.backButton?.setStyle({ backgroundColor: '#FF8787' }));
    this.backButton.on('pointerout', () => this.backButton?.setStyle({ backgroundColor: '#FF6B6B' }));
  }

  /**
   * 重新开始游戏
   */
  private restartGame(): void {
    LogUtil.log('ResultScene: 重新开始游戏');
    this.scene.start('DemoGameScene');
  }

  /**
   * 返回首页
   */
  private backToHome(): void {
    LogUtil.log('ResultScene: 返回首页');
    window.location.href = '/';
  }

  /**
   * 设置最终分数
   */
  public setScore(score: number): void {
    this.finalScore = score;
  }

  /**
   * 场景销毁
   */
  public shutdown(): void {
    if (this.restartButton) {
      this.restartButton.destroy();
    }
    if (this.backButton) {
      this.backButton.destroy();
    }
  }
}
