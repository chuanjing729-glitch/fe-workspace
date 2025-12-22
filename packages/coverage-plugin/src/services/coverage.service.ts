import { ICoverageService, IGitService } from '../core/interfaces';
import { WebpackCoveragePluginOptions, CoverageMap, CoverageData, IncrementalCoverageResult } from '../core/types';
import * as istanbulDiff from 'istanbul-diff';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 覆盖率服务实现类
 * 负责计算增量覆盖率
 */
export class CoverageService implements ICoverageService {
    private gitService: IGitService;
    private options: WebpackCoveragePluginOptions | undefined;
    private mergedMap: CoverageMap = {}; // v3.0: 持久化合并后的覆盖率数据
    private baselines: Record<string, any> = {}; // v3.0: 存储文件的静态元数据 (statementMap, fnMap, branchMap)

    constructor(gitService: IGitService, options?: WebpackCoveragePluginOptions) {
        this.gitService = gitService;
        this.options = options;
    }

    /**
     * 注册文件基准元数据 (Build-time or first-seen)
     */
    public registerBaseline(filename: string, metadata: any) {
        this.baselines[filename] = metadata;
        if (!this.mergedMap[filename]) {
            this.mergedMap[filename] = {
                path: filename,
                ...metadata,
                s: {},
                f: {},
                b: {}
            };
        }
    }

    /**
     * 合并覆盖率数据 (Merge Logic)
     */
    private mergeCoverage(target: CoverageMap, source: CoverageMap) {
        for (const file in source) {
            if (!target[file]) {
                target[file] = JSON.parse(JSON.stringify(source[file]));
                continue;
            }

            // 归并语句计数
            const targetS = target[file].s;
            const sourceS = source[file].s;
            for (const id in sourceS) {
                if (targetS[id] !== undefined) {
                    targetS[id] = Math.max(targetS[id], sourceS[id]);
                } else {
                    targetS[id] = sourceS[id];
                }
            }
            // 归并函数与分支计数 (同理)
            if (source[file].f) {
                for (const id in source[file].f) {
                    target[file].f[id] = Math.max(target[file].f[id] || 0, source[file].f[id]);
                }
            }
        }
    }

    /**
     * 计算增量覆盖率（路由方法）
     * 根据配置选择使用 istanbul-diff 或传统实现
     * @param coverageMap 运行时收集到的覆盖率数据
     */
    async calculate(coverageMap: CoverageMap): Promise<IncrementalCoverageResult> {
        // 默认使用 istanbul-diff 实现（v3.0+）
        const useIstanbul = this.options?.useIstanbulDiff !== false;

        if (useIstanbul) {
            console.log('[CoverageService] 使用 istanbul-diff 实现');
            return this.calculateWithIstanbulDiff(coverageMap);
        } else {
            console.log('[CoverageService] 使用传统实现');
            return this.calculateLegacy(coverageMap);
        }
    }

