import express, { Application, Request, Response } from 'express';
import { ICoverageService } from '../core/interfaces';
import { IncrementalCoverageResult, CoverageMap } from '../core/types';
import { UiGenerator } from './ui.generator';

/**
 * 嵌入式 HTTP 服务器
 * 负责接收浏览器端的覆盖率数据，并提供查询接口
 */
export class HttpServer {
    private app: Application | null = null;
    private coverageService: ICoverageService;
    private latestResult: IncrementalCoverageResult | null = null;

    constructor(coverageService: ICoverageService) {
        this.coverageService = coverageService;
    }

    /**
     * 将中间件挂载到 Webpack Dev Server 的 App 实例上
     */
    public attach(app: Application): void {
        console.log('[HttpServer] 挂载中间件到 DevServer');
        this.app = app;
        this.registerRoutes();
    }

    /**
     * 注册路由
     */
    private registerRoutes(): void {
        if (!this.app) return;

        // 1. 覆盖率上报接口
        this.app.post('/__coverage_upload', express.json({ limit: '50mb' }), async (req: Request, res: Response) => {
            const coverageData = req.body as CoverageMap;
            if (coverageData) {
                // 触发异步计算，不阻塞请求
                this.coverageService.calculate(coverageData)
                    .then(result => {
                        this.latestResult = result;
                        console.log(`[HttpServer] 增量覆盖率更新: ${result.overall.coverageRate}%`);
                    })
                    .catch(err => {
                        console.error('[HttpServer] 计算失败:', err);
                    });
            }
            res.json({ success: true });
        });

        // 2. 覆盖率查询接口
        this.app.get('/__coverage_info', (req: Request, res: Response) => {
            if (this.latestResult) {
                res.json({
                    success: true,
                    data: {
                        coverageRate: this.latestResult.overall.coverageRate,
                        coveredLines: this.latestResult.overall.coveredChangedLines,
                        totalLines: this.latestResult.overall.totalChangedLines,
                        uncoveredFiles: this.latestResult.files
                            .filter(f => f.coverageRate < 100)
                            .map(f => ({
                                file: f.file,
                                rate: f.coverageRate,
                                uncoveredLines: f.uncoveredLines
                            }))
                    }
                });
            } else {
                res.json({ success: false, message: 'Wait for data...' });
            }
        });

        // 3. 静态资源接口
        this.app.get('/__coverage_overlay.css', (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'text/css');
            res.send(UiGenerator.generateOverlayCss());
        });

        this.app.get('/__coverage_overlay.js', (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/javascript');
            res.send(UiGenerator.generateOverlayJs());
        });
    }
}
