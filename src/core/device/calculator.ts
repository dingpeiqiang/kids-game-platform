/**
 * UI 尺寸计算器
 * 职责：基于设备信息和游戏设计尺寸，计算具体UI元素的尺寸
 */

import { DeviceAdapter } from './adapter';

/**
 * 元素尺寸配置
 */
export interface ElementSize {
  width: number;
  height: number;
  fontSize: number;
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  padding: number;
  gap: number;
  buttonSize: number;
  iconSize: number;
}

/**
 * 屏幕尺寸计算器
 * 用于游戏内 UI 元素的尺寸计算
 */
export class DeviceCalculator {
  /**
   * 基于设计尺寸计算实际尺寸
   */
  static calculateSize(designWidth: number, designHeight: number): ElementSize {
    const scale = DeviceAdapter.getScaleFactor();
    return {
      width: Math.round(designWidth * scale),
      height: Math.round(designHeight * scale),
      fontSize: Math.round(16 * scale),
    };
  }

  /**
   * 计算游戏内按钮尺寸
   */
  static getButtonSize(baseSize: number = 100): number {
    const scale = DeviceAdapter.getScaleFactor();
    return Math.round(baseSize * scale);
  }

  /**
   * 计算布局间距
   */
  static getLayoutSpacing(): LayoutConfig {
    const scale = DeviceAdapter.getScaleFactor();
    const device = DeviceAdapter.getDeviceInfo();
    
    // 根据设备类型调整间距
    let multiplier = 1;
    if (device.type === 'tv') multiplier = 1.5;
    else if (device.type === 'pc') multiplier = 1.25;
    else if (device.type === 'tablet') multiplier = 1.1;

    return {
      padding: Math.round(20 * scale * multiplier),
      gap: Math.round(16 * scale * multiplier),
      buttonSize: Math.round(100 * scale),
      iconSize: Math.round(60 * scale),
    };
  }

  /**
   * 计算网格布局参数
   */
  static calculateGridLayout(
    containerWidth: number,
    containerHeight: number,
    itemCount: number
  ): {
    cols: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
    gapX: number;
    gapY: number;
  } {
    const cols = DeviceAdapter.getColumnsCount();
    const rows = Math.ceil(itemCount / cols);
    const spacing = this.getLayoutSpacing();

    // 计算单元格尺寸
    const totalGapX = spacing.gap * (cols - 1);
    const totalGapY = spacing.gap * (rows - 1);
    const cellWidth = Math.floor((containerWidth - totalGapX) / cols);
    const cellHeight = Math.floor((containerHeight - totalGapY) / rows);

    return {
      cols,
      rows,
      cellWidth,
      cellHeight,
      gapX: spacing.gap,
      gapY: spacing.gap,
    };
  }

  /**
   * 计算居中位置
   */
  static calculateCenterPosition(
    containerWidth: number,
    containerHeight: number,
    elementWidth: number,
    elementHeight: number
  ): { x: number; y: number } {
    return {
      x: (containerWidth - elementWidth) / 2,
      y: (containerHeight - elementHeight) / 2,
    };
  }

  /**
   * 计算响应式字体大小
   */
  static getResponsiveFontSize(
    baseSize: number,
    options: {
      minScale?: number;
      maxScale?: number;
    } = {}
  ): number {
    const { minScale = 0.8, maxScale = 1.5 } = options;
    const scale = DeviceAdapter.getScaleFactor();
    const clampedScale = Math.max(minScale, Math.min(maxScale, scale));
    return Math.round(baseSize * clampedScale);
  }

  /**
   * 计算圆角半径
   */
  static getBorderRadius(baseRadius: number = 10): number {
    const scale = DeviceAdapter.getScaleFactor();
    return Math.round(baseRadius * scale);
  }
}
