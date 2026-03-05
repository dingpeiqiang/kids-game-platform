/**
 * Phaser 模态框组件
 * 统一的弹窗实现，用于结果显示、游戏结束等场景
 */

import Phaser from 'phaser';
import { Button, ButtonOptions } from './button';

/** 模态框选项 */
export interface ModalOptions {
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 背景颜色 */
  backgroundColor?: number;
  /** 背景透明度 */
  backgroundAlpha?: number;
  /** 圆角 */
  borderRadius?: number;
  /** 标题 */
  title?: string;
  /** 标题颜色 */
  titleColor?: string;
  /** 是否显示遮罩 */
  showMask?: boolean;
  /** 遮罩颜色 */
  maskColor?: number;
  /** 遮罩透明度 */
  maskAlpha?: number;
}

/**
 * 统一模态框组件
 */
export class Modal extends Phaser.GameObjects.Container {
  private mask!: Phaser.GameObjects.Graphics;
  private background!: Phaser.GameObjects.Graphics;
  private titleText?: Phaser.GameObjects.Text;
  private contentContainer!: Phaser.GameObjects.Container;
  private buttonContainer!: Phaser.GameObjects.Container;

  private onCloseCallback?: () => void;
  private isShown = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: ModalOptions = {}
  ) {
    super(scene, x, y);

    const {
      width = 400,
      height = 300,
      backgroundColor = 0xffffff,
      backgroundAlpha = 0.95,
      borderRadius = 20,
      title = '',
      titleColor = '#333333',
      showMask = true,
      maskColor = 0x000000,
      maskAlpha = 0.5,
    } = options;

    this.setSize(width, height);
    this.setVisible(false);

    // 创建遮罩
    if (showMask) {
      this.mask = scene.add.graphics();
      this.drawMask(maskColor, maskAlpha);
      this.add(this.mask);
    }

    // 创建背景
    this.background = scene.add.graphics();
    this.drawBackground(backgroundColor, backgroundAlpha, borderRadius);
    this.add(this.background);

    // 创建标题（如果有）
    if (title) {
      this.titleText = scene.add.text(0, -height / 2 + 40, title, {
        font: 'bold 32px Arial',
        color: titleColor,
      });
      this.titleText.setOrigin(0.5, 0.5);
      this.add(this.titleText);
    }

    // 内容容器
    this.contentContainer = scene.add.container(0, 0);
    this.add(this.contentContainer);

    // 按钮容器
    this.buttonContainer = scene.add.container(0, height / 2 - 50);
    this.add(this.buttonContainer);

    scene.add.existing(this);
  }

  /**
   * 绘制遮罩
   */
  private drawMask(color: number, alpha: number): void {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;

    this.mask.clear();
    this.mask.fillStyle(color, alpha);
    this.mask.fillRect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  }

  /**
   * 绘制背景
   */
  private drawBackground(color: number, alpha: number, radius: number): void {
    const width = this.width;
    const height = this.height;

    this.background.clear();
    this.background.fillStyle(color, alpha);
    this.background.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  }

  /**
   * 设置关闭回调
   */
  setOnClose(callback: () => void): this {
    this.onCloseCallback = callback;
    return this;
  }

  /**
   * 设置标题
   */
  setTitle(title: string, color?: string): this {
    if (this.titleText) {
      this.titleText.setText(title);
      if (color) {
        this.titleText.setColor(color);
      }
    }
    return this;
  }

  /**
   * 添加内容
   */
  addContent(gameObject: Phaser.GameObjects.GameObject): this {
    this.contentContainer.add(gameObject);
    return this;
  }

  /**
   * 添加按钮
   */
  addButton(options: ButtonOptions & { label: string; onClick: () => void }): Button {
    const { label, onClick, ...buttonOptions } = options;
    const buttonY = this.buttonContainer.list.length * 60;

    const button = new Button(this.scene, 0, buttonY, {
      width: 250,
      height: 50,
      ...buttonOptions,
    });

    button.setOnClick(() => {
      onClick();
      this.hide();
    });

    this.buttonContainer.add(button);
    return button;
  }

  /**
   * 显示模态框
   */
  show(): this {
    this.setVisible(true);
    this.setScale(0);

    this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.isShown = true;
    return this;
  }

  /**
   * 隐藏模态框
   */
  hide(): this {
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      duration: 200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
        this.onCloseCallback?.();
      },
    });

    this.isShown = false;
    return this;
  }

  /**
   * 销毁模态框
   */
  destroy(): void {
    this.buttonContainer.destroy();
    this.contentContainer.destroy();
    super.destroy();
  }

  /**
   * 检查是否正在显示
   */
  get shown(): boolean {
    return this.isShown;
  }
}

/**
 * 结果模态框（预配置的通用模态框）
 */
export class ResultModal extends Modal {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    result: {
      winner?: { name: string; color: string };
      isDraw: boolean;
      scores: Array<{ name: string; score: number; color: string }>;
    },
    callbacks: {
      onRestart?: () => void;
      onHome?: () => void;
    } = {}
  ) {
    super(scene, x, y, {
      width: 450,
      height: 350,
      title: result.isDraw ? '平局！🤝' : result.winner ? `${result.winner.name} 获胜！🎉` : '游戏结束',
      titleColor: result.winner?.color || '#333333',
    });

    // 显示分数
    const scoreText = result.scores
      .map((s) => `${s.name}: ${s.score}`)
      .join('  vs  ');

    const scoreDisplay = scene.add.text(0, -20, scoreText, {
      font: 'bold 28px Arial',
      color: '#666666',
    });
    scoreDisplay.setOrigin(0.5, 0.5);
    this.addContent(scoreDisplay);

    // 添加按钮
    this.addButton({
      label: '再来一局',
      onClick: callbacks.onRestart || (() => {}),
    });

    this.addButton({
      label: '返回主页',
      backgroundColor: 0xE0E0E0,
      hoverColor: 0xC0C0C0,
      textColor: '#333333',
      onClick: callbacks.onHome || (() => {}),
    });
  }
}
