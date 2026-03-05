import { BaseScene } from '@/core/scene.base';
import { DeviceUtil } from '@/utils/device.util';
import { LogUtil } from '@/utils/log.util';
import { splitScreenGameManager } from './split-screen-game';
import { ColorGameSplitScreenScene } from '@/games/color-game/scenes/split-screen.game.scene';

/**
 * 分屏模式选择场景
 */
export class SplitScreenSelectScene extends BaseScene {
  private gameId: string = 'color-game';

  public setGameId(gameId: string): void {
    this.gameId = gameId;
  }

  public create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // 背景
    const bg = this.add.rectangle(
      centerX,
      centerY,
      this.scale.width,
      this.scale.height,
      0x87CEEB
    );

    // 标题
    const title = this.add.text(centerX, 100, '选择分屏方向', {
      font: `bold ${DeviceUtil.getOptimalFontSize(48)}px Arial`,
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 4,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 10,
        fill: true,
      },
    });
    title.setOrigin(0.5, 0.5);

    // 说明文字
    const description = this.add.text(
      centerX,
      160,
      '两个玩家同时在各自的屏幕上游戏',
      {
        font: `${DeviceUtil.getOptimalFontSize(24)}px Arial`,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: { x: 20, y: 10 },
      }
    );
    description.setOrigin(0.5, 0.5);

    // 创建按钮
    this.createButtons(centerX, centerY);

    // 键盘导航
    this.setupKeyboardNavigation();

    LogUtil.log('[SplitScreenSelectScene] 分屏选择场景创建完成');
  }

  private createButtons(centerX: number, centerY: number): void {
    const buttonWidth = 300;
    const buttonHeight = 80;
    const buttonSpacing = 30;
    const startY = centerY - buttonSpacing / 2;

    // 水平分屏按钮
    this.createModeButton(
      centerX,
      startY,
      buttonWidth,
      buttonHeight,
      '↔️ 水平分屏',
      '左右两个屏幕',
      () => this.startSplitScreen('horizontal')
    );

    // 垂直分屏按钮
    this.createModeButton(
      centerX,
      startY + buttonHeight + buttonSpacing,
      buttonWidth,
      buttonHeight,
      '↕️ 垂直分屏',
      '上下两个屏幕',
      () => this.startSplitScreen('vertical')
    );

    // 返回按钮
    this.createBackButton(centerX, this.scale.height - 80);
  }

  private createModeButton(
    x: number,
    y: number,
    width: number,
    height: number,
    mainText: string,
    subText: string,
    onClick: () => void
  ): void {
    const container = this.add.container(x, y);

    // 按钮背景
    const bg = this.add.rectangle(0, 0, width, height, 0x4CAF50);
    bg.setStrokeStyle(3, 0x2E7D32);

    // 主文字
    const mainLabel = this.add.text(0, -10, mainText, {
      font: `bold ${DeviceUtil.getOptimalFontSize(28)}px Arial`,
      color: '#ffffff',
    });
    mainLabel.setOrigin(0.5, 0.5);

    // 副文字
    const subLabel = this.add.text(0, 20, subText, {
      font: `${DeviceUtil.getOptimalFontSize(18)}px Arial`,
      color: '#E8F5E9',
    });
    subLabel.setOrigin(0.5, 0.5);

    container.add([bg, mainLabel, subLabel]);

    // 添加交互
    bg.setInteractive({ useHandCursor: true });
    mainLabel.setInteractive({ useHandCursor: true });

    const onMouseOver = () => {
      bg.setFillStyle(0x66BB6A);
      container.setScale(1.05);
    };

    const onMouseOut = () => {
      bg.setFillStyle(0x4CAF50);
      container.setScale(1);
    };

    const handleButtonClick = () => {
      bg.setFillStyle(0x81C784);
      this.time.delayedCall(100, () => {
        onClick();
      });
    };

    bg.on('pointerover', onMouseOver);
    bg.on('pointerout', onMouseOut);
    bg.on('pointerdown', handleButtonClick);

    mainLabel.on('pointerover', onMouseOver);
    mainLabel.on('pointerout', onMouseOut);
    mainLabel.on('pointerdown', handleButtonClick);
  }

  private createBackButton(x: number, y: number): void {
    const bg = this.add.rectangle(0, 0, 200, 60, 0xFF9800);
    bg.setStrokeStyle(3, 0xF57C00);
    bg.setInteractive({ useHandCursor: true });

    const text = this.add.text(0, 0, '← 返回', {
      font: `bold ${DeviceUtil.getOptimalFontSize(24)}px Arial`,
      color: '#ffffff',
    });
    text.setOrigin(0.5, 0.5);
    text.setInteractive({ useHandCursor: true });

    const container = this.add.container(x, y);
    container.add([bg, text]);

    const onMouseOver = () => {
      bg.setFillStyle(0xFFB74D);
      container.setScale(1.05);
    };

    const onMouseOut = () => {
      bg.setFillStyle(0xFF9800);
      container.setScale(1);
    };

    const onClick = () => {
      this.scene.start('MenuScene');
    };

    bg.on('pointerover', onMouseOver);
    bg.on('pointerout', onMouseOut);
    bg.on('pointerdown', onClick);

    text.on('pointerover', onMouseOver);
    text.on('pointerout', onMouseOut);
    text.on('pointerdown', onClick);
  }

  private setupKeyboardNavigation(): void {
    this.input.keyboard?.on('keydown-UP', () => {
      // 向上导航
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      // 向下导航
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      // 确认选择
      this.startSplitScreen('horizontal');
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      // 返回主菜单
      this.scene.start('MenuScene');
    });
  }

  private startSplitScreen(direction: 'horizontal' | 'vertical'): void {
    LogUtil.log(`[SplitScreenSelectScene] 启动分屏模式: ${direction}`);

    // 停止当前场景
    this.scene.stop();

    // 启动分屏游戏
    splitScreenGameManager.startGame({
      gameId: this.gameId,
      player1Scene: ColorGameSplitScreenScene,
      player2Scene: ColorGameSplitScreenScene,
      direction,
      duration: 60, // 60秒游戏时间
    });
  }
}
