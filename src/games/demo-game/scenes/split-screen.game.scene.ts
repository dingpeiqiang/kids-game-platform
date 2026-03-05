import { SplitScreenScene, SplitScreenGameConfig } from '@/core/split-screen.scene';
import { LogUtil } from '@/utils/log.util';

/**
 * 数字拼图游戏 - 分屏模式场景
 * 支持两个玩家同时在各自的屏幕上游戏
 */
export class DemoGameSplitScreenScene extends SplitScreenScene {
  /** 目标数字 */
  private targetNumber: number = 0;

  /** 选项按钮 */
  private optionButtons: Phaser.GameObjects.Text[] = [];

  /** 当前题目文本 */
  private questionText?: Phaser.GameObjects.Text;

  /**
   * 创建游戏逻辑
   */
  protected createGame(): void {
    // 创建问题显示
    this.createQuestionDisplay();

    // 创建选项按钮
    this.createOptionButtons();

    // 生成第一道题
    this.generateNewQuestion();

    LogUtil.log(`[DemoGameSplitScreenScene] 玩家${this.playerId}游戏逻辑创建完成`);
  }

  /**
   * 创建问题显示
   */
  private createQuestionDisplay(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.3;

    // 提示文字
    const hint = this.add.text(0, -60, '找到这个数字', {
      font: 'bold 24px Arial',
      color: '#333333',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: { x: 15, y: 10 },
      stroke: '#333',
      strokeThickness: 2,
    });
    hint.setOrigin(0.5, 0.5);

    // 目标数字显示
    this.questionText = this.add.text(0, 0, '', {
      font: 'bold 72px Arial',
      color: '#4A90E2',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: { x: 30, y: 20 },
      stroke: '#333',
      strokeThickness: 3,
    });
    this.questionText.setOrigin(0.5, 0.5);

    const container = this.add.container(centerX, centerY);
    container.add([hint, this.questionText]);
  }

  /**
   * 创建选项按钮
   */
  private createOptionButtons(): void {
    const centerX = this.scale.width / 2;
    const startY = this.scale.height * 0.6;
    const buttonSize = 80;
    const gap = 20;

    // 计算布局
    const cols = 4;
    const totalWidth = cols * buttonSize + (cols - 1) * gap;
    const startX = (this.scale.width - totalWidth) / 2 + buttonSize / 2;

    // 创建4个选项按钮
    for (let i = 0; i < 4; i++) {
      const x = startX + i * (buttonSize + gap);
      const y = startY;

      const button = this.add.text(x, y, '', {
        font: 'bold 40px Arial',
        color: '#ffffff',
        backgroundColor: '#FF6B6B',
        padding: { x: 20, y: 15 },
        fixedWidth: buttonSize,
        align: 'center',
        stroke: '#333',
        strokeThickness: 2,
      });
      button.setOrigin(0.5, 0.5);
      button.setInteractive({ useHandCursor: true });
      button.setData('index', i);

      button.on('pointerdown', () => this.handleAnswer(button));

      button.on('pointerover', () => {
        this.tweens.add({
          targets: button,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150,
        });
        button.setStyle({ backgroundColor: '#FF8787' });
      });

      button.on('pointerout', () => {
        this.tweens.add({
          targets: button,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 150,
        });
        button.setStyle({ backgroundColor: '#FF6B6B' });
      });

      this.optionButtons.push(button);
    }
  }

  /**
   * 生成新问题
   */
  private generateNewQuestion(): void {
    // 生成1-10的随机数字
    this.targetNumber = Math.floor(Math.random() * 10) + 1;

    // 更新问题显示
    if (this.questionText) {
      this.questionText.setText(this.targetNumber.toString());

      // 添加弹跳动画
      this.tweens.add({
        targets: this.questionText,
        scale: { from: 0.5, to: 1 },
        duration: 300,
        ease: 'Back.Out',
      });
    }

    // 更新选项按钮
    const options = this.generateOptions();
    this.optionButtons.forEach((button, index) => {
      button.setText(options[index].toString());
    });
  }

  /**
   * 生成选项（包含一个正确答案和三个错误答案）
   */
  private generateOptions(): number[] {
    const options = [this.targetNumber];
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
   * 处理答案
   */
  private handleAnswer(button: Phaser.GameObjects.Text): void {
    if (this.isGameEnded) return;

    const selectedNumber = parseInt(button.text, 10);
    const isCorrect = selectedNumber === this.targetNumber;

    if (isCorrect) {
      // 答对了
      this.handleCorrectAnswer(button);
    } else {
      // 答错了
      this.handleWrongAnswer(button);
    }
  }

  /**
   * 处理正确答案
   */
  private handleCorrectAnswer(button: Phaser.GameObjects.Text): void {
    // 加分
    this.addScore(10);

    // 显示正确反馈
    this.showFeedback('正确！+10分', '#4CAF50');

    // 正确动画
    this.tweens.add({
      targets: button,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true,
      ease: 'Back.Out',
    });

    // 生成新问题
    this.generateNewQuestion();
  }

  /**
   * 处理错误答案
   */
  private handleWrongAnswer(button: Phaser.GameObjects.Text): void {
    // 显示错误反馈
    this.showFeedback('错误！', '#F44336');

    // 错误震动动画
    this.tweens.add({
      targets: button,
      x: button.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
    });

    // 扣分
    this.addScore(-5);
  }

  /**
   * 显示反馈文字
   */
  private showFeedback(message: string, color: string): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.75;

    const feedback = this.add.text(centerX, centerY, message, {
      font: 'bold 32px Arial',
      color: color,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: { x: 20, y: 12 },
      stroke: '#333',
      strokeThickness: 3,
    });
    feedback.setOrigin(0.5, 0.5);
    feedback.setDepth(1000);

    // 淡出动画
    this.tweens.add({
      targets: feedback,
      alpha: 0,
      y: centerY - 50,
      duration: 1000,
      ease: 'Quad.Out',
      onComplete: () => feedback.destroy(),
    });
  }

  /**
   * 结束游戏
   */
  protected endGame(): void {
    super.endGame();

    // 停止所有动画
    this.tweens.killAll();

    // 显示游戏结束消息
    this.showGameEndMessage();
  }

  /**
   * 更新场景
   */
  public update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
