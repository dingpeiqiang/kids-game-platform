/**
 * 全局常量（如游戏类型、安全规则）
 */
export const GAME_TYPES = {
  PUZZLE: 'puzzle', // 拼图游戏
  MATH: 'math', // 数学游戏
  MEMORY: 'memory', // 记忆游戏
  COLORING: 'coloring', // 涂色游戏
  MUSIC: 'music', // 音乐游戏
} as const;

export const SAFE_RULES = {
  // 安全输入长度限制
  MAX_INPUT_LENGTH: 50,
  // 最大分数显示
  MAX_SCORE: 9999,
  // 音量限制（0-1）
  MAX_VOLUME: 0.8,
} as const;

export const SCENE_NAMES = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  RESULT: 'ResultScene',
} as const;

/**
 * 游戏类型显示名称映射
 */
export const GAME_TYPE_LABELS: Record<string, string> = {
  [GAME_TYPES.MATH]: '数学',
  [GAME_TYPES.PUZZLE]: '拼图',
  [GAME_TYPES.MEMORY]: '记忆',
  [GAME_TYPES.COLORING]: '涂色',
  [GAME_TYPES.MUSIC]: '音乐',
};

/**
 * 游戏类型颜色映射
 */
export const GAME_TYPE_COLORS: Record<string, string> = {
  [GAME_TYPES.MATH]: '#FF6B6B',
  [GAME_TYPES.PUZZLE]: '#9B59B6',
  [GAME_TYPES.MEMORY]: '#4ECDC4',
  [GAME_TYPES.COLORING]: '#95E1D3',
  [GAME_TYPES.MUSIC]: '#FFD93D',
};

/**
 * 游戏列表配置
 */
export const GAME_LIST = [
  {
    id: 'math-game',
    name: '数字大冒险',
    type: GAME_TYPES.MATH,
    description: '找到正确的数字',
    color: '#FF6B6B',
    icon: '🔢',
  },
  {
    id: 'color-game',
    name: '颜色配对',
    type: GAME_TYPES.COLORING,
    description: '找出相同的颜色',
    color: '#95E1D3',
    icon: '🎨',
  },
  {
    id: 'shape-game',
    name: '形状识别',
    type: GAME_TYPES.PUZZLE,
    description: '认识不同的形状',
    color: '#9B59B6',
    icon: '⭐',
  },
  {
    id: 'memory-game',
    name: '记忆挑战',
    type: GAME_TYPES.MEMORY,
    description: '考验你的记忆力',
    color: '#4ECDC4',
    icon: '🧠',
  },
] as const;

/**
 * 筛选选项配置
 */
export const FILTER_OPTIONS = {
  ALL: '全部',
  FAVORITES: '★ 收藏',
} as const;