    /**
     * 计算增量覆盖率（传统实现）
     * @param coverageMap 运行时收集到的覆盖率数据
     */
    private async calculateLegacy(coverageMap: CoverageMap): Promise<IncrementalCoverageResult> {
        // v3.0: 合并新上报的数据到主 Map 中
        // 支持 "Thin" 协议：如果上报的数据缺失 Map，则从 baselines 中拼装
        const normalizedMap: CoverageMap = {};
        for (const file in coverageMap) {
            const data = coverageMap[file];
            if (!data.statementMap && this.baselines[file]) {
                // 是 Thin Data, 进行拼装
                normalizedMap[file] = {
                    ...this.baselines[file],
                    s: data.s,
                    f: data.f,
                    b: data.b,
                    path: data.path || file
                };
            } else {
                normalizedMap[file] = {
                    ...data,
                    path: data.path || file
                };
                // 如果之前没见过 baseline，现在存一下
                if (data.statementMap && !this.baselines[file]) {
                    this.baselines[file] = {
                        statementMap: data.statementMap,
                        fnMap: data.fnMap,
                        branchMap: data.branchMap
                    };
                }
            }
        }

        this.mergeCoverage(this.mergedMap, normalizedMap);

        const changedFiles = await this.gitService.getChangedFiles();
        const result: IncrementalCoverageResult = {
            overall: {
                totalChangedLines: 0,
                coveredChangedLines: 0,
                coverageRate: 100 // 默认 100%
            },
            files: []
        };

        console.log(`[CoverageService] 开始计算 ${changedFiles.length} 个变更文件的覆盖率 (使用合并数据)`);

        for (const file of changedFiles) {
            // 从合并后的数据中查找
            const coverage = this.findCoverageForFile(this.mergedMap, file);

            if (!coverage) {
                // 如果是源文件但没有覆盖率数据，视为全未覆盖
                if (this.isSourceFile(file)) {
                    const changedLines = await this.gitService.getFileDiff(file);
                    if (changedLines.length > 0) {
                        result.files.push({
                            file,
                            changedLines,
                            uncoveredLines: [...changedLines],
                            coverageRate: 0
                        });
                        result.overall.totalChangedLines += changedLines.length;
                    }
                }
                continue;
            }

            // 获取变更行号
            const changedLines = await this.gitService.getFileDiff(file);

            if (changedLines.length === 0) continue;

            // 计算未覆盖行
            const uncoveredLines = this.getUncoveredLines(coverage, changedLines);
            const coveredCount = changedLines.length - uncoveredLines.length;
            const coverageRate = changedLines.length > 0
                ? Math.round((coveredCount / changedLines.length) * 100)
                : 100;

            result.files.push({
                file,
                changedLines,
                uncoveredLines,
                coverageRate
            });

            result.overall.totalChangedLines += changedLines.length;
            result.overall.coveredChangedLines += coveredCount;
        }

        // 计算整体覆盖率
        if (result.overall.totalChangedLines > 0) {
            result.overall.coverageRate = Math.round(
                (result.overall.coveredChangedLines / result.overall.totalChangedLines) * 100
            );
        }

        return result;
    }

    /**
     * 查找文件对应的覆盖率数据
     */
    private findCoverageForFile(coverageMap: CoverageMap, gitFile: string): CoverageData | undefined {
        if (coverageMap[gitFile]) return coverageMap[gitFile];

        // 模糊匹配: 检查 coverageMap 中的路径是否以此 gitFile 结尾
        // 注意: Windows 下路径分隔符可能不同，需归一化
        const normalizedGitFile = gitFile.replace(/\\/g, '/');

        return Object.values(coverageMap).find(cov => {
            if (!cov || !cov.path) return false;
            const normalizedCovPath = cov.path.replace(/\\/g, '/');
            return normalizedCovPath.endsWith(normalizedGitFile);
        });
    }

    /**
     * 识别变更行中哪些未覆盖
     */
    private getUncoveredLines(coverage: CoverageData, changedLines: number[]): number[] {
        const uncoveredLines: number[] = [];

        for (const line of changedLines) {
            let isLineCovered = false;
            let hasStatement = false;

            // Istanbul statementMap: ID -> Range
            // Istanbul s: ID -> Count
            for (const [id, range] of Object.entries(coverage.statementMap)) {
                if (line >= range.start.line && line <= range.end.line) {
                    hasStatement = true;
                    if (coverage.s[id] > 0) {
                        isLineCovered = true;
                        break;
                    }
                }
            }

            // 如果该行有可执行语句但执行次数为0，则视为未覆盖
            if (hasStatement && !isLineCovered) {
                uncoveredLines.push(line);
            }
        }

        return uncoveredLines;
    }

