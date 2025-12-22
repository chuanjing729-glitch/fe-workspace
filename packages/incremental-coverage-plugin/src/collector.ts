/**
 * 覆盖率收集器
 * 
 * 负责接收和合并来自浏览器的覆盖率数据
 * 维护全局的覆盖率状态，支持多次上报的数据累加
 * 
 * @module collector
 */

import * as path from 'path';
import type { CoverageMap, CoverageData } from './types';

/**
 * Coverage Collector - 覆盖率收集器
 * 
 * 核心职责：
 * 1. 接收浏览器上报的覆盖率数据
 * 2. 合并多次上报的数据（累加执行次数）
 * 3. 维护全局覆盖率状态
 * 
 * @example
 * const collector = new CoverageCollector();
 * const merged = collector.merge(newCoverageData);
 */
export class CoverageCollector {
    /**
     * 全局覆盖率映射表
     * 
     * 键是文件路径，值是该文件的覆盖率数据
     * 这个对象会随着数据上报不断更新
     */
    private coverageMap: CoverageMap = {};

    /**
     * 合并新的覆盖率数据
     * 
     * 算法说明：
     * 1. 遍历新数据中的每个文件
     * 2. 如果是首次出现的文件，直接存储
     * 3. 如果文件已存在，合并执行次数（累加）
     * 
     * 为什么要累加？
     * - 用户可能多次执行同一段代码
     * - 需要记录总的执行次数，而不是覆盖
     * 
     * @param newCoverage - 新上报的覆盖率数据
     * @returns 合并后的完整覆盖率数据
     * 
     * @example
     * // 第一次上报
     * collector.merge({ 'src/utils.ts': { s: { '0': 1 } } });
     * // 第二次上报（同一文件）
     * collector.merge({ 'src/utils.ts': { s: { '0': 2 } } });
     * // 结果：s['0'] = 3（累加）
     */
    merge(newCoverage: CoverageMap): CoverageMap {
        const projectRoot = process.cwd();
        // 遍历新数据的每个文件
        for (const [key, data] of Object.entries(newCoverage)) {
            // 归一化路径，确保绝对路径/相对路径都能匹配
            const filePath = path.isAbsolute(key) ? key : path.resolve(projectRoot, key);

            if (!this.coverageMap[filePath]) {
                // 首次出现的文件，直接存储
                this.coverageMap[filePath] = data;
            } else {
                // 已存在的文件，合并数据
                this.coverageMap[filePath] = this.mergeCoverageData(
                    this.coverageMap[filePath],
                    data
                );
            }
        }

        // 返回合并后的完整数据
        return this.coverageMap;
    }

    /**
     * 获取当前的覆盖率数据
     * 
     * @returns 当前的完整覆盖率映射表
     */
    getCoverage(): CoverageMap {
        return this.coverageMap;
    }

    /**
     * 重置覆盖率数据
     * 
     * 清空所有已收集的数据，重新开始
     * 通常在需要重新计算覆盖率时使用
     */
    reset(): void {
        this.coverageMap = {};
    }

    /**
     * 合并两个覆盖率数据对象
     * 
     * 合并策略：
     * 1. 语句覆盖（s）：执行次数累加
     * 2. 函数覆盖（f）：执行次数累加
     * 3. 分支覆盖（b）：数组元素逐个累加
     * 
     * 注意：
     * - statementMap、fnMap、branchMap 不需要合并（它们是静态的位置信息）
     * - 只有执行次数（s、f、b）需要累加
     * 
     * @param existing - 已存在的覆盖率数据
     * @param newData - 新的覆盖率数据
     * @returns 合并后的覆盖率数据
     * 
     * @private
     */
    private mergeCoverageData(existing: CoverageData, newData: CoverageData): CoverageData {
        // 创建合并后的数据对象
        const merged: CoverageData = {
            path: existing.path,
            // 位置映射表保持不变（它们是静态的）
            statementMap: existing.statementMap,
            fnMap: existing.fnMap,
            branchMap: existing.branchMap,
            // 执行次数需要累加
            s: { ...existing.s },
            f: { ...existing.f },
            b: { ...existing.b },
        };

        // 合并语句执行次数
        // 例如：existing.s['0'] = 5, newData.s['0'] = 3
        // 结果：merged.s['0'] = 8
        for (const [key, count] of Object.entries(newData.s)) {
            merged.s[key] = (merged.s[key] || 0) + count;
        }

        // 合并函数执行次数
        // 逻辑同上
        for (const [key, count] of Object.entries(newData.f)) {
            merged.f[key] = (merged.f[key] || 0) + count;
        }

        // 合并分支执行次数
        // 分支是数组，需要逐个元素累加
        // 例如：existing.b['0'] = [2, 1], newData.b['0'] = [1, 2]
        // 结果：merged.b['0'] = [3, 3]
        for (const [key, counts] of Object.entries(newData.b)) {
            if (!merged.b[key]) {
                // 如果原数据中没有这个分支，直接使用新数据
                merged.b[key] = counts;
            } else {
                // 如果原数据中有这个分支，逐个元素累加
                merged.b[key] = counts.map((count, i) => (merged.b[key][i] || 0) + count);
            }
        }

        return merged;
    }
}
