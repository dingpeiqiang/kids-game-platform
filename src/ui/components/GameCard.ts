import { DeviceUtil } from '@/utils/device.util';

/**
 * 游戏数据接口
 */
export interface GameItem {
  id: string;
  name: string;
  type: string;
  description: string;
  color: string;
  icon: string;
}

/**
 * 游戏卡片组件
 * 独立的游戏卡片，包含显示和交互逻辑
 */
export class GameCard {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private shadow: Phaser.GameObjects.Graphics;
  private favoriteBtn?: Phaser.GameObjects.Container;
  private isHighlighted = false;

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private game: GameItem,
    private scale: number,
    private index: number,
    private isFavorite: boolean,
    private onClick: (gameId: string) => void,
    private onToggleFavorite: (game: GameItem) => void,
  ) {
    this.container = scene.add.container(x, y);
    this.shadow = scene.add.graphics();
    this.bg = scene.add.graphics();
    this.create();
  }

  /**
   * 创建卡片
   */
  private create(): void {
    const buttonWidth = 220 * this.scale;
    const buttonHeight = 160 * this.scale;
    const cornerRadius = 16 * this.scale;

    // 阴影层
    this.shadow.fillStyle(0x000000, 0.05);
    this.shadow.fillRoundedRect(
      -buttonWidth / 2 + 3 * this.scale,
      -buttonHeight / 2 + 3 * this.scale,
      buttonWidth,
      buttonHeight,
      cornerRadius,
    );

    // 主背景
    this.drawBackground(false);

    // 左侧彩色条
    const stripeWidth = 5 * this.scale;
    this.bg.fillStyle(Phaser.Display.Color.HexStringToColor(this.game.color).color, 0.9);
    this.bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, stripeWidth, buttonHeight, { 
      tl: cornerRadius, bl: cornerRadius, tr: 0, br: 0 
    });

    // 边框
    this.bg.lineStyle(1, 0xE8EEF2, 1);
    this.bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);

    // 图标
    const icon = this.scene.add.text(-buttonWidth / 2 + 30 * this.scale, -15 * this.scale, this.game.icon, {
      font: `${DeviceUtil.getOptimalFontSize(36)}px Arial`,
    }).setOrigin(0.5, 0.5);

    // 游戏名称
    const name = this.scene.add.text(-buttonWidth / 2 + 65 * this.scale, -15 * this.scale, this.game.name, {
      font: `bold ${DeviceUtil.getOptimalFontSize(18)}px "Microsoft YaHei", Arial`,
      color: '#2D3436',
    }).setOrigin(0, 0.5);

    // 游戏描述
    const description = this.scene.add.text(-buttonWidth / 2 + 30 * this.scale, 25 * this.scale, this.game.description, {
      font: `${DeviceUtil.getOptimalFontSize(13)}px "Microsoft YaHei", Arial`,
      color: '#8898A2',
    }).setOrigin(0, 0.5);

    // 收藏按钮
    this.favoriteBtn = this.createFavoriteButton(buttonWidth / 2 - 15 * this.scale, -buttonHeight / 2 + 15 * this.scale);

    this.container.add([this.shadow, this.bg, icon, name, description, this.favoriteBtn]);
    this.container.setData('index', this.index);

    // 设置交互
    this.setupInteraction();
  }

  /**
   * 绘制背景
   */
  private drawBackground(highlighted: boolean): void {
    const buttonWidth = 220 * this.scale;
    const buttonHeight = 160 * this.scale;
    const cornerRadius = 16 * this.scale;

    this.bg.clear();
    this.bg.fillStyle(0xffffff, highlighted ? 1 : 0.98);
    this.bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);

    // 左侧彩色条
    const stripeWidth = 5 * this.scale;
    this.bg.fillStyle(Phaser.Display.Color.HexStringToColor(this.game.color).color, highlighted ? 1 : 0.9);
    this.bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, stripeWidth, buttonHeight, { 
      tl: cornerRadius, bl: cornerRadius, tr: 0, br: 0 
    });

    if (highlighted) {
      this.bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(this.game.color).color, 0.8);
    } else {
      this.bg.lineStyle(1, 0xE8EEF2, 1);
    }
    this.bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);
  }

  /**
   * 创建收藏按钮
   */
  private createFavoriteButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const btnSize = 28;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xF8FAFC, 0.8);
    bg.fillCircle(0, 0, btnSize / 2);

    const star = this.scene.add.text(0, 0, this.isFavorite ? '★' : '☆', {
      font: 'bold 16px Arial',
      color: this.isFavorite ? '#FFD93D' : '#CBD5E0',
    }).setOrigin(0.5, 0.5);

    container.add([bg, star]);

    // 交互
    bg.setInteractive(new Phaser.Geom.Circle(0, 0, btnSize / 2), Phaser.Geom.Circle.Contains);
    bg.on('pointerdown', () => {
      this.onToggleFavorite(this.game);
    });

    return container;
  }

  /**
   * 更新收藏状态
   */
  public updateFavoriteState(isFavorite: boolean): void {
    if (this.favoriteBtn) {
      const star = this.favoriteBtn.list[1] as Phaser.GameObjects.Text;
      star.setText(isFavorite ? '★' : '☆');
      star.setStyle({ color: isFavorite ? '#FFD93D' : '#CBD5E0' });
    }
  }

  /**
   * 设置交互
   */
  private setupInteraction(): void {
    const buttonWidth = 220 * this.scale;
    const buttonHeight = 160 * this.scale;

    this.bg.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains,
    );

    // 点击事件
    this.bg.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this.container,
        scale: 0.96,
        duration: 80,
        yoyo: true,
        ease: 'Quad.Out',
        onComplete: () => this.onClick(this.game.id),
      });
    });

    // 悬停效果
    this.bg.on('pointerover', () => this.highlight());
    this.bg.on('pointerout', () => this.unhighlight());
  }

  /**
   * 高亮卡片
   */
  public highlight(): void {
    if (this.isHighlighted) return;
    this.isHighlighted = true;

    const buttonWidth = 220 * this.scale;
    const buttonHeight = 160 * this.scale;
    const cornerRadius = 16 * this.scale;

    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      scale: 1.03,
      duration: 120,
      ease: 'Back.Out',
    });

    // 更新阴影
    this.shadow.clear();
    this.shadow.fillStyle(0x000000, 0.12);
    this.shadow.fillRoundedRect(
      -buttonWidth / 2 + 5 * this.scale,
      -buttonHeight / 2 + 5 * this.scale,
      buttonWidth,
      buttonHeight,
      cornerRadius,
    );

    this.drawBackground(true);
  }

  /**
   * 取消高亮
   */
  public unhighlight(): void {
    if (!this.isHighlighted) return;
    this.isHighlighted = false;

    const buttonWidth = 220 * this.scale;
    const buttonHeight = 160 * this.scale;

    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 100,
      ease: 'Quad.Out',
    });

    this.shadow.clear();
    this.shadow.fillStyle(0x000000, 0.05);
    this.shadow.fillRoundedRect(
      -buttonWidth / 2 + 3 * this.scale,
      -buttonHeight / 2 + 3 * this.scale,
      buttonWidth,
      buttonHeight,
      16 * this.scale,
    );

    this.drawBackground(false);
  }

  /**
   * 获取容器
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 销毁卡片
   */
  public destroy(): void {
    this.container.destroy();
  }
}
