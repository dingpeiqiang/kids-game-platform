/**
 * 游戏渲染器接口
 * 定义游戏场景渲染的抽象接口，便于测试和替换实现
 */

import { Player, IGameState, PlayerId, Score, HexColor } from '../events';

/** 题目数据 */
export interface Question {
  id: string;
  type: 'color' | 'shape' | 'number' | 'custom';
  content: unknown;
  options?: unknown[];
}

/** 反馈类型 */
export type FeedbackType = 'success' | 'error' | 'info';

/**
 * 游戏渲染器接口
 * 游戏逻辑通过此接口与渲染层通信
 */
export interface IGameRenderer {
  /**
   * 显示题目
   */
  showQuestion(question: Question): void;

  /**
   * 隐藏题目
   */
  hideQuestion(): void;

  /**
   * 显示反馈消息
   */
  showFeedback(message: string, type: FeedbackType): void;

  /**
   * 更新分数显示
   */
  updateScore(playerId: PlayerId, score: Score): void;

  /**
   * 更新所有玩家分数
   */
  updateAllScores(scores: Map<PlayerId, Score>): void;

  /**
   * 高亮当前玩家
   */
  highlightPlayer(playerId: PlayerId): void;

  /**
   * 显示回合提示
   */
  showRoundIndicator(round: number, totalRounds: number): void;

  /**
   * 显示加载状态
   */
  showLoading(message?: string): void;

  /**
   * 隐藏加载状态
   */
  hideLoading(): void;

  /**
   * 清理渲染
   */
  clear(): void;
}

/**
 * 输入处理器接口
 * 定义处理用户输入的抽象接口
 */
export interface IInputHandler {
  /**
   * 注册答案提交回调
   */
  onAnswer(callback: (playerId: PlayerId, answer: unknown) => void): void;

  /**
   * 注册暂停回调
   */
  onPause(callback: () => void): void;

  /**
   * 注册返回回调
   */
  onBack(callback: () => void): void;

  /**
   * 启用输入
   */
  enable(): void;

  /**
   * 禁用输入
   */
  disable(): void;

  /**
   * 清理事件监听
   */
  destroy(): void;
}

/**
 * 游戏生命周期接口
 */
export interface IGameLifecycle {
  /**
   * 初始化游戏
   */
  init(config: unknown): Promise<void>;

  /**
   * 开始游戏
   */
  start(): void;

  /**
   * 暂停游戏
   */
  pause(): void;

  /**
   * 恢复游戏
   */
  resume(): void;

  /**
   * 重新开始
   */
  restart(): void;

  /**
   * 结束游戏
   */
  end(): void;

  /**
   * 销毁游戏
   */
  destroy(): void;
}

/**
 * 分数计算器接口
 */
export interface IScoreCalculator {
  /**
   * 计算得分
   */
  calculateScore(playerId: PlayerId, answer: unknown, correct: boolean): Score;

  /**
   * 获取排行榜
   */
  getLeaderboard(): Array<{ player: Player; score: Score }>;

  /**
   * 获取胜利者
   */
  getWinner(): Player | null;

  /**
   * 判断是否平局
   */
  isDraw(): boolean;
}
