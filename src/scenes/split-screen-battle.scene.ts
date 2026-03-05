/**
 * 分屏对战场景
 * 为双人对战模式创建分屏显示界面
 * 真正的分屏游戏：两个玩家同时在各自的屏幕区域玩游戏
 */

import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { DeviceUtil } from '@/utils/device.util';
import { GameId } from '@/core/battle-select.scene';
import { PlayerId } from '@/core/events/game-events';

// 导入游戏逻辑类
import { ColorGameLogic } from '@/games/color-game/logic/color-game-logic';

export class SplitScreenBattleScene extends BaseScene {
  // 游戏信息
  private gameId: GameId = 'color-game';

  // 玩家信息
  private player1Info?: Phaser.GameObjects.Container;
  private player2Info?: Phaser.GameObjects.Container;
  private player1Score: number = 0;
  private player2Score: number = 0;
  private player1ScoreText?: Phaser.GameObjects.Text;
  private player2ScoreText?: Phaser.GameObjects.Text;

  // 分割线
  private divider?: Phaser.GameObjects.Graphics;

  // 游戏状态
  private gameStarted: boolean = false;

  // 分屏容器
  private player1Container?: Phaser.GameObjects.Container;
  private player2Container?: Phaser.GameObjects.Container;

  // 游戏逻辑实例
  private player1GameLogic?: any;
  private player2GameLogic?: any;

  // 游戏状态
  private player1State?: any;
  private player2State?: any;

  constructor() {
    super('SplitScreenBattleScene');
  }

  public create(): void {
    LogUtil.log('SplitScreenBattleScene: 创建分屏对战场景');

    // 获取游戏信息
    const battleInfo = (window as any).__BATTLE_INFO__;
    if (battleInfo) {
      this.gameId = battleInfo.gameId;
    }

    // 设置背景
    this.cameras.main.setBackgroundColor('#FFF9E6');

    // 创建分屏布局
    this.createSplitScreenLayout();

    // 创建玩家信息面板
    this.createPlayerInfoPanels();

    // 创建开始按钮
    this.createStartButton();

    // 创建返回按钮
    this.createBackButton();
  }

  /**
   * 创建分屏布局
   */
  private createSplitScreenLayout(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // 绘制分割线（垂直）
    this.divider = this.add.graphics();
    this.divider.lineStyle(4, 0xE0E0E0, 1);
    this.divider.lineBetween(centerX, 50, centerX, this.scale.height - 50);
  }

  /**
   * 创建玩家信息面板
   */
  private createPlayerInfoPanels(): void {
    const battleInfo = (window as any).__BATTLE_INFO__;
    if (!battleInfo || !battleInfo.players) return;

    const player1 = battleInfo.players[0];
    const player2 = battleInfo.players[1];
    const scale = DeviceUtil.getScaleFactor();

    // 玩家1信息（左半边）
    this.createPlayer1Panel(player1, scale);

    // 玩家2信息（右半边）
    this.createPlayer2Panel(player2, scale);
  }

  /**
   * 创建玩家1面板
   */
  private createPlayer1Panel(player: any, scale: number): void {
    const centerX = this.scale.width * 0.25;
    const centerY = this.scale.height * 0.3;
    const width = 300 * scale;
    const height = 400 * scale;

    this.player1Info = this.add.container(centerX, centerY);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0xFF6B6B, 0.1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
    bg.lineStyle(3, 0xFF6B6B, 0.5);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);

    // 标题
    const title = this.add.text(0, -height * 0.35, '🎮 玩家1', {
      font: `bold ${DeviceUtil.getOptimalFontSize(28) * scale}px "Microsoft YaHei", Arial`,
      color: '#FF6B6B',
    });
    title.setOrigin(0.5, 0.5);

    // 头像
    const avatar = this.add.text(0, -height * 0.15, '🐱', {
      font: `${80 * scale}px Arial`,
    });
    avatar.setOrigin(0.5, 0.5);

    // 用户名
    const username = this.add.text(0, height * 0.05, player.username, {
      font: `bold ${DeviceUtil.getOptimalFontSize(24) * scale}px "Microsoft YaHei", Arial`,
      color: '#333333',
    });
    username.setOrigin(0.5, 0.5);

