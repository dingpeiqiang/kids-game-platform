import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

export default defineConfig(({ mode }) => {
  return {
    // 基础路径
    base: mode === 'production' ? '/kids-game/' : '/',
    // 别名配置（模块化便捷引用）
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // esbuild 配置（移除类型检查，只做语法转换）
    esbuild: {
      loader: 'ts',
    },
    // 开发服务器配置
    server: {
      port: 3000,
      open: true,
      host: true,
    },
    // 优化配置
    optimizeDeps: {
      include: ['phaser', 'js-cookie'],
    },
    // 插件配置
    plugins: [
      {
        name: 'copy-index-html',
        closeBundle() {
          if (mode === 'production') {
            const sourceDir = resolve(__dirname);
            const targetDir = resolve(__dirname, 'dist');

            // 复制 index.html 到 dist 目录
            const sourceHtml = resolve(sourceDir, 'index.html');
            const targetHtml = resolve(targetDir, 'index.html');

            if (existsSync(sourceHtml)) {
              copyFileSync(sourceHtml, targetHtml);
              console.log('✓ 已复制 index.html 到 dist 目录');
            }
          }
        },
      },
    ],
    // 构建配置
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
        },
        output: {
          // 按模块拆分代码
          manualChunks: {
            phaser: ['phaser'],
          },
          entryFileNames: 'assets/main.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  };
});
