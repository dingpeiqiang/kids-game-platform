/**
 * 构建后处理脚本
 * 移除 index.html 中无效的脚本引用
 */

import fs from 'fs';
import path from 'path';

const distPath = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('[Post-Build] 开始处理 index.html...');

try {
  let htmlContent = fs.readFileSync(indexPath, 'utf-8');

  // 移除无效的脚本引用
  htmlContent = htmlContent.replace(
    /<script type="module" src="\/src\/index\.ts"><\/script>/g,
    ''
  );

  // 写回文件
  fs.writeFileSync(indexPath, htmlContent, 'utf-8');

  console.log('[Post-Build] ✓ index.html 处理完成');
} catch (error) {
  console.error('[Post-Build] ✗ 处理失败:', error);
  process.exit(1);
}
