import { GAME_CONFIG } from '@/config/game.config';
import { Scene } from 'phaser';
import { LogUtil } from '@/utils/log.util';

/**
 * 游戏基类（所有游戏继承此基类，规范化开发）
 * 封装通用逻辑：初始化、场景管理、适配、销毁
 */
export abstract class BaseGame {
  protected game: Phaser.Game | null = null;
  protected scenes: typeof Scene[] = []; // 游戏场景列表

  constructor(scenes: typeof Scene[]) {
    this.scenes = scenes;
  }

  /**
   * 初始化游戏
   */
  public init(): void {
    try {
      LogUtil.log('开始创建 Phaser 游戏实例...');

      // 检测屏幕尺寸，选择合适的游戏尺寸
      const screenSize = this.getOptimalScreenSize();
      LogUtil.log('屏幕尺寸:', screenSize);

      // 创建游戏实例
      this.game = new Phaser.Game({
        type: GAME_CONFIG.type,
        width: screenSize.width,
        height: screenSize.height,
        parent: GAME_CONFIG.parent,
        backgroundColor: GAME_CONFIG.backgroundColor,
        pixelArt: GAME_CONFIG.pixelArt,
        roundPixels: GAME_CONFIG.roundPixels,
        fps: GAME_CONFIG.fps,
        input: GAME_CONFIG.input,
        audio: GAME_CONFIG.audio,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: screenSize.width,
          height: screenSize.height,
        },
        scene: this.scenes,
      });

      LogUtil.log('Phaser 游戏实例创建成功');

      // 监听游戏销毁
      this.game.events.on('destroy', this.onDestroy.bind(this));

    } catch (error) {
      LogUtil.error('游戏初始化失败：', error);
      LogUtil.error('错误详情：', error instanceof Error ? error.message : String(error));
      this.destroy();
    }
  }

  /**
   * 获取最佳屏幕尺寸（适配手机、平板、PC、智能电视）
   */
  private getOptimalScreenSize(): { width: number; height: number } {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const aspectRatio = screenWidth / screenHeight;

    LogUtil.log(`当前屏幕: ${screenWidth}x${screenHeight}, 宽高比: ${aspectRatio.toFixed(2)}`);

    // 智能电视（大屏幕，通常是 1920x1080 或更大）
    if (screenWidth >= 1920) {
      LogUtil.log('检测到智能电视设备');
      if (aspectRatio >= 1.5) {
        // 16:9 电视（标准）
        return { width: 1920, height: 1080 };
      } else {
        // 其他比例电视
        return { width: screenWidth, height: screenHeight };
      }
    }
    // 大屏 PC / 电视盒子（1280-1920）
    else if (screenWidth >= 1280) {
      LogUtil.log('检测到大屏PC/电视盒子');
      if (aspectRatio > 1) {
        // 横屏，使用 16:9
        return { width: 1280, height: 720 };
      } else {
        // 竖屏，使用 9:16
        return { width: 405, height: 720 };
      }
    }
    // 普通PC / 大屏平板（1024-1280）
    else if (screenWidth >= 1024) {
      LogUtil.log('检测到PC/平板');
      if (aspectRatio > 1) {
        // 横屏
        return { width: 1024, height: 768 };
      } else {
        // 竖屏
        return { width: 768, height: 1024 };
      }
    }
    // 平板端（768-1024）
    else if (screenWidth >= 768) {
      LogUtil.log('检测到平板设备');
      if (aspectRatio > 1) {
        return { width: 1024, height: 768 };
      } else {
        return { width: 768, height: 1024 };
      }
    }
    // 移动端（小于768）
    else {
      LogUtil.log('检测到移动设备');
      if (aspectRatio > 1) {
        // 横屏手机
        return { width: 667, height: 375 };
      } else {
        // 竖屏手机
        return { width: 750, height: 1334 };
      }
    }
  }

  /**
   * 设备适配（核心适配逻辑）
   */
  protected adaptDevice(): void {
    if (!this.game) return;

    try {
      const scaleManager = this.game.scale;
      // 适配策略：宽高比适配，居中显示，不拉伸
      scaleManager.scaleMode = Phaser.Scale.FIT;
      scaleManager.autoCenter = Phaser.Scale.CENTER_BOTH;
      scaleManager.refresh();
      LogUtil.log('设备适配完成');
    } catch (error) {
      LogUtil.error('设备适配失败：', error);
    }
  }

  /**
   * 销毁游戏
   */
  public destroy(): void {
    if (this.game) {
      try {
        this.game.destroy(true);
        this.game = null;
        LogUtil.log('游戏已销毁');
      } catch (error) {
        LogUtil.error('销毁游戏失败：', error);
      }
    }
  }

  /**
   * 销毁回调（子类可重写）
   */
  protected onDestroy(): void {
    // 子类实现自定义销毁逻辑
  }
}
