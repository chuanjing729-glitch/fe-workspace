import express from 'express';
import { ICoverageService } from '../core/interfaces';
import { IncrementalCoverageResult, CoverageMap } from '../core/types';
import { UiGenerator } from './ui.generator';

/**
 * 嵌入式 HTTP 服务器 (Universal Version)
 * 支持 Express (Webpack) 和 Connect (Vite)
 */
export class HttpServer {
    private coverageService: ICoverageService;
    private latestResult: IncrementalCoverageResult | null = null;

    constructor(coverageService: ICoverageService) {
        this.coverageService = coverageService;
    }

    /**
     * 安装中间件到服务器 (支持 Webpack DevServer 和 Vite DevServer)
     */
    public install(server: any): void {
        console.log('[HttpServer] Installing middleware...');

        // 解析 Body (Vite 的 connect 不自带 body parser)
        // Express.json() 返回兼容 connect 的中间件
        server.use('/__coverage_upload', express.json({ limit: '50mb' }));

        const isExpress = typeof server.get === 'function';

        if (isExpress) {
            this.registerExpressRoutes(server);
        } else {
            this.registerConnectRoutes(server);
        }
    }

    private registerExpressRoutes(app: any) {
        app.post('/__coverage_upload', this.handleUpload.bind(this));
        app.get('/__coverage_info', this.handleInfo.bind(this));
        app.get('/__coverage_overlay.css', this.handleCss.bind(this));
        app.get('/__coverage_overlay.js', this.handleJs.bind(this));
    }

    private registerConnectRoutes(server: any) {
        // Connect 只支持 .use(route, handler)

        server.use('/__coverage_upload', (req: any, res: any, next: any) => {
            if (req.method === 'POST') {
                this.handleUpload(req, res);
            } else {
                next();
            }
        });

        server.use('/__coverage_info', (req: any, res: any, next: any) => {
            if (req.method === 'GET') {
                this.handleInfo(req, res);
            } else {
                next();
            }
        });

        server.use('/__coverage_overlay.css', (req: any, res: any, next: any) => {
            if (req.method === 'GET') {
                this.handleCss(req, res);
            } else { next(); }
        });

        server.use('/__coverage_overlay.js', (req: any, res: any, next: any) => {
            if (req.method === 'GET') {
                this.handleJs(req, res);
            } else { next(); }
        });
    }

    // --- Handlers ---

    private async handleUpload(req: any, res: any) {
        const sendJson = (data: any) => {
            if (res.json) res.json(data);
            else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
            }
        };

        const coverageData = req.body;
        if (coverageData) {
            this.coverageService.calculate(coverageData).then(r => {
                this.latestResult = r;
                console.log(`[HttpServer] 增量覆盖率更新: ${r.overall.coverageRate}%`);
            }).catch(e => console.error('[HttpServer] 计算失败:', e));
        }
        sendJson({ success: true });
    }

    private handleInfo(req: any, res: any) {
        const sendJson = (data: any) => {
            if (res.json) res.json(data);
            else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
            }
        };

        if (this.latestResult) {
            sendJson({
                success: true,
                data: {
                    coverageRate: this.latestResult.overall.coverageRate,
                    coveredLines: this.latestResult.overall.coveredChangedLines,
                    totalLines: this.latestResult.overall.totalChangedLines,
                    uncoveredFiles: this.latestResult.files.filter(f => f.coverageRate < 100).map(f => ({
                        file: f.file,
                        rate: f.coverageRate,
                        uncoveredLines: f.uncoveredLines
                    }))
                }
            });
        } else {
            sendJson({ success: false, message: 'Wait for data...' });
        }
    }

    private handleCss(req: any, res: any) {
        res.setHeader('Content-Type', 'text/css');
        res.end(UiGenerator.generateOverlayCss());
    }

    private handleJs(req: any, res: any) {
        res.setHeader('Content-Type', 'application/javascript');
        res.end(UiGenerator.generateOverlayJs());
    }

    // Deprecated alias for backward compatibility (in case used elsewhere)
    public attach(app: any): void {
        this.install(app);
    }
}
