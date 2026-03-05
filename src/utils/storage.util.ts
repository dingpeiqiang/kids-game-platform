/**
 * 存储工具
 * 类型安全的 LocalStorage/SessionStorage 封装
 */

type StorageType = 'local' | 'session';

/**
 * 存储工具类
 */
export class StorageUtil {
  /**
   * 获取存储对象
   */
  private static getStorage(type: StorageType): Storage {
    return type === 'local' ? localStorage : sessionStorage;
  }

  /**
   * 设置值
   */
  public static set<T>(key: string, value: T, type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type);
      const serialized = JSON.stringify(value);
      storage.setItem(key, serialized);
    } catch (error) {
      console.error(`[StorageUtil] 保存失败: ${key}`, error);
    }
  }

  /**
   * 获取值
   */
  public static get<T>(key: string, type: StorageType = 'local'): T | undefined {
    try {
      const storage = this.getStorage(type);
      const item = storage.getItem(key);
      if (item === null) return undefined;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[StorageUtil] 读取失败: ${key}`, error);
      return undefined;
    }
  }

  /**
   * 删除值
   */
  public static remove(key: string, type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type);
      storage.removeItem(key);
    } catch (error) {
      console.error(`[StorageUtil] 删除失败: ${key}`, error);
    }
  }

  /**
   * 清空存储
   */
  public static clear(type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type);
      storage.clear();
    } catch (error) {
      console.error('[StorageUtil] 清空失败', error);
    }
  }

  /**
   * 检查键是否存在
   */
  public static has(key: string, type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      return storage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取存储大小（键数量）
   */
  public static size(type: StorageType = 'local'): number {
    try {
      const storage = this.getStorage(type);
      return storage.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取所有键
   */
  public static keys(type: StorageType = 'local'): string[] {
    try {
      const storage = this.getStorage(type);
      return Array.from({ length: storage.length }, (_, i) => storage.key(i) || '');
    } catch (error) {
      return [];
    }
  }

  /**
   * 批量设置
   */
  public static setMany<T extends Record<string, unknown>>(
    items: T,
    type: StorageType = 'local'
  ): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, type);
    });
  }

  /**
   * 批量获取
   */
  public static getMany<T extends string[]>(
    keys: T,
    type: StorageType = 'local'
  ): Record<T[number], unknown> {
    const result = {} as Record<T[number], unknown>;
    keys.forEach((key) => {
      result[key] = this.get(key, type);
    });
    return result;
  }
}

/**
 * 带过期时间的存储
 */
export class ExpireStorageUtil extends StorageUtil {
  /**
   * 设置带过期时间的值
   */
  public static setExpire<T>(key: string, value: T, expires: number): void {
    const data = {
      value,
      expires: Date.now() + expires,
    };
    this.set(key, data);
  }

  /**
   * 获取带过期时间的值
   */
  public static getExpire<T>(key: string): T | undefined {
    const data = this.get<{ value: T; expires: number }>(key);
    if (!data) return undefined;

    if (Date.now() > data.expires) {
      this.remove(key);
      return undefined;
    }

    return data.value;
  }
}

/**
 * 命名空间存储
 */
export class NamespaceStorage {
  constructor(private namespace: string, private type: StorageType = 'local') {}

  private getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  set<T>(key: string, value: T): void {
    StorageUtil.set(this.getKey(key), value, this.type);
  }

  get<T>(key: string): T | undefined {
    return StorageUtil.get<T>(this.getKey(key), this.type);
  }

  remove(key: string): void {
    StorageUtil.remove(this.getKey(key), this.type);
  }

  clear(): void {
    const keys = StorageUtil.keys(this.type);
    keys
      .filter((k) => k.startsWith(`${this.namespace}:`))
      .forEach((k) => StorageUtil.remove(k, this.type));
  }
}
