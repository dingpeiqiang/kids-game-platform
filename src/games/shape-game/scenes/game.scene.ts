import { BaseBattleScene, BattleMode } from '@/core/battle.base';
import { LogUtil } from '@/utils/log.util';
import { DeviceUtil } from '@/utils/device.util';

import { navigateTo } from '@/utils/path.util';

/**
 * 形状识别游戏场景
 * 儿童友好：识别圆形、方形、三角形等基本形状
 * 支持双人对战模式
 */
export class GameScene extends BaseBattleScene {
  private targetShape: string = '';
  private questionText?: Phaser.GameObjects.Text;
  backButton?: Phaser.GameObjects.Text;
  private shapeButtons: Phaser.GameObjects.Container[] = [];
  private currentFocusIndex: number = 0;

  // 对战回合数
  private roundsPerPlayer: number = 5;
  private currentRound: number = 0;
  private totalRounds: number = 0;

  // 形状配置
  private readonly SHAPES = [
    { name: '圆形', icon: '⭕', color: '#FF6B6B' },
    { name: '方形', icon: '⬜', color: '#4A90E2' },
    { name: '三角形', icon: '🔺', color: '#95E1D3' },
    { name: '星形', icon: '⭐', color: '#FFE66D' },
    { name: '心形', icon: '❤️', color: '#FF6B9D' },
    { name: '菱形', icon: '🔶', color: '#9B59B6' },
  ];

  constructor() {
    super('ShapeGameScene');

    // 检查对战模式
    const mode = (window as any).__GAME_BATTLE_MODE__;
    if (mode === 'battle') {
      this.battleMode = BattleMode.BATTLE;
      this.totalRounds = this.roundsPerPlayer * 2;
    } else {
      this.battleMode = BattleMode.SINGLE;
      this.totalRounds = 10;
    }
  }

  /**
   * 创建游戏场景
   */
  public create(): void {
    LogUtil.log('ShapeGameScene: 创建场景', { battleMode: this.isBattleMode });

    // 验证登录状态
    if (!AuthUtil.checkLoginStatus(this)) {
      return;
    }

    this.cameras.main.setBackgroundColor('#E8F5E9');

    // 创建UI元素（根据模式选择）
    if (this.isBattleMode) {
      this.createBattleScorePanel();
    } else {
      this.createScore();
    }

    this.createBackButton();
    this.createTargetShape();
    this.createShapeButtons();

    // 设置键盘控制
    this.setupKeyboardControl();

    this.generateQuestion();
    this.events.on('shutdown', this.shutdown.bind(this));
  }

  /**
   * 创建分数显示（单人模式）
   */
  private createScore(): void {
    const padding = DeviceUtil.getOptimalFontSize(20);
    this.player1.scoreText = this.add.text(padding, padding, '分数: 0', {
      font: `bold ${DeviceUtil.getOptimalFontSize(28)}px Arial`,
      color: '#333333',
    });
    this.player1.score = 0;
  }

  /**
   * 更新分数显示（实现抽象方法）
   */
  protected updateScoreDisplay(): void {
    if (this.isBattleMode) {
      // 更新双人对战分数
      if (this.player1.scoreText) {
        this.player1.scoreText.setText(`${this.player1.name}: ${this.player1.score}`);
      }
      if (this.player2.scoreText) {
        this.player2.scoreText.setText(`${this.player2.name}: ${this.player2.score}`);
      }
    } else {
      // 更新单人分数
      if (this.player1.scoreText) {
        this.player1.scoreText.setText(`分数: ${this.player1.score}`);
      }
    }
  }

  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    const padding = DeviceUtil.getOptimalFontSize(20);
    const rightX = this.scale.width - padding;
    this.backButton = this.add.text(rightX, 30, '← 首页', {
      font: `bold ${DeviceUtil.getOptimalFontSize(24)}px Arial`,
      color: '#333333',
      backgroundColor: 'rgba(0,0,0,0.1)',
      padding: { x: padding, y: padding / 2 },
    });
    this.backButton.setOrigin(1, 0.5);
    this.backButton.setInteractive({ useHandCursor: true });

    this.backButton.on('pointerdown', () => {
      LogUtil.log('ShapeGameScene: 返回首页');
      // 返回到首页
      navigateTo('/');
    });

    this.backButton.on('pointerover', () => {
      this.backButton?.setStyle({ backgroundColor: 'rgba(0,0,0,0.2)' });
    });

