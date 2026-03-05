import { LogUtil } from '@/utils/log.util';

/**
 * 颜色游戏配置
 */
export interface ColorGameConfig {
  colors: Array<{ name: string; code: string; label: string }>;
}

/**
 * 颜色游戏状态
 */
export interface ColorGameState {
  targetColor: string;
  currentOptions: string[];
}

/**
 * 颜色游戏逻辑类
 * 提供核心的游戏玩法逻辑，可被单人和双人模式共享
 */
export class ColorGameLogic {
  private readonly COLORS: Array<{ name: string; code: string; label: string }>;

  constructor(config?: ColorGameConfig) {
    this.COLORS = config?.colors || [
      { name: '红色', code: '#FF6B6B', label: '🔴' },
      { name: '蓝色', code: '#4A90E2', label: '🔵' },
      { name: '绿色', code: '#95E1D3', label: '🟢' },
      { name: '黄色', code: '#FFE66D', label: '🟡' },
      { name: '紫色', code: '#9B59B6', label: '🟣' },
      { name: '橙色', code: '#F39C12', label: '🟠' },
    ];

    LogUtil.log('[ColorGameLogic] 颜色游戏逻辑初始化完成');
  }

  /**
   * 生成新的目标颜色
   */
  public generateNewQuestion(): ColorGameState {
    const randomIndex = Math.floor(Math.random() * this.COLORS.length);
    const targetColor = this.COLORS[randomIndex].code;

    // 生成选项（包含目标颜色）
    const options = this.generateOptions(targetColor);

    LogUtil.log(`[ColorGameLogic] 生成新题目，目标颜色: ${targetColor}`);

    return {
      targetColor,
      currentOptions: options,
    };
  }

  /**
   * 生成颜色选项（包含目标颜色和其他随机颜色）
   */
  public generateOptions(targetColor: string): string[] {
    const options = [targetColor];

    // 添加其他随机颜色
    while (options.length < this.COLORS.length) {
      const randomColor = this.COLORS[Math.floor(Math.random() * this.COLORS.length)].code;
      if (!options.includes(randomColor)) {
        options.push(randomColor);
      }
    }

    // 打乱顺序
    return options.sort(() => Math.random() - 0.5);
  }

  /**
   * 检查答案是否正确
   */
  public checkAnswer(selectedColor: string, targetColor: string): boolean {
    const isCorrect = selectedColor === targetColor;
    LogUtil.log(`[ColorGameLogic] 检查答案: ${selectedColor} === ${targetColor} = ${isCorrect}`);
    return isCorrect;
  }

  /**
   * 获取颜色配置
   */
  public getColorConfig(): Array<{ name: string; code: string; label: string }> {
    return [...this.COLORS];
  }

  /**
   * 根据颜色代码获取颜色名称
   */
  public getColorName(colorCode: string): string {
    const color = this.COLORS.find(c => c.code === colorCode);
    return color?.name || '未知颜色';
  }

  /**
   * 根据颜色代码获取颜色标签
   */
  public getColorLabel(colorCode: string): string {
    const color = this.COLORS.find(c => c.code === colorCode);
    return color?.label || '❓';
  }
}
