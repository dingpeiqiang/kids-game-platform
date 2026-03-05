/**
 * 环境变量映射（统一管理）
 */
export const ENV_CONFIG = {
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  gameBaseUrl: import.meta.env.VITE_GAME_BASE_URL || 'http://localhost:3000',
  gameDebug: import.meta.env.VITE_GAME_DEBUG === 'true',
};
