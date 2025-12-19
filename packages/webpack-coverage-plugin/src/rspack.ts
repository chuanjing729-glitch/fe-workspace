import { unplugin } from './unplugin';
import { WebpackCoveragePluginOptions } from './core/types';

/**
 * Rspack Plugin Adapter
 * 导出 Rspack 专用的插件实例 (兼容 Webpack 接口)
 * 
 * Usage:
 * const { rspackCoveragePlugin } = require('@51jbs/webpack-coverage-plugin/rspack');
 * plugins: [rspackCoveragePlugin({...})]
 */
export default unplugin.rspack;
export const rspackCoveragePlugin = unplugin.rspack;

