/**
 * 设备模块统一导出
 * 使用方式：
 * import { DeviceDetector, DeviceAdapter, DeviceCalculator } from '@/core/device';
 */

export { DeviceDetector } from './detector';
export { DeviceAdapter } from './adapter';
export { DeviceCalculator } from './calculator';

export type { DeviceInfo, DeviceType, Orientation } from './detector';
export type { UISizeConfig, ResolutionConfig } from './adapter';
export type { ElementSize, LayoutConfig } from './calculator';