    private isSourceFile(file: string): boolean {
        // Normalize path
        const normalizedFile = file.replace(/\\/g, '/');

        // Basic extension check
        if (!/\.(js|ts|jsx|tsx|vue)$/.test(normalizedFile)) return false;
        if (normalizedFile.includes('node_modules')) return false;

        // Apply Plugin include/exclude filters (v3.0 fix)
        if (this.options?.include) {
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
                        matched = true;
                        break;
                    }
                }
            }
            if (!matched) return false;
        }

        if (this.options?.exclude) {
            const excludes = Array.isArray(this.options.exclude) ? this.options.exclude : [this.options.exclude];
            for (const p of excludes) {
                if (p instanceof RegExp && p.test(normalizedFile)) return false;
                if (typeof p === 'string') {
                    const normalizedP = p.replace(/\\/g, '/');
                    if (normalizedFile.includes(normalizedP)) return false;
                }
            }
        }

        return true;
    }

    /**
     * 使用 istanbul-diff 计算增量覆盖率（新实现）
     */
    private async calculateWithIstanbulDiff(coverageMap: CoverageMap): Promise<IncrementalCoverageResult> {
        // 1. 规范化和合并数据（复用 calculateLegacy 的逻辑）
        const normalizedMap: CoverageMap = {};
        for (const file in coverageMap) {
            const data = coverageMap[file];
            if (!data.statementMap && this.baselines[file]) {
                normalizedMap[file] = {
                    ...this.baselines[file],
                    s: data.s,
                    f: data.f,
                    b: data.b,
                    path: data.path || file
                };
            } else {
                normalizedMap[file] = {
                    ...data,
                    path: data.path || file
                };
                if (data.statementMap && !this.baselines[file]) {
                    this.baselines[file] = {
                        statementMap: data.statementMap,
                        fnMap: data.fnMap,
                        branchMap: data.branchMap
                    };
                }
            }
        }
        this.mergeCoverage(this.mergedMap, normalizedMap);

        // 2. 转换为 Istanbul 格式
        const currentCoverage = this.toIstanbulFormat(this.mergedMap);

        // 3. 获取 baseline（检查文件是否存在）
        const existingBaseline = this.getIstanbulBaseline();
        const baselineExists = existingBaseline !== null;
        const baselineCoverage = existingBaseline || this.createEmptyIstanbulBaseline();


        // 4. 使用 istanbul-diff 计算差异
        const diff = istanbulDiff.diff(baselineCoverage, currentCoverage, {
            pick: 'lines'
        });

        // 改进日志输出
        if (diff && diff.total) {
            console.log('[CoverageService] Istanbul diff:', JSON.stringify(diff.total, null, 2));
        } else {
            console.log('[CoverageService] Istanbul diff: 无变化（覆盖率数据与 baseline 相同）');
        }

        // 5. 获取 Git 变更并计算（复用传统逻辑）
        const changedFiles = await this.gitService.getChangedFiles();
        const result: IncrementalCoverageResult = {
            overall: { totalChangedLines: 0, coveredChangedLines: 0, coverageRate: 100 },
            files: []
        };

        for (const file of changedFiles) {
            const coverage = this.findCoverageForFile(this.mergedMap, file);
            if (!coverage) {
                if (this.isSourceFile(file)) {
                    const changedLines = await this.gitService.getFileDiff(file);
                    if (changedLines.length > 0) {
                        result.files.push({
                            file,
                            changedLines,
                            uncoveredLines: [...changedLines],
                            coverageRate: 0
                        });
                        result.overall.totalChangedLines += changedLines.length;
                    }
                }
                continue;
            }

            const changedLines = await this.gitService.getFileDiff(file);
            if (changedLines.length === 0) continue;

            const uncoveredLines = this.getUncoveredLines(coverage, changedLines);
            const coveredCount = changedLines.length - uncoveredLines.length;
            const coverageRate = changedLines.length > 0
                ? Math.round((coveredCount / changedLines.length) * 100)
                : 100;

            result.files.push({
                file,
                changedLines,
                uncoveredLines,
                coverageRate
            });

            result.overall.totalChangedLines += changedLines.length;
            result.overall.coveredChangedLines += coveredCount;
        }

        if (result.overall.totalChangedLines > 0) {
            result.overall.coverageRate = Math.round(
                (result.overall.coveredChangedLines / result.overall.totalChangedLines) * 100
            );
        }

        // 只在首次运行时保存 baseline（如果 baseline 文件不存在）
        if (!baselineExists) {
            console.log('[CoverageService] 首次运行，保存 baseline');
            this.saveIstanbulBaseline(currentCoverage);
        }
        // 注意：不要每次都保存 baseline，否则 diff 永远为空
        // 如需更新 baseline，请手动删除 .coverage/istanbul-baseline.json

        return result;
    }

    /**
     * 转换为 Istanbul JSON Summary 格式
     */
    private toIstanbulFormat(coverageMap: CoverageMap): any {
        const result: any = {
            total: {
                lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
                statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
                functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
                branches: { total: 0, covered: 0, skipped: 0, pct: 0 }
            }
        };

        for (const [filePath, coverage] of Object.entries(coverageMap)) {
            if (!coverage) continue;
            const fileMetrics = this.calculateIstanbulFileMetrics(coverage);
            result[filePath] = fileMetrics;

            result.total.lines.total += fileMetrics.lines.total;
            result.total.lines.covered += fileMetrics.lines.covered;
            result.total.statements.total += fileMetrics.statements.total;
            result.total.statements.covered += fileMetrics.statements.covered;
            result.total.functions.total += fileMetrics.functions.total;
            result.total.functions.covered += fileMetrics.functions.covered;
            result.total.branches.total += fileMetrics.branches.total;
            result.total.branches.covered += fileMetrics.branches.covered;
        }

        result.total.lines.pct = result.total.lines.total > 0
            ? (result.total.lines.covered / result.total.lines.total) * 100 : 0;
        result.total.statements.pct = result.total.statements.total > 0
            ? (result.total.statements.covered / result.total.statements.total) * 100 : 0;
        result.total.functions.pct = result.total.functions.total > 0
            ? (result.total.functions.covered / result.total.functions.total) * 100 : 0;
        result.total.branches.pct = result.total.branches.total > 0
            ? (result.total.branches.covered / result.total.branches.total) * 100 : 0;

        return result;
    }

    /**
     * 计算单个文件的 Istanbul 指标
     */
    private calculateIstanbulFileMetrics(coverage: CoverageData): any {
        const lines = {
            total: Object.keys(coverage.statementMap || {}).length,
            covered: 0,
            skipped: 0,
            pct: 0
        };

        for (const [, count] of Object.entries(coverage.s || {})) {
            if (count > 0) lines.covered++;
        }
        lines.pct = lines.total > 0 ? (lines.covered / lines.total) * 100 : 0;

        const statements = { ...lines };

        const functions = {
            total: Object.keys(coverage.fnMap || {}).length,
            covered: 0,
            skipped: 0,
            pct: 0
        };
        for (const [, count] of Object.entries(coverage.f || {})) {
            if (count > 0) functions.covered++;
        }
        functions.pct = functions.total > 0 ? (functions.covered / functions.total) * 100 : 0;

        const branches = {
            total: Object.keys(coverage.branchMap || {}).length * 2,
            covered: 0,
            skipped: 0,
            pct: 0
        };
        for (const [, counts] of Object.entries(coverage.b || {})) {
            if (Array.isArray(counts)) {
                for (const count of counts) {
                    if (count > 0) branches.covered++;
                }
            }
        }
        branches.pct = branches.total > 0 ? (branches.covered / branches.total) * 100 : 0;

        return { lines, statements, functions, branches };
    }

    /**
     * 获取 Istanbul baseline
     */
    private getIstanbulBaseline(): any | null {
        try {
            const outputDir = this.options?.outputDir || '.coverage';
            const baselinePath = path.join(outputDir, 'istanbul-baseline.json');
            if (fs.existsSync(baselinePath)) {
                return JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
            }
        } catch (error) {
            console.warn('[CoverageService] 无法读取 Istanbul baseline:', error);
        }
        return null;
    }

    /**
     * 保存 Istanbul baseline
     */
    private saveIstanbulBaseline(istanbulCoverage: any): void {
        try {
            const outputDir = this.options?.outputDir || '.coverage';
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            const baselinePath = path.join(outputDir, 'istanbul-baseline.json');
            fs.writeFileSync(baselinePath, JSON.stringify(istanbulCoverage, null, 2));
            console.log('[CoverageService] Istanbul baseline 已保存');
        } catch (error) {
            console.error('[CoverageService] 保存 Istanbul baseline 失败:', error);
        }
    }

    /**
     * 创建空的 Istanbul baseline
     */
    private createEmptyIstanbulBaseline(): any {
        return {
            total: {
                lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
                statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
                functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
                branches: { total: 0, covered: 0, skipped: 0, pct: 0 }
            }
        };
    }
}
