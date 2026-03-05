/**
 * 应用配置中心
 * 统一管理所有配置：游戏元数据、用户配置、运行时配置
 */

import { StorageUtil } from '../utils/storage.util';

/** 游戏元数据 */
export interface GameMetadata {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  color: string;
  sceneName: string;
  enabled: boolean;
  tags: string[];
  ageRange: string;
}

/** 用户配置 */
export interface UserConfig {
  favorites: string[];
  lastPlayed: string | null;
  grade: string;
  points: number;
  username: string;
  avatar: string;
}

/** 运行时配置 */
export interface RuntimeConfig {
  currentGame: string | null;
  battleMode: boolean;
  playerCount: number;
}

/** 完整应用配置 */
export interface AppConfig {
  games: GameMetadata[];
  user: UserConfig;
  runtime: RuntimeConfig;
}

/** 默认用户配置 */
const DEFAULT_USER_CONFIG: UserConfig = {
  favorites: [],
  lastPlayed: null,
  grade: 'g1',
  points: 10,
  username: '小玩家',
  avatar: '🐱',
};

/** 默认运行时配置 */
const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  currentGame: null,
  battleMode: false,
  playerCount: 1,
};

/**
 * 配置存储键
 */
const CONFIG_KEYS = {
  USER: 'app_user_config',
  GAMES: 'app_games_config',
};

/**
 * 应用配置管理器
 */
export class AppConfigManager {
  private static instance: AppConfigManager;

  private userConfig: UserConfig;
  private runtimeConfig: RuntimeConfig;
  private gameMetadata: GameMetadata[] = [];

  private constructor() {
    this.userConfig = this.loadUserConfig();
    this.runtimeConfig = { ...DEFAULT_RUNTIME_CONFIG };
    this.loadGameMetadata();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): AppConfigManager {
    if (!AppConfigManager.instance) {
      AppConfigManager.instance = new AppConfigManager();
    }
    return AppConfigManager.instance;
  }

  /**
   * 加载用户配置
   */
  private loadUserConfig(): UserConfig {
    try {
      const stored = StorageUtil.get<UserConfig>(CONFIG_KEYS.USER);
      if (stored) {
        return { ...DEFAULT_USER_CONFIG, ...stored };
      }
    } catch (e) {
      console.error('加载用户配置失败:', e);
    }
    return { ...DEFAULT_USER_CONFIG };
  }

  /**
   * 保存用户配置
   */
  private saveUserConfig(): void {
    StorageUtil.set(CONFIG_KEYS.USER, this.userConfig);
  }

  /**
   * 加载游戏元数据
   */
  private loadGameMetadata(): void {
    // 静态导入游戏列表（可替换为远程加载）
    const { GAME_LIST } = require('./constant');
    this.gameMetadata = GAME_LIST as GameMetadata[];
  }

  // ===== 用户配置操作 =====

  /**
   * 获取用户配置
   */
  public getUserConfig(): UserConfig {
    return { ...this.userConfig };
  }

  /**
   * 更新用户配置
   */
  public updateUserConfig(updates: Partial<UserConfig>): void {
    this.userConfig = { ...this.userConfig, ...updates };
    this.saveUserConfig();
  }

  /**
   * 添加收藏
   */
  public addFavorite(gameId: string): void {
    if (!this.userConfig.favorites.includes(gameId)) {
      this.userConfig.favorites.push(gameId);
      this.saveUserConfig();
    }
  }

  /**
   * 移除收藏
   */
  public removeFavorite(gameId: string): void {
    const index = this.userConfig.favorites.indexOf(gameId);
    if (index > -1) {
      this.userConfig.favorites.splice(index, 1);
      this.saveUserConfig();
    }
  }

  /**
   * 检查是否收藏
   */
  public isFavorite(gameId: string): boolean {
    return this.userConfig.favorites.includes(gameId);
  }

  /**
   * 设置学龄
   */
  public setGrade(grade: string): void {
    this.userConfig.grade = grade;
    this.saveUserConfig();
  }

  /**
   * 添加点数
   */
  public addPoints(points: number): void {
    this.userConfig.points = Math.max(0, this.userConfig.points + points);
    this.saveUserConfig();
  }

  /**
   * 消费点数
   */
  public consumePoints(points: number): boolean {
    if (this.userConfig.points >= points) {
      this.userConfig.points -= points;
      this.saveUserConfig();
      return true;
    }
    return false;
  }

  // ===== 游戏元数据操作 =====

  /**
   * 获取所有游戏
   */
  public getAllGames(): GameMetadata[] {
    return [...this.gameMetadata];
  }

  /**
   * 获取启用的游戏
   */
  public getEnabledGames(): GameMetadata[] {
    return this.gameMetadata.filter((g) => g.enabled);
  }

  /**
   * 根据类型获取游戏
   */
  public getGamesByType(type: string): GameMetadata[] {
    return this.gameMetadata.filter((g) => g.type === type);
  }

  /**
   * 获取游戏详情
   */
  public getGameById(id: string): GameMetadata | undefined {
    return this.gameMetadata.find((g) => g.id === id);
  }

  /**
   * 搜索游戏
   */
  public searchGames(keyword: string): GameMetadata[] {
    const lower = keyword.toLowerCase();
    return this.gameMetadata.filter(
      (g) =>
        g.name.toLowerCase().includes(lower) ||
        g.description.toLowerCase().includes(lower) ||
        g.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }

  // ===== 运行时配置操作 =====

  /**
   * 获取运行时配置
   */
  public getRuntimeConfig(): RuntimeConfig {
    return { ...this.runtimeConfig };
  }

  /**
   * 设置当前游戏
   */
  public setCurrentGame(gameId: string | null): void {
    this.runtimeConfig.currentGame = gameId;
  }

  /**
   * 设置对战模式
   */
  public setBattleMode(enabled: boolean): void {
    this.runtimeConfig.battleMode = enabled;
    this.runtimeConfig.playerCount = enabled ? 2 : 1;
  }

  /**
   * 设置玩家数量
   */
  public setPlayerCount(count: number): void {
    this.runtimeConfig.playerCount = Math.max(1, Math.min(4, count));
    this.runtimeConfig.battleMode = count > 1;
  }

  // ===== 批量操作 =====

  /**
   * 导出完整配置
   */
  public exportConfig(): string {
    return JSON.stringify(
      {
        user: this.userConfig,
        runtime: this.runtimeConfig,
      },
      null,
      2
    );
  }

  /**
   * 导入配置
   */
  public importConfig(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.user) {
        this.userConfig = { ...DEFAULT_USER_CONFIG, ...data.user };
        this.saveUserConfig();
      }
      if (data.runtime) {
        this.runtimeConfig = { ...DEFAULT_RUNTIME_CONFIG, ...data.runtime };
      }
      return true;
    } catch (e) {
      console.error('导入配置失败:', e);
      return false;
    }
  }

  /**
   * 重置为默认配置
   */
  public resetToDefault(): void {
    this.userConfig = { ...DEFAULT_USER_CONFIG };
    this.runtimeConfig = { ...DEFAULT_RUNTIME_CONFIG };
    this.saveUserConfig();
  }
}

/** 全局配置实例 */
export const appConfig = AppConfigManager.getInstance();
