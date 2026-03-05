import { SAFE_RULES } from '@/config/constant';

/**
 * 安全工具（儿童内容过滤、输入校验）
 */
export class SafeUtil {
  /**
   * 过滤敏感词（示例：简单的关键词过滤）
   * 实际项目中应该使用更完善的敏感词库
   */
  static filterSensitiveWords(text: string): string {
    const sensitiveWords = ['暴力', '血腥', '恐怖', '成人'];
    let filteredText = text;
    sensitiveWords.forEach((word) => {
      const regex = new RegExp(word, 'gi');
      filteredText = filteredText.replace(regex, '***');
    });
    return filteredText;
  }

  /**
   * 验证用户输入（长度、字符类型）
   */
  static validateInput(input: string): { valid: boolean; message: string } {
    // 检查长度
    if (input.length > SAFE_RULES.MAX_INPUT_LENGTH) {
      return {
        valid: false,
        message: `输入太长啦，最多只能输入${SAFE_RULES.MAX_INPUT_LENGTH}个字哦～`,
      };
    }

    // 检查是否包含敏感词
    const filtered = this.filterSensitiveWords(input);
    if (filtered !== input) {
      return { valid: false, message: '内容不合适哦，请重新输入～' };
    }

    return { valid: true, message: '' };
  }

  /**
   * 安全的数字限制（防止过大数值）
   */
  static clampNumber(value: number, min: number = 0, max: number = SAFE_RULES.MAX_SCORE): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * 检查图片URL是否安全（简单的协议检查）
   */
  static isSafeImageUrl(url: string): boolean {
    if (!url) return false;
    return url.startsWith('https://') || url.startsWith('http://') || url.startsWith('/');
  }

  /**
   * 转义HTML（防止XSS）
   */
  static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }
}
