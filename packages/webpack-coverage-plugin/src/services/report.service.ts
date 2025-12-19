import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
    IGitService,
    ICoverageService,
    IAnalysisService
} from '../core/interfaces';
import { ReportData, WebpackCoveragePluginOptions } from '../core/types';
import { HtmlRenderer } from '../infra/report/html.renderer';

/**
 * 报告生成服务
 * 负责聚合数据并调用 Renderer 生成报告
 */
export class ReportService {
    private outputDir: string;
    private options: WebpackCoveragePluginOptions;
    private htmlRenderer: HtmlRenderer;

    constructor(outputDir: string, options: WebpackCoveragePluginOptions) {
        this.outputDir = outputDir;
        this.options = options;
        this.htmlRenderer = new HtmlRenderer();
        this.ensureDirectoryExists(outputDir);
    }

    private ensureDirectoryExists(dir: string): void {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    public async generate(data: {
        gitService: IGitService;
        incrementalResult: any; // IncrementalCoverageResult
        impactResult: any;      // ImpactAnalysisResult
    }): Promise<void> {

        // 1. 聚合数据
        const reportData = await this.buildReportData(data);

        // 2. 生成 HTML 报告
        const htmlContent = this.htmlRenderer.render(reportData);
        const htmlPath = path.join(this.outputDir, 'smart-test-report.html');
        fs.writeFileSync(htmlPath, htmlContent);

        console.log(`[ReportService] 报告已生成: ${htmlPath}`);

        // TODO: 生成 Markdown 报告 (后续)
    }

    private async buildReportData(data: {
        gitService: IGitService;
        incrementalResult: any;
        impactResult: any;
    }): Promise<ReportData> {
        const gitInfo = await data.gitService.getGitInfo();
        const cov = data.incrementalResult?.overall || { coverageRate: 0, totalChangedLines: 0, coveredChangedLines: 0 };
        const qualityGate = this.evaluateQualityGate(cov.coverageRate, data.impactResult?.affectedPages?.length || 0);

        return {
            timestamp: new Date().toLocaleString(),
            environment: {
                nodeVersion: process.version,
                os: process.platform,
                gitName: gitInfo.name,
                gitEmail: gitInfo.email,
                gitBranch: gitInfo.branch,
                gitHash: gitInfo.hash,
                hardware: {
                    cpu: os.cpus()[0]?.model || 'Unknown',
                    memory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`
                }
            },
            coverage: {
                overallRate: cov.coverageRate,
                totalLines: cov.totalChangedLines,
                coveredLines: cov.coveredChangedLines,
                uncoveredFiles: data.incrementalResult?.files
                    .filter((f: any) => f.coverageRate < 100)
                    .map((f: any) => ({
                        file: f.file,
                        rate: f.coverageRate,
                        uncoveredLines: f.uncoveredLines
                    })) || []
            },
            impact: {
                level: data.impactResult?.impactLevel || 'low',
                affectedPages: data.impactResult?.affectedPages || [],
                affectedComponents: data.impactResult?.affectedComponents || [],
                propagationPaths: data.impactResult?.propagationPaths || []
            },
            qualityGate,
            business: [] // 暂时留空，后续可接入业务映射
        };
    }

    private evaluateQualityGate(coverageRate: number, impactCount: number) {
        const gates = [
            {
                metric: 'Incremental Coverage',
                value: `${coverageRate}%`,
                threshold: `${this.options.qualityGate?.lineCoverageThreshold || 80}%`,
                status: coverageRate >= (this.options.qualityGate?.lineCoverageThreshold || 80) ? 'pass' : 'fail' as 'pass' | 'fail'
            }
            // 可以添加更多门禁规则
        ];

        return {
            passed: gates.every(g => g.status === 'pass'),
            gates
        };
    }
}
