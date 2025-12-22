/**
 * 主插件文件
 * 
 * 使用 unplugin 创建统一的插件接口，支持 Webpack、Vite 等多种构建工具
 * 负责初始化各个模块并协调它们之间的交互
 * 
 * @module plugin
 */

import { createUnplugin } from 'unplugin';
import type { IncrementalCoverageOptions } from './types';
import { CoverageCollector } from './collector';
import { CoverageDiffer } from './differ';
import { CoverageReporter } from './reporter';

/**
 * 默认配置选项
 * 
 * 提供合理的默认值，用户可以根据需要覆盖这些配置
 */
const defaultOptions: IncrementalCoverageOptions = {
    // 默认只包含 src 目录下的文件
    include: ['src/**'],

    // 默认排除测试文件和 node_modules
    exclude: ['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**'],

    // 默认与 main 分支对比
    gitDiffBase: 'main',

    // 默认输出到 .coverage 目录
    outputDir: '.coverage',

    // 默认生成 HTML 格式报告
    reportFormat: 'html',

    // 默认启用浏览器 UI
    enableOverlay: true,

    // 默认 baseline 文件路径
    baselinePath: '.coverage/baseline.json',

    // 默认自动保存 baseline
    autoSaveBaseline: true,

    // 默认覆盖率阈值 80%
    threshold: 80,
    // 默认报告生成间隔 10秒
    reportInterval: 10000,
    // 默认保留 15 个历史报告
    historyCount: 15,
};

/**
 * Incremental Coverage Plugin
 * 
 * 轻量级增量覆盖率插件，基于以下技术：
 * - babel-plugin-istanbul: 代码插桩
 * - istanbul-diff: 增量覆盖率计算
 * - unplugin: 多构建工具支持
 * 
 * @example
 * // Webpack
 * new WebpackIncrementalCoveragePlugin({ include: ['src/**'] })
 * 
 * // Vite
 * ViteIncrementalCoveragePlugin({ include: ['src/**'] })
 */
