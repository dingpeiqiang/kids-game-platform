import { ENV_CONFIG } from '@/config/env.config';

/**
 * 获取调用位置信息
 */
function getCallerInfo(): string {
  const stack = new Error().stack;
  if (!stack) return 'unknown';

  const lines = stack.split('\n');
  // 跳过 Error 和 getCallerInfo 本身，从第三行开始找实际调用者
  const callerLine = lines[3]?.trim() || lines[2]?.trim() || '';
  
  // 提取文件名和行号
  const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
  if (match) {
    const [, funcName, filePath, line, col] = match;
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
    return `${fileName}:${line}:${col} [${funcName}]`;
  }
  
  // 兼容其他格式
  const simpleMatch = callerLine.match(/at\s+(.+?):(\d+):(\d+)/);
  if (simpleMatch) {
    const [, filePath, line, col] = simpleMatch;
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
    return `${fileName}:${line}:${col}`;
  }
  
  return callerLine.replace('at ', '') || 'unknown';
}

/**
 * 格式化时间戳
 */
function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
         `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

/**
 * 日志工具（调试/监控）- 优化版，增加详细定位信息
 */
export class LogUtil {
  /** 场景上下文 */
  static sceneContext: string = '';

  /** 设置场景上下文 */
  static setContext(context: string): void {
    this.sceneContext = context;
  }

  /**
   * 普通日志
   */
  static log(...args: any[]): void {
    if (ENV_CONFIG.gameDebug) {
      const caller = getCallerInfo();
      const context = this.sceneContext ? `[${this.sceneContext}] ` : '';
      console.log(`%c[${formatTimestamp()}]%c ${context}${caller}`, 'color: #666', 'color: #4CAF50; font-weight: bold', ...args);
    }
  }

  /**
   * 信息日志
   */
  static info(...args: any[]): void {
    if (ENV_CONFIG.gameDebug) {
      const caller = getCallerInfo();
      const context = this.sceneContext ? `[${this.sceneContext}] ` : '';
      console.info(`%c[${formatTimestamp()}]%c ${context}${caller}`, 'color: #666', 'color: #2196F3; font-weight: bold', ...args);
    }
  }

  /**
   * 警告日志
   */
  static warn(...args: any[]): void {
    const caller = getCallerInfo();
    const context = this.sceneContext ? `[${this.sceneContext}] ` : '';
    console.warn(`%c[${formatTimestamp()}]%c ${context}${caller}`, 'color: #666', 'color: #FF9800; font-weight: bold', ...args);
  }

  /**
   * 错误日志
   */
  static error(...args: any[]): void {
    const caller = getCallerInfo();
    const context = this.sceneContext ? `[${this.sceneContext}] ` : '';
    console.error(`%c[${formatTimestamp()}]%c ${context}${caller}`, 'color: #666', 'color: #F44336; font-weight: bold', ...args);
  }

  /**
   * 调试日志（仅开发环境）
   */
  static debug(...args: any[]): void {
    if (ENV_CONFIG.gameDebug) {
      const caller = getCallerInfo();
      const context = this.sceneContext ? `[${this.sceneContext}] ` : '';
      console.debug(`%c[${formatTimestamp()}]%c ${context}${caller}`, 'color: #999', 'color: #9C27B0; font-weight: bold', ...args);
    }
  }

  /**
   * 性能日志（记录耗时）
   */
  static performance(label: string, startTime: number): void {
    if (ENV_CONFIG.gameDebug) {
      const duration = performance.now() - startTime;
      const caller = getCallerInfo();
      const context = this.sceneContext ? `[${this.sceneContext}] ` : '';
      console.log(`%c[${formatTimestamp()}]%c ${context}${caller} %c[Performance] ${label}: ${duration.toFixed(2)}ms`, 
        'color: #666', 'color: #4CAF50; font-weight: bold', 'color: #FF5722');
    }
  }

  /**
   * 性能标记开始
   */
  static startPerformance(label: string): () => void {
    const startTime = performance.now();
    return () => this.performance(label, startTime);
  }

  /**
   * 分组日志开始
   */
  static group(label: string): void {
    if (ENV_CONFIG.gameDebug) {
      const caller = getCallerInfo();
      const context = this.sceneContext ? `[${this.sceneContext}] ` : '';
      console.group(`[${formatTimestamp()}] ${context}${caller} ${label}`);
    }
  }

  /**
   * 分组日志结束
   */
  static groupEnd(): void {
    if (ENV_CONFIG.gameDebug) {
      console.groupEnd();
    }
  }

  /**
   * 表格日志
   */
  static table(data: any): void {
    if (ENV_CONFIG.gameDebug) {
      const caller = getCallerInfo();
      console.log(`%c[${formatTimestamp()}]%c ${caller}`, 'color: #666', 'color: #00BCD4; font-weight: bold');
      console.table(data);
    }
  }
}
