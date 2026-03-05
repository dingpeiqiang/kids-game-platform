import { DeviceUtil } from '@/utils/device.util';

/**
 * 筛选按钮组件
 * 只显示图标，类似游戏中的颜色按钮
 * 支持全部、收藏、分类筛选
 */
export class FilterButton {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private innerBg: Phaser.GameObjects.Graphics;
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
    this.innerBg = scene.add.graphics();
    this.isActive = active;
    this.create();
  }

  /**
   * 创建按钮
   */
  private create(): void {
    const btnSize = DeviceUtil.getOptimalFontSize(48);

    this.drawButton(this.isActive);

    this.container.add([this.bg, this.innerBg]);
    this.container.setData('label', this.label);

    this.setupInteraction(btnSize);
  }

  /**
   * 绘制按钮
   */
  private drawButton(active: boolean): void {
    const btnSize = DeviceUtil.getOptimalFontSize(48);
    const padding = DeviceUtil.getOptimalFontSize(6);

    this.bg.clear();
    this.innerBg.clear();

    // 外圆边框
    this.bg.fillStyle(0xffffff, 1);
    this.bg.fillCircle(0, 0, btnSize / 2);
    
    if (active) {
      this.bg.lineStyle(4, Phaser.Display.Color.HexStringToColor(this.color).color, 1);
    } else {
      this.bg.lineStyle(3, Phaser.Display.Color.HexStringToColor(this.color).color, 0.5);
    }
    this.bg.strokeCircle(0, 0, btnSize / 2);

    // 内圆填充
    if (active) {
      this.innerBg.fillStyle(Phaser.Display.Color.HexStringToColor(this.color).color, 0.8);
      this.innerBg.fillCircle(0, 0, btnSize / 2 - padding);
    } else {
      this.innerBg.fillStyle(Phaser.Display.Color.HexStringToColor(this.color).color, 0.3);
      this.innerBg.fillCircle(0, 0, btnSize / 2 - padding);
    }
  }

  /**
   * 设置交互
   */
  private setupInteraction(btnSize: number): void {
    this.bg.setInteractive(
      new Phaser.Geom.Circle(0, 0, btnSize / 2),
      Phaser.Geom.Circle.Contains,
    );

    this.bg.on('pointerdown', () => {
      this.onClick(this.label);
    });

    this.bg.on('pointerover', () => {
      this.scene.tweens.killTweensOf(this.container);
      this.scene.tweens.add({
        targets: this.container,
        scale: 1.15,
        duration: 100,
        ease: 'Quad.Out',
      });
    });

    this.bg.on('pointerout', () => {
      this.scene.tweens.killTweensOf(this.container);
      this.scene.tweens.add({
        targets: this.container,
        scale: 1,
        duration: 100,
        ease: 'Quad.Out',
      });
    });
  }

  /**
   * 设置激活状态
   */
  public setActive(active: boolean): void {
    this.isActive = active;
    this.drawButton(active);
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
