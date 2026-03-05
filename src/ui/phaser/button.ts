/**
 * Phaser 按钮组件
 * 统一的按钮实现，支持点击、悬停、禁用等状态
 */

import Phaser from 'phaser';
import { DeviceCalculator } from '../../core/device';

/** 按钮选项 */
export interface ButtonOptions {
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 背景颜色 */
  backgroundColor?: number;
  /** 悬停背景颜色 */
  hoverColor?: number;
  /** 点击背景颜色 */
  activeColor?: number;
  /** 边框颜色 */
  borderColor?: number;
  /** 边框宽度 */
  borderWidth?: number;
  /** 圆角 */
  borderRadius?: number;
  /** 文本 */
  text?: string;
  /** 文本颜色 */
  textColor?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 是否可用 */
  enabled?: boolean;
}

/**
 * 统一按钮组件
 */
export class Button extends Phaser.GameObjects.Container {
  private background!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private isHighlighted = false;
  private isDisabled = false;

  // 回调
  private onClickCallback?: () => void;
  private onHoverCallback?: () => void;
  private onOutCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: ButtonOptions = {}
  ) {
    super(scene, x, y);

    const {
      width = 200,
      height = 50,
      backgroundColor = 0x95E1D3,
      hoverColor = 0x7BC4B0,
      activeColor = 0x6BB09A,
      borderColor = 0x333333,
      borderWidth = 2,
      borderRadius = 10,
      text = '',
      textColor = '#333333',
      fontSize = 24,
      enabled = true,
    } = options;

    this.setSize(width, height);

    // 创建背景
    this.background = scene.add.graphics();
    this.drawBackground(backgroundColor, borderColor, borderWidth, borderRadius);
    this.add(this.background);

    // 创建文本
    this.label = scene.add.text(0, 0, text, {
      font: `bold ${fontSize}px Arial`,
      color: textColor,
    });
    this.label.setOrigin(0.5, 0.5);
    this.add(this.label);

    // 设置交互
    this.setInteractive({ useHandCursor: enabled });

    // 绑定事件
    this.bindEvents(hoverColor, activeColor, borderRadius);

    // 设置初始状态
    this.isDisabled = !enabled;
    if (!enabled) {
      this.setAlpha(0.5);
    }

    scene.add.existing(this);
  }

  /**
   * 绘制背景
   */
  private drawBackground(
    bgColor: number,
    borderColor: number,
    borderWidth: number,
    radius: number
  ): void {
    const width = this.width;
    const height = this.height;

    this.background.clear();

    // 绘制边框
    if (borderWidth > 0) {
      this.background.lineStyle(borderWidth, borderColor, 1);
    }

    // 绘制背景
    this.background.fillStyle(bgColor, 1);
    this.background.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

    // 绘制边框
    if (borderWidth > 0) {
      this.background.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(hoverColor: number, activeColor: number, radius: number): void {
    this.on('pointerover', () => {
      if (this.isDisabled) return;
      this.drawBackground(hoverColor, 0x333333, 2, radius);
      this.onHoverCallback?.();
    });

    this.on('pointerout', () => {
      if (this.isDisabled) return;
      this.drawBackground(0x95E1D3, 0x333333, 2, radius);
      this.onOutCallback?.();
    });

    this.on('pointerdown', () => {
      if (this.isDisabled) return;
      this.drawBackground(activeColor, 0x333333, 2, radius);
    });

    this.on('pointerup', () => {
      if (this.isDisabled) return;
      this.drawBackground(0x95E1D3, 0x333333, 2, radius);
      this.onClickCallback?.();
    });
  }

  /**
   * 设置点击回调
   */
  setOnClick(callback: () => void): this {
    this.onClickCallback = callback;
    return this;
  }

  /**
   * 设置悬停回调
   */
  setOnHover(callback: () => void): this {
    this.onHoverCallback = callback;
    return this;
  }

  /**
   * 设置离开回调
   */
  setOnOut(callback: () => void): this {
    this.onOutCallback = callback;
    return this;
  }

  /**
   * 设置高亮状态
   */
  setHighlighted(value: boolean): this {
    this.isHighlighted = value;
    if (value) {
      this.setScale(1.1);
      this.drawBackground(0xFFD93D, 0x333333, 3, 10);
    } else {
      this.setScale(1);
      this.drawBackground(0x95E1D3, 0x333333, 2, 10);
    }
    return this;
  }

  /**
   * 禁用按钮
   */
  disable(): this {
    this.isDisabled = true;
    this.setAlpha(0.5);
    this.setInteractive(false);
    return this;
  }

  /**
   * 启用按钮
   */
  enable(): this {
    this.isDisabled = false;
    this.setAlpha(1);
    this.setInteractive({ useHandCursor: true });
    return this;
  }

  /**
   * 设置文本
   */
  setButtonText(text: string): this {
    this.label.setText(text);
    return this;
  }

  /**
   * 获取按钮文本
   */
  getButtonText(): string {
    return this.label.text;
  }
}
