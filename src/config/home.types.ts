/**
 * 首页配置类型定义
 * 用于首页游戏配置化加载和管理
 */

/**
 * 学龄配置
 */
export interface GradeConfig {
  /** 学龄代码 */
  code: string;
  /** 学龄名称 */
  name: string;
  /** 排序权重 */
  order: number;
}

/**
 * 游戏分类配置
 */
export interface CategoryConfig {
  /** 分类代码 */
  code: string;
  /** 分类名称 */
  name: string;
  /** 分类图标 */
  icon: string;
  /** 排序权重 */
  order: number;
}

/**
 * 游戏配置
 */
export interface GameConfig {
  /** 游戏ID */
  id: string;
  /** 游戏名称 */
  name: string;
  /** 游戏图标 */
  icon: string;
  /** 适用年龄范围 */
  ageRange: string;
  /** 游戏分类 */
  category: string;
  /** 适用学龄列表 */
  grades: string[];
  /** 游戏场景名称（用于跳转） */
  sceneName?: string;
  /** 游戏URL（备用） */
  gameUrl?: string;
  /** 排序权重 */
  order: number;
  /** 是否启用 */
  enabled: boolean;
  /** 是否为新游戏 */
  isNew: boolean;
  /** 是否热门 */
  isHot: boolean;
  /** 游戏描述 */
  description?: string;
  /** 游戏标签 */
  tags?: string[];
}

/**
 * Banner配置
 */
export interface BannerConfig {
  /** Banner ID */
  id: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 按钮文字 */
  buttonText: string;
  /** 按钮图标 */
  buttonIcon: string;
  /** 关联的游戏ID（可选） */
  gameId?: string;
  /** 关联的页面路由（可选） */
  route?: string;
  /** Banner背景色 */
  backgroundColor?: string;
  /** 排序权重 */
  order: number;
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 今日推荐配置
 */
export interface TodayRecommendConfig {
  /** 推荐游戏ID */
  gameId: string;
  /** 推荐理由 */
  reason?: string;
  /** 排序权重 */
  order: number;
}

/**
 * 首页整体配置
 */
export interface HomePageConfig {
  /** 配置版本 */
  version: string;
  /** 更新时间 */
  updateTime: string;
  /** 学龄配置 */
  grades: GradeConfig[];
  /** 游戏分类配置 */
  categories: CategoryConfig[];
  /** 游戏列表配置 */
  games: GameConfig[];
  /** Banner配置 */
  banners: BannerConfig[];
  /** 今日推荐配置 */
  todayRecommend: TodayRecommendConfig[];
  /** 默认学龄 */
  defaultGrade: string;
  /** 默认分类 */
  defaultCategory: string;
  /** Banner自动播放间隔（毫秒） */
  bannerAutoPlayInterval: number;
}

/**
 * 用户游戏偏好
 */
export interface UserGamePreference {
  /** 最近玩过的游戏ID列表 */
  recentGames: string[];
  /** 收藏的游戏ID列表 */
  favoriteGames: string[];
  /** 用户学龄 */
  grade: string;
}

/**
 * 配置管理操作
 */
export enum ConfigOperation {
  /** 启用游戏 */
  ENABLE_GAME = 'enable_game',
  /** 禁用游戏 */
  DISABLE_GAME = 'disable_game',
  /** 更新游戏排序 */
  UPDATE_GAME_ORDER = 'update_game_order',
  /** 添加游戏到推荐 */
  ADD_TO_RECOMMEND = 'add_to_recommend',
  /** 从推荐移除游戏 */
  REMOVE_FROM_RECOMMEND = 'remove_from_recommend',
  /** 更新Banner配置 */
  UPDATE_BANNER = 'update_banner',
  /** 启用/禁用Banner */
  TOGGLE_BANNER = 'toggle_banner',
}

/**
 * 配置变更日志
 */
export interface ConfigChangeLog {
  /** 操作ID */
  id: string;
  /** 操作类型 */
  operation: ConfigOperation;
  /** 操作目标ID */
  targetId: string;
  /** 操作前数据 */
  beforeData?: any;
  /** 操作后数据 */
  afterData?: any;
  /** 操作人 */
  operator: string;
  /** 操作时间 */
  timestamp: string;
  /** 备注 */
  remark?: string;
}