    // 分数标签
    const scoreLabel = this.add.text(0, height * 0.25, '分数', {
      font: `${DeviceUtil.getOptimalFontSize(18) * scale}px "Microsoft YaHei", Arial`,
      color: '#666666',
    });
    scoreLabel.setOrigin(0.5, 0.5);

    // 分数
    this.player1ScoreText = this.add.text(0, height * 0.35, '0', {
      font: `bold ${DeviceUtil.getOptimalFontSize(48) * scale}px Arial`,
      color: '#FF6B6B',
    });
    this.player1ScoreText.setOrigin(0.5, 0.5);

    // 状态标签
    const status = this.add.text(0, height * 0.45, '准备中', {
      font: `${DeviceUtil.getOptimalFontSize(16) * scale}px "Microsoft YaHei", Arial`,
      color: '#999999',
    });
    status.setOrigin(0.5, 0.5);

    this.player1Info.add([bg, title, avatar, username, scoreLabel, this.player1ScoreText, status]);
  }

  /**
   * 创建玩家2面板
   */
  private createPlayer2Panel(player: any, scale: number): void {
    const centerX = this.scale.width * 0.75;
    const centerY = this.scale.height * 0.3;
    const width = 300 * scale;
    const height = 400 * scale;

    this.player2Info = this.add.container(centerX, centerY);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x4A90E2, 0.1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
    bg.lineStyle(3, 0x4A90E2, 0.5);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);

    // 标题
    const title = this.add.text(0, -height * 0.35, '🎮 玩家2', {
      font: `bold ${DeviceUtil.getOptimalFontSize(28) * scale}px "Microsoft YaHei", Arial`,
      color: '#4A90E2',
    });
    title.setOrigin(0.5, 0.5);

    // 头像
    const avatar = this.add.text(0, -height * 0.15, '🐶', {
      font: `${80 * scale}px Arial`,
    });
    avatar.setOrigin(0.5, 0.5);

    // 用户名
    const username = this.add.text(0, height * 0.05, player.username, {
      font: `bold ${DeviceUtil.getOptimalFontSize(24) * scale}px "Microsoft YaHei", Arial`,
      color: '#333333',
    });
    username.setOrigin(0.5, 0.5);

    // 分数标签
    const scoreLabel = this.add.text(0, height * 0.25, '分数', {
      font: `${DeviceUtil.getOptimalFontSize(18) * scale}px "Microsoft YaHei", Arial`,
      color: '#666666',
    });
    scoreLabel.setOrigin(0.5, 0.5);

    // 分数
    this.player2ScoreText = this.add.text(0, height * 0.35, '0', {
      font: `bold ${DeviceUtil.getOptimalFontSize(48) * scale}px Arial`,
      color: '#4A90E2',
    });
    this.player2ScoreText.setOrigin(0.5, 0.5);

    // 状态标签
    const status = this.add.text(0, height * 0.45, '准备中', {
      font: `${DeviceUtil.getOptimalFontSize(16) * scale}px "Microsoft YaHei", Arial`,
      color: '#999999',
    });
    status.setOrigin(0.5, 0.5);

    this.player2Info.add([bg, title, avatar, username, scoreLabel, this.player2ScoreText, status]);
  }

  /**
   * 创建开始按钮
   */
  private createStartButton(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.8;
    const scale = DeviceUtil.getScaleFactor();

    const buttonWidth = 200 * scale;
    const buttonHeight = 60 * scale;

    const container = this.add.container(centerX, centerY);

    // 背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x4CAF50, 0x4CAF50, 0x45A049, 0x45A049, 1);
    bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 30);

    // 文字
    const text = this.add.text(0, 0, '开始对战', {
      font: `bold ${DeviceUtil.getOptimalFontSize(24)}px "Microsoft YaHei", Arial`,
      color: '#ffffff',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    // 设置交互
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerdown', () => {
      this.startBattleGame();
    });

    bg.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 150,
        ease: 'Quad.Out',
      });
    });

    bg.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 150,
        ease: 'Quad.Out',
      });
    });
  }

  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    const padding = DeviceUtil.getOptimalFontSize(20);

    const container = this.add.container(padding, padding);

    const bg = this.add.graphics();
    bg.fillStyle(0xE0E0E0, 1);
    bg.fillRoundedRect(-50, -20, 100, 40, 12);

    const text = this.add.text(0, 0, '← 返回', {
      font: `bold ${DeviceUtil.getOptimalFontSize(16)}px "Microsoft YaHei", Arial`,
      color: '#333333',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    bg.setInteractive(
      new Phaser.Geom.Rectangle(-50, -20, 100, 40),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerdown', () => {
      this.scene.start('BattleSelectScene');
    });
  }

  /**
   * 开始对战游戏
   */
  private startBattleGame(): void {
    if (this.gameStarted) return;
    this.gameStarted = true;

    LogUtil.log('SplitScreenBattleScene: 开始分屏对战游戏');

    // 隐藏准备界面的 UI
    if (this.player1Info) this.player1Info.setVisible(false);
    if (this.player2Info) this.player2Info.setVisible(false);
    if (this.divider) this.divider.setVisible(false);

    // 隐藏所有按钮容器
    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Container) {
        const hasButton = child.list.some(item => {
          if (item instanceof Phaser.GameObjects.Graphics) {
            return true;
          }
          return false;
        });
        if (hasButton) {
          child.setVisible(false);
        }
      }
    });

    // 创建分屏游戏
    this.createSplitScreenGame();

    LogUtil.log('SplitScreenBattleScene: 分屏游戏已启动');
  }

  /**
   * 创建分屏游戏
   */
  private createSplitScreenGame(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const halfWidth = width / 2;

    // 获取玩家信息
    const battleInfo = (window as any).__BATTLE_INFO__;
    const player1 = battleInfo?.players[0];
    const player2 = battleInfo?.players[1];

    // 初始化游戏逻辑
    this.initializeGameLogic();

    // 创建玩家1的游戏容器（左半边）
    this.player1Container = this.add.container(0, 0);
    this.player1Container.setPosition(halfWidth / 2, height / 2);
    this.createPlayerGame(1, halfWidth, height);

    // 创建玩家2的游戏容器（右半边）
    this.player2Container = this.add.container(0, 0);
    this.player2Container.setPosition(width + halfWidth / 2, height / 2);
    this.createPlayerGame(2, halfWidth, height);

    // 创建分数显示
    this.createInGameScoreDisplays(player1?.username, player2?.username);

    // 创建分割线
    this.createInGameDivider();
  }

  /**
   * 初始化游戏逻辑
   */
  private initializeGameLogic(): void {
    switch (this.gameId) {
      case 'color-game':
        this.player1GameLogic = new ColorGameLogic();
        this.player2GameLogic = new ColorGameLogic();
        break;
      case 'shape-game':
      case 'demo-game':
        // 其他游戏的逻辑类待实现
        break;
    }

    // 生成初始游戏状态
    if (this.player1GameLogic && this.player2GameLogic) {
      this.player1State = this.player1GameLogic.generateNewQuestion();
      this.player2State = this.player2GameLogic.generateNewQuestion();
    }
  }

  /**
   * 创建玩家游戏
   */
  private createPlayerGame(playerId: number, width: number, height: number): void {
    switch (this.gameId) {
      case 'color-game':
        this.createColorGame(playerId, width, height);
        break;
      case 'shape-game':
        this.createShapeGame(playerId, width, height);
        break;
      case 'demo-game':
        this.createDemoGame(playerId, width, height);
        break;
    }
  }

  /**
   * 创建颜色游戏
   */
  private createColorGame(playerId: number, width: number, height: number): void {
    const gameLogic = playerId === 1 ? this.player1GameLogic : this.player2GameLogic;
    const gameState = playerId === 1 ? this.player1State : this.player2State;

    if (!gameLogic || !gameState) return;

    const playerContainer = playerId === 1 ? this.player1Container : this.player2Container;
    if (!playerContainer) return;

    const colorConfig = gameLogic.getColorConfig();
    const targetColor = gameState.targetColor;

    // 目标颜色显示
    const targetColorBlock = this.add.rectangle(0, -height * 0.2, 100, 100, parseInt(targetColor.replace('#', '0x')));
    targetColorBlock.setStrokeStyle(4, 0x333333);
    targetColorBlock.setName(`targetColor-${playerId}`);
    playerContainer.add(targetColorBlock);

    // 提示文字
    const hintText = this.add.text(0, -height * 0.35, '找出这个颜色！', {
      font: 'bold 20px Arial',
      color: '#333333',
    });
    hintText.setOrigin(0.5, 0.5);
    hintText.setName(`hintText-${playerId}`);
    playerContainer.add(hintText);

    // 创建颜色选项
    const startY = height * 0.1;
    const blockSize = 60;
    const gap = 10;
    const cols = 3;
    const totalWidth = cols * blockSize + (cols - 1) * gap;
    const startX = -totalWidth / 2 + blockSize / 2;

    for (let i = 0; i < gameState.currentOptions.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (blockSize + gap);
      const y = startY + row * (blockSize + gap);

      const colorCode = gameState.currentOptions[i];
      const colorBlock = this.add.rectangle(x, y, blockSize, blockSize, parseInt(colorCode.replace('#', '0x')));
      colorBlock.setStrokeStyle(2, 0x333333);
      colorBlock.setData('playerId', playerId);
      colorBlock.setData('color', colorCode);
      colorBlock.setData('targetColor', targetColor);

      colorBlock.setInteractive({ useHandCursor: true });
      colorBlock.on('pointerdown', () => {
        this.handleColorClick(colorBlock, playerId);
      });

      playerContainer.add(colorBlock);
    }

    LogUtil.log(`SplitScreenBattleScene: 创建玩家${playerId}的颜色游戏完成`);
  }

  /**
   * 创建形状游戏
   */
  private createShapeGame(playerId: number, width: number, height: number): void {
    const shapes = [
      { name: '圆形', icon: '⭕', color: '#FF6B6B' },
      { name: '方形', icon: '⬜', color: '#4A90E2' },
      { name: '三角形', icon: '🔺', color: '#95E1D3' },
      { name: '星形', icon: '⭐', color: '#FFE66D' },
    ];

    const targetIndex = Math.floor(Math.random() * shapes.length);
    const targetShape = shapes[targetIndex];

    const playerContainer = playerId === 1 ? this.player1Container : this.player2Container;
    if (!playerContainer) return;

    // 目标形状显示
    const targetIcon = this.add.text(0, -height * 0.2, targetShape.icon, {
      font: '80px Arial',
    });
    targetIcon.setOrigin(0.5, 0.5);
    playerContainer.add(targetIcon);

    // 提示文字
    const hintText = this.add.text(0, -height * 0.35, `找出${targetShape.name}！`, {
      font: 'bold 20px Arial',
      color: '#333333',
    });
    hintText.setOrigin(0.5, 0.5);
    playerContainer.add(hintText);

    // 创建形状选项
    const startY = height * 0.1;
    const iconSize = 60;
    const gap = 20;
    const totalWidth = shapes.length * iconSize + (shapes.length - 1) * gap;
    const startX = -totalWidth / 2 + iconSize / 2;

    for (let i = 0; i < shapes.length; i++) {
      const x = startX + i * (iconSize + gap);
      const y = startY;

      const icon = this.add.text(x, y, shapes[i].icon, {
        font: '50px Arial',
      });
      icon.setOrigin(0.5, 0.5);
      icon.setData('playerId', playerId);
      icon.setData('shape', shapes[i].name);
      icon.setData('targetShape', targetShape.name);

      icon.setInteractive({ useHandCursor: true });
      icon.on('pointerdown', () => {
        this.handleShapeClick(icon, playerId);
      });

      playerContainer.add(icon);
    }

    LogUtil.log(`SplitScreenBattleScene: 创建玩家${playerId}的形状游戏完成`);
  }

  /**
   * 创建数字游戏
   */
  private createDemoGame(playerId: number, width: number, height: number): void {
    const targetNumber = Math.floor(Math.random() * 10) + 1;

    const playerContainer = playerId === 1 ? this.player1Container : this.player2Container;
    if (!playerContainer) return;

    // 目标数字显示
    const targetText = this.add.text(0, -height * 0.2, targetNumber.toString(), {
      font: 'bold 72px Arial',
      color: '#4A90E2',
    });
    targetText.setOrigin(0.5, 0.5);
    playerContainer.add(targetText);

    // 提示文字
    const hintText = this.add.text(0, -height * 0.35, '找出这个数字！', {
      font: 'bold 20px Arial',
      color: '#333333',
    });
    hintText.setOrigin(0.5, 0.5);
    playerContainer.add(hintText);

    // 创建数字选项
    const options = this.generateNumberOptions(targetNumber);
    const startY = height * 0.1;
    const buttonSize = 60;
    const gap = 15;
    const totalWidth = options.length * buttonSize + (options.length - 1) * gap;
    const startX = -totalWidth / 2 + buttonSize / 2;

    for (let i = 0; i < options.length; i++) {
      const x = startX + i * (buttonSize + gap);
      const y = startY;

      const button = this.add.text(x, y, options[i].toString(), {
        font: 'bold 40px Arial',
        color: '#ffffff',
        backgroundColor: '#FF6B6B',
        padding: { x: 15, y: 10 },
      });
      button.setOrigin(0.5, 0.5);
      button.setData('playerId', playerId);
      button.setData('number', options[i]);
      button.setData('targetNumber', targetNumber);

      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => {
        this.handleNumberClick(button, playerId);
      });

      playerContainer.add(button);
    }

    LogUtil.log(`SplitScreenBattleScene: 创建玩家${playerId}的数字游戏完成`);
  }

  /**
   * 生成数字选项
   */
  private generateNumberOptions(target: number): number[] {
    const options = [target];
    while (options.length < 4) {
      const num = Math.floor(Math.random() * 10) + 1;
      if (!options.includes(num)) {
        options.push(num);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  }

  /**
   * 处理颜色点击
   */
  private handleColorClick(colorBlock: Phaser.GameObjects.Rectangle, playerId: number): void {
    const gameLogic = playerId === 1 ? this.player1GameLogic : this.player2GameLogic;
    const selectedColor = colorBlock.getData('color');
    const targetColor = colorBlock.getData('targetColor');

    if (!gameLogic) return;

    const isCorrect = gameLogic.checkAnswer(selectedColor, targetColor);

    if (isCorrect) {
      // 答对了
      if (playerId === 1) {
        this.player1Score += 10;
        if (this.player1ScoreText) {
          this.player1ScoreText.setText(this.player1Score.toString());
        }
        // 更新玩家1的游戏状态
        this.player1State = gameLogic.generateNewQuestion();
      } else {
        this.player2Score += 10;
        if (this.player2ScoreText) {
          this.player2ScoreText.setText(this.player2Score.toString());
        }
        // 更新玩家2的游戏状态
        this.player2State = gameLogic.generateNewQuestion();
      }
      this.showFeedback('正确！+10分', '#4CAF50', playerId);

      // 重新生成游戏
      this.regenerateColorGame(playerId);
    } else {
      this.showFeedback('错误！', '#F44336', playerId);
    }
  }

  /**
   * 处理形状点击
   */
  private handleShapeClick(icon: Phaser.GameObjects.Text, playerId: number): void {
    const selectedShape = icon.getData('shape');
    const targetShape = icon.getData('targetShape');

    if (selectedShape === targetShape) {
      if (playerId === 1) {
        this.player1Score += 10;
        if (this.player1ScoreText) {
          this.player1ScoreText.setText(this.player1Score.toString());
        }
      } else {
        this.player2Score += 10;
        if (this.player2ScoreText) {
          this.player2ScoreText.setText(this.player2Score.toString());
        }
      }
      this.showFeedback('正确！+10分', '#4CAF50', playerId);
      this.regenerateShapeGame(playerId);
    } else {
      this.showFeedback('错误！', '#F44336', playerId);
    }
  }

  /**
   * 处理数字点击
   */
  private handleNumberClick(button: Phaser.GameObjects.Text, playerId: number): void {
    const selectedNumber = button.getData('number');
    const targetNumber = button.getData('targetNumber');

    if (selectedNumber === targetNumber) {
      if (playerId === 1) {
        this.player1Score += 10;
        if (this.player1ScoreText) {
          this.player1ScoreText.setText(this.player1Score.toString());
        }
      } else {
        this.player2Score += 10;
        if (this.player2ScoreText) {
          this.player2ScoreText.setText(this.player2Score.toString());
        }
      }
      this.showFeedback('正确！+10分', '#4CAF50', playerId);
      this.regenerateDemoGame(playerId);
    } else {
      this.showFeedback('错误！', '#F44336', playerId);
    }
  }

  /**
   * 重新生成颜色游戏
   */
  private regenerateColorGame(playerId: number): void {
    const width = this.scale.width / 2;
    const height = this.scale.height;
    const playerContainer = playerId === 1 ? this.player1Container : this.player2Container;
    const gameState = playerId === 1 ? this.player1State : this.player2State;

    if (!playerContainer || !gameState) return;

    // 清除旧的游戏元素（保留一些）
    playerContainer.list.forEach(child => child.destroy());
    playerContainer.list = [];

    // 创建新的游戏
    this.createColorGame(playerId, width, height);
  }

  /**
   * 重新生成形状游戏
   */
  private regenerateShapeGame(playerId: number): void {
    const width = this.scale.width / 2;
    const height = this.scale.height;
    const playerContainer = playerId === 1 ? this.player1Container : this.player2Container;

    if (!playerContainer) return;

    playerContainer.list.forEach(child => child.destroy());
    playerContainer.list = [];

    this.createShapeGame(playerId, width, height);
  }

  /**
   * 重新生成数字游戏
   */
  private regenerateDemoGame(playerId: number): void {
    const width = this.scale.width / 2;
    const height = this.scale.height;
    const playerContainer = playerId === 1 ? this.player1Container : this.player2Container;

    if (!playerContainer) return;

    playerContainer.list.forEach(child => child.destroy());
    playerContainer.list = [];

    this.createDemoGame(playerId, width, height);
  }

  /**
   * 显示反馈
   */
  private showFeedback(message: string, color: string, playerId: number): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const halfWidth = width / 2;

    const x = playerId === 1 ? halfWidth / 2 : width + halfWidth / 2;
    const y = height * 0.7;

    const feedback = this.add.text(x, y, message, {
      font: 'bold 28px Arial',
      color: color,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: { x: 20, y: 10 },
    });
    feedback.setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: feedback,
      alpha: 0,
      duration: 1000,
      delay: 500,
      onComplete: () => feedback.destroy(),
    });
  }

  /**
   * 创建游戏中的分数显示
   */
  private createInGameScoreDisplays(player1Name: string, player2Name: string): void {
    const width = this.scale.width;
    const padding = 20;

    // 玩家1分数（左上）
    const player1ScoreBg = this.add.graphics();
    player1ScoreBg.fillStyle(0xFF6B6B, 1);
    player1ScoreBg.fillRoundedRect(padding, padding, 200, 40, 8);

    this.player1ScoreText = this.add.text(padding + 100, padding + 20, `${player1Name}: ${this.player1Score}`, {
      font: 'bold 18px Arial',
      color: '#ffffff',
    });
    this.player1ScoreText.setOrigin(0.5, 0.5);
    this.player1ScoreText.setName('player1InGameScore');

    // 玩家2分数（右上）
    const player2ScoreBg = this.add.graphics();
    player2ScoreBg.fillStyle(0x4A90E2, 1);
    player2ScoreBg.fillRoundedRect(width - padding - 200, padding, 200, 40, 8);

    this.player2ScoreText = this.add.text(width - padding - 100, padding + 20, `${player2Name}: ${this.player2Score}`, {
      font: 'bold 18px Arial',
      color: '#ffffff',
    });
    this.player2ScoreText.setOrigin(0.5, 0.5);
    this.player2ScoreText.setName('player2InGameScore');
  }

  /**
   * 创建游戏中的分割线
   */
  private createInGameDivider(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const halfWidth = width / 2;

    const divider = this.add.graphics();
    divider.lineStyle(4, 0xCCCCCC, 1);
    divider.lineBetween(halfWidth, 0, halfWidth, height);
    divider.setName('inGameDivider');
  }
}
