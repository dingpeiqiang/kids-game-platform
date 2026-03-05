/**
 * 首页配置化加载服务
 * 提供配置化的首页数据加载接口
 */

import { homeConfigManager } from '../config/home.config.manager';
import type {
  GameConfig,
  BannerConfig,
  CategoryConfig,
  GradeConfig,
  UserGamePreference,
} from '../config/home.types';

/**
 * 首页数据服务
 */
export class HomeConfigService {
  private static instance: HomeConfigService;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): HomeConfigService {
    if (!HomeConfigService.instance) {
      HomeConfigService.instance = new HomeConfigService();
    }
    return HomeConfigService.instance;
  }

  /**
   * 获取首页配置版本
   */
  public getConfigVersion(): string {
    const config = homeConfigManager.getConfig();
    return config.version;
  }

  /**
   * 获取配置更新时间
   */
  public getConfigUpdateTime(): string {
    const config = homeConfigManager.getConfig();
    return config.updateTime;
  }

  /**
   * 获取学龄列表
   */
  public getGrades(): GradeConfig[] {
    return homeConfigManager.getGrades();
  }

  /**
   * 获取学龄名称
   */
  public getGradeName(code: string): string {
    return homeConfigManager.getGradeName(code);
  }

  /**
   * 获取默认学龄
   */
  public getDefaultGrade(): string {
    const config = homeConfigManager.getConfig();
    return config.defaultGrade;
  }

  /**
   * 获取分类列表
   */
  public getCategories(): CategoryConfig[] {
    return homeConfigManager.getCategories();
  }

  /**
   * 获取默认分类
   */
  public getDefaultCategory(): string {
    const config = homeConfigManager.getConfig();
    return config.defaultCategory;
  }

  /**
   * 获取所有游戏（用于配置管理）
   */
  public getAllGames(): GameConfig[] {
    return homeConfigManager.getAllGames();
  }

  /**
   * 获取启用的游戏
   */
  public getEnabledGames(): GameConfig[] {
    return homeConfigManager.getEnabledGames();
  }

  /**
   * 根据学龄获取游戏
   */
  public getGamesByGrade(grade: string): GameConfig[] {
    return homeConfigManager.getEnabledGames().filter(game =>
      game.grades.includes(grade)
    );
  }

  /**
   * 根据学龄和分类获取游戏
   */
  public getGamesByGradeAndCategory(grade: string, category: string): GameConfig[] {
    return homeConfigManager.getGamesByGradeAndCategory(grade, category);
  }

  /**
   * 根据分类获取游戏
   */
  public getGamesByCategory(category: string): GameConfig[] {
    return homeConfigManager.getEnabledGames().filter(game =>
      game.category === category
    );
  }

  /**
   * 获取游戏详情
   */
  public getGameById(id: string): GameConfig | undefined {
    return homeConfigManager.getGameById(id);
  }

  /**
   * 获取Banner列表
   */
  public getBanners(): BannerConfig[] {
    return homeConfigManager.getBanners();
  }

  /**
   * 获取Banner自动播放间隔
   */
  public getBannerAutoPlayInterval(): number {
    const config = homeConfigManager.getConfig();
    return config.bannerAutoPlayInterval;
  }

  /**
   * 获取今日推荐游戏
   */
  public getTodayRecommendGames(): GameConfig[] {
    return homeConfigManager.getTodayRecommend();
  }

  /**
   * 获取热门游戏（按isHot标记筛选）
   */
  public getHotGames(limit: number = 8): GameConfig[] {
    return homeConfigManager.getEnabledGames()
      .filter(game => game.isHot)
      .slice(0, limit);
  }

  /**
   * 获取新游戏（按isNew标记筛选）
   */
  public getNewGames(limit: number = 6): GameConfig[] {
    return homeConfigManager.getEnabledGames()
      .filter(game => game.isNew)
      .slice(0, limit);
  }

  /**
   * 根据游戏ID列表获取游戏信息
   */
  public getGamesByIds(ids: string[]): GameConfig[] {
    return ids
      .map(id => homeConfigManager.getGameById(id))
      .filter((game): game is GameConfig => !!game && game.enabled);
  }

  /**
   * 搜索游戏（按名称或标签）
   */
  public searchGames(keyword: string): GameConfig[] {
    const lowerKeyword = keyword.toLowerCase();
    return homeConfigManager.getEnabledGames().filter(game => {
      return (
        game.name.toLowerCase().includes(lowerKeyword) ||
        game.description?.toLowerCase().includes(lowerKeyword) ||
        game.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword))
      );
    });
  }

  /**
   * 获取游戏统计信息
   */
  public getGameStatistics(): {
    total: number;
    enabled: number;
    disabled: number;
    byCategory: Record<string, number>;
    byGrade: Record<string, number>;
  } {
    const allGames = homeConfigManager.getAllGames();
    const enabledGames = homeConfigManager.getEnabledGames();

    const byCategory: Record<string, number> = {};
    const byGrade: Record<string, number> = {};

    // 按分类统计
    enabledGames.forEach(game => {
      byCategory[game.category] = (byCategory[game.category] || 0) + 1;
    });

    // 按学龄统计
    enabledGames.forEach(game => {
      game.grades.forEach(grade => {
        byGrade[grade] = (byGrade[grade] || 0) + 1;
      });
    });

    return {
      total: allGames.length,
      enabled: enabledGames.length,
      disabled: allGames.length - enabledGames.length,
      byCategory,
      byGrade,
    };
  }

  /**
   * 获取用户偏好（从本地存储）
   */
  public getUserPreference(): UserGamePreference {
    try {
      const stored = localStorage.getItem('kids_game_user_preference');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('加载用户偏好失败:', error);
    }

    // 返回默认偏好
    const config = homeConfigManager.getConfig();
    return {
      recentGames: [],
      favoriteGames: [],
      grade: config.defaultGrade,
    };
  }

  /**
   * 保存用户偏好
   */
  public saveUserPreference(preference: UserGamePreference): void {
    try {
      localStorage.setItem('kids_game_user_preference', JSON.stringify(preference));
    } catch (error) {
      console.error('保存用户偏好失败:', error);
    }
  }

  /**
   * 添加到最近游戏列表
   */
  public addToRecentGames(gameId: string): void {
    const preference = this.getUserPreference();

    // 移除已存在的记录
    const index = preference.recentGames.indexOf(gameId);
    if (index > -1) {
      preference.recentGames.splice(index, 1);
    }

    // 添加到开头
    preference.recentGames.unshift(gameId);

    // 只保留最近10个
    preference.recentGames = preference.recentGames.slice(0, 10);

    this.saveUserPreference(preference);
  }

  /**
   * 获取最近游戏
   */
  public getRecentGames(limit: number = 3): GameConfig[] {
    const preference = this.getUserPreference();
    return this.getGamesByIds(preference.recentGames).slice(0, limit);
  }

  /**
   * 添加/取消收藏
   */
  public toggleFavorite(gameId: string): void {
    const preference = this.getUserPreference();
    const index = preference.favoriteGames.indexOf(gameId);

    if (index > -1) {
      // 取消收藏
      preference.favoriteGames.splice(index, 1);
    } else {
      // 添加收藏
      preference.favoriteGames.push(gameId);
    }

    this.saveUserPreference(preference);
  }

  /**
   * 获取收藏的游戏
   */
  public getFavoriteGames(): GameConfig[] {
    const preference = this.getUserPreference();
    return this.getGamesByIds(preference.favoriteGames);
  }

  /**
   * 检查游戏是否被收藏
   */
  public isFavorite(gameId: string): boolean {
    const preference = this.getUserPreference();
    return preference.favoriteGames.includes(gameId);
  }

  /**
   * 获取个性化推荐游戏
   * 基于用户学龄、最近游戏、热门游戏等因素
   */
  public getPersonalizedRecommendations(limit: number = 6): GameConfig[] {
    const preference = this.getUserPreference();
    const allGames = homeConfigManager.getEnabledGames();

    // 1. 获取适合当前学龄的游戏
    const gradeGames = allGames.filter(game =>
      game.grades.includes(preference.grade)
    );

    // 2. 排除最近玩过的游戏
    const recentIds = new Set(preference.recentGames);
    const recommended = gradeGames.filter(game => !recentIds.has(game.id));

    // 3. 优先推荐热门游戏和新游戏
    recommended.sort((a, b) => {
      // 热门游戏优先
      if (a.isHot && !b.isHot) return -1;
      if (!a.isHot && b.isHot) return 1;
      // 新游戏次之
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      // 按排序权重
      return a.order - b.order;
    });

    return recommended.slice(0, limit);
  }

  /**
   * 刷新配置（从服务器或本地存储重新加载）
   */
  public async refreshConfig(): Promise<void> {
    // 未来可以从服务器获取配置
    // 目前使用本地存储
    return Promise.resolve();
  }

  /**
   * 检查游戏是否可玩
   */
  public isGamePlayable(game: GameConfig, userPoints: number): {
    canPlay: boolean;
    reason: string;
  } {
    // 1. 检查游戏是否启用
    if (!game.enabled) {
      return { canPlay: false, reason: '游戏已下架' };
    }

    // 2. 检查是否有对应的游戏场景
    if (!game.sceneName && !game.gameUrl) {
      return { canPlay: false, reason: '即将上线' };
    }

    // 3. 检查用户点数（需要在调用时传入）
    if (userPoints <= 0) {
      return { canPlay: false, reason: '点数不足' };
    }

    return { canPlay: true, reason: '' };
  }
}

/**
 * 导出单例实例
 */
export const homeConfigService = HomeConfigService.getInstance();
