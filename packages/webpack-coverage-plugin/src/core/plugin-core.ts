import { WebpackCoveragePluginOptions } from './types';
import { GitService } from '../services/git.service';
import { CoverageService } from '../services/coverage.service';
import { AnalysisService } from '../services/analysis.service';
import { ApiService } from '../services/api.service';
import { HttpServer } from '../infra/http.server';
import { FileStorage } from '../infra/storage';
import { ReportService } from '../services/report.service';
import * as path from 'path';
import { transformSync } from '@babel/core';

/**
 * CoveragePluginCore (核心逻辑层)
 * 封装平台无关的业务逻辑，包括：
 * 1. 服务初始化 (Git, Storage, Analysis, Report)
 * 2. 代码插桩 (Babel Transform)
 * 3. 报告生成 (Report Generation)
 */
export class CoveragePluginCore {
    options: WebpackCoveragePluginOptions;
    gitService: GitService;
    coverageService: CoverageService;
    analysisService: AnalysisService;
    apiService: ApiService;
    httpServer: HttpServer;
    storage: FileStorage;
    incrementalResult: any;

    constructor(options: WebpackCoveragePluginOptions = {}) {
        this.options = {
            enabled: process.env.ENABLE_SELF_TEST === 'true',
            include: options.include || [],
            exclude: options.exclude,
            outputDir: options.outputDir || '.coverage',
            enableImpactAnalysis: options.enableImpactAnalysis !== false,
            enableOverlay: options.enableOverlay !== false,
            qualityGate: {
                lineCoverageThreshold: 80,
                ...options.qualityGate
            },
            ...options
        };

        // 默认排除逻辑 (Default exclude logic)
        if (!this.options.exclude) {
            this.options.exclude = [/node_modules/, /\.test\./, /\.spec\./] as unknown as RegExp | string[];
        }

        // 初始化各个服务 (Initialize Services)
        // FileStorage: 用于缓存 AST 分析结果和文件内容
        this.storage = new FileStorage(path.resolve(process.cwd(), '.cache'), 'coverage-plugin');
        this.gitService = new GitService(process.cwd()); // Git 操作
        this.coverageService = new CoverageService(this.gitService, this.options); // 覆盖率核心计算 (注入 options 用于过滤)
        this.analysisService = new AnalysisService(process.cwd(), this.storage); // 依赖分析
        this.apiService = new ApiService('', '', ''); // API 服务 (预留)
        this.httpServer = new HttpServer(this.coverageService); // HTTP 服务 (接收覆盖率上报)
    }

    /**
     * 插件初始化
     * 如果需要在构建开始时进行依赖分析，在此处执行
     */
    async init() {
        if (!this.options.enabled) return;
        console.log('[CoveragePlugin] 初始化...');

        // 自动探测 Git 根目录 (支持 Monorepo)
        await this.gitService.findGitRoot();

        if (this.options.enableImpactAnalysis) {
            this.analysisService.initDependencyGraph().catch(console.error);
        }
    }

    /**
     * 判断文件是否需要插桩
     * 基于 include/exclude 配置和文件扩展名
     */
    shouldInstrument(file: string): boolean {
        if (!this.options.enabled) return false;

        // Normalize path for consistent matching
        const normalizedFile = file.replace(/\\/g, '/');

        if (normalizedFile.includes('node_modules')) return false;

        // Include check (v3.0 fix: use startsWith for absolute path prefix matching)
        if (this.options.include) {
            const includes = Array.isArray(this.options.include) ? this.options.include : [this.options.include];
            let matched = false;
            for (const p of includes) {
                if (p instanceof RegExp && p.test(normalizedFile)) {
                    matched = true;
                    break;
                }
                if (typeof p === 'string') {
                    const normalizedP = p.replace(/\\/g, '/');
                    if (normalizedFile.startsWith(normalizedP) || normalizedFile.includes(normalizedP)) {
                        // NOTE: For absolute paths, startsWith is safer. 
                        // But we'll keep includes if the user provided a partial path.
                        // However, if we want to be strict with the ResolveDir/src, startsWith is better.
                        matched = true;
                        break;
                    }
                }
            }
            if (!matched) return false;
        }

        // Exclude check
        if (this.options.exclude) {
            const excludes = Array.isArray(this.options.exclude) ? this.options.exclude : [this.options.exclude];
            for (const p of excludes) {
                if (p instanceof RegExp && p.test(normalizedFile)) return false;
                if (typeof p === 'string') {
                    const normalizedP = p.replace(/\\/g, '/');
                    if (normalizedFile.includes(normalizedP)) return false;
                }
            }
        }

        return /\.(js|ts|jsx|tsx|vue)$/.test(normalizedFile);
    }

    /**
     * 代码转换 (Transform)
     * 使用 Babel 和 istanbul 插件对代码进行插桩
     */
    transform(code: string, id: string): { code: string, map: any } | null {
        if (!this.shouldInstrument(id)) return null;

        try {
            const result = transformSync(code, {
                filename: id,
                plugins: [
                    [require.resolve('babel-plugin-istanbul'), {
                        // 启用 inputSourceMap 传递，确保链式调用支持
                        useInlineSourceMaps: false
                    }]
                ],
                sourceMaps: true, // 明确开启 sourcemap 生成
                configFile: false,
                babelrc: false
            });

            if (!result) return null;

            return {
                code: result.code || '',
                map: result.map
            };
        } catch (e) {
            console.warn(`[CoveragePlugin] Transform error for ${id}:`, e);
            return null;
        }
    }

    /**
     * 生成最终覆盖率报告
     * 1. 获取 Git 变更
     * 2. 分析变更影响面
     * 3. 结合运行时覆盖率生成 HTML 报告
     */
    async generateReport() {
        if (!this.options.enabled) return;
        try {
            console.log('[CoveragePlugin] 生成报告...');
            const changedFiles = await this.gitService.getChangedFiles();
            const impact = await this.analysisService.analyzeImpact(changedFiles);
            console.log(`[Report] 受影响页面: ${impact.affectedPages.length} 个`);

            const reportService = new ReportService(this.options.outputDir || '.coverage', this.options);

            await reportService.generate({
                gitService: this.gitService,
                incrementalResult: this.incrementalResult,
                impactResult: impact
            });
        } catch (error) {
            console.error('[CoveragePlugin] 生成报告失败:', error);
        }
    }
}
