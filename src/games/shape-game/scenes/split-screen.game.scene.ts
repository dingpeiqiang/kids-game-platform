import { SplitScreenScene, SplitScreenGameConfig } from '@/core/split-screen.scene';
import { LogUtil } from '@/utils/log.util';

/**
 * 形状识别游戏 - 分屏模式场景
 * 支持两个玩家同时在各自的屏幕上游戏
 */
export class ShapeGameSplitScreenScene extends SplitScreenScene {
  /** 目标形状 */
  private targetShape: string = '';

  /** 形状按钮 */
  private shapeButtons: Phaser.GameObjects.Container[] = [];

  /** 形状提示文本 */
  private shapeHintText?: Phaser.GameObjects.Text;

  /** 形状配置 */
  private readonly SHAPES = [
    { name: '圆形', icon: '⭕', color: '#FF6B6B' },
    { name: '方形', icon: '⬜', color: '#4A90E2' },
    { name: '三角形', icon: '🔺', color: '#95E1D3' },
    { name: '星形', icon: '⭐', color: '#FFE66D' },
    { name: '心形', icon: '❤️', color: '#FF6B9D' },
    { name: '菱形', icon: '🔶', color: '#9B59B6' },
  ];

  /**
   * 创建游戏逻辑
   */
  protected createGame(): void {
    // 创建目标形状显示
    this.createTargetShapeDisplay();

    // 创建形状选项
    this.createShapeButtons();

    // 显示形状提示
    this.showShapeHint();

    // 生成第一道题
    this.generateNewTargetShape();

    LogUtil.log(`[ShapeGameSplitScreenScene] 玩家${this.playerId}游戏逻辑创建完成`);
  }

  /**
   * 创建目标形状显示
   */
  private createTargetShapeDisplay(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.25;

    // 提示文字
    const hint = this.add.text(0, -60, '找出这个形状', {
      font: 'bold 24px Arial',
      color: '#333333',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: { x: 15, y: 10 },
      stroke: '#333',
      strokeThickness: 2,
    });
    hint.setOrigin(0.5, 0.5);

    // 形状图标容器
    const shapeContainer = this.add.container(0, 0);
    shapeContainer.setName('targetShape');

    // 形状图标
    const shapeIcon = this.add.text(0, 0, '', {
      font: '80px Arial',
    });
    shapeIcon.setOrigin(0.5, 0.5);
    shapeIcon.setName('shapeIcon');

    shapeContainer.add(shapeIcon);

    const container = this.add.container(centerX, centerY);
    container.add([hint, shapeContainer]);
  }

  /**
   * 创建形状选项按钮
   */
  private createShapeButtons(): void {
    const centerX = this.scale.width / 2;
    const startY = this.scale.height * 0.5;
    const buttonSize = 100;
    const gap = 15;

    // 计算布局
    const cols = 3;
    const totalWidth = cols * buttonSize + (cols - 1) * gap;
    const startX = (this.scale.width - totalWidth) / 2 + buttonSize / 2;

    // 创建形状选项
    for (let i = 0; i < this.SHAPES.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (buttonSize + gap);
      const y = startY + row * (buttonSize + gap);

      const button = this.createShapeButton(x, y, this.SHAPES[i], buttonSize);
      this.shapeButtons.push(button);
    }
  }

  /**
   * 创建单个形状按钮
   */
  private createShapeButton(
    x: number,
    y: number,
    shape: { name: string; icon: string; color: string },
    size: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // 背景圆
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillCircle(0, 0, size / 2);
    bg.lineStyle(4, parseInt(shape.color.replace('#', '0x')), 1);
    bg.strokeCircle(0, 0, size / 2);

    // 形状图标
    const icon = this.add.text(0, 0, shape.icon, {
      font: '50px Arial',
    });
    icon.setOrigin(0.5, 0.5);

    // 形状名称
    const nameText = this.add.text(0, size / 2 + 15, shape.name, {
      font: 'bold 18px Arial',
      color: '#333333',
    });
    nameText.setOrigin(0.5, 0.5);

    container.add([bg, icon, nameText]);
    container.setData('shape', shape);

    // 设置交互
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size + 30),
      Phaser.Geom.Rectangle.Contains,
    );

    bg.on('pointerdown', () => {
      this.onShapeButtonClick(shape);
    });

    bg.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 150,
      });
    });

    bg.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 150,
      });
    });

    return container;
  }

  /**
   * 显示形状提示
   */
  private showShapeHint(): void {
    if (!this.shapeHintText) {
      this.shapeHintText = this.add.text(
        this.scale.width / 2,
        this.scale.height * 0.4,
        '',
        {
          font: 'bold 28px Arial',
          color: '#333333',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: { x: 20, y: 12 },
          stroke: '#333',
          strokeThickness: 2,
        },
      );
      this.shapeHintText.setOrigin(0.5, 0.5);
      this.shapeHintText.setDepth(999);
    }
  }

  /**
   * 生成新的目标形状
   */
  private generateNewTargetShape(): void {
    const randomIndex = Math.floor(Math.random() * this.SHAPES.length);
    this.targetShape = this.SHAPES[randomIndex].name;

    // 更新目标形状显示
    const targetContainer = this.children.getByName('targetShape') as Phaser.GameObjects.Container;
    if (targetContainer) {
      const shapeIcon = targetContainer.getByName('shapeIcon') as Phaser.GameObjects.Text;
      if (shapeIcon) {
        const targetShape = this.SHAPES.find(s => s.name === this.targetShape);
        if (targetShape) {
          shapeIcon.setText(targetShape.icon);

          // 添加旋转动画
          this.tweens.add({
            targets: shapeIcon,
            angle: 360,
            duration: 500,
            ease: 'Back.Out',
          });
        }
      }
    }

    // 更新提示文本
    if (this.shapeHintText) {
      this.shapeHintText.setText(`选择: ${this.targetShape}`);
    }
  }

  /**
   * 处理形状按钮点击
   */
  private onShapeButtonClick(shape: { name: string; icon: string; color: string }): void {
    if (this.isGameEnded) return;

    const isCorrect = shape.name === this.targetShape;

    if (isCorrect) {
      // 答对了
      this.handleCorrectAnswer(shape);
    } else {
      // 答错了
      this.handleWrongAnswer(shape);
    }
  }

  /**
   * 处理正确答案
   */
  private handleCorrectAnswer(shape: { name: string; icon: string; color: string }): void {
    // 加分
    this.addScore(10);

    // 显示正确反馈
    this.showFeedback('正确！+10分', '#4CAF50');

    // 找到对应的按钮容器
    const button = this.shapeButtons.find(b => b.getData('shape').name === shape.name);
    if (button) {
      // 正确动画
      this.tweens.add({
        targets: button,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Back.Out',
      });
    }

    // 生成新的目标形状
    this.generateNewTargetShape();
  }

  /**
   * 处理错误答案
   */
  private handleWrongAnswer(shape: { name: string; icon: string; color: string }): void {
    // 显示错误反馈
    this.showFeedback('错误！', '#F44336');

    // 找到对应的按钮容器
    const button = this.shapeButtons.find(b => b.getData('shape').name === shape.name);
    if (button) {
      // 错误震动动画
      this.tweens.add({
        targets: button,
        x: button.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
      });
    }

    // 扣分
    this.addScore(-5);
  }

  /**
   * 显示反馈文字
   */
  private showFeedback(message: string, color: string): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.8;

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
