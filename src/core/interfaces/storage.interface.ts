/**
 * 存储接口定义
 * 抽象存储操作，便于后期扩展（如IndexedDB、远程存储等）
 */

/**
 * 存储值类型
 */
export type StorageValue = string | number | boolean | object | null;

/**
 * 存储选项
 */
export interface StorageOptions {
  /** 存储命名空间 */
  namespace?: string;
  /** 过期时间（毫秒） */
  expires?: number;
  /** 是否加密 */
  encrypt?: boolean;
}

/**
 * 存储接口
 */
export interface IStorage {
  /**
   * 设置值
   */
  set<T extends StorageValue>(key: string, value: T, options?: StorageOptions): void;

  /**
   * 获取值
   */
  get<T extends StorageValue>(key: string, defaultValue?: T): T | undefined;

  /**
   * 删除值
   */
  remove(key: string): void;

  /**
   * 清空存储
   */
  clear(): void;

  /**
   * 检查键是否存在
   */
  has(key: string): boolean;

  /**
   * 获取所有键
   */
  keys(): string[];

  /**
   * 获取存储大小
   */
  size(): number;
}

/**
 * 用户数据接口
 */
export interface IUserData {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 头像 */
  avatar: string;
  /** 点数 */
  points: number;
  /** 收藏的游戏ID列表 */
  favorites: string[];
  /** 最近玩过的游戏ID列表 */
  recentGames: string[];
  /** 当前学龄 */
  grade: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 游戏记录接口
 */
export interface IGameRecord {
  /** 记录ID */
  id: string;
  /** 游戏ID */
  gameId: string;
  /** 玩家ID */
  playerId: string;
  /** 得分 */
  score: number;
  /** 游戏时长（毫秒） */
  duration: number;
  /** 游戏模式 */
  mode: 'single' | 'battle';
  /** 名次（多人模式） */
  rank?: number;
  /** 游玩时间 */
  playedAt: string;
}

/**
 * 游戏进度接口
 */
export interface IGameProgress {
  /** 游戏ID */
  gameId: string;
  /** 最高分 */
  highScore: number;
  /** 游戏次数 */
  playCount: number;
  /** 总游戏时长 */
  totalDuration: number;
  /** 最后游玩时间 */
  lastPlayedAt: string;
  /** 完成进度 */
  completion?: Record<string, number>;
}
