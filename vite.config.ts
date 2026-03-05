import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

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
      // 避免缓存问题
      hmr: {
        overlay: false,
      },
      // 监听配置
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
    // 优化配置
    optimizeDeps: {
      include: ['phaser', 'js-cookie'],
      // 强制重新预构建
      force: false,
    },
    // CSS配置优化
    css: {
      devSourcemap: true,
      // CSS代码分割和优化
      modules: {
        localsConvention: 'camelCase',
      },
    },
    // 构建配置
    build: {
      outDir: 'dist',
      // 生产环境压缩
      minify: mode === 'production' ? 'esbuild' : false,
      // CSS压缩
      cssCodeSplit: true,
      // 设置chunk大小警告限制
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        // 多页面应用配置
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          game: fileURLToPath(new URL('./game.html', import.meta.url)),
        },
        output: {
          // 按模块拆分代码（便于自动化工具拆分生成）
          manualChunks: {
            phaser: ['phaser'],
            'vendor-utils': ['js-cookie'],
          },
          // 文件名哈希
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },
  };
});
