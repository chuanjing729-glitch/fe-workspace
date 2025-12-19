import { ICoverageService, IGitService } from '../core/interfaces';
import { WebpackCoveragePluginOptions, CoverageMap, CoverageData, IncrementalCoverageResult } from '../core/types';

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
     * 计算增量覆盖率
     * @param coverageMap 运行时收集到的覆盖率数据
     */
    async calculate(coverageMap: CoverageMap): Promise<IncrementalCoverageResult> {
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
}
