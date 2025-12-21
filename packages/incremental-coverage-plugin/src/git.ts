/**
 * Git 服务模块
 * 
 * 负责与 Git 交互，获取代码变更信息
 * 
 * 核心功能：
 * 1. 获取变更的文件列表
 * 2. 解析 Git diff 输出
 * 3. 提取新增和删除的行号
 * 
 * @module git
 */

import simpleGit from 'simple-git';
import * as path from 'path';
import type { GitDiffResult } from './types';

// 初始化 simple-git 实例
// 我们先创建一个基础实例，用于寻找 Git 根目录
const baseGit = simpleGit();

/**
 * 获取 Git 根目录
 */
async function getGitRoot(): Promise<string> {
    try {
        const topLevel = await baseGit.revparse(['--show-toplevel']);
        return topLevel.trim();
    } catch (e) {
        return process.cwd();
    }
}

/**
 * 获取 Git diff 信息
 * 
 * 对比当前分支（HEAD）与指定基准分支的差异
 * 返回变更的文件列表和具体的行号信息
 * 
 * 工作流程：
 * 1. 使用 git.diffSummary() 获取变更文件列表
 * 2. 对每个文件使用 git.diff() 获取详细差异
 * 3. 解析 diff 输出，提取行号
 * 
 * @param base - 对比的基准分支（例如：'main', 'develop'）
 * @returns Git diff 结果，包含文件列表和行号信息
 * 
 * @example
 * const diff = await getGitDiff('main');
 * console.log('Changed files:', diff.files);
 * console.log('Added lines in file.ts:', diff.additions['file.ts']);
 */
export async function getGitDiff(base: string = 'main'): Promise<GitDiffResult> {
    try {
        // 获取 Git 根目录
        const topLevel = await getGitRoot();
        // 创建在该 root 下运行的实例
        const git = simpleGit(topLevel);

        // 1. 获取 diff 摘要
        // 注意：不传第二个参数表示对比工作区
        const diffSummary = await git.diffSummary([base]);

        // 初始化结果对象
        const result: GitDiffResult = {
            files: [],        // 变更的文件列表
            additions: {},    // 每个文件新增的行号
            deletions: {},    // 每个文件删除的行号
        };

        // 2. 遍历变更的文件
        for (const fileSummary of diffSummary.files) {
            const relativeFile = fileSummary.file;
            const absoluteFile = path.resolve(topLevel, relativeFile);

            // 记录绝对路径
            result.files.push(absoluteFile);

            // 获取该文件的详细 diff
            const diff = await git.diff([base, '--', relativeFile]);

            // 解析 diff 输出，提取行号
            const { additions, deletions } = parseDiff(diff);

            // 记录行号信息
            if (additions.length > 0) {
                result.additions[absoluteFile] = additions;
            }
            if (deletions.length > 0) {
                result.deletions[absoluteFile] = deletions;
            }
        }

        return result;
    } catch (error) {
        // 如果 Git 操作失败（例如：不在 Git 仓库中），返回空结果
        console.warn('[Git] 获取 diff 失败:', error);
        return {
            files: [],
            additions: {},
            deletions: {},
        };
    }
}

/**
 * 解析 Git diff 输出，提取行号
 * 
 * Git diff 格式说明：
 * ```
 * @@ -10,5 +10,6 @@  ← hunk header（块头）
 * -deleted line       ← 删除的行（以 - 开头）
 * +added line         ← 新增的行（以 + 开头）
 *  context line       ← 上下文行（以空格开头）
 * ```
 * 
 * 算法说明：
 * 1. 查找 hunk header（@@ ... @@）
 * 2. 从 header 中提取起始行号
 * 3. 遍历每一行：
 *    - '+' 开头：新增行，记录行号并递增
 *    - '-' 开头：删除行，记录行号但不递增
 *    - ' ' 开头：上下文行，递增行号
 * 
 * 注意事项：
 * - '+++' 和 '---' 是文件头，不是实际的变更
 * - 行号从 1 开始（不是 0）
 * - 删除的行不影响新文件的行号
 * 
 * @param diffText - Git diff 的原始文本输出
 * @returns 新增和删除的行号列表
 * 
 * @example
 * const diff = `
 * @@ -10,3 +10,4 @@
 *  context
 * -old line
 * +new line 1
 * +new line 2
 * `;
 * const result = parseDiff(diff);
 * // result.additions = [11, 12]
 * // result.deletions = [11]
 * 
 * @private
 */
function parseDiff(diffText: string): { additions: number[]; deletions: number[] } {
    const additions: number[] = [];
    const deletions: number[] = [];

    // 按行分割 diff 文本
    const lines = diffText.split('\n');

    // 当前处理的行号（新文件中的行号）
    let currentLine = 0;

    for (const line of lines) {
        // 1. 解析 hunk header
        // 格式：@@ -old_start,old_count +new_start,new_count @@
        // 例如：@@ -10,5 +10,6 @@ 表示：
        // - 旧文件从第 10 行开始，共 5 行
        // - 新文件从第 10 行开始，共 6 行
        if (line.startsWith('@@')) {
            // 提取新文件的起始行号（+后面的数字）
            const match = line.match(/\+(\d+)/);
            if (match) {
                currentLine = parseInt(match[1], 10);
            }
            continue;
        }

        // 2. 跳过非内容行
        // 例如：文件头（diff --git）、索引行（index）等
        if (!line.startsWith('+') && !line.startsWith('-') && !line.startsWith(' ')) {
            continue;
        }

        // 3. 处理新增行
        if (line.startsWith('+') && !line.startsWith('+++')) {
            // '+' 开头表示新增的行
            // '+++' 是文件头，需要排除
            additions.push(currentLine);
            currentLine++;  // 新增行会增加行号
        }
        // 4. 处理删除行
        else if (line.startsWith('-') && !line.startsWith('---')) {
            // '-' 开头表示删除的行
            // '---' 是文件头，需要排除
            deletions.push(currentLine);
            // 注意：删除的行不增加行号，因为它在新文件中不存在
        }
        // 5. 处理上下文行
        else {
            // 空格开头表示上下文行（未变更的行）
            currentLine++;
        }
    }

    return { additions, deletions };
}

/**
 * 获取变更的文件列表
 * 
 * 这是 getGitDiff 的简化版本，只返回文件列表
 * 适用于只需要知道哪些文件变更了，不需要具体行号的场景
 * 
 * @param base - 对比的基准分支
 * @returns 变更的文件路径列表
 * 
 * @example
 * const files = await getChangedFiles('main');
 * console.log('Changed files:', files);
 */
export async function getChangedFiles(base: string = 'main'): Promise<string[]> {
    const diff = await getGitDiff(base);
    return diff.files;
}
