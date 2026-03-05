/**
 * 游戏事件类型定义
 * 所有游戏事件在此集中定义，保证类型安全
 */

/** 玩家 ID 类型（品牌化类型） */
export type PlayerId = number & { __brand: 'PlayerId' };

/** 分数类型（品牌化类型） */
export type Score = number & { __brand: 'Score' };

/** 十六进制颜色类型 */
export type HexColor = `#${string}`;

/** 游戏模式 */
export type GameMode = 'single' | 'battle' | 'splitscreen';

/** 玩家数据 */
export interface Player {
  id: PlayerId;
  name: string;
  score: Score;
  color: HexColor;
  isActive: boolean;
}

/** 游戏配置 */
export interface IGameConfig {
  playerCount: number;
  totalRounds: number;
  mode: GameMode;
}

/** 玩家输入 */
export interface IPlayerInput {
  playerId: PlayerId;
  action: string;
  data?: unknown;
}

/** 游戏状态 */
export interface IGameState {
  currentRound: number;
  scores: Map<PlayerId, Score>;
  isComplete: boolean;
}

/** 游戏事件数据 */
export type GameEventData =
  | { type: 'game:start'; gameId: string; mode: GameMode; players: Player[] }
  | { type: 'game:end'; gameId: string; scores: Map<PlayerId, Score>; winner?: Player; isDraw: boolean }
  | { type: 'player:scoreChange'; playerId: PlayerId; score: Score }
  | { type: 'player:turnChange'; currentPlayerId: PlayerId }
  | { type: 'round:complete'; round: number; scores: Map<PlayerId, Score> }
  | { type: 'ui:showFeedback'; message: string; type: 'success' | 'error' | 'info' }
  | { type: 'ui:showResult'; winner?: Player; isDraw: boolean; scores: Map<PlayerId, Score> }
  | { type: 'game:pause' }
  | { type: 'game:resume' }
  | { type: 'game:restart' };

/** 事件回调类型 */
export type GameEventCallback = (data: GameEventData) => void;
