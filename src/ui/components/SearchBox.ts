import { DeviceUtil } from '@/utils/device.util';

/**
 * 搜索框组件
 * 简化版的搜索输入框
 */
export class SearchBox {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private searchText: Phaser.GameObjects.Text;
  private placeholder: Phaser.GameObjects.Text;
  private clearBtn?: Phaser.GameObjects.Container;
  private currentValue = '';

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private width: number,
    private onSearch: (value: string) => void,
    private onClear: () => void,
  ) {
    this.container = scene.add.container(x, y);
    this.bg = scene.add.graphics();
    this.searchText = scene.add.text(0, 0, '');
    this.placeholder = scene.add.text(0, 0, '');
    this.create();
  }

  /**
   * 创建搜索框
   */
  private create(): void {
    const boxHeight = 44;

    // 背景
    this.bg.fillStyle(0xffffff, 0.95);
    this.bg.fillRoundedRect(-this.width / 2, -boxHeight / 2, this.width, boxHeight, 22);
    this.bg.lineStyle(1.5, 0xE0E6ED, 1);
    this.bg.strokeRoundedRect(-this.width / 2, -boxHeight / 2, this.width, boxHeight, 22);

    // 搜索图标
    const searchIcon = this.scene.add.text(-this.width / 2 + 18, 0, '🔍', {
      font: `${DeviceUtil.getOptimalFontSize(18)}px Arial`,
      fixedWidth: 28,
    }).setOrigin(0.5, 0.5);

    // 占位符
    this.placeholder = this.scene.add.text(10, 0, '搜索游戏...', {
      font: `${DeviceUtil.getOptimalFontSize(16)}px "Microsoft YaHei", Arial`,
      color: '#A0AEC0',
    }).setOrigin(0, 0.5);

    // 搜索文字显示
    this.searchText = this.scene.add.text(10, 0, '', {
      font: `${DeviceUtil.getOptimalFontSize(16)}px "Microsoft YaHei", Arial`,
      color: '#2D3436',
    }).setOrigin(0, 0.5);
    this.searchText.setVisible(false);

    // 清除按钮
    this.clearBtn = this.createClearButton(this.width / 2 - 20, 0);

    this.container.add([this.bg, searchIcon, this.placeholder, this.searchText, this.clearBtn]);
    this.container.setScale(0);

    // 设置交互
    this.bg.setInteractive(
      new Phaser.Geom.Rectangle(-this.width / 2, -boxHeight / 2, this.width, boxHeight),
      Phaser.Geom.Rectangle.Contains,
    );
    this.bg.on('pointerdown', () => this.activateSearch());
  }

  /**
   * 创建清除按钮
   */
  private createClearButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const btnSize = 24;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xE74C3C, 1);
    bg.fillCircle(0, 0, btnSize / 2);

    const xText = this.scene.add.text(0, 0, '✕', {
      font: 'bold 16px Arial',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    container.add([bg, xText]);
    container.setVisible(false);

    bg.setInteractive(new Phaser.Geom.Circle(0, 0, btnSize / 2), Phaser.Geom.Circle.Contains);
    bg.on('pointerdown', () => this.clear());

    return container;
  }

  /**
   * 激活搜索
   */
  private activateSearch(): void {
    // 创建HTML输入框
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = this.currentValue;
    input.placeholder = '搜索游戏...';
    input.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      padding: 12px 20px;
      font-size: 16px;
      border: 2px solid #74B9FF;
      border-radius: 25px;
      outline: none;
      z-index: 1000;
      font-family: "Microsoft YaHei", Arial, sans-serif;
    `;

    input.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      this.setValue(value);
      this.onSearch(value);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => input.remove(), 200);
    });

    gameContainer.appendChild(input);
    input.focus();
  }

  /**
   * 设置值
   */
  public setValue(value: string): void {
    this.currentValue = value;
    this.searchText.text = value;
    this.searchText.setVisible(value.length > 0);
    this.placeholder.setVisible(value.length === 0);
    if (this.clearBtn) {
      this.clearBtn.setVisible(value.length > 0);
    }
  }

  /**
   * 获取值
   */
  public getValue(): string {
    return this.currentValue;
  }

  /**
   * 清除
   */
  public clear(): void {
    this.setValue('');
    this.onClear();
  }

  /**
   * 显示动画
   */
  public showAnimation(): void {
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 400,
      ease: 'Back.Out',
    });
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
