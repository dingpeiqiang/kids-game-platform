import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { SCENE_NAMES } from '@/config/constant';

/**
 * 颜色配对游戏结果场景
 */
export class ResultScene extends BaseScene {
  private finalScore: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private messageText?: Phaser.GameObjects.Text;
  private restartButton?: Phaser.GameObjects.Text;
  private backButton?: Phaser.GameObjects.Text;

  constructor() {
    super('ColorGameResultScene');
  }

  public create(): void {
    LogUtil.log('ColorGameResultScene: 创建场景');
    this.cameras.main.setBackgroundColor('#FFF9E6');
    this.createTitle();
    this.createScore();
    this.createMessage();
    this.createButtons();
    this.events.on('shutdown', this.shutdown.bind(this));
  }

  private createTitle(): void {
    const centerX = this.scale.width / 2;
    const title = this.add.text(centerX, 180, '游戏结束', {
      font: 'bold 56px Arial',
      color: '#333333',
    });
    title.setOrigin(0.5, 0.5);
  }

  private createScore(): void {
    const centerX = this.scale.width / 2;
    this.scoreText = this.add.text(centerX, 300, `你的分数: ${this.finalScore}`, {
      font: 'bold 48px Arial',
      fill: '#333333',
    });
    this.scoreText.setOrigin(0.5, 0.5);
  }

  private createMessage(): void {
    const centerX = this.scale.width / 2;
    const message = this.getEncouragementMessage();
    this.messageText = this.add.text(centerX, 380, message, {
      font: '32px Arial',
      color: '#333333',
      align: 'center',
    });
    this.messageText.setOrigin(0.5, 0.5);
  }

  private getEncouragementMessage(): string {
    if (this.finalScore >= 100) {
      return '太棒了！你是色彩小天才！🎨';
    } else if (this.finalScore >= 50) {
      return '做得很好！继续加油！✨';
    } else {
      return '没关系，再试一次！你可以的！😊';
    }
  }

  private createButtons(): void {
    const centerX = this.scale.width / 2;

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

  private restartGame(): void {
    LogUtil.log('ColorGameResultScene: 重新开始游戏');
    this.scene.start('ColorGameScene');
  }

  private backToHome(): void {
    LogUtil.log('ColorGameResultScene: 返回首页');
    window.location.href = '/';
  }

  public setScore(score: number): void {
    this.finalScore = score;
  }

  public shutdown(): void {
    if (this.restartButton) {
      this.restartButton.destroy();
    }
    if (this.backButton) {
      this.backButton.destroy();
    }
  }
}
