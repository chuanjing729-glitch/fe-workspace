import { Compiler } from 'webpack';
import { WebpackCoveragePluginOptions } from './core/types';
import { unplugin } from './unplugin';

/**
 * WebpackCoveragePlugin (V3.0 Unplugin Wrapper)
 * 保持向后兼容的 Class API
 */
export class WebpackCoveragePlugin {
  private rawPlugin: any;

  constructor(options: WebpackCoveragePluginOptions = {}) {
    this.rawPlugin = unplugin.webpack(options);
  }

  apply(compiler: Compiler) {
    this.rawPlugin.apply(compiler);
  }
}

export default WebpackCoveragePlugin;
