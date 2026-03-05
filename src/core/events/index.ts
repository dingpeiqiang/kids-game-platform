/**
 * 事件模块统一导出
 */

export { GameEventBus, gameEventBus } from './event-bus';

export type {
  PlayerId,
  Score,
  HexColor,
  GameMode,
  Player,
  IGameConfig,
  IPlayerInput,
  IGameState,
  GameEventData,
  GameEventCallback,
} from './game-events';
