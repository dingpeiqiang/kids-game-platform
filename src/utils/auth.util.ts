/**
 * 认证工具类
 * 提供登录状态验证功能
 */

import { userService } from '@/services/user.service';
import { LogUtil } from '@/utils/log.util';

export class AuthUtil {
  /**
   * 验证登录状态
   * 如果未登录，跳转到登录场景
   *
   * @param scene Phaser场景实例
   * @returns 是否已登录
   */
  static checkLoginStatus(scene: Phaser.Scene): boolean {
    const currentUser = userService.getCurrentUser();

    if (!currentUser) {
      const sceneKey = scene.scene.key;
      LogUtil.log(`[AuthUtil] 场景 ${sceneKey}: 用户未登录，跳转到登录场景`);

      // 停止当前场景并跳转到登录场景
      scene.scene.start('LoginScene');

      return false;
    }

    return true;
  }

  /**
   * 获取当前用户信息
   *
   * @returns 当前用户或null
   */
  static getCurrentUser() {
    return userService.getCurrentUser();
  }

  /**
   * 强制用户登出
   */
  static logout(): void {
    userService.logout();
  }

  /**
   * 创建场景混入方法
   * 可以在场景中使用 checkAuth() 方法验证登录状态
   */
  static createSceneMixin(scene: Phaser.Scene) {
    return {
      /**
       * 验证登录状态
       * 在场景创建时调用
       */
      checkAuth(): boolean {
        return AuthUtil.checkLoginStatus(scene);
      },

      /**
       * 获取当前用户
       */
      getCurrentUser() {
        return AuthUtil.getCurrentUser();
      },
    };
  }
}
