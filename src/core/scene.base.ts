import { Scene } from 'phaser';

/**
 * 场景基类（所有场景继承此基类）
 * 封装场景通用逻辑：预加载、创建、更新、销毁
 */
export abstract class BaseScene extends Scene {
  constructor(key: string) {
    super(key);
  }

  /**
   * 预加载资源（子类可重写）
   */
  public preload(): void {
    // 子类实现资源加载逻辑
  }

  /**
   * 创建场景（子类可重写）
   */
  public create(): void {
    // 子类实现场景创建逻辑
  }

  /**
   * 更新场景（子类可重写）
   */
  public update(_time: number, _delta: number): void {
    // 子类实现场景更新逻辑
  }

  /**
   * 场景销毁
   */
  public shutdown(): void {
    // 清理资源
  }
}
