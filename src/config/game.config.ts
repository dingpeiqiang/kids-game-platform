import 'phaser';

/**
 * 游戏全局配置（配置化管理，便于自动化工具修改）
 * 儿童游戏特性：低帧率、适配小屏、禁用暴力渲染
 */
export const GAME_CONFIG = {
  // 基础配置
  width: 750, // 设计宽度（适配移动端）
  height: 1334, // 设计高度
  type: Phaser.AUTO, // 自动选择渲染模式（WebGL/Canvas）
  fps: {
    target: 60, // 提高帧率，减少卡顿
    forceSetTimeOut: false,
  },
  // 渲染配置（儿童友好：抗锯齿、清晰）
  pixelArt: false,
  roundPixels: true, // 像素取整，避免模糊
  // 输入配置（适配触摸/鼠标）
  input: {
    touch: {
      capture: true,
    },
    mouse: true,
  },
  // 音频配置（儿童游戏默认静音，需用户触发）
  audio: {
    disableWebAudio: false,
  },
  // 父容器
  parent: 'game-container',
  backgroundColor: '#87CEEB',
} as const;
