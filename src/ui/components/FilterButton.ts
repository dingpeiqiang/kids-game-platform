import { DeviceUtil } from '@/utils/device.util';

/**
 * 筛选按钮组件
 * 支持全部、收藏、分类筛选
 */
export class FilterButton {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private text!: Phaser.GameObjects.Text;
  private isActive = false;

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private label: string,
    private color: string,
    private onClick: (label: string) => void,
    active = false,
  ) {
    this.container = scene.add.container(x, y);
    this.bg = scene.add.graphics();
    this.isActive = active;
    this.create();
  }

  /**
   * 创建按钮
   */
  private create(): void {
    const btnWidth = this.getLabelWidth();
    const btnHeight = 36;

    this.drawButton(this.isActive);

    this.text = this.scene.add.text(0, 0, this.label, {
      font: `bold ${DeviceUtil.getOptimalFontSize(16)}px "Microsoft YaHei", Arial`,
      color: this.isActive ? '#ffffff' : '#636E72',
    }).setOrigin(0.5, 0.5);

    this.container.add([this.bg, this.text]);
    this.container.setData('label', this.label);

    this.setupInteraction(btnWidth, btnHeight);
  }

  /**
   * 获取按钮宽度（根据文字长度自适应）
   */
  private getLabelWidth(): number {
    // 基础宽度 + 每个字符约16像素
    const baseWidth = 40;
    const charWidth = 16;
    return Math.max(100, baseWidth + this.label.length * charWidth);
  }

  /**
   * 绘制按钮
   */
  private drawButton(active: boolean): void {
    const btnWidth = this.getLabelWidth();
    const btnHeight = 36;

    this.bg.clear();
    if (active) {
      this.bg.fillStyle(Phaser.Display.Color.HexStringToColor(this.color).color, 1);
      this.bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 18);
      this.bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(this.color).color, 1);
    } else {
      this.bg.fillStyle(0xffffff, 0.7);
      this.bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 18);
      this.bg.lineStyle(2, 0xBDC3C7, 0.5);
    }
    this.bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 18);
  }

  /**
   * 设置交互
   */
  private setupInteraction(btnWidth: number, btnHeight: number): void {
    this.bg.setInteractive(
      new Phaser.Geom.Rectangle(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight),
      Phaser.Geom.Rectangle.Contains,
    );

    this.bg.on('pointerdown', () => {
      this.onClick(this.label);
    });

    this.bg.on('pointerover', () => {
      const btnW = this.getLabelWidth();
      this.bg.clear();
      this.bg.fillStyle(this.isActive ? Phaser.Display.Color.HexStringToColor(this.color).color : 0xffffff, 0.9);
      this.bg.fillRoundedRect(-btnW / 2, -btnHeight / 2, btnW, btnHeight, 18);
      this.bg.lineStyle(2, this.isActive ? Phaser.Display.Color.HexStringToColor(this.color).color : 0x74B9FF, 1);
      this.bg.strokeRoundedRect(-btnW / 2, -btnHeight / 2, btnW, btnHeight, 18);
    });

    this.bg.on('pointerout', () => {
      this.drawButton(this.isActive);
    });
  }

  /**
   * 设置激活状态
   */
  public setActive(active: boolean): void {
    this.isActive = active;
    this.drawButton(active);
    this.text.setStyle({ color: active ? '#ffffff' : '#636E72' });
  }

  /**
   * 获取激活状态
   */
  public getActive(): boolean {
    return this.isActive;
  }

  /**
   * 获取标签
   */
  public getLabel(): string {
    return this.label;
  }

  /**
   * 设置位置
   */
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /**
   * 获取容器
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.container.destroy();
  }
}
