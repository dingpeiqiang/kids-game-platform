import { SplitScreenScene } from '@/core/split-screen.scene';
import { LogUtil } from '@/utils/log.util';

/**
 * 颜色配对游戏 - 分屏模式场景
 * 支持两个玩家同时在各自的屏幕上游戏
 */
export class ColorGameSplitScreenScene extends SplitScreenScene {
  /** 目标颜色块 */
  private targetColorBlock: Phaser.GameObjects.Rectangle | null = null;

  /** 可选颜色块数组 */
  private colorBlocks: Phaser.GameObjects.Rectangle[] = [];

  /** 目标颜色 */
  private targetColor: number = 0xffffff;

  /** 当前颜色选项 */
  private currentColors: number[] = [];

  /** 颜色映射 */
  private colorMap: Record<string, number> = {
    'red': 0xFF6B6B,
    'blue': 0x4A90E2,
    'green': 0x95E1D3,
    'yellow': 0xFFE66D,
    'purple': 0x9B59B6,
    'orange': 0xF39C12,
  };

  /** 颜色名称映射 */
  private colorNames: Record<number, string> = {};

  /** 颜色提示文本 */
  private colorHintText: Phaser.GameObjects.Text | null = null;

  /**
   * 创建游戏逻辑
   */
  protected createGame(): void {
    // 初始化颜色名称映射
    this.colorNames = {
      0xFF6B6B: '红色',
      0x4A90E2: '蓝色',
      0x95E1D3: '绿色',
      0xFFE66D: '黄色',
      0x9B59B6: '紫色',
      0xF39C12: '橙色',
    };

    // 创建目标颜色块
    this.createTargetColorBlock();

    // 创建颜色选项
    this.createColorBlocks();

    // 显示颜色提示
    this.showColorHint();

    LogUtil.log(`[ColorGameSplitScreenScene] 玩家${this.playerId}游戏逻辑创建完成`);
  }

  /**
   * 创建目标颜色块
   */
  private createTargetColorBlock(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.3;

    // 目标颜色块背景
    const targetContainer = this.add.container(centerX, centerY);

    // 提示文字
    const hint = this.add.text(0, -60, '找出这个颜色', {
      font: 'bold 24px Arial',
      color: '#333333',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: { x: 15, y: 10 },
      stroke: '#333',
      strokeThickness: 2,
    });
    hint.setOrigin(0.5, 0.5);

    // 颜色块
    this.targetColorBlock = this.add.rectangle(0, 0, 120, 120, 0xffffff);
    this.targetColorBlock.setStrokeStyle(4, 0x333333);

    targetContainer.add(hint);
    targetContainer.add(this.targetColorBlock);

    // 生成第一个目标颜色
    this.generateNewTargetColor();
  }

  /**
   * 创建颜色选项块
   */
  private createColorBlocks(): void {
    const colors = Object.values(this.colorMap);
    const blockSize = 80;
    const gap = 20;
    const startY = this.scale.height * 0.6;

    // 计算布局
    const cols = 3;
    const totalWidth = cols * blockSize + (cols - 1) * gap;
    const startX = (this.scale.width - totalWidth) / 2 + blockSize / 2;

    // 创建颜色选项
    for (let i = 0; i < colors.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (blockSize + gap);
      const y = startY + row * (blockSize + gap);

      const colorBlock = this.add.rectangle(x, y, blockSize, blockSize, colors[i]);
      colorBlock.setStrokeStyle(3, 0x333333);
      colorBlock.setData('color', colors[i]);
      colorBlock.setData('originalScale', 1.0);

      // 添加点击事件
      colorBlock.setInteractive({ useHandCursor: true });
      colorBlock.on('pointerdown', () => this.onColorBlockClick(colorBlock));

      // 添加悬停效果
      colorBlock.on('pointerover', () => {
        this.tweens.add({
          targets: colorBlock,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150,
        });
      });

      colorBlock.on('pointerout', () => {
        this.tweens.add({
          targets: colorBlock,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 150,
        });
      });

      this.colorBlocks.push(colorBlock);
    }
  }

  /**
   * 生成新的目标颜色
   */
  private generateNewTargetColor(): void {
    const colors = Object.values(this.colorMap);
    const randomIndex = Math.floor(Math.random() * colors.length);
    this.targetColor = colors[randomIndex];

    // 更新目标颜色块
    if (this.targetColorBlock) {
      this.targetColorBlock.fillColor = this.targetColor;

      // 添加旋转动画
      this.tweens.add({
        targets: this.targetColorBlock,
        angle: 360,
        duration: 500,
        ease: 'Back.Out',
      });
    }
  }

  /**
   * 显示颜色提示
   */
  private showColorHint(): void {
    if (!this.colorHintText) {
      this.colorHintText = this.add.text(
        this.scale.width / 2,
        this.scale.height * 0.45,
        '',
        {
          font: 'bold 28px Arial',
          color: '#333333',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: { x: 20, y: 12 },
          stroke: '#333',
          strokeThickness: 2,
        }
      );
      this.colorHintText.setOrigin(0.5, 0.5);
      this.colorHintText.setDepth(999);
    }

    const colorName = this.colorNames[this.targetColor] || '未知颜色';
    this.colorHintText.setText(`选择: ${colorName}`);
  }

  /**
   * 处理颜色块点击
   */
  private onColorBlockClick(colorBlock: Phaser.GameObjects.Rectangle): void {
    if (this.isGameEnded) return;

    const selectedColor = colorBlock.getData('color');

    if (selectedColor === this.targetColor) {
      // 答对了
      this.handleCorrectAnswer(colorBlock);
    } else {
      // 答错了
      this.handleWrongAnswer(colorBlock);
    }
  }

  /**
   * 处理正确答案
   */
  private handleCorrectAnswer(colorBlock: Phaser.GameObjects.Rectangle): void {
    // 加分
    this.addScore(10);

    // 显示正确反馈
    this.showFeedback('正确！+10分', '#4CAF50');

    // 正确动画
    this.tweens.add({
      targets: colorBlock,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true,
      ease: 'Back.Out',
    });

    // 生成新的目标颜色
    this.generateNewTargetColor();
    this.showColorHint();
  }

  /**
   * 处理错误答案
   */
  private handleWrongAnswer(colorBlock: Phaser.GameObjects.Rectangle): void {
    // 显示错误反馈
    this.showFeedback('错误！', '#F44336');

    // 错误震动动画
    this.tweens.add({
      targets: colorBlock,
      x: colorBlock.x + 10,
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
    const centerY = this.scale.height / 2;

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
}
