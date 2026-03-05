/**
 * 首页游戏配置管理器
 * 负责首页游戏配置的加载、保存、更新和管理
 */

import type {
  HomePageConfig,
  GameConfig,
  BannerConfig,
  CategoryConfig,
  GradeConfig,
  ConfigOperation,
  ConfigChangeLog,
} from './home.types';

/**
 * 默认首页配置
 */
const DEFAULT_HOME_CONFIG: HomePageConfig = {
  version: '1.0.0',
  updateTime: new Date().toISOString(),
  grades: [
    { code: 'k1', name: '小班', order: 1 },
    { code: 'k2', name: '中班', order: 2 },
    { code: 'k3', name: '大班', order: 3 },
    { code: 'g1', name: '小学1年级', order: 4 },
    { code: 'g2', name: '小学2年级', order: 5 },
    { code: 'g3', name: '小学3年级', order: 6 },
    { code: 'g4', name: '小学4年级', order: 7 },
    { code: 'g5', name: '小学5年级', order: 8 },
    { code: 'g6', name: '小学6年级', order: 9 },
  ],
  categories: [
    { code: 'puzzle', name: '益智拼图', icon: '🧩', order: 1 },
    { code: 'math', name: '数字算数', icon: '🔢', order: 2 },
    { code: 'adventure', name: '闯关冒险', icon: '🗺️', order: 3 },
    { code: 'creative', name: '手工创意', icon: '🎨', order: 4 },
  ],
  games: [
    // 益智拼图类
    {
      id: 'puzzle-1',
      name: '拼图小能手',
      icon: '🧩',
      ageRange: '3-6岁',
      category: 'puzzle',
      grades: ['k1', 'k2', 'k3'],
      sceneName: 'ShapeGameScene',
      order: 1,
      enabled: true,
      isNew: false,
      isHot: true,
      description: '锻炼孩子的空间思维能力',
      tags: ['益智', '拼图'],
    },
    {
      id: 'puzzle-2',
      name: '图形世界',
      icon: '🔷',
      ageRange: '4-7岁',
      category: 'puzzle',
      grades: ['k2', 'k3', 'g1'],
      sceneName: 'ShapeGameScene',
      order: 2,
      enabled: true,
      isNew: true,
      isHot: false,
      description: '认识各种有趣的图形',
      tags: ['益智', '图形'],
    },

    {
      id: 'puzzle-3',
      name: '空间拼搭',
      icon: '🏗️',
      ageRange: '5-8岁',
      category: 'puzzle',
      grades: ['k3', 'g1', 'g2'],
      sceneName: 'ShapeGameScene',
      order: 3,
      enabled: false,
      isNew: false,
      isHot: false,
    },
    {
      id: 'puzzle-4',
      name: '思维迷宫',
      icon: '🌀',
      ageRange: '6-10岁',
      category: 'puzzle',
      grades: ['g1', 'g2', 'g3'],
      sceneName: 'ShapeGameScene',
      order: 4,
      enabled: true,
      isNew: false,
      isHot: true,
      description: '挑战你的思维能力',
      tags: ['益智', '迷宫'],
    },
    // 数字算数类
    {
      id: 'math-1',
      name: '数字王国',
      icon: '🔢',
      ageRange: '4-7岁',
      category: 'math',
      grades: ['k2', 'k3', 'g1'],
      sceneName: 'DemoGameScene',
      order: 1,
      enabled: true,
      isNew: false,
      isHot: true,
      description: '认识数字，快乐学习',
      tags: ['数学', '数字'],
    },
    {
      id: 'math-2',
      name: '算数冒险',
      icon: '➕',
      ageRange: '5-8岁',
      category: 'math',
      grades: ['k3', 'g1', 'g2'],
      sceneName: 'DemoGameScene',
      order: 2,
      enabled: true,
      isNew: true,
      isHot: false,
      description: '在冒险中学习算术',
      tags: ['数学', '算术'],
    },
    {
      id: 'math-3',
      name: '数学城堡',
      icon: '🏰',
      ageRange: '6-10岁',
      category: 'math',
      grades: ['g1', 'g2', 'g3'],
      sceneName: 'DemoGameScene',
      order: 3,
      enabled: true,
      isNew: false,
      isHot: true,
      description: '在城堡里探索数学奥秘',
      tags: ['数学', '城堡'],
    },
    {
      id: 'math-4',
      name: '口算达人',
      icon: '✨',
      ageRange: '7-12岁',
      category: 'math',
      grades: ['g2', 'g3', 'g4'],
      sceneName: 'DemoGameScene',
      order: 4,
      enabled: true,
      isNew: false,
      isHot: false,
    },
    // 闯关冒险类
    {
      id: 'adventure-1',
      name: '丛林探险',
      icon: '🌴',
      ageRange: '4-8岁',
      category: 'adventure',
      grades: ['k2', 'k3', 'g1', 'g2'],
      sceneName: 'DemoGameScene',
      order: 1,
      enabled: true,
      isNew: false,
      isHot: true,
      description: '探索神秘的丛林',
      tags: ['冒险', '丛林'],
    },
    {
      id: 'adventure-2',
      name: '海底世界',
      icon: '🐠',
      ageRange: '5-9岁',
      category: 'adventure',
      grades: ['k3', 'g1', 'g2', 'g3'],
      sceneName: 'DemoGameScene',
      order: 2,
      enabled: true,
      isNew: true,
      isHot: false,
      description: '发现海底的奇妙生物',
      tags: ['冒险', '海洋'],
    },
    {
      id: 'adventure-3',
      name: '太空旅行',
      icon: '🚀',
      ageRange: '6-10岁',
      category: 'adventure',
      grades: ['g1', 'g2', 'g3', 'g4'],
      sceneName: 'DemoGameScene',
      order: 3,
      enabled: false,
      isNew: false,
      isHot: false,
    },
    {
      id: 'adventure-4',
      name: '恐龙时代',
      icon: '🦕',
      ageRange: '7-12岁',
      category: 'adventure',
      grades: ['g2', 'g3', 'g4', 'g5'],
      sceneName: 'DemoGameScene',
      order: 4,
      enabled: true,
      isNew: false,
      isHot: true,
      description: '回到恐龙时代',
      tags: ['冒险', '恐龙'],
    },
    // 手工创意类
    {
      id: 'creative-1',
      name: '颜色配对',
      icon: '🎨',
      ageRange: '3-6岁',
      category: 'creative',
      grades: ['k1', 'k2', 'k3'],
      sceneName: 'ColorGameScene',
      order: 1,
      enabled: true,
      isNew: false,
      isHot: true,
      description: '学习认识各种颜色',
      tags: ['创意', '颜色'],
    },
    {
      id: 'creative-2',
      name: '涂色世界',
      icon: '🖌️',
      ageRange: '4-7岁',
      category: 'creative',
      grades: ['k2', 'k3', 'g1'],
      sceneName: 'ColorGameScene',
      order: 2,
      enabled: true,
      isNew: true,
      isHot: false,
      description: '发挥创意自由涂色',
      tags: ['创意', '涂色'],
    },
    {
      id: 'creative-3',
      name: '拼贴画',
      icon: '🖼️',
      ageRange: '5-8岁',
      category: 'creative',
      grades: ['k3', 'g1', 'g2'],
      sceneName: 'ColorGameScene',
      order: 3,
      enabled: false,
      isNew: false,
      isHot: false,
    },
    {
      id: 'creative-4',
      name: '创意工坊',
      icon: '✏️',
      ageRange: '6-10岁',
      category: 'creative',
      grades: ['g1', 'g2', 'g3'],
      sceneName: 'ColorGameScene',
      order: 4,
      enabled: true,
      isNew: false,
      isHot: false,
      description: '发挥你的无限创意',
      tags: ['创意', '手工'],
    },
  ],
  banners: [
    {
      id: 'banner-1',
      title: '数字拼图大冒险',
      description: '一年级专属益智游戏',
      buttonText: '立即开始 ⭐',
      buttonIcon: '⭐',
      gameId: 'math-1',
      backgroundColor: '#FF6B6B',
      order: 1,
      enabled: true,
    },
    {
      id: 'banner-2',
      title: '答题赢取游戏点数',
      description: '答对1题赚1点，每日最多赚10点',
      buttonText: '去答题 ✏️',
      buttonIcon: '✏️',
      route: 'quiz-center',
      backgroundColor: '#4ECDC4',
      order: 2,
      enabled: true,
    },
    {
      id: 'banner-3',
      title: '新游戏上线啦！',
      description: '形状认知游戏，适合3-6岁宝宝',
      buttonText: '试玩看看 🎉',
      buttonIcon: '🎉',
      gameId: 'puzzle-2',
      backgroundColor: '#FFD93D',
      order: 3,
      enabled: true,
    },

  ],
  todayRecommend: [
    { gameId: 'creative-1', order: 1, reason: '热门游戏，孩子们都爱玩' },
    { gameId: 'puzzle-1', order: 2, reason: '锻炼思维能力' },
    { gameId: 'math-1', order: 3, reason: '适合当前学龄' },
    { gameId: 'adventure-1', order: 4, reason: '新游戏上线' },
  ],
  defaultGrade: 'g1',
  defaultCategory: 'puzzle',
  bannerAutoPlayInterval: 5000,
};

