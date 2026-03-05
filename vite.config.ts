import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  return {
    // 基础路径 - 生产环境使用根路径
    base: mode === 'production' ? '/' : '/',
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
    // 构建配置
    build: {
      outDir: 'dist',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        // 单页面应用配置
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
        },
        output: {
          // 按模块拆分代码（便于自动化工具拆分生成）
          manualChunks: {
            phaser: ['phaser'],
          },
        },
      },
    },
  };
});
