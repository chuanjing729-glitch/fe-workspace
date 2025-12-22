import { unplugin } from './unplugin';
import type { Plugin } from 'vite';
import { WebpackCoveragePluginOptions } from './core/types';

/**
 * Vite Coverage Plugin
 * export default for easy use in vite.config.ts
 */
export default unplugin.vite as (options?: WebpackCoveragePluginOptions) => Plugin;
export const viteCoveragePlugin = unplugin.vite as (options?: WebpackCoveragePluginOptions) => Plugin;
