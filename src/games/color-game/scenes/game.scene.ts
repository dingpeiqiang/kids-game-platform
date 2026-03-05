import { BaseBattleScene, BattleMode } from '@/core/battle.base';
import { LogUtil } from '@/utils/log.util';
import { DeviceUtil } from '@/utils/device.util';
import { AuthUtil } from '@/utils/auth.util';

/**
 * 颜色配对游戏场景
 * 儿童友好：选择与目标颜色相同的颜色块
 * 支持双人对战模式
 */
export class GameScene extends BaseBattleScene {
  private targetColor: string = '';
  private questionText?: Phaser.GameObjects.Text;
  backButton?: Phaser.GameObjects.Text;
  private colorButtons: Phaser.GameObjects.Container[] = [];
  private currentFocusIndex: number = 0;

  // 对战回合数
  private roundsPerPlayer: number = 5;
  private currentRound: number = 0;
  private totalRounds: number = 0;

  // 颜色配置
  private readonly COLORS = [
    { name: '红色', code: '#FF6B6B', label: '🔴' },
    { name: '蓝色', code: '#4A90E2', label: '🔵' },
    { name: '绿色', code: '#95E1D3', label: '🟢' },
    { name: '黄色', code: '#FFE66D', label: '🟡' },
    { name: '紫色', code: '#9B59B6', label: '🟣' },
    { name: '橙色', code: '#F39C12', label: '🟠' },
  ];

  constructor() {
    super('ColorGameScene');

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
    LogUtil.log('ColorGameScene: 创建场景', { battleMode: this.isBattleMode });

    // 验证登录状态
    if (!AuthUtil.checkLoginStatus(this)) {
      return;
    }

    // 设置背景色
    this.cameras.main.setBackgroundColor('#FFF9E6');

    // 创建UI元素（根据模式选择）
    if (this.isBattleMode) {
      this.createBattleScorePanel();
    } else {
      this.createScore();
    }

    this.createBackButton();
    this.createTargetColor();
    this.createColorButtons();

    // 设置键盘控制
    this.setupKeyboardControl();

    // 生成第一道题
    this.generateQuestion();

    // 监听全局事件
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
    this.backButton = this.add.text(rightX, DeviceUtil.getOptimalFontSize(30), '← 首页', {
      font: `bold ${DeviceUtil.getOptimalFontSize(24)}px Arial`,
      color: '#333333',
      backgroundColor: 'rgba(0,0,0,0.1)',
      padding: { x: padding, y: padding / 2 },
    });
    this.backButton.setOrigin(1, 0.5);
    this.backButton.setInteractive({ useHandCursor: true });

    this.backButton.on('pointerdown', () => {
      LogUtil.log('ColorGameScene: 返回首页');
      // 返回到首页
      window.location.href = '/';
    });

    this.backButton.on('pointerover', () => {
      this.backButton?.setStyle({ backgroundColor: 'rgba(0,0,0,0.2)' });
    });

    this.backButton.on('pointerout', () => {
      this.backButton?.setStyle({ backgroundColor: 'rgba(0,0,0,0.1)' });
    });
  }

  /**
   * 创建目标颜色显示
   */
  private createTargetColor(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.25;

    // 提示文字
    this.questionText = this.add.text(centerX, centerY - DeviceUtil.getOptimalFontSize(100), '找出这个颜色！', {
      font: `bold ${DeviceUtil.getOptimalFontSize(32)}px Arial`,
      color: '#333333',
    });
    this.questionText.setOrigin(0.5, 0.5);
  }

  /**
   * 创建颜色按钮
   */
  private createColorButtons(): void {
    const centerX = this.scale.width / 2;
    const startY = this.scale.height * 0.4;
    const scale = Math.min(this.scale.width / 800, DeviceUtil.getScaleFactor());
    const buttonSize = DeviceUtil.getOptimalFontSize(100) * scale;
    const gap = buttonSize * 1.3;

    this.COLORS.forEach((color, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;

      // 计算位置，使按钮居中
      const totalWidth = 2 * gap;
      const startX = centerX - totalWidth / 2;

      const x = startX + col * gap;
      const y = startY + row * (gap + DeviceUtil.getOptimalFontSize(30));

      const button = this.createColorButton(x, y, color, buttonSize);
      this.colorButtons.push(button);
    });
  }

  /**
   * 创建单个颜色按钮
   */
  private createColorButton(
    x: number,
    y: number,
    color: { name: string; code: string; label: string },
    size: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // 颜色方块背景
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 15);
    bg.lineStyle(4, parseInt(color.code.replace('#', '0x')), 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 15);

