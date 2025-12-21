/**
 * Webpack 专用入口文件
 * 
 * 为 Webpack 项目提供便捷的导入方式
 * 
 * 使用方式：
 * ```javascript
 * const { WebpackIncrementalCoveragePlugin } = require('@51jbs/incremental-coverage-plugin/webpack');
 * 
 * module.exports = {
 *   plugins: [
 *     new WebpackIncrementalCoveragePlugin({ ... })
 *   ]
 * };
 * ```
 * 
 * @module webpack
 */

import { IncrementalCoveragePlugin } from './plugin';

// 导出 Webpack 版本的插件
export default IncrementalCoveragePlugin.webpack;
export const WebpackIncrementalCoveragePlugin = IncrementalCoveragePlugin.webpack;
