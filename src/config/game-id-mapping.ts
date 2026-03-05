/**
 * 游戏ID映射配置
 * 用于统一管理游戏ID和对应场景键名的关系
 */

import Phaser from 'phaser';

/**
 * 游戏信息
 */
export interface GameInfo {
  /** 游戏ID */
  gameId: string;
  /** 场景键名 */
  sceneKey: string;
  /** 结果场景键名 */
  resultSceneKey?: string;
  /** 游戏名称（用于显示） */
  displayName: string;
  /** 游戏描述 */
  description: string;
  /** 游戏图标 */
  icon: string;
  /** 默认游戏时长（秒） */
  defaultDuration: number;
}

/**
 * 游戏ID映射表
 */
export const GAME_ID_MAPPING: Record<string, GameInfo> = {
  'color-game': {
    gameId: 'color-game',
    sceneKey: 'ColorGameScene',
    resultSceneKey: 'ColorResultScene',
    displayName: '颜色游戏',
    description: '识别颜色，锻炼观察力',
    icon: '🎨',
    defaultDuration: 60,
  },
  'shape-game': {
    gameId: 'shape-game',
    sceneKey: 'ShapeGameScene',
    resultSceneKey: 'ShapeResultScene',
    displayName: '形状游戏',
    description: '认识形状，培养空间感',
    icon: '⭐',
    defaultDuration: 60,
  },
  'math-game': {
    gameId: 'math-game',
    sceneKey: 'GameScene',
    displayName: '数学游戏',
    description: '简单计算，提升数学能力',
    icon: '🔢',
    defaultDuration: 60,
  },
  'demo-game': {
    gameId: 'demo-game',
    sceneKey: 'DemoGameScene',
    resultSceneKey: 'DemoResultScene',
    displayName: '演示游戏',
    description: '游戏演示示例',
    icon: '🎮',
    defaultDuration: 60,
  },
};

/**
 * 获取游戏信息
 */
export function getGameInfo(gameId: string): GameInfo | null {
  return GAME_ID_MAPPING[gameId] || null;
}

/**
 * 获取所有游戏列表
 */
export function getAllGames(): GameInfo[] {
  return Object.values(GAME_ID_MAPPING);
}

/**
 * 根据场景键名获取游戏ID
 */
export function getGameIdBySceneKey(sceneKey: string): string | null {
  const game = Object.values(GAME_ID_MAPPING).find((g) => g.sceneKey === sceneKey);
  return game?.gameId || null;
}

/**
 * 检查游戏ID是否有效
 */
export function isValidGameId(gameId: string): boolean {
  return gameId in GAME_ID_MAPPING;
}

/**
 * 获取场景键名
 */
export function getSceneKey(gameId: string): string | null {
  const game = getGameInfo(gameId);
  return game?.sceneKey || null;
}

/**
 * 获取结果场景键名
 */
export function getResultSceneKey(gameId: string): string | null {
  const game = getGameInfo(gameId);
  return game?.resultSceneKey || null;
}