    // 内部颜色填充
    const innerBg = this.add.graphics();
    innerBg.fillStyle(parseInt(color.code.replace('#', '0x')), 1);
    innerBg.fillRoundedRect(-size / 2 + 10, -size / 2 + 10, size - 20, size - 20, 10);

    // 颜色名称
    const nameText = this.add.text(0, size / 2 + DeviceUtil.getOptimalFontSize(30), color.name, {
      font: `bold ${DeviceUtil.getOptimalFontSize(20)}px Arial`,
      color: '#333333',
    });
    nameText.setOrigin(0.5, 0.5);

    container.add([bg, innerBg, nameText]);

    // 设置交互 - 使用 Graphics 对象作为 hitArea
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size + 50),
      Phaser.Geom.Rectangle.Contains
    );

    // 点击事件
    bg.on('pointerdown', () => {
      this.handleAnswer(color);
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
    // 随机选择一个目标颜色
    const randomIndex = Math.floor(Math.random() * this.COLORS.length);
    this.targetColor = this.COLORS[randomIndex].code;

    // 显示目标颜色
    this.showTargetColor();
  }

  /**
   * 显示目标颜色
   */
  private showTargetColor(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.25;
    const scale = Math.min(this.scale.width / 800, DeviceUtil.getScaleFactor());
    const size = DeviceUtil.getOptimalFontSize(120) * scale;

    // 移除旧的目标颜色显示
    const oldTarget = this.children.getByName('targetColor');
    if (oldTarget) {
      oldTarget.destroy();
    }

    const container = this.add.container(centerX, centerY);
    container.setName('targetColor');

    // 目标颜色方块
    const targetBg = this.add.graphics();
    targetBg.fillStyle(0xffffff, 1);
    targetBg.fillRoundedRect(-size / 2, -size / 2, size, size, 15 * scale);
    targetBg.lineStyle(5 * scale, parseInt('#333333'.replace('#', '0x')), 1);
    targetBg.strokeRoundedRect(-size / 2, -size / 2, size, size, 15 * scale);

    // 内部颜色
    const innerBg = this.add.graphics();
    innerBg.fillStyle(parseInt(this.targetColor.replace('#', '0x')), 1);
    innerBg.fillRoundedRect(-size / 2 + 10 * scale, -size / 2 + 10 * scale, size - 20 * scale, size - 20 * scale, 10 * scale);

    container.add([targetBg, innerBg]);

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
  private handleAnswer(selectedColor: { name: string; code: string; label: string }): void {
    const isCorrect = selectedColor.code === this.targetColor;
    this.currentRound++;

    if (isCorrect) {
      this.addScore(10);
      LogUtil.log(`ColorGameScene: ${this.currentPlayer.name} 答对了！`, this.currentPlayer.score);
      this.showFeedback('✅ 正确！');
    } else {
      LogUtil.log(`ColorGameScene: ${this.currentPlayer.name} 答错了`);
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
        color: result.winner?.color || '#333333',
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
        window.location.href = '/';
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
      this.scene.start('ColorResultScene', { score: this.player1.score });
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
      color: '#333333',
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
    LogUtil.log('ColorGameScene: 启用键盘控制');

    // 设置初始焦点
    if (this.colorButtons.length > 0) {
      this.highlightButton(this.colorButtons[0]);
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
    const newIndex = Math.max(0, Math.min(this.colorButtons.length - 1, this.currentFocusIndex + delta));
    if (newIndex !== this.currentFocusIndex) {
      // 移除旧焦点
      this.unhighlightButton(this.colorButtons[this.currentFocusIndex]);
      // 设置新焦点
      this.currentFocusIndex = newIndex;
      this.highlightButton(this.colorButtons[newIndex]);
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
    if (this.colorButtons[this.currentFocusIndex]) {
      // 触发按钮的点击事件
      const button = this.colorButtons[this.currentFocusIndex];
      // 找到对应的颜色数据
      const container = button;
      const colorButtons = container.list;
      if (colorButtons.length >= 3) {
        const nameText = colorButtons[2] as Phaser.GameObjects.Text;
        const colorName = nameText.text;
        const color = this.COLORS.find(c => c.name === colorName);
        if (color) {
          this.handleAnswer(color);
        }
      }
    }
  }

  /**
   * 场景销毁
   */
  public shutdown(): void {
    this.colorButtons.forEach((button) => button.destroy());
    this.colorButtons = [];
  }
}
