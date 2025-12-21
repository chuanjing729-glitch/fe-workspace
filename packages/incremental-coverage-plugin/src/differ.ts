/**
 * 覆盖率差异计算器
 * 
 * 负责计算增量覆盖率，这是插件的核心模块
 * 
 * 工作流程：
 * 1. 加载 baseline 覆盖率（参考基准）
 * 2. 使用 istanbul-diff 计算差异
 * 3. 结合 Git diff 获取变更的文件和行号
 * 4. 计算每个变更文件的覆盖率
 * 5. 汇总整体覆盖率
 * 6. 保存新的 baseline（可选）
 * 
 * @module differ
 */

import * as istanbulDiff from 'istanbul-diff';
import * as fs from 'fs';
import * as path from 'path';
import type { IncrementalCoverageOptions, CoverageMap, IncrementalCoverageResult } from './types';
import { getGitDiff } from './git';

/**
 * Coverage Differ - 覆盖率差异计算器
 * 
 * 核心职责：
 * 1. 管理 baseline 覆盖率（加载/保存）
 * 2. 使用 istanbul-diff 计算覆盖率差异
 * 3. 结合 Git diff 确定需要检查的代码行
 * 4. 计算增量覆盖率百分比
 * 
 * @example
 * const differ = new CoverageDiffer(options);
 * const result = await differ.calculate(currentCoverage);
 */
export class CoverageDiffer {
    constructor(private options: IncrementalCoverageOptions) { }

    /**
     * 计算增量覆盖率
     * 
     * 这是最核心的方法，完整的计算流程：
     * 
     * 1. 加载 baseline（如果存在）
     * 2. 使用 istanbul-diff 计算差异
     * 3. 获取 Git 变更的文件和行号
     * 4. 对每个变更文件：
     *    a. 获取该文件的覆盖率数据
     *    b. 找出变更的行号
     *    c. 检查这些行是否被覆盖
     *    d. 计算覆盖率百分比
     * 5. 汇总所有文件的覆盖率
     * 6. 保存新的 baseline（如果需要）
     * 
     * @param currentCoverage - 当前的覆盖率数据
     * @returns 增量覆盖率计算结果
     * 
     * @example
     * const result = await differ.calculate(coverageMap);
     * console.log(`Overall coverage: ${result.overall.coverageRate}%`);
     */
    async calculate(currentCoverage: CoverageMap): Promise<IncrementalCoverageResult> {
        console.log('[CoverageDiffer] 开始计算增量覆盖率...');

        // 1. 加载 baseline 覆盖率
        // baseline 是参考基准，通常是上一次的覆盖率或主分支的覆盖率
        const baseline = this.loadBaseline();

        // 2. 使用 istanbul-diff 计算差异
        // istanbul-diff 会比较 baseline 和当前覆盖率，找出变化
        // pick: 'lines' 表示只关注行覆盖率
        const diff = istanbulDiff.diff(baseline || {}, currentCoverage, {
            pick: 'lines',
        });

        console.log('[CoverageDiffer] Istanbul diff 结果:', diff.total);

        // 3. 获取 Git diff（变更的文件和行号）
        // 这一步很关键：我们只关心 Git 中变更的代码，而不是所有代码
        const gitDiff = await getGitDiff(this.options.gitDiffBase || 'main');

        // 4. 初始化结果对象
        const result: IncrementalCoverageResult = {
            overall: {
                totalLines: 0,        // 总变更行数
                coveredLines: 0,      // 已覆盖的变更行数
                coverageRate: 100,    // 覆盖率百分比（默认 100%）
            },
            files: [],              // 每个文件的详细信息
            changedFiles: gitDiff.files,  // 变更的文件列表
            timestamp: Date.now(),  // 时间戳
        };

        // 5. 处理每个变更的文件
        let validFileCount = 0;
        console.log('[CoverageDiffer] 待处理变更文件数:', gitDiff.files.length);
        console.log('[CoverageDiffer] 当前覆盖率数据中的文件(前5个):', Object.keys(currentCoverage).slice(0, 5));

        for (const file of gitDiff.files) {
            // 过滤非源码文件
            const isValid = this.isValidSourceFile(file);
            if (!isValid) {
                // console.log(`[CoverageDiffer] 过滤掉文件: ${file}`);
                continue;
            }

            console.log(`[CoverageDiffer] 处理源码文件: ${file}`);
            validFileCount++;
            const coverage = currentCoverage[file];

            if (!coverage) {
                // 情况 1：文件没有覆盖率数据
                // 可能原因：
                // - 文件被 exclude 排除了
                // - 文件没有被执行过
                // - 文件是新增的但还没有测试
                const changedLines = gitDiff.additions[file] || [];
                if (changedLines.length > 0) {
                    result.files.push({
                        file,
                        changedLines,
                        uncoveredLines: changedLines,  // 所有行都未覆盖
                        coverageRate: 0,               // 覆盖率 0%
                    });
                    result.overall.totalLines += changedLines.length;
                }
                continue;
            }

            // 情况 2：文件有覆盖率数据
            // 计算变更行的覆盖情况
            const changedLines = gitDiff.additions[file] || [];

            // 找出哪些变更的行没有被覆盖
            const uncoveredLines = this.getUncoveredLines(coverage, changedLines);

            // 计算覆盖的行数
            const coveredCount = changedLines.length - uncoveredLines.length;

            // 计算覆盖率百分比
            const coverageRate = changedLines.length > 0
                ? Math.round((coveredCount / changedLines.length) * 100)
                : 100;  // 如果没有变更行，默认 100%

            // 添加到结果中
            result.files.push({
                file,
                changedLines,
                uncoveredLines,
                coverageRate,
            });

            // 累加到整体统计
            result.overall.totalLines += changedLines.length;
            result.overall.coveredLines += coveredCount;
        }

        // 6. 计算整体覆盖率
        if (result.overall.totalLines > 0) {
            result.overall.coverageRate = Math.round(
                (result.overall.coveredLines / result.overall.totalLines) * 100
            );
        }

        console.log(`[CoverageDiffer] 计算完成: ${validFileCount} 个有效文件, ${result.overall.totalLines} 行代码, 报告率 ${result.overall.coverageRate}%`);

        // 7. 保存 baseline（如果需要）
        // 只在首次运行时保存，避免每次都更新 baseline
        if (this.options.autoSaveBaseline && !baseline) {
            console.log('[CoverageDiffer] 保存 baseline...');
            this.saveBaseline(currentCoverage);
        }

        return result;
    }

