import { Compiler } from 'webpack';
import * as path from 'path';
import { WebpackCoveragePluginOptions } from './core/types';
import { GitService } from './services/git.service';
import { CoverageService } from './services/coverage.service';
import { AnalysisService } from './services/analysis.service';
import { ApiService } from './services/api.service';
import { HttpServer } from './infra/http.server';
import { FileStorage } from './infra/storage';
import { ReportService } from './services/report.service';

/**
 * WebpackCoveragePlugin (V2.0 Core Refactor)
 * 采用 Clean Architecture 架构
 * 作为 Composition Root 负责组装各个服务
 */
export class WebpackCoveragePlugin {
  private options: WebpackCoveragePluginOptions;

  // Services
  private gitService: GitService;
  private coverageService: CoverageService;
  private analysisService: AnalysisService;
  private apiService: ApiService;
  private httpServer: HttpServer;
  private storage: FileStorage;
  private incrementalResult: any; // Added to satisfy the new generateReport method's usage

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

    // 1. 初始化基础设施
    this.storage = new FileStorage(path.resolve(process.cwd(), '.cache'), 'coverage-plugin');

    // 2. 初始化核心服务 (Dependency Injection)
    this.gitService = new GitService(process.cwd());
    this.coverageService = new CoverageService(this.gitService);
    this.analysisService = new AnalysisService(process.cwd(), this.storage);
    // TODO: 后续可从 options 获取真实 token
    this.apiService = new ApiService('', '', '');

    // 3. 初始化 HTTP 服务
    this.httpServer = new HttpServer(this.coverageService);

    // 默认排除
    if (!this.options.exclude) {
      this.options.exclude = [/node_modules/, /\.test\./, /\.spec\./] as unknown as RegExp | string[];
    }
  }

  apply(compiler: Compiler) {
    if (!this.options.enabled) return;

    // Hook: 编译开始
    compiler.hooks.compile.tap('WebpackCoveragePlugin', () => {
      console.log('[WebpackCoveragePlugin] 开始编译...');
      if (this.options.enableImpactAnalysis) {
        // 异步初始化依赖图谱 (不阻塞主线程)
        this.analysisService.initDependencyGraph().catch(console.error);
      }
    });

    // Hook: 模块工厂 (插桩逻辑)
    compiler.hooks.normalModuleFactory.tap('WebpackCoveragePlugin', (nmf) => {
      nmf.hooks.createModule.tap('WebpackCoveragePlugin', (createData: any) => {
        if (!createData.resource) return;
        if (this.shouldInstrument(createData.resource)) {
          this.injectBabelLoader(createData);
        }
      });
    });

    // Hook: DevServer 集成
    if (compiler.options.devServer) {
      const originalBefore = compiler.options.devServer.before;
      compiler.options.devServer.before = (app: any, server: any, compilerInstance: any) => {
        if (originalBefore) originalBefore(app, server, compilerInstance);
        this.httpServer.attach(app);
      };
    } else {
      // Webpack 5+ DevServer configuration might use `onBeforeSetupMiddleware` or `setupMiddlewares`
      // 兼容新版 Webpack Dev Server
      const devServer = compiler.options.devServer || {};
      const originalOnBeforeSetupMiddleware = (devServer as any).onBeforeSetupMiddleware;
      (devServer as any).onBeforeSetupMiddleware = (devServerObj: any) => {
        if (originalOnBeforeSetupMiddleware) originalOnBeforeSetupMiddleware(devServerObj);
        if (devServerObj.app) this.httpServer.attach(devServerObj.app);
      };
    }

    // Hook: 编译完成
    compiler.hooks.done.tapPromise('WebpackCoveragePlugin', async (stats) => {
      console.log('[WebpackCoveragePlugin] 编译完成，正在生成自测报告...');
      await this.generateReport();
    });
  }

  /**
   * 生成最终报告
   */
  private async generateReport() {
    try {
      // 1. 获取 Git 信息
      // const gitInfo = await this.gitService.getGitInfo();
      const changedFiles = await this.gitService.getChangedFiles();

      // 2. 分析影响面
      const impact = await this.analysisService.analyzeImpact(changedFiles);
      console.log(`[Report] 受影响页面: ${impact.affectedPages.length} 个`);

      // 3. 生成报告
      const reportService = new ReportService(this.options.outputDir || '.coverage', this.options);
      
      await reportService.generate({
        gitService: this.gitService,
        incrementalResult: this.incrementalResult, // 注意：这里如果在 done 钩子前没有触发 upload，可能是 null
        impactResult: impact
      });

    } catch (error) {
      console.error('[WebpackCoveragePlugin] 生成报告失败:', error);
    }
  }

  /**
   * 注入 Babel Socket
   */
  private injectBabelLoader(createData: any) {
    const loaders = createData.loaders || [];
    const hasBabelLoader = loaders.some((l: any) => l.loader && l.loader.includes('babel-loader'));

    // 简易插桩逻辑
    if (!hasBabelLoader || true) { // 强制注入
      loaders.unshift({
        loader: require.resolve('babel-loader'),
        options: {
          plugins: [[require.resolve('babel-plugin-istanbul'), {
            exclude: this.options.exclude
          }]]
        }
      });
      createData.loaders = loaders;
    }
  }

  private shouldInstrument(file: string): boolean {
    if (file.includes('node_modules')) return false;

    // Exclude check
    if (this.options.exclude) {
      const excludes = Array.isArray(this.options.exclude) ? this.options.exclude : [this.options.exclude];
      for (const p of excludes) {
        if (p instanceof RegExp && p.test(file)) return false;
        if (typeof p === 'string' && file.includes(p)) return false;
      }
    }

    return /\.(js|ts|jsx|tsx|vue)$/.test(file);
  }
}

export default WebpackCoveragePlugin;
