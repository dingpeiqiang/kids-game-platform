/**
 * 批量修复导航路径
 * 将 window.location.href = '/' 替换为 navigateTo('/')
 */

import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(process.cwd(), 'src');

// 需要修复的文件列表
const filesToFix = [
  'games/color-game/scenes/game.scene.ts',
  'games/color-game/scenes/result.scene.ts',
  'games/demo-game/scenes/game.scene.ts',
  'games/demo-game/scenes/result.scene.ts',
  'games/shape-game/scenes/game.scene.ts',
  'games/shape-game/scenes/result.scene.ts',
  'scenes/universal-split-screen.scene.ts',
  'scenes/login.scene.ts', // 已修复，跳过
  'core/battle-select.scene.ts',
  'core/layout-manager.ts',
  'core/split-screen-manager.ts',
];

console.log('[修复] 开始批量修复导航路径...');

let fixedCount = 0;
let skippedCount = 0;

filesToFix.forEach(relativePath => {
  const filePath = path.join(projectRoot, relativePath);

  if (!fs.existsSync(filePath)) {
    console.warn(`[跳过] 文件不存在: ${relativePath}`);
    skippedCount++;
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 检查是否已经导入 navigateTo
    if (!content.includes("import { navigateTo } from '@/utils/path.util'") &&
        !content.includes("import { navigateTo } from '../utils/path.util'") &&
        !content.includes("import { navigateTo } from '../../utils/path.util'")) {

      // 查找最后一个 import 语句
      const importMatch = content.match(/^import.*from\s+['"][^'"]+['"];\s*$/gm);
      if (importMatch && importMatch.length > 0) {
        const lastImport = importMatch[importMatch.length - 1];
        const lastIndex = content.indexOf(lastImport) + lastImport.length;

        // 计算导入路径的深度
        const depth = relativePath.split('/').length - 1;
        const pathPrefix = depth > 0 ? '../'.repeat(depth - 1) : './';
        const importPath = pathPrefix + 'utils/path.util';

        const importStatement = `\nimport { navigateTo } from '@/utils/path.util';\n`;
        content = content.slice(0, lastIndex) + importStatement + content.slice(lastIndex);

        console.log(`[添加] ${relativePath}: 添加导入语句`);
      } else {
        console.warn(`[跳过] ${relativePath}: 未找到导入语句位置`);
        skippedCount++;
        return;
      }
    }

    // 替换 window.location.href = '/' 为 navigateTo('/')
    const originalMatches = content.match(/window\.location\.href\s*=\s*['"]\/['"]/g);
    if (originalMatches && originalMatches.length > 0) {
      content = content.replace(/window\.location\.href\s*=\s*['"]\/['"]/g, "navigateTo('/')");
      console.log(`[修复] ${relativePath}: 替换了 ${originalMatches.length} 处`);
      fixedCount += originalMatches.length;
    } else {
      console.log(`[跳过] ${relativePath}: 没有需要替换的内容`);
    }

    // 写回文件
    fs.writeFileSync(filePath, content, 'utf-8');

  } catch (error) {
    console.error(`[错误] ${relativePath}:`, error.message);
  }
});

console.log(`\n[完成] 修复完成！`);
console.log(`- 修复的文件: ${filesToFix.length - skippedCount} 个`);
console.log(`- 替换的语句: ${fixedCount} 处`);
console.log(`- 跳过的文件: ${skippedCount} 个`);
