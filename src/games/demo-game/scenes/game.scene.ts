import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { SafeUtil } from '@/utils/safe.util';
import { SAFE_RULES } from '@/config/constant';
import { AuthUtil } from '@/utils/auth.util';

import { navigateTo } from '@/utils/path.util';

/**
 * 示例游戏主场景（数字拼图）
 * 儿童友好：简单的点击操作、友好反馈
 */
export class GameScene extends BaseScene {
  private score: number = 0;
  private targetNumber: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private questionText?: Phaser.GameObjects.Text;
  private backButton?: Phaser.GameObjects.Text;
  private buttons: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('DemoGameScene');
  }

  /**
   * 创建游戏场景
   */
  public create(): void {
    LogUtil.log('GameScene: 创建场景');

    // 验证登录状态
    if (!AuthUtil.checkLoginStatus(this)) {
      return;
    }

    // 设置背景色（儿童友好的柔和颜色）
    this.cameras.main.setBackgroundColor('#4A90E2');

    // 创建UI元素
    this.createScore();
    this.createBackButton();
    this.createQuestion();
    this.createButtons();

    // 生成第一道题
    this.generateQuestion();

    // 监听全局事件
    this.events.on('shutdown', this.shutdown.bind(this));
  }

  /**
   * 创建分数显示
   */
  private createScore(): void {
    this.scoreText = this.add.text(20, 20, '分数: 0', {
      font: 'bold 28px Arial',
      color: '#ffffff',
    });
  }

  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    const rightX = this.scale.width - 20;
    this.backButton = this.add.text(rightX, 30, '← 首页', {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.3)',
      padding: { x: 20, y: 10 },
    });
    this.backButton.setOrigin(1, 0.5);
    this.backButton.setInteractive({ useHandCursor: true });

    this.backButton.on('pointerdown', () => {
      LogUtil.log('GameScene: 返回首页');
      navigateTo('/');
    });

    this.backButton.on('pointerover', () => {
      this.backButton?.setStyle({ backgroundColor: 'rgba(255,255,255,0.5)' });
    });

    this.backButton.on('pointerout', () => {
      this.backButton?.setStyle({ backgroundColor: 'rgba(255,255,255,0.3)' });
    });
  }

  /**
   * 创建问题显示
   */
  private createQuestion(): void {
    const centerX = this.scale.width / 2;
    this.questionText = this.add.text(centerX, 250, '', {
      font: 'bold 52px Arial',
      color: '#ffffff',
    });
    this.questionText.setOrigin(0.5, 0.5);
  }

  /**
   * 创建选项按钮
   */
  private createButtons(): void {
    const centerX = this.scale.width / 2;
    const buttonLabels = ['A', 'B', 'C', 'D'];
    const startX = centerX - 225;
    const startY = 500;
    const gap = 150;

    buttonLabels.forEach((label, index) => {
      const button = this.add.text(startX + index * gap, startY, label, {
        font: 'bold 40px Arial',
        fill: '#ffffff',
        backgroundColor: '#FF6B6B',
        padding: { x: 25, y: 20 },
        fixedWidth: 100,
        align: 'center',
      });
      button.setOrigin(0.5, 0.5);
      button.setInteractive({ useHandCursor: true });

      button.on('pointerdown', () => this.handleAnswer(index));
      button.on('pointerover', () => button.setStyle({ backgroundColor: '#FF8787' }));
      button.on('pointerout', () => button.setStyle({ backgroundColor: '#FF6B6B' }));

      this.buttons.push(button);
    });
  }

  /**
   * 生成新问题
   */
  private generateQuestion(): void {
    // 生成1-10的数字（儿童友好）
    this.targetNumber = Math.floor(Math.random() * 10) + 1;

    // 显示问题
    if (this.questionText) {
      this.questionText.setText(`找到数字: ${this.targetNumber}`);
    }

    // 更新按钮选项（简化：直接显示数字）
    const options = this.generateOptions(this.targetNumber);
    this.buttons.forEach((button, index) => {
      button.setText(`${options[index]}`);
    });
  }

  /**
   * 生成选项（包含一个正确答案和三个错误答案）
   */
  private generateOptions(correct: number): number[] {
    const options = [correct];
    while (options.length < 4) {
      const num = Math.floor(Math.random() * 10) + 1;
      if (!options.includes(num)) {
        options.push(num);
      }
    }
    // 打乱顺序
    return options.sort(() => Math.random() - 0.5);
  }

  /**
   * 处理用户答案
   */
  private handleAnswer(buttonIndex: number): void {
    const selectedNumber = parseInt(this.buttons[buttonIndex].text, 10);
    const isCorrect = selectedNumber === this.targetNumber;

    if (isCorrect) {
      this.score = SafeUtil.clampNumber(this.score + 10);
      if (this.scoreText) {
        this.scoreText.setText(`分数: ${this.score}`);
      }
      LogUtil.log('GameScene: 答对了！', this.score);

      // 下一题
      this.time.delayedCall(500, () => this.generateQuestion());
    } else {
      LogUtil.log('GameScene: 答错了');
      // 显示错误反馈
      this.showFeedback('再试一次哦～');
    }
  }

  /**
   * 显示反馈消息
   */
  private showFeedback(message: string): void {
    const centerX = this.scale.width / 2;
    const feedback = this.add.text(centerX, 400, message, {
      font: 'bold 36px Arial',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 20, y: 10 },
    });
    feedback.setOrigin(0.5, 0.5);

    this.time.delayedCall(1000, () => feedback.destroy());
  }

  /**
   * 场景更新
   */
  public update(_time: number, _delta: number): void {
    // 游戏逻辑更新
  }

  /**
   * 场景销毁
   */
  public shutdown(): void {
    this.buttons.forEach((button) => button.destroy());
    this.buttons = [];
  }
}
