/**
 * 接口模块统一导出
 */

export type {
  Question,
  FeedbackType,
  IGameRenderer,
  IInputHandler,
  IGameLifecycle,
  IScoreCalculator,
} from './renderer.interface';

export type {
  StorageValue,
  StorageOptions,
  IStorage,
  IUserData,
  IGameRecord,
  IGameProgress,
} from './storage.interface';
