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

        // 2. 生成带时间戳和序号的报告文件名（使用本地时间）
        const timestamp = this.getTimestamp();
        const sequence = this.getNextSequenceNumber();
        const filename = `coverage-report-${timestamp}-${sequence.toString().padStart(3, '0')}.html`;

        // 3. 生成 HTML 报告
        const htmlContent = this.htmlRenderer.render(reportData);
        const htmlPath = path.join(this.outputDir, filename);
        fs.writeFileSync(htmlPath, htmlContent);

        // 4. 同时生成一个 latest.html 作为最新报告的快捷访问
        const latestPath = path.join(this.outputDir, 'latest.html');
        fs.writeFileSync(latestPath, htmlContent);

        console.log(`[ReportService] 报告已生成: ${filename}`);

        // 5. 清理旧报告（保留最近10个）
        this.cleanOldReports(10);

        // TODO: 生成 Markdown 报告 (后续)
    }

    /**
     * 获取本地时间戳字符串
     */
    private getTimestamp(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}-${hour}-${minute}-${second}`;
    }

    /**
     * 获取下一个序号（基于当前目录中已有的报告数量）
     */
    private getNextSequenceNumber(): number {
        try {
            const files = fs.readdirSync(this.outputDir);
            const reportFiles = files.filter(f => f.startsWith('coverage-report-') && f.endsWith('.html'));
            return reportFiles.length + 1;
        } catch {
            return 1;
        }
    }

    /**
     * 清理旧报告，保留最近的 N 个
     */
    private cleanOldReports(keepCount: number = 10) {
        try {
            const files = fs.readdirSync(this.outputDir)
                .filter(f => f.startsWith('coverage-report-') && f.endsWith('.html'))
                .map(f => ({
                    name: f,
                    path: path.join(this.outputDir, f),
                    time: fs.statSync(path.join(this.outputDir, f)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time); // 最新的在前

            // 删除超出保留数量的旧报告
            files.slice(keepCount).forEach(file => {
                fs.unlinkSync(file.path);
                console.log(`[ReportService] 清理旧报告: ${file.name}`);
            });
        } catch (error) {
            console.warn('[ReportService] 清理旧报告失败:', error);
        }
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
