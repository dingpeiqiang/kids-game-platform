/**
 * 设备适配模块
 * 职责：根据检测结果进行屏幕适配、尺寸计算
 */

import { DeviceDetector, DeviceInfo } from './detector';

/**
 * UI 尺寸配置
 */
export interface UISizeConfig {
  fontScale: number;
  cardWidth: number;
  cardHeight: number;
  columns: number;
}

/**
 * 游戏分辨率配置
 */
export interface ResolutionConfig {
  width: number;
  height: number;
}

/**
 * 设备适配器
 * 基于设备检测结果提供适配策略
 */
export class DeviceAdapter {
  private static cachedInfo: DeviceInfo | null = null;

  /**
   * 获取缓存的设备信息（避免频繁计算）
   */
  static getDeviceInfo(): DeviceInfo {
    if (!this.cachedInfo) {
      this.cachedInfo = DeviceDetector.getDeviceInfo();
    }
    return this.cachedInfo;
  }

  /**
   * 刷新设备信息缓存
   */
  static refreshDeviceInfo(): DeviceInfo {
    this.cachedInfo = DeviceDetector.getDeviceInfo();
    return this.cachedInfo;
  }

  /**
   * 获取适配缩放因子
   */
  static getScaleFactor(): number {
    const device = this.getDeviceInfo();
    const minDimension = Math.min(device.screenWidth, device.screenHeight);

    switch (device.type) {
      case 'tv':
        return 1.5;
      case 'pc':
        if (minDimension >= 1200) return 1.3;
        return 1.15;
      case 'tablet':
        return device.isLandscape ? 1.1 : 1.05;
      case 'mobile':
      default:
        return minDimension >= 600 ? 1.05 : 0.95;
    }
  }

  /**
   * 获取最优字体大小
   */
  static getOptimalFontSize(baseSize: number): number {
    const scale = this.getScaleFactor();
    return Math.round(baseSize * scale);
  }

  /**
   * 获取游戏分辨率配置
   */
  static getOptimalGameResolution(): ResolutionConfig {
    const device = this.getDeviceInfo();
    const { screenWidth, screenHeight, isLandscape, type } = device;

    switch (type) {
      case 'tv':
        return { width: screenWidth, height: screenHeight };
      case 'pc':
        if (isLandscape) {
          return screenWidth >= 1440 ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
        }
        return { width: 900, height: 1200 };
      case 'tablet':
        return isLandscape ? { width: 1024, height: 768 } : { width: 768, height: 1024 };
      case 'mobile':
      default:
        if (isLandscape) {
          return { width: Math.min(667, screenWidth), height: Math.min(375, screenHeight) };
        }
        return { width: Math.min(750, screenWidth), height: Math.min(1334, screenHeight) };
    }
  }

  /**
   * 获取游戏卡片尺寸
   */
  static getGameCardSize(): { width: number; height: number } {
    const device = this.getDeviceInfo();
    const { screenWidth, screenHeight, isLandscape, type } = device;

    switch (type) {
      case 'tv':
        return { width: 280, height: 200 };
      case 'pc':
        return isLandscape ? { width: 260, height: 180 } : { width: 220, height: 160 };
      case 'tablet':
        return isLandscape ? { width: 240, height: 170 } : { width: 200, height: 150 };
      case 'mobile':
      default:
        if (isLandscape) {
          return { width: Math.min(200, screenWidth / 3), height: 140 };
        }
        return { width: Math.min(220, screenWidth / 2.5), height: 150 };
    }
  }

  /**
   * 获取布局列数
   */
  static getColumnsCount(): number {
    const device = this.getDeviceInfo();
    const { screenWidth, isLandscape, type } = device;

    switch (type) {
      case 'tv':
        return 5;
      case 'pc':
        return isLandscape ? 4 : 3;
      case 'tablet':
        return isLandscape ? 4 : 3;
      case 'mobile':
      default:
        return isLandscape ? 3 : 2;
    }
  }

  /**
   * 获取 UI 尺寸配置
   */
  static getUISizeConfig(): UISizeConfig {
    return {
      fontScale: this.getScaleFactor(),
      ...this.getGameCardSize(),
      columns: this.getColumnsCount(),
    };
  }

  /**
   * 是否需要遥控器模式（TV设备）
   */
  static needsRemoteControlMode(): boolean {
    return DeviceDetector.isSmartTV();
  }

  /**
   * 禁用默认滚动行为
   */
  static disableScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  /**
   * 启用全屏模式
   */
  static enableFullscreen(): Promise<void> {
    const element = document.documentElement;
    const requestFullscreen = 
      element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen;
    
    if (requestFullscreen) {
      return requestFullscreen.call(element);
    }
    return Promise.reject(new Error('Fullscreen not supported'));
  }

  /**
   * 退出全屏模式
   */
  static exitFullscreen(): Promise<void> {
    const exitFullscreen = 
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen;

    if (exitFullscreen) {
      return exitFullscreen.call(document);
    }
    return Promise.reject(new Error('Exit fullscreen not supported'));
  }

  /**
   * 检测是否在全屏模式
   */
  static isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }
}
