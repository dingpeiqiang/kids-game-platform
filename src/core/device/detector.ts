/**
 * 设备检测模块
 * 职责：纯检测逻辑，不包含任何适配或UI计算
 */

export type DeviceType = 'mobile' | 'tablet' | 'pc' | 'tv';
export type Orientation = 'portrait' | 'landscape';

/** 设备信息接口 */
export interface DeviceInfo {
  type: DeviceType;
  orientation: Orientation;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  hasTouch: boolean;
  hasKeyboard: boolean;
  hasMouse: boolean;
  isTV: boolean;
  isLandscape: boolean;
}

/**
 * 设备检测器
 * 提供纯检测功能，无副作用
 */
export class DeviceDetector {
  /**
   * 检测是否为移动设备
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * 检测是否为智能电视
   */
  static isSmartTV(): boolean {
    const tvUA = /TV|Television|SmartTV|Web0S|Tizen|Android TV|GoogleTV|Fire TV|Apple TV/i.test(navigator.userAgent);
    const largeScreen = window.innerWidth >= 1920;
    const noPointerDevice = !this.hasMouseSupport() && !this.hasTouchSupport();
    return tvUA || (largeScreen && noPointerDevice);
  }

  /**
   * 检测触摸支持
   */
  static hasTouchSupport(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * 检测键盘支持
   */
  static hasKeyboardSupport(): boolean {
    return !this.isMobile() && !this.isSmartTV();
  }

  /**
   * 检测鼠标支持
   */
  static hasMouseSupport(): boolean {
    return 'onmousemove' in window && !this.hasTouchSupport();
  }

  /**
   * 获取设备类型
   */
  static getDeviceType(): DeviceType {
    const screenWidth = window.innerWidth;

    if (this.isSmartTV()) {
      return 'tv';
    }
    if (screenWidth >= 1024 && !this.isMobile()) {
      return 'pc';
    }
    if (screenWidth >= 768 || (window.innerWidth > window.innerHeight && screenWidth >= 640)) {
      return 'tablet';
    }
    return 'mobile';
  }

  /**
   * 获取屏幕方向
   */
  static getOrientation(): Orientation {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  /**
   * 获取完整的设备信息
   */
  static getDeviceInfo(): DeviceInfo {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isLandscape = screenWidth > screenHeight;

    return {
      type: this.getDeviceType(),
      orientation: this.getOrientation(),
      screenWidth,
      screenHeight,
      pixelRatio: window.devicePixelRatio || 1,
      hasTouch: this.hasTouchSupport(),
      hasKeyboard: this.hasKeyboardSupport(),
      hasMouse: this.hasMouseSupport(),
      isTV: this.isSmartTV(),
      isLandscape,
    };
  }
}