    /**
     * 从文件加载 baseline 覆盖率
     * 
     * Baseline 是参考基准，用于对比当前覆盖率的变化
     * 通常在首次运行时创建，之后保持不变（除非手动更新）
     * 
     * @returns baseline 覆盖率数据，如果文件不存在则返回 null
     * @private
     */
    private loadBaseline(): CoverageMap | null {
        try {
            const baselinePath = this.options.baselinePath || '.coverage/baseline.json';
            if (fs.existsSync(baselinePath)) {
                return JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
            }
        } catch (error) {
            console.warn('[CoverageDiffer] 加载 baseline 失败:', error);
        }
        return null;
    }

    /**
     * 保存 baseline 覆盖率到文件
     * 
     * 将当前的覆盖率数据保存为 baseline，供后续对比使用
     * 
     * 注意：
     * - 会自动创建目录（如果不存在）
     * - 使用 JSON 格式，便于查看和调试
     * - 格式化输出（2 空格缩进）
     * 
     * @param coverage - 要保存的覆盖率数据
     * @private
     */
    private saveBaseline(coverage: CoverageMap): void {
        try {
            const baselinePath = this.options.baselinePath || '.coverage/baseline.json';
            const dir = path.dirname(baselinePath);

            // 确保目录存在
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // 保存为格式化的 JSON
            fs.writeFileSync(baselinePath, JSON.stringify(coverage, null, 2));
            console.log('[CoverageDiffer] Baseline 已保存');
        } catch (error) {
            console.error('[CoverageDiffer] 保存 baseline 失败:', error);
        }
    }