/**
 * 首页配置管理器类
 */
export class HomeConfigManager {
  private static instance: HomeConfigManager;
  private config: HomePageConfig;
  private changeLogs: ConfigChangeLog[] = [];
  private readonly CONFIG_KEY = 'kids_game_home_config';
  private readonly CHANGE_LOG_KEY = 'kids_game_config_changes';

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): HomeConfigManager {
    if (!HomeConfigManager.instance) {
      HomeConfigManager.instance = new HomeConfigManager();
    }
    return HomeConfigManager.instance;
  }

  /**
   * 加载配置
   */
  private loadConfig(): HomePageConfig {
    try {
      const storedConfig = localStorage.getItem(this.CONFIG_KEY);
      if (storedConfig) {
        return JSON.parse(storedConfig);
      }
    } catch (error) {
      console.error('加载首页配置失败:', error);
    }
    return { ...DEFAULT_HOME_CONFIG };
  }

  /**
   * 保存配置
   */
  private saveConfig(): void {
    try {
      this.config.updateTime = new Date().toISOString();
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('保存首页配置失败:', error);
    }
  }

  /**
   * 记录变更日志
   */
  private logChange(
    operation: ConfigOperation,
    targetId: string,
    beforeData?: any,
    afterData?: any,
    remark?: string
  ): void {
    const log: ConfigChangeLog = {
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      targetId,
      beforeData,
      afterData,
      operator: 'admin',
      timestamp: new Date().toISOString(),
      remark,
    };

    this.changeLogs.unshift(log);

    // 只保留最近100条日志
    if (this.changeLogs.length > 100) {
      this.changeLogs = this.changeLogs.slice(0, 100);
    }

    try {
      localStorage.setItem(this.CHANGE_LOG_KEY, JSON.stringify(this.changeLogs));
    } catch (error) {
      console.error('保存变更日志失败:', error);
    }
  }

  /**
   * 获取完整配置
   */
  public getConfig(): HomePageConfig {
    return { ...this.config };
  }

  /**
   * 获取学龄配置
   */
  public getGrades(): GradeConfig[] {
    return [...this.config.grades].sort((a, b) => a.order - b.order);
  }

  /**
   * 获取学龄名称
   */
  public getGradeName(code: string): string {
    const grade = this.config.grades.find(g => g.code === code);
    return grade?.name || code;
  }

  /**
   * 获取分类配置
   */
  public getCategories(): CategoryConfig[] {
    return [...this.config.categories].sort((a, b) => a.order - b.order);
  }

  /**
   * 获取所有游戏
   */
  public getAllGames(): GameConfig[] {
    return [...this.config.games].sort((a, b) => a.order - b.order);
  }

  /**
   * 获取启用的游戏
   */
  public getEnabledGames(): GameConfig[] {
    return this.getAllGames().filter(g => g.enabled);
  }

  /**
   * 根据学龄和分类筛选游戏
   */
  public getGamesByGradeAndCategory(grade: string, category: string): GameConfig[] {
    return this.getEnabledGames().filter(
      game => game.grades.includes(grade) && game.category === category
    );
  }

  /**
   * 获取游戏详情
   */
  public getGameById(id: string): GameConfig | undefined {
    return this.config.games.find(g => g.id === id);
  }

  /**
   * 获取Banner配置
   */
  public getBanners(): BannerConfig[] {
    return [...this.config.banners]
      .filter(b => b.enabled)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * 获取今日推荐
   */
  public getTodayRecommend(): GameConfig[] {
    const recommendIds = [...this.config.todayRecommend]
      .filter(r => r.order >= 0)
      .sort((a, b) => a.order - b.order)
      .map(r => r.gameId);

    const games = recommendIds
      .map(id => this.getGameById(id))
      .filter((game): game is GameConfig => !!game && game.enabled);

    return games;
  }

  /**
   * 启用/禁用游戏
   */
  public toggleGameEnabled(gameId: string, enabled: boolean): boolean {
    const game = this.getGameById(gameId);
    if (!game) {
      console.error('游戏不存在:', gameId);
      return false;
    }

    const beforeEnabled = game.enabled;
    game.enabled = enabled;
    game.order = enabled ? (game.order || 999) : 999;

    this.logChange(
      enabled ? ConfigOperation.ENABLE_GAME : ConfigOperation.DISABLE_GAME,
      gameId,
      { enabled: beforeEnabled },
      { enabled }
    );

    this.saveConfig();
    return true;
  }

  /**
   * 更新游戏排序
   */
  public updateGameOrders(gameOrders: { id: string; order: number }[]): boolean {
    const beforeData = gameOrders.map(({ id }) => ({
      id,
      order: this.getGameById(id)?.order,
    }));

    gameOrders.forEach(({ id, order }) => {
      const game = this.getGameById(id);
      if (game) {
        game.order = order;
      }
    });

    const afterData = gameOrders.map(({ id, order }) => ({ id, order }));

    this.logChange(
      ConfigOperation.UPDATE_GAME_ORDER,
      'multiple',
      beforeData,
      afterData,
      `批量更新${gameOrders.length}个游戏排序`
    );

    this.saveConfig();
    return true;
  }

  /**
   * 添加游戏到今日推荐
   */
  public addToTodayRecommend(gameId: string, order?: number, reason?: string): boolean {
    const game = this.getGameById(gameId);
    if (!game) {
      console.error('游戏不存在:', gameId);
      return false;
    }

    // 检查是否已经在推荐列表中
    const existingIndex = this.config.todayRecommend.findIndex(r => r.gameId === gameId);
    if (existingIndex >= 0) {
      console.warn('游戏已在推荐列表中:', gameId);
      return false;
    }

    // 计算新的order
    const maxOrder = Math.max(...this.config.todayRecommend.map(r => r.order), -1);
    const newOrder = order !== undefined ? order : maxOrder + 1;

    this.config.todayRecommend.push({
      gameId,
      order: newOrder,
      reason,
    });

    this.logChange(
      ConfigOperation.ADD_TO_RECOMMEND,
      gameId,
      undefined,
      { order: newOrder, reason },
      reason
    );

    this.saveConfig();
    return true;
  }

  /**
   * 从今日推荐中移除游戏
   */
  public removeFromTodayRecommend(gameId: string): boolean {
    const index = this.config.todayRecommend.findIndex(r => r.gameId === gameId);
    if (index < 0) {
      console.warn('游戏不在推荐列表中:', gameId);
      return false;
    }

    const beforeData = { ...this.config.todayRecommend[index] };
    this.config.todayRecommend.splice(index, 1);

    this.logChange(
      ConfigOperation.REMOVE_FROM_RECOMMEND,
      gameId,
      beforeData,
      undefined,
      '从今日推荐中移除'
    );

    this.saveConfig();
    return true;
  }

  /**
   * 更新Banner配置
   */
  public updateBanner(bannerId: string, updates: Partial<BannerConfig>): boolean {
    const banner = this.config.banners.find(b => b.id === bannerId);
    if (!banner) {
      console.error('Banner不存在:', bannerId);
      return false;
    }

    const beforeData = { ...banner };
    Object.assign(banner, updates);

    this.logChange(
      ConfigOperation.UPDATE_BANNER,
      bannerId,
      beforeData,
      banner,
      '更新Banner配置'
    );

    this.saveConfig();
    return true;
  }

  /**
   * 启用/禁用Banner
   */
  public toggleBannerEnabled(bannerId: string, enabled: boolean): boolean {
    const banner = this.config.banners.find(b => b.id === bannerId);
    if (!banner) {
      console.error('Banner不存在:', bannerId);
      return false;
    }

    const beforeEnabled = banner.enabled;
    banner.enabled = enabled;

    this.logChange(
      ConfigOperation.TOGGLE_BANNER,
      bannerId,
      { enabled: beforeEnabled },
      { enabled }
    );

    this.saveConfig();
    return true;
  }

  /**
   * 重置配置为默认值
   */
  public resetToDefault(): void {
    this.config = { ...DEFAULT_HOME_CONFIG };
    this.config.updateTime = new Date().toISOString();
    this.changeLogs = [];

    this.logChange(
      ConfigOperation.UPDATE_GAME_ORDER,
      'all',
      'reset',
      'default',
      '重置为默认配置'
    );

    this.saveConfig();
    localStorage.setItem(this.CHANGE_LOG_KEY, JSON.stringify(this.changeLogs));
  }

  /**
   * 导出配置
   */
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 导入配置
   */
  public importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson) as HomePageConfig;

      // 简单验证配置结构
      if (!importedConfig.grades || !importedConfig.categories || !importedConfig.games) {
        throw new Error('配置格式不正确');
      }

      const beforeConfig = { ...this.config };
      this.config = importedConfig;
      this.config.updateTime = new Date().toISOString();

      this.logChange(
        ConfigOperation.UPDATE_GAME_ORDER,
        'all',
        beforeConfig,
        importedConfig,
        '导入配置'
      );

      this.saveConfig();
      return true;
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }

  /**
   * 获取变更日志
   */
  public getChangeLogs(limit: number = 50): ConfigChangeLog[] {
    return this.changeLogs.slice(0, limit);
  }
}

/**
 * 导出单例实例
 */
export const homeConfigManager = HomeConfigManager.getInstance();
