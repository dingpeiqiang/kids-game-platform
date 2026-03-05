/**
 * 构建后处理脚本
 * 修复 index.html 中的内联脚本路径问题
 * 复制必要的静态文件
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distPath = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distPath, 'index.html');
const projectRoot = path.resolve(process.cwd());

console.log('[Post-Build] 开始构建后处理...');

try {
  // 1. 处理 index.html
  console.log('[Post-Build] 处理 index.html...');
  let htmlContent = fs.readFileSync(indexPath, 'utf-8');

  // 移除可能残留的无效脚本引用（如果有）
  htmlContent = htmlContent.replace(
    /<script type="module" src="\/src\/main\.ts"><\/script>\s*/g,
    ''
  );

  // 写回文件
  fs.writeFileSync(indexPath, htmlContent, 'utf-8');
  console.log('[Post-Build] ✓ index.html 处理完成');

  // 2. 复制 404.html
  console.log('[Post-Build] 复制 404.html...');
  const source404 = path.join(projectRoot, '404.html');
  const target404 = path.join(distPath, '404.html');

  if (fs.existsSync(source404)) {
    fs.copyFileSync(source404, target404);
    console.log('[Post-Build] ✓ 404.html 复制完成');
  } else {
    console.warn('[Post-Build] ⚠ 404.html 不存在，跳过复制');
  }

  // 3. 创建 .nojekyll 文件
  console.log('[Post-Build] 创建 .nojekyll...');
  const nojekyllPath = path.join(distPath, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '', 'utf-8');
  console.log('[Post-Build] ✓ .nojekyll 创建完成');

  // 4. 列出构建产物
  console.log('[Post-Build] 构建产物目录:');
  const listFiles = (dir, prefix = '') => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        console.log(`${prefix}📁 ${file}/`);
        listFiles(filePath, prefix + '  ');
      } else {
        console.log(`${prefix}📄 ${file} (${formatSize(stats.size)})`);
      }
    });
  };

  listFiles(distPath);

  console.log('[Post-Build] ✓ 构建后处理完成');
} catch (error) {
  console.error('[Post-Build] ✗ 处理失败:', error);
  process.exit(1);
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
