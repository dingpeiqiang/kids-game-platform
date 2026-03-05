/**
 * 路径工具函数
 * 处理 GitHub Pages 等部署环境的路径问题
 */

/**
 * 获取当前页面的基础路径（包含仓库名）
 *
 * 例如：
 * - 本地开发: http://localhost:3000/ 返回 ''
 * - GitHub Pages: https://user.github.io/kids-game-platform/ 返回 '/kids-game-platform'
 * - GitHub Pages: https://user.github.io/kids-game-platform/game 返回 '/kids-game-platform'
 *
 * @returns 基础路径，包含开头的斜杠但不包含结尾的斜杠
 */
export function getBasePath(): string {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  return pathParts.length > 0 ? `/${pathParts[0]}` : '';
}

/**
 * 获取完整的 URL 路径
 *
 * @param path 相对路径，例如 '/' 或 '?game=puzzle-2'
 * @returns 完整的路径
 *
 * @example
 * // 在本地开发环境
 * getFullPath('/') -> '/'
 * getFullPath('?game=puzzle-2') -> '/?game=puzzle-2'
 *
 * // 在 GitHub Pages 环境
 * getFullPath('/') -> '/kids-game-platform/'
 * getFullPath('?game=puzzle-2') -> '/kids-game-platform/?game=puzzle-2'
 */
export function getFullPath(path: string): string {
  const basePath = getBasePath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  if (cleanPath === '') {
    return basePath + '/';
  }

  return basePath + (cleanPath.startsWith('?') || cleanPath.startsWith('#')
    ? cleanPath
    : '/' + cleanPath
  );
}

/**
 * 跳转到指定路径
 *
 * @param path 目标路径
 * @param replace 是否使用 replace 替换当前历史记录（默认 false）
 *
 * @example
 * navigateTo('?game=puzzle-2'); // 跳转到游戏
 * navigateTo('/', true); // 返回首页并替换历史记录
 */
export function navigateTo(path: string, replace: boolean = false): void {
  const fullPath = getFullPath(path);

  if (replace) {
    window.location.replace(fullPath);
  } else {
    window.location.href = fullPath;
  }
}

/**
 * 刷新当前页面
 *
 * @param forceReload 是否强制重新加载（默认 true）
 */
export function reload(forceReload: boolean = true): void {
  window.location.reload(forceReload);
}

/**
 * 获取当前页面的查询参数
 *
 * @returns URLSearchParams 对象
 */
export function getQueryParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * 获取指定的查询参数
 *
 * @param key 参数名
 * @returns 参数值，如果不存在则返回 null
 */
export function getQueryParam(key: string): string | null {
  return getQueryParams().get(key);
}

/**
 * 设置查询参数并跳转
 *
 * @param params 参数对象
 * @param replace 是否使用 replace（默认 false）
 *
 * @example
 * setQueryParams({ game: 'puzzle-2', mode: 'battle' });
 */
export function setQueryParams(params: Record<string, string | number | boolean>, replace: boolean = false): void {
  const currentParams = getQueryParams();
  Object.entries(params).forEach(([key, value]) => {
    currentParams.set(key, String(value));
  });

  const queryString = currentParams.toString();
  const path = queryString ? '?' + queryString : '/';

  navigateTo(path, replace);
}

/**
 * 删除指定的查询参数并跳转
 *
 * @param keys 要删除的参数名数组
 * @param replace 是否使用 replace（默认 false）
 *
 * @example
 * removeQueryParams(['game', 'mode']);
 */
export function removeQueryParams(keys: string[], replace: boolean = false): void {
  const currentParams = getQueryParams();
  keys.forEach(key => {
    currentParams.delete(key);
  });

  const queryString = currentParams.toString();
  const path = queryString ? '?' + queryString : '/';

  navigateTo(path, replace);
}