export const IncrementalCoveragePlugin = createUnplugin<IncrementalCoverageOptions | undefined>((userOptions = {}) => {
    // 合并用户配置和默认配置
    const options = { ...defaultOptions, ...userOptions };

    // 初始化各个模块
    const collector = new CoverageCollector();
    const differ = new CoverageDiffer(options);
    const reporter = new CoverageReporter(options);

    // 用于防抖处理
    let lastReportTime = 0;
    let pendingResult: any = null;
    let reportTimer: NodeJS.Timeout | null = null;

    console.log('[IncrementalCoverage] 插件已初始化');

    return {
        // 插件名称
        name: 'incremental-coverage-plugin',

        /**
         * Webpack 特定的钩子
         * 
         * 在 Webpack 环境中，需要：
         * 1. 注入 babel-plugin-istanbul 配置
         * 2. 设置 HTTP 中间件接收覆盖率数据
         * 3. 监听编译生命周期
         */
        webpack(compiler) {
            console.log('[IncrementalCoverage] Webpack 模式');

            // 1. 注入 babel-plugin-istanbul 配置
            const rules = (compiler.options.module?.rules || []) as any[];
            const processed = new WeakSet();

            const injectBabel = (rule: any) => {
                if (!rule || typeof rule !== 'object' || processed.has(rule)) return;
                processed.add(rule);

                // 1. 检查 direct loader (对象形式)
                const isBabel = rule.loader && (typeof rule.loader === 'string') && (rule.loader.includes('babel-loader') || rule.loader === 'babel-loader');
                if (isBabel) {
                    if (!rule.options) rule.options = {};
                    if (typeof rule.options === 'object') {
                        rule.options.plugins = rule.options.plugins || [];
                        const hasIstanbul = rule.options.plugins.some((p: any) => {
                            const name = Array.isArray(p) ? p[0] : p;
                            return typeof name === 'string' && name.includes('istanbul');
                        });
                        if (!hasIstanbul) {
                            rule.options.plugins.push([
                                'babel-plugin-istanbul',
                                {
                                    extension: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
                                    include: options.include,
                                    exclude: options.exclude || ['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**']
                                }
                            ]);
                            console.log('[IncrementalCoverage] 已注入到 babel-loader');
                        }
                    }
                }

                // 2. 检查 use 数组或对象
                if (rule.use) {
                    if (Array.isArray(rule.use)) {
                        rule.use.forEach((u: any, index: number) => {
                            if (typeof u === 'object') {
                                injectBabel(u);
                            } else if (typeof u === 'string' && (u.includes('babel-loader') || u === 'babel-loader')) {
                                // 将字符串转换为对象
                                rule.use[index] = {
                                    loader: u,
                                    options: {
                                        plugins: [[
                                            'babel-plugin-istanbul',
                                            {
                                                extension: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
                                                include: options.include,
                                                exclude: options.exclude || ['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**']
                                            }
                                        ]]
                                    }
                                };
                                console.log('[IncrementalCoverage] 已将字符串 babel-loader 转换为对象并注入');
                            }
                        });
                    } else if (typeof rule.use === 'object') {
                        injectBabel(rule.use);
                    } else if (typeof rule.use === 'string' && (rule.use.includes('babel-loader') || rule.use === 'babel-loader')) {
                        rule.use = {
                            loader: rule.use,
                            options: {
                                plugins: [[
                                    'babel-plugin-istanbul',
                                    {
                                        extension: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
                                        include: options.include,
                                        exclude: options.exclude || ['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**']
                                    }
                                ]]
                            }
                        };
                        console.log('[IncrementalCoverage] 已将 rule.use 字符串转换为对象并注入');
                    }
                }

                // 3. 递归 oneOf 等
                if (rule.oneOf && Array.isArray(rule.oneOf)) {
                    rule.oneOf.forEach(injectBabel);
                }
            };

            rules.forEach(injectBabel);

            // 2. 设置中间件接收覆盖率数据
            // 直接修改 devServer 配置
            if (!compiler.options.devServer) {
                compiler.options.devServer = {};
            }

            const originalSetupMiddlewares = compiler.options.devServer.setupMiddlewares;
            compiler.options.devServer.setupMiddlewares = (middlewares: any, devServer: any) => {
                if (originalSetupMiddlewares) {
                    middlewares = originalSetupMiddlewares(middlewares, devServer);
                }

                devServer.app?.post('/coverage', async (req: any, res: any) => {
                    const startTime = Date.now();

                    // 定义处理逻辑
                    const handleCoverage = async (payload: any) => {
                        let coverageData;

                        // 处理压缩数据
                        if (payload.data && req.headers['x-coverage-compressed']) {
                            try {
                                const compressed = payload.data;
                                const decompressed = Buffer.from(compressed, 'base64').toString();
                                coverageData = JSON.parse(decodeURIComponent(decompressed));

                                console.log('[IncrementalCoverage] 数据已解压缩 (压缩率: ' +
                                    Math.round((1 - compressed.length / JSON.stringify(coverageData).length) * 100) + '%)');
                            } catch (e) {
                                console.warn('[IncrementalCoverage] 解压失败，回退到原始数据:', e);
                                coverageData = payload.data ? payload.data : payload;
                            }
                        } else {
                            coverageData = payload;
                        }

                        // 合并并计算
                        const merged = collector.merge(coverageData);
                        const result = await differ.calculate(merged);
                        pendingResult = result;

                        // 防抖逻辑
                        const now = Date.now();
                        const elapsed = now - lastReportTime;
                        const interval = options.reportInterval || 10000;

                        if (elapsed >= interval) {
                            await reporter.generate(result);
                            lastReportTime = now;
                            if (reportTimer) {
                                clearTimeout(reportTimer);
                                reportTimer = null;
                            }
                        } else if (!reportTimer) {
                            console.log(`[IncrementalCoverage] 报告生成冷却中，将在 ${interval - elapsed}ms 后尝试...`);
                            reportTimer = setTimeout(async () => {
                                if (pendingResult) {
                                    await reporter.generate(pendingResult);
                                    lastReportTime = Date.now();
                                }
                                reportTimer = null;
                            }, interval - elapsed);
                        }

                        res.json({
                            status: 'ok',
                            coverage: {
                                rate: result.overall.coverageRate,
                                coveredLines: result.overall.coveredLines,
                                totalLines: result.overall.totalLines,
                                fileCount: result.files.length
                            }
                        });
                    };

                    try {
                        // 1. 如果 body-parser 已经处理了 body
                        if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
                            await handleCoverage(req.body);
                            return;
                        }

                        // 2. 否则，手动收集流数据
                        let chunks: Buffer[] = [];
                        req.on('data', (chunk: Buffer) => { chunks.push(chunk); });
                        req.on('end', async () => {
                            try {
                                const body = Buffer.concat(chunks).toString();
                                if (!body) {
                                    res.status(400).json({ success: false, error: 'Empty body' });
                                    return;
                                }
                                const payload = JSON.parse(body);
                                await handleCoverage(payload);
                            } catch (parseError) {
                                console.error('[IncrementalCoverage] 接收数据解析失败:', parseError);
                                res.status(400).json({ success: false, error: 'Invalid data format' });
                            }
                        });
                    } catch (error) {
                        console.error('[IncrementalCoverage] 中间件处理异常:', error);
                        res.status(500).json({ success: false, error: String(error) });
                    }
                });

                console.log('[IncrementalCoverage] 中间件已注册');
                return middlewares;
            };

            // 3. 监听编译完成，注入客户端脚本
            compiler.hooks.compilation.tap('IncrementalCoveragePlugin', (compilation: any) => {
                // 3.1 生成客户端脚本文件
                compilation.hooks.processAssets.tap(
                    {
                        name: 'IncrementalCoveragePlugin',
                        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
                    },
                    () => {
                        // Incremental Coverage Client Script (Hardened + Overlay)
                        const clientScript = `
                        (function () {
                            console.log('[Coverage Client] 启动 v2.2 with Overlay');

                            var config = {
                                endpoint: '/coverage',
                                interval: 5000,
                                maxRetries: 3,
                                retryDelay: 1000,
                                timeout: 5000,
                                storageKey: '__incremental_coverage_cache__',
                                enableOverlay: ${options.enableOverlay !== false}
  };

            var state = {
                lastDataHash: '',
                isReporting: false,
                retryQueue: JSON.parse(localStorage.getItem(config.storageKey) || '[]')
            };

            // --- Overlay Logic ---
            var overlay = null;

            function createOverlay() {
                if (!config.enableOverlay || overlay) return;

                var host = document.createElement('div');
                host.id = 'inc-cov-overlay-host';
                host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
                document.body.appendChild(host);

                var shadow = host.attachShadow({ mode: 'open' });
                var container = document.createElement('div');
                container.id = 'inc-cov-pill';

                var style = document.createElement('style');
                style.textContent = \`
        :host { all: initial; }
        .pill {
            background: #222;
            color: #fff;
            padding: 8px 16px;
            border-radius: 99px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .pill:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 20px rgba(0,0,0,0.25);
            background: #2a2a2a;
        }
        .dot { 
            width: 8px; 
            height: 8px; 
            border-radius: 50%; 
            background: #666; 
            box-shadow: 0 0 8px rgba(255,255,255,0.2);
            transition: background 0.3s ease;
        }
        .content { display: flex; flex-direction: column; line-height: 1.2; }
        .label { font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-size: 14px; font-variant-numeric: tabular-nums; }
      \`;
      
      shadow.appendChild(style);
      shadow.appendChild(container);
      
      overlay = { shadow: shadow, container: container };
      updateOverlay(null, 'init');
      
      // Click to open report (optional, logic needed to know report URL or open new tab)
      // For now, maybe just log or simple alert
      container.addEventListener('click', function() {
        console.log('[Coverage Overlay] Clicked');
      });
  }

  function updateOverlay(data, status) {
      if (!overlay) return;
      var container = overlay.container;
      
      var color = '#666';
      var labelText = 'Ready';
      var valueText = 'Inc. Coverage';
      
      if (status === 'init') {
        valueText = 'Connecting...';
      } else if (status === 'ok' && data) {
         var rate = data.rate;
         if (rate >= 80) color = '#10b981'; // Green
         else if (rate >= 50) color = '#f59e0b'; // Orange
         else color = '#ef4444'; // Red
         
         labelText = 'Changed Lines: ' + data.totalLines;
         valueText = rate + '%';
      } else {
         color = '#ef4444';
         valueText = 'Error';
      }

      container.innerHTML = \`
        <div class="pill">
            <div class="dot" style="background: \${color}; box-shadow: 0 0 8px \${color}66;"></div>
            <div class="content">
                <span class="label">\${labelText}</span>
                <span class="value">\${valueText}</span>
            </div>
        </div>
      \`;
  }

  function getHash(obj) {
    return JSON.stringify(obj).length + '';
  }

  function compressAndEncode(data) {
    try {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    } catch (e) {
      console.error('[Coverage Client] 编码失败:', e);
      return null;
    }
  }

  function sendData(coverageData, isRetry) {
    if (state.isReporting && !isRetry) return;
    
    var currentHash = getHash(coverageData);
    if (!isRetry && currentHash === state.lastDataHash) return;

    state.isReporting = true;
    var payload = compressAndEncode(coverageData);
    if (!payload) { state.isReporting = false; return; }

    fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Coverage-Compressed': 'base64' },
      body: JSON.stringify({ data: payload }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(config.timeout) : undefined
    })
    .then(function(res) {
      return res.json().then(function(json) {
         if (res.ok) { return json; }
         throw new Error(json.error || 'Server error');
      });
    })
    .then(function(json) {
        state.lastDataHash = currentHash;
        
        // Update Overlay
        if (json.coverage) {
            updateOverlay(json.coverage, 'ok');
        }
        
        if (state.retryQueue.length > 0) {
          var next = state.retryQueue.shift();
          localStorage.setItem(config.storageKey, JSON.stringify(state.retryQueue));
          sendData(next, true);
        }
    })
    .catch(function(err) {
      console.warn('[Coverage Client] 上报失败:', err.message);
      updateOverlay(null, 'error');
      if (!isRetry) {
        state.retryQueue.push(coverageData);
        if (state.retryQueue.length > 10) state.retryQueue.shift();
        localStorage.setItem(config.storageKey, JSON.stringify(state.retryQueue));
      }
    })
    .finally(function() {
      state.isReporting = false;
    });
  }

  // Init
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createOverlay);
  } else {
      createOverlay();
  }

  setInterval(function() {
    if (window.__coverage__) {
      sendData(window.__coverage__, false);
    }
  }, config.interval);

  window.addEventListener('beforeunload', function() {
    if (window.__coverage__ && getHash(window.__coverage__) !== state.lastDataHash) {
      var payload = compressAndEncode(window.__coverage__);
      if (payload) {
        navigator.sendBeacon(config.endpoint, JSON.stringify({ data: payload }));
      }
    }
  });
})();
                        `.trim();

                        compilation.emitAsset(
                            'coverage-client.js',
                            new compiler.webpack.sources.RawSource(clientScript)
                        );
                    }
                );

                // 3.2 集成 HtmlWebpackPlugin，自动注入 script 标签
                const HtmlWebpackPlugin = compiler.options.plugins?.find(
                    (plugin: any) => plugin.constructor.name === 'HtmlWebpackPlugin'
                )?.constructor;

                if (HtmlWebpackPlugin) {
                    (HtmlWebpackPlugin as any).getHooks(compilation).alterAssetTagGroups.tapAsync(
                        'IncrementalCoveragePlugin',
                        (data: any, cb: any) => {
                            // 在 body 结束前注入脚本
                            data.bodyTags.push({
                                tagName: 'script',
                                voidTag: false,
                                attributes: {
                                    src: '/coverage-client.js'
                                }
                            });
                            console.log('[IncrementalCoverage] 客户端脚本已自动注入');
                            cb(null, data);
                        }
                    );
                } else {
                    console.warn('[IncrementalCoverage] 未找到 HtmlWebpackPlugin，客户端脚本需要手动引入');
                }
            });

            // 4. 优雅退出钩子
            const finalReport = async () => {
                if (pendingResult) {
                    console.log('[IncrementalCoverage] 正在生成退出前的最终报告...');
                    try {
                        await reporter.generate(pendingResult);
                    } catch (e) {
                        console.error('[IncrementalCoverage] 退出前生成报告失败:', e);
                    }
                    pendingResult = null;
                }
            };

            process.once('SIGINT', async () => {
                await finalReport();
                process.exit(0);
            });
            process.once('SIGTERM', async () => {
                await finalReport();
                process.exit(0);
            });
        },

        /**
         * Vite 特定的钩子
         * 
         * 在 Vite 环境中，需要：
         * 1. 通过 transform 钩子注入 babel-plugin-istanbul
         * 2. 通过 configureServer 添加中间件
         * 3. 支持 HMR（热模块替换）
         */
        vite: {
            // 只在开发模式下应用
            apply: 'serve',

            /**
             * 配置解析完成后的钩子
             * 
             * 在这里可以访问完整的 Vite 配置
             */
            configResolved(config) {
                console.log('[IncrementalCoverage] Vite 模式');

                // TODO: 注入 babel-plugin-istanbul 配置
                // 需要在 transform 钩子中使用 babel 转换代码
            },

            /**
             * 配置开发服务器的钩子
             * 
             * 在这里添加自定义中间件
             */
            configureServer(server) {
                // TODO: 设置中间件接收覆盖率数据
                // 添加 POST /coverage 端点

                // TODO: 添加 HMR 支持
                // 在热更新时重新计算覆盖率
            },
        },

        /**
         * 构建开始时的钩子
         * 
         * 可以在这里进行初始化工作
         */
        buildStart() {
            console.log('[IncrementalCoverage] 构建开始');
        },

        /**
         * 构建结束时的钩子
         * 
         * 可以在这里进行清理工作
         */
        buildEnd() {
            console.log('[IncrementalCoverage] 构建结束');
        },
    };
});

// 默认导出
export default IncrementalCoveragePlugin;

// 导出类型定义
export type { IncrementalCoverageOptions };