    this.backButton.on('pointerout', () => {
      this.backButton?.setStyle({ backgroundColor: 'rgba(0,0,0,0.1)' });
    });
  }

  /**
   * 创建目标形状显示
   */
  private createTargetShape(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.25;

    this.questionText = this.add.text(centerX, centerY - DeviceUtil.getOptimalFontSize(100), '找出这个形状！', {
      font: `bold ${DeviceUtil.getOptimalFontSize(32)}px Arial`,
      fill: '#333333',
    });
    this.questionText.setOrigin(0.5, 0.5);
  }

  /**
   * 创建形状按钮
   */
  private createShapeButtons(): void {
    const centerX = this.scale.width / 2;
    const startY = 320;
    const gap = 130;
    const scale = Math.min(this.scale.width / 800, 1);
    const buttonSize = 100 * scale;

    this.SHAPES.forEach((shape, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;

      const totalWidth = 2 * gap;
      const startX = centerX - totalWidth / 2;

      const x = startX + col * gap;
      const y = startY + row * (gap + 30 * scale);

      const button = this.createShapeButton(x, y, shape, buttonSize);
      this.shapeButtons.push(button);
    });
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

    // 背景卡片
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 15);
    bg.lineStyle(4, shape.color, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 15);

    // 形状图标
    const icon = this.add.text(0, 0, shape.icon, {
      font: `${60 * (size / 100)}px Arial`,
      fixedWidth: size,
      align: 'center',
    });
    icon.setOrigin(0.5, 0.5);

    // 形状名称
    const nameText = this.add.text(0, size / 2 + DeviceUtil.getOptimalFontSize(30), shape.name, {
      font: `bold ${DeviceUtil.getOptimalFontSize(20)}px Arial`,
      color: '#333333',
    });
    nameText.setOrigin(0.5, 0.5);

    container.add([bg, icon, nameText]);

    // 设置交互 - 使用 Graphics 对象作为 hitArea
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size + 50),
      Phaser.Geom.Rectangle.Contains
    );

    // 点击事件
    bg.on('pointerdown', () => {
      this.handleAnswer(shape);
    });

    // 悬停效果
    bg.on('pointerover', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 100,
        ease: 'Quad.Out',
      });
    });

    bg.on('pointerout', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100,
        ease: 'Quad.Out',
      });
    });

    return container;
  }

  /**
   * 生成新问题
   */
  private generateQuestion(): void {
    const randomIndex = Math.floor(Math.random() * this.SHAPES.length);
    this.targetShape = this.SHAPES[randomIndex].name;
    this.showTargetShape();
  }

  /**
   * 显示目标形状
   */
  private showTargetShape(): void {
    const centerX = this.scale.width / 2;
    const centerY = 200;
    const scale = Math.min(this.scale.width / 800, 1);
    const size = 120 * scale;

    // 移除旧的目标形状显示
    const oldTarget = this.children.getByName('targetShape');
    if (oldTarget) {
      oldTarget.destroy();
    }

    const container = this.add.container(centerX, centerY);
    container.setName('targetShape');

    const targetShape = this.SHAPES.find((s) => s.name === this.targetShape);
    if (!targetShape) return;

    // 背景圆
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillCircle(0, 0, size / 2);
    bg.lineStyle(5, targetShape.color, 1);
    bg.strokeCircle(0, 0, size / 2);

    // 形状图标
    const icon = this.add.text(0, 0, targetShape.icon, {
      font: `${70 * (size / 100)}px Arial`,
      fixedWidth: size,
      align: 'center',
    });
    icon.setOrigin(0.5, 0.5);

    container.add([bg, icon]);

    // 弹跳动画
    this.tweens.add({
      targets: container,
      scale: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  /**
   * 处理答案
   */
  private handleAnswer(selectedShape: { name: string; icon: string; color: string }): void {
    const isCorrect = selectedShape.name === this.targetShape;
    this.currentRound++;

    if (isCorrect) {
      this.addScore(10);
      LogUtil.log(`ShapeGameScene: ${this.currentPlayer.name} 答对了！`, this.currentPlayer.score);
      this.showFeedback('✅ 正确！');
    } else {
      LogUtil.log(`ShapeGameScene: ${this.currentPlayer.name} 答错了`);
      this.showFeedback('❌ 再试一次～');
    }

    // 检查游戏是否结束
    if (this.currentRound >= this.totalRounds) {
      this.time.delayedCall(500, () => this.endGame());
      return;
    }

    // 对战模式：切换玩家
    if (this.isBattleMode) {
      this.time.delayedCall(800, () => {
        this.switchPlayer();
        this.generateQuestion();
      });
    } else {
      this.time.delayedCall(800, () => this.generateQuestion());
    }
  }

  /**
   * 结束游戏
   */
  private endGame(): void {
    if (this.isBattleMode) {
      const result = this.getBattleResult();
      let resultText = '';

      if (result.isDraw) {
        resultText = '平局！';
      } else {
        resultText = `${result.winner?.name} 获胜！`;
      }

      // 显示对战结果
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;

      const resultContainer = this.add.container(centerX, centerY);

      const resultBg = this.add.graphics();
      resultBg.fillStyle(0xffffff, 0.95);
      resultBg.fillRoundedRect(-200, -150, 400, 300, 30);

      const winnerText = this.add.text(0, -80, resultText, {
        font: `bold ${DeviceUtil.getOptimalFontSize(48)}px Arial`,
        fill: result.winner?.color || '#333333',
      });
      winnerText.setOrigin(0.5);

      const scoreText = this.add.text(0, 20,
        `${this.player1.name}: ${this.player1.score}  vs  ${this.player2.name}: ${this.player2.score}`, {
        font: `bold ${DeviceUtil.getOptimalFontSize(28)}px Arial`,
        color: '#333333',
      });
      scoreText.setOrigin(0.5);

      // 再来一局按钮
      const restartBtn = this.createResultButton(0, 100, '再来一局', () => {
        this.scene.restart();
      });

      // 返回主页按钮
      const homeBtn = this.createResultButton(0, 160, '返回主页', () => {
        navigateTo('/');
      });

      resultContainer.add([resultBg, winnerText, scoreText, restartBtn, homeBtn]);

      // 动画
      resultContainer.setScale(0);
      this.tweens.add({
        targets: resultContainer,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });
    } else {
      // 单人模式：直接跳转到结果场景
      this.scene.start('ShapeResultScene', { score: this.player1.score });
    }
  }

  /**
   * 创建结果按钮
   */
  private createResultButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const width = 250;
    const height = 50;

    const bg = this.add.graphics();
    bg.fillStyle(0x95E1D3, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);

    const label = this.add.text(0, 0, text, {
      font: `bold ${DeviceUtil.getOptimalFontSize(24)}px Arial`,
      fill: '#333333',
    });
    label.setOrigin(0.5, 0.5);

    container.add([bg, label]);
    container.setInteractive({ useHandCursor: true });

    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x7BC4B0, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    });
    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x95E1D3, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    });

    return container;
  }

  /**
   * 显示反馈
   */
  private showFeedback(message: string): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.6;

    const feedback = this.add.text(centerX, centerY, message, {
      font: `bold ${DeviceUtil.getOptimalFontSize(40)}px Arial`,
      color: '#333333',
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: { x: DeviceUtil.getOptimalFontSize(30), y: DeviceUtil.getOptimalFontSize(20) },
    });
    feedback.setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: feedback,
      alpha: { from: 1, to: 0 },
      duration: 700,
      delay: 100,
      onComplete: () => feedback.destroy(),
    });
  }

  /**
   * 设置键盘控制
   */
  private setupKeyboardControl(): void {
    LogUtil.log('ShapeGameScene: 启用键盘控制');

    // 设置初始焦点
    if (this.shapeButtons.length > 0) {
      this.highlightButton(this.shapeButtons[0]);
      this.currentFocusIndex = 0;
    }

    // 监听键盘事件
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          this.moveFocus(-3); // 上移一行（3列）
          break;
        case 'ArrowDown':
          this.moveFocus(3); // 下移一行
          break;
        case 'ArrowLeft':
          this.moveFocus(-1); // 左移
          break;
        case 'ArrowRight':
          this.moveFocus(1); // 右移
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.activateFocusedButton();
          break;
      }
    });
  }

  /**
   * 移动焦点
   */
  private moveFocus(delta: number): void {
    const newIndex = Math.max(0, Math.min(this.shapeButtons.length - 1, this.currentFocusIndex + delta));
    if (newIndex !== this.currentFocusIndex) {
      // 移除旧焦点
      this.unhighlightButton(this.shapeButtons[this.currentFocusIndex]);
      // 设置新焦点
      this.currentFocusIndex = newIndex;
      this.highlightButton(this.shapeButtons[newIndex]);
    }
  }

  /**
   * 高亮按钮
   */
  private highlightButton(button: Phaser.GameObjects.Container): void {
    this.tweens.killTweensOf(button);
    this.tweens.add({
      targets: button,
      scale: 1.1,
      duration: 100,
      ease: 'Quad.Out',
    });
  }

  /**
   * 取消高亮按钮
   */
  private unhighlightButton(button: Phaser.GameObjects.Container): void {
    this.tweens.killTweensOf(button);
    this.tweens.add({
      targets: button,
      scale: 1,
      duration: 100,
      ease: 'Quad.Out',
    });
  }

  /**
   * 激活焦点按钮
   */
  private activateFocusedButton(): void {
    if (this.shapeButtons[this.currentFocusIndex]) {
      const button = this.shapeButtons[this.currentFocusIndex];
      const container = button;
      const shapeButtons = container.list;
      if (shapeButtons.length >= 3) {
        const nameText = shapeButtons[2] as Phaser.GameObjects.Text;
        const shapeName = nameText.text;
        const shape = this.SHAPES.find(s => s.name === shapeName);
        if (shape) {
          this.handleAnswer(shape);
        }
      }
    }
  }

  /**
   * 场景销毁
   */
  public shutdown(): void {
    this.shapeButtons.forEach((button) => button.destroy());
    this.shapeButtons = [];
  }
}
