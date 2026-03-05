import { GAME_CONFIG } from '@/config/game.config';

/**
 * 设备适配工具（屏幕适配、触摸/鼠标兼容）
 */
export class DeviceAdapter {
  /**
   * 检测是否为移动设备
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  /**
   * 检测是否为触摸设备
   */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * 获取设备信息
   */
  static getDeviceInfo(): {
    isMobile: boolean;
    isTouch: boolean;
    screenWidth: number;
    screenHeight: number;
    devicePixelRatio: number;
  } {
    return {
      isMobile: this.isMobile(),
      isTouch: this.isTouchDevice(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  }

  /**
   * 计算适配比例
   */
  static getScaleRatio(): { scaleX: number; scaleY: number } {
    const deviceInfo = this.getDeviceInfo();
    const scaleX = deviceInfo.screenWidth / GAME_CONFIG.width;
    const scaleY = deviceInfo.screenHeight / GAME_CONFIG.height;
    return { scaleX, scaleY };
  }

  /**
   * 禁用页面默认行为（防止拖拽、缩放）
   */
  static disableDefaultBehavior(): void {
    // 禁用右键菜单
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    // 禁用默认触摸行为
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }
}
