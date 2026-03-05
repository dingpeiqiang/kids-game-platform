import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { DeviceUtil } from '@/utils/device.util';
import { userService } from '@/services/user.service';

/**
 * 游戏ID类型
 */
export type GameId = 'color-game' | 'shape-game' | 'demo-game';

/**
 * 对战模式选择场景
 * 玩家可以选择单人模式或双人对战
 */
export class BattleSelectScene extends BaseScene {
  private gameId: GameId = 'color-game';
  private gameSceneKey: string = '';
  private resultSceneKey: string = '';
  private modeButtons: Phaser.GameObjects.Container[] = [];
  private currentFocusIndex: number = 0;

  constructor() {
    super('BattleSelectScene');
  }

  /**
   * 设置游戏ID
   */
  public setGameId(gameId: GameId): void {
    this.gameId = gameId;
    this.setGameSceneKeys();
  }

  /**
   * 设置游戏场景键名
   */
  private setGameSceneKeys(): void {
    switch (this.gameId) {
      case 'color-game':
        this.gameSceneKey = 'ColorGameScene';
        this.resultSceneKey = 'ColorResultScene';
        break;
      case 'shape-game':
        this.gameSceneKey = 'ShapeGameScene';
        this.resultSceneKey = 'ShapeResultScene';
        break;
      case 'demo-game':
        this.gameSceneKey = 'DemoGameScene';
        this.resultSceneKey = 'DemoResultScene';
        break;
    }
  }

  /**
   * 创建场景
   */
  public create(): void {
    LogUtil.log('BattleSelectScene: 创建场景');
    console.log('[BattleSelectScene] create() 被调用');

    // 验证登录状态
    if (!this.checkLoginStatus()) {
      return;
    }

    // 设置背景
    this.cameras.main.setBackgroundColor('#FFF9E6');

    // 设置场景键名
    this.setGameSceneKeys();

    // 创建标题
    this.createTitle();
    console.log('[BattleSelectScene] 标题已创建');

    // 创建模式选择按钮
    this.createModeButtons();
    console.log('[BattleSelectScene] 模式按钮已创建');

    // 创建返回按钮
    this.createBackButton();
    console.log('[BattleSelectScene] 返回按钮已创建');

    // 设置键盘控制
    this.setupKeyboardControl();
    console.log('[BattleSelectScene] 键盘控制已设置');

    console.log('[BattleSelectScene] 场景创建完成');
  }

