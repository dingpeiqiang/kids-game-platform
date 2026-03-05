import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { SCENE_NAMES } from '@/config/constant';

/**
 * 启动场景（初始化后直接进入主菜单）
 */
export class BootScene extends BaseScene {
  constructor() {
    super('BootScene');
  }

  /**
   * 场景创建（直接进入主菜单）
   */
  public create(): void {
    LogUtil.log('BootScene: 启动场景创建');

    // 设置背景色
    this.cameras.main.setBackgroundColor('#FFE66D');

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // 显示启动文字
    const title = this.add.text(centerX, centerY - 50, '🎮 儿童游戏平台', {
      font: 'bold 48px Arial',
      color: '#333333',
    });
    title.setOrigin(0.5, 0.5);

    const subtitle = this.add.text(centerX, centerY + 25, '加载中...', {
      font: '24px Arial',
      color: '#666666',
    });
    subtitle.setOrigin(0.5, 0.5);

    // 0.8秒后进入主菜单场景
    this.time.delayedCall(800, () => {
      LogUtil.log('BootScene: 启动完成，进入主菜单');
      title.destroy();
      subtitle.destroy();
      this.scene.start(SCENE_NAMES.MENU);
    });
  }
}
