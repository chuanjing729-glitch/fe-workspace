/**
 * Vite 专用入口文件
 * 
 * 为 Vite 项目提供便捷的导入方式
 * 
 * 使用方式：
 * ```javascript
 * import { ViteIncrementalCoveragePlugin } from '@51jbs/incremental-coverage-plugin/vite';
 * 
 * export default {
 *   plugins: [
 *     ViteIncrementalCoveragePlugin({ ... })
 *   ]
 * };
 * ```
 * 
 * @module vite
 */

import { IncrementalCoveragePlugin } from './plugin';

// 导出 Vite 版本的插件
export default IncrementalCoveragePlugin.vite;
export const ViteIncrementalCoveragePlugin = IncrementalCoveragePlugin.vite;