    /**
     * 获取未覆盖的行号列表
     * 
     * 算法说明：
     * 1. 遍历每一个变更的行号
     * 2. 检查是否有语句（statement）覆盖这一行
     * 3. 如果有语句覆盖且执行次数 > 0，则该行被覆盖
     * 4. 否则，该行未被覆盖
     * 
     * 为什么检查 statementMap？
     * - Istanbul 的覆盖率是基于语句（statement）的
     * - statementMap 记录了每个语句的位置（起始行、结束行）
     * - 通过检查语句的位置，可以知道某一行是否被覆盖
     * 
     * 为什么检查执行次数？
     * - coverage.s[stmtId] 记录了语句的执行次数
     * - 如果执行次数 > 0，说明这个语句被执行过
     * - 如果执行次数 = 0，说明这个语句没有被执行
     * 
     * @param coverage - 文件的覆盖率数据
     * @param changedLines - 变更的行号列表
     * @returns 未覆盖的行号列表
     * 
     * @example
     * const uncovered = this.getUncoveredLines(coverage, [10, 11, 12]);
     * // 返回: [11] （假设第 11 行没有被覆盖）
     * 
     * @private
     */
    private getUncoveredLines(coverage: any, changedLines: number[]): number[] {
        const uncovered: number[] = [];

        // 遍历每一个变更的行
        for (const line of changedLines) {
            let isCovered = false;

            // 检查是否有语句覆盖这一行
            // statementMap 的格式：{ '0': { start: { line: 1 }, end: { line: 3 } } }
            for (const [stmtId, loc] of Object.entries(coverage.statementMap || {})) {
                const location = loc as any;

                // 检查这个语句是否包含当前行
                // 例如：语句从第 1 行到第 3 行，那么第 2 行也被这个语句覆盖
                if (location.start.line <= line && location.end.line >= line) {
                    // 检查这个语句是否被执行过
                    if (coverage.s[stmtId] > 0) {
                        isCovered = true;
                        break;  // 找到一个覆盖的语句就够了
                    }
                }
            }

            // 如果没有找到覆盖的语句，记录为未覆盖
            if (!isCovered) {
                uncovered.push(line);
            }
        }

        return uncovered;
    }
    /**
     * 判断是否为有效的源码文件
     * 用于过滤 node_modules, lockfiles 和非源码文件
     * @private
     */
    private isValidSourceFile(file: string): boolean {
        // 1. 排除 node_modules 和基础配置文件
        if (file.includes('node_modules')) return false;
        if (file.includes('package.json') || file.includes('pnpm-lock.yaml') || file.includes('yarn.lock')) return false;
        if (file.endsWith('.d.ts')) return false;

        // 2. 检查扩展名
        const ext = path.extname(file).toLowerCase();
        if (!ext) return false;
        const validExts = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.css', '.scss', '.less'];
        if (!validExts.includes(ext)) return false;

        // 3. 获取项目相对路径
        const projectRoot = process.cwd();
        const relativePath = path.isAbsolute(file)
            ? path.relative(projectRoot, file)
            : file;

        // 如果路径包含 ".."，说明在项目目录之外，排除
        if (relativePath.startsWith('..')) return false;

        // 4. 应用 include/exclude 配置
        const { include, exclude } = this.options;

        // 简单匹配函数：支持简单的通配符 * 和 **
        const isMatch = (pattern: string, target: string) => {
            if (!pattern) return false;
            // 简单处理：将 ** 替换为 .*，将 * 替换为 [^/]*
            const regexStr = pattern
                .replace(/[.+^${}()|[\]\\]/g, '\\$&') // 转义正则特有字符
                .replace(/\\\*\\\*/g, '.*')           // 处理 **
                .replace(/\\\*/g, '[^/]*');            // 处理 *
            const regex = new RegExp(`^${regexStr}$|^${regexStr}/.*`);
            return regex.test(target);
        };

        // Exclude 优先
        if (exclude) {
            const excludes = Array.isArray(exclude) ? exclude : [exclude];
            for (const pattern of excludes) {
                if (isMatch(pattern, relativePath)) {
                    console.log(`[CoverageDiffer] Excluded: ${relativePath} (matched ${pattern})`);
                    return false;
                }
            }
        }

        // Include 过滤
        if (include) {
            const includes = Array.isArray(include) ? include : [include];
            let matched = false;
            for (const pattern of includes) {
                if (isMatch(pattern, relativePath)) {
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                // console.log(`[CoverageDiffer] Not included: ${relativePath}`);
                return false;
            }
        }

        return true;
    }
}