  /**
   * 验证登录状态
   */
  private checkLoginStatus(): boolean {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      LogUtil.log('BattleSelectScene: 用户未登录，跳转到登录场景');
      this.scene.start('LoginScene');
      return false;
    }
    return true;
  }

  /**
   * 创建标题
   */
  private createTitle(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.2;

    const title = this.add.text(centerX, centerY, '选择游戏模式', {
      font: `bold ${DeviceUtil.getOptimalFontSize(48)}px Arial`,
      color: '#333333',
    });
    title.setOrigin(0.5, 0.5);

    // 标题动画
    this.tweens.add({
      targets: title,
      scale: { from: 0.8, to: 1 },
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  /**
   * 创建模式选择按钮
   */
  private createModeButtons(): void {
    const centerX = this.scale.width / 2;
    const startY = this.scale.height * 0.4;
    const gap = this.scale.height * 0.25;

    const modes = [
      {
        name: '单人模式',
        desc: '独自挑战',
        icon: '🎮',
        color: '#95E1D3',
        mode: 'single',
      },
      {
        name: '双人对战',
        desc: '和朋友比拼',
        icon: '⚔️',
        color: '#FF6B6B',
        mode: 'battle',
      },
      {
        name: '双屏对战',
        desc: '同屏竞技',
        icon: '🎯',
        color: '#4A90E2',
        mode: 'dual-screen',
      },
    ];

    modes.forEach((mode, index) => {
      const y = startY + index * gap;
      const button = this.createModeButton(centerX, y, mode);
      this.modeButtons.push(button);
    });

    // 默认选中第一个
    if (this.modeButtons.length > 0) {
      this.highlightButton(this.modeButtons[0]);
      this.currentFocusIndex = 0;
    }
  }

  /**
   * 创建单个模式按钮
   */
  private createModeButton(
    x: number,
    y: number,
    mode: { name: string; desc: string; icon: string; color: string; mode: string }
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const scale = DeviceUtil.getScaleFactor();
    const width = 400 * scale;
    const height = 120 * scale;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
    bg.lineStyle(4, mode.color, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);

    // 图标
    const icon = this.add.text(0, -height * 0.15, mode.icon, {
      font: `${60 * scale}px Arial`,
    });
    icon.setOrigin(0.5, 0.5);

    // 名称
    const nameText = this.add.text(0, height * 0.1, mode.name, {
      font: `bold ${DeviceUtil.getOptimalFontSize(32) * scale}px Arial`,
      fill: '#333333',
    });
    nameText.setOrigin(0.5, 0.5);

    // 描述
    const descText = this.add.text(0, height * 0.35, mode.desc, {
      font: `${DeviceUtil.getOptimalFontSize(20) * scale}px Arial`,
      color: '#666666',
    });
    descText.setOrigin(0.5, 0.5);

    container.add([bg, icon, nameText, descText]);

    // 设置交互
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    // 点击事件
    bg.on('pointerdown', () => {
      this.selectMode(mode.mode as 'single' | 'battle');
    });

    // 悬停效果
    bg.on('pointerover', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 100,
        ease: 'Quad.Out',
      });
    });

    bg.on('pointerout', () => {
      if (this.modeButtons.indexOf(container) !== this.currentFocusIndex) {
        this.tweens.killTweensOf(container);
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 100,
          ease: 'Quad.Out',
        });
      }
    });

    return container;
  }

  /**
   * 选择模式
   */
  private selectMode(mode: 'single' | 'battle' | 'dual-screen'): void {
    LogUtil.log(`BattleSelectScene: 选择模式 ${mode}`);

    // 再次验证登录状态
    if (!this.checkLoginStatus()) {
      return;
    }

    // 存储模式到全局
    (window as any).__GAME_BATTLE_MODE__ = mode;

    if (mode === 'dual-screen') {
      // 进入双屏对战场景
      LogUtil.log('BattleSelectScene: 进入双屏对战场景');
      this.scene.start('UniversalSplitScreenScene', {
        gameId: this.gameId,
        duration: 60,
        direction: 'horizontal',
      });
    } else if (mode === 'battle') {
      // 进入玩家2登录场景
      LogUtil.log('BattleSelectScene: 进入玩家2登录场景');
      // 存储游戏ID到全局
      (window as any).__GAME_ID__ = this.gameId;
      this.scene.start('Player2LoginScene');
    } else {
      // 单人模式，直接启动游戏
      this.scene.start(this.gameSceneKey);
    }
  }

  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    const padding = DeviceUtil.getOptimalFontSize(20);
    this.backButton = this.add.text(padding, DeviceUtil.getOptimalFontSize(30), '← 返回', {
      font: `bold ${DeviceUtil.getOptimalFontSize(24)}px Arial`,
      color: '#333333',
      backgroundColor: 'rgba(0,0,0,0.1)',
      padding: { x: padding, y: padding / 2 },
    });
    this.backButton.setInteractive({ useHandCursor: true });

    this.backButton.on('pointerdown', () => {
      LogUtil.log('BattleSelectScene: 返回首页');
      window.location.href = '/';
    });
  }

  backButton?: Phaser.GameObjects.Text;

  /**
   * 设置键盘控制
   */
  private setupKeyboardControl(): void {
    LogUtil.log('BattleSelectScene: 启用键盘控制');

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          this.moveFocus(-1);
          break;
        case 'ArrowDown':
          this.moveFocus(1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.activateFocusedButton();
          break;
        case 'Escape':
          window.location.href = '/';
          break;
      }
    });
  }

  /**
   * 移动焦点
   */
  private moveFocus(delta: number): void {
    const newIndex = Math.max(0, Math.min(this.modeButtons.length - 1, this.currentFocusIndex + delta));
    if (newIndex !== this.currentFocusIndex) {
      this.unhighlightButton(this.modeButtons[this.currentFocusIndex]);
      this.currentFocusIndex = newIndex;
      this.highlightButton(this.modeButtons[newIndex]);
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
   * 取消高亮
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
    if (this.modeButtons[this.currentFocusIndex]) {
      // 根据索引选择模式
      const mode = this.currentFocusIndex === 0 ? 'single' : 'battle';
      this.selectMode(mode);
    }
  }
}
