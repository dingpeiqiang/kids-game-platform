/**
 * UI 模块统一导出
 */

// Phaser UI 组件
export { Button, Modal, ResultModal, ScorePanel, ScorePanelManager } from './phaser';
export type { ButtonOptions, ModalOptions, ScorePanelOptions } from './phaser';

// DOM UI 组件
export { GameCard } from './components/GameCard';
export { FilterButton } from './components/FilterButton';
export { SearchBox } from './components/SearchBox';
export type { GameItem } from './components';

// 菜单场景
export { MenuScene } from './menu.scene';
