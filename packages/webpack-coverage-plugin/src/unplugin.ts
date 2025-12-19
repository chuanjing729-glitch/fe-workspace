import { createUnplugin } from 'unplugin';
import { WebpackCoveragePluginOptions } from './core/types';
import { CoveragePluginCore } from './core/plugin-core';
import { Compiler } from 'webpack';

// ... imports

/**
 * Webpack/Rspack 通用适配逻辑
 * 将核心逻辑桥接到 Webpack 风格的钩子 (Hooks) 上
 */
function applyWebpackLike(compiler: Compiler, core: CoveragePluginCore) {
    // 兼容性处理：原有逻辑使用 compiler.hooks.done
    compiler.hooks.done.tapPromise('UnpluginCoverage', async () => {
        await core.generateReport();
    });

    // DevServer 集成 (支持 Webpack 4/5 和 Rspack)
    if (compiler.options.devServer) {
        const devServer = compiler.options.devServer as any;

        // Webpack 4: before
        const originalBefore = devServer.before;
        if (originalBefore) {
            devServer.before = (app: any, server: any, compiler: any) => {
                originalBefore(app, server, compiler);
                core.httpServer.install(app);
            };
        } else if (devServer.onBeforeSetupMiddleware) {
            // Webpack 5 (Deprecated)
            const originalMiddleware = devServer.onBeforeSetupMiddleware;
            devServer.onBeforeSetupMiddleware = (devServerObj: any) => {
                if (originalMiddleware) originalMiddleware(devServerObj);
                if (devServerObj.app) core.httpServer.install(devServerObj.app);
            };
        } else if (devServer.setupMiddlewares) {
            // Webpack 5 Latest / Rspack
            const originalSetup = devServer.setupMiddlewares;
            devServer.setupMiddlewares = (middlewares: any[], devServerObj: any) => {
                if (originalSetup) middlewares = originalSetup(middlewares, devServerObj);
                if (devServerObj.app) core.httpServer.install(devServerObj.app);
                return middlewares;
            };
        }
    }
}

/**
 * Unplugin Factory (通用插件工厂)
 * 定义跨平台的构建钩子，并分发到不同工具的适配器中
 */
export const unplugin = createUnplugin<WebpackCoveragePluginOptions>((options) => {
    const core = new CoveragePluginCore(options);

    return {
        name: 'unplugin-coverage',

        // 1. 通用构建开始钩子
        async buildStart() {
            await core.init();
        },

        // 2. 文件包含检测
        transformInclude(id) {
            return core.shouldInstrument(id);
        },

        // 3. 代码转换 (插桩)
        transform(code, id) {
            return core.transform(code, id);
        },

        // ------------------
        // Webpack 特定适配
        // ------------------
        webpack(compiler: Compiler) {
            applyWebpackLike(compiler, core);
        },

        // ------------------
        // Rspack 特定适配
        // ------------------
        rspack(compiler: any) {
            applyWebpackLike(compiler, core);
        },

        // ------------------
        // Vite 特定适配
        // ------------------
        vite: {
            // 配置 DevServer (Middleware)
            configureServer(server) {
                // server.middlewares 是 connect 实例，兼容 Express 风格
                core.httpServer.install(server.middlewares);
            },

            // 构建结束时生成报告
            async closeBundle() {
                await core.generateReport();
            },

            // 注入 UI 脚本 (Overlay) 到 HTML 中
            transformIndexHtml() {
                if (core.options.enableOverlay) {
                    return [
                        {
                            tag: 'script',
                            attrs: { src: '/__coverage_overlay.js' },
                            injectTo: 'body'
                        },
                        {
                            tag: 'link',
                            attrs: { rel: 'stylesheet', href: '/__coverage_overlay.css' },
                            injectTo: 'head'
                        }
                    ];
                }
            }
        }
    };
});
