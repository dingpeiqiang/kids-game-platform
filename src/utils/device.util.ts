/**
 * 多端设备检测与适配工具
 * 支持手机、平板、PC、智能电视
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'pc' | 'tv';
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  hasTouch: boolean;
  hasKeyboard: boolean;
  hasMouse: boolean;
  isTV: boolean;
  isLandscape: boolean;
}

export class DeviceUtil {
  private static resizeCallback: (() => void) | null = null;

  /**
   * 获取设备信息（每次动态计算）
   */
  static getDeviceInfo(): DeviceInfo {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isLandscape = screenWidth > screenHeight;
    const aspectRatio = screenWidth / screenHeight;

    // 检测设备类型
    let type: 'mobile' | 'tablet' | 'pc' | 'tv';

    // 智能电视检测
    if (this.isSmartTV()) {
      type = 'tv';
    }
    // PC 检测（考虑横竖屏）
    else if (screenWidth >= 1024 && !this.isMobile()) {
      type = 'pc';
    }
    // 平板检测
    else if (screenWidth >= 768 || (isLandscape && screenWidth >= 640)) {
      type = 'tablet';
    }
    // 移动设备
    else {
      type = 'mobile';
    }

    const deviceInfo: DeviceInfo = {
      type,
      orientation: isLandscape ? 'landscape' : 'portrait',
      isLandscape,
      screenWidth,
      screenHeight,
      pixelRatio: window.devicePixelRatio || 1,
      hasTouch: this.hasTouchSupport(),
      hasKeyboard: this.hasKeyboardSupport(),
      hasMouse: this.hasMouseSupport(),
      isTV: this.isSmartTV(),
    };

    return deviceInfo;
  }

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
   * 获取最优的游戏分辨率（动态适配）
   */
  static getOptimalGameResolution(): { width: number; height: number } {
    const device = this.getDeviceInfo();
    const { screenWidth, screenHeight, isLandscape } = device;

    // 根据设备类型和屏幕方向选择最优分辨率
    switch (device.type) {
      case 'tv':
        return { width: screenWidth, height: screenHeight };

      case 'pc':
        if (isLandscape) {
          return screenWidth >= 1440 ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
        }
        return { width: 900, height: 1200 };

      case 'tablet':
        if (isLandscape) {
          return { width: 1024, height: 768 };
        }
        return { width: 768, height: 1024 };

      case 'mobile':
      default:
        if (isLandscape) {
          // 横屏移动设备
          return { width: Math.min(667, screenWidth), height: Math.min(375, screenHeight) };
        }
        // 竖屏移动设备
        return { width: Math.min(750, screenWidth), height: Math.min(1334, screenHeight) };
    }
  }

  /**
   * 获取适配缩放因子（考虑屏幕尺寸）
   */
  static getScaleFactor(): number {
    const device = this.getDeviceInfo();
    const minDimension = Math.min(device.screenWidth, device.screenHeight);

    // 电视使用大缩放
    if (device.type === 'tv') {
      return 1.5;
    }
    // 大屏PC
    if (device.type === 'pc' && minDimension >= 1200) {
      return 1.3;
    }
    // 普通PC
    if (device.type === 'pc') {
      return 1.15;
    }
    // 平板横屏
    if (device.type === 'tablet' && device.isLandscape) {
      return 1.1;
    }
    // 小屏幕平板/大屏手机
    if (minDimension >= 600) {
      return 1.05;
    }
    // 小屏手机
    return 0.95;
  }

  /**
   * 获取最优字体大小
   */
  static getOptimalFontSize(baseSize: number): number {
    const scale = this.getScaleFactor();
    return Math.round(baseSize * scale);
  }

  /**
   * 获取游戏卡片尺寸（响应式）
   */
  static getGameCardSize(): { width: number; height: number } {
    const device = this.getDeviceInfo();
    const { screenWidth, screenHeight, isLandscape, type } = device;

    if (type === 'tv') {
      return { width: 280, height: 200 };
    }
    if (type === 'pc') {
      return isLandscape ? { width: 260, height: 180 } : { width: 220, height: 160 };
    }
    if (type === 'tablet') {
      return isLandscape ? { width: 240, height: 170 } : { width: 200, height: 150 };
    }
    // mobile
    if (isLandscape) {
      return { width: Math.min(200, screenWidth / 3), height: 140 };
    }
    return { width: Math.min(220, screenWidth / 2.5), height: 150 };
  }

  /**
   * 获取布局列数
   */
  static getColumnsCount(): number {
    const device = this.getDeviceInfo();
    const { screenWidth, isLandscape, type } = device;

    if (type === 'tv') {
      return 5;
    }
    if (type === 'pc') {
      return isLandscape ? 4 : 3;
    }
    if (type === 'tablet') {
      return isLandscape ? 4 : 3;
    }
    // mobile
    return isLandscape ? 3 : 2;
  }

  /**
   * 监听窗口大小变化
   */
  static onResize(callback: () => void): void {
    this.resizeCallback = callback;
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
  }

  /**
   * 移除窗口大小监听
   */
  static removeResizeListener(): void {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    this.resizeCallback = null;
  }

  private static handleResize = (): void => {
    if (this.resizeCallback) {
      // 延迟执行，等待布局完成
      setTimeout(() => {
        this.resizeCallback?.();
      }, 100);
    }
  };

  /**
   * 是否需要遥控器模式
   */
  static needsRemoteControlMode(): boolean {
    return this.isSmartTV();
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
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    }
    if ((element as any).webkitRequestFullscreen) {
      return (element as any).webkitRequestFullscreen();
    }
    if ((element as any).mozRequestFullScreen) {
      return (element as any).mozRequestFullScreen();
    }
    if ((element as any).msRequestFullscreen) {
      return (element as any).msRequestFullscreen();
    }
    return Promise.reject('Fullscreen not supported');
  }

  /**
   * 退出全屏模式
   */
  static exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    }
    if ((document as any).webkitExitFullscreen) {
      return (document as any).webkitExitFullscreen();
    }
    if ((document as any).mozCancelFullScreen) {
      return (document as any).mozCancelFullScreen();
    }
    if ((document as any).msExitFullscreen) {
      return (document as any).msExitFullscreen();
    }
    return Promise.reject('Fullscreen exit not supported');
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
