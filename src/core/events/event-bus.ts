/**
 * 类型安全的事件总线
 * 用于游戏内部各模块间的通信
 */

import Phaser from 'phaser';
import { GameEventData, GameEventCallback } from './game-events';

/**
 * 游戏事件总线
 * 提供事件的发布/订阅功能，带完整类型推导
 */
export class GameEventBus {
  private emitter: Phaser.Events.EventEmitter;
  private static instance: GameEventBus;

  private constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): GameEventBus {
    if (!GameEventBus.instance) {
      GameEventBus.instance = new GameEventBus();
    }
    return GameEventBus.instance;
  }

  /**
   * 订阅事件
   */
  public on<K extends GameEventData['type']>(
    eventType: K,
    callback: (data: Extract<GameEventData, { type: K }>) => void,
    context?: unknown
  ): this {
    this.emitter.on(eventType, callback, context);
    return this;
  }

  /**
   * 一次性订阅事件
   */
  public once<K extends GameEventData['type']>(
    eventType: K,
    callback: (data: Extract<GameEventData, { type: K }>) => void,
    context?: unknown
  ): this {
    this.emitter.once(eventType, callback, context);
    return this;
  }

  /**
   * 发布事件
   */
  public emit<K extends GameEventData['type']>(
    eventType: K,
    data: Extract<GameEventData, { type: K }>
  ): boolean {
    return this.emitter.emit(eventType, data);
  }

  /**
   * 取消订阅
   */
  public off<K extends GameEventData['type']>(
    eventType?: K,
    callback?: GameEventCallback,
    context?: unknown
  ): this {
    if (eventType) {
      this.emitter.off(eventType, callback as (...args: unknown[]) => void, context);
    } else {
      this.emitter.off();
    }
    return this;
  }

  /**
   * 停止事件传播
   */
  public stopPropagation(): void {
    this.emitter.stopPropagation();
  }

  /**
   * 获取事件监听器数量
   */
  public listenerCount(eventType: GameEventData['type']): number {
    return this.emitter.listenerCount(eventType);
  }
}

/** 全局事件总线实例 */
export const gameEventBus = GameEventBus.getInstance();
