import simpleGit, { SimpleGit } from 'simple-git';
import { IGitService } from '../core/interfaces';
import { GitInfo } from '../core/types';

/**
 * Git 服务实现类
 * 封装底层的 git 操作
 */
export class GitService implements IGitService {
    private git: SimpleGit;
    private rootDir: string;

    constructor(rootDir: string) {
        this.rootDir = rootDir;
        this.git = simpleGit(rootDir);
    }

    /**
     * 获取变更文件列表
     * @param targetBranch 目标分支，默认为 main
     */
    async getChangedFiles(targetBranch: string = 'main'): Promise<string[]> {
        try {
            const diffSummary = await this.git.diffSummary([targetBranch]);
            return diffSummary.files.map(file => file.file);
        } catch (error) {
            console.warn('[GitService] 获取变更文件失败:', error);
            return [];
        }
    }

    /**
     * 获取特定文件的变更行号
     * @param filePath 文件路径
     * @param targetBranch 目标分支
     */
    async getFileDiff(filePath: string, targetBranch: string = 'main'): Promise<number[]> {
        try {
            // 获取 diff 内容
            const diff = await this.git.diff([targetBranch, '--', filePath]);
            return this.parseDiffLines(diff);
        } catch (error) {
            console.warn(`[GitService] 获取文件 diff 失败 (${filePath}):`, error);
            return [];
        }
    }

    /**
     * 解析 diff 内容，提取变更行号 (新增/修改)
     */
    private parseDiffLines(diffContent: string): number[] {
        const changedLines: number[] = [];
        const lines = diffContent.split('\n');
        let currentLineNumber = 0;

        for (const line of lines) {
            // 匹配 chunk header: @@ -oldStart,oldLength +newStart,newLength @@
            const chunkHeaderMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);

            if (chunkHeaderMatch) {
                currentLineNumber = parseInt(chunkHeaderMatch[1], 10) - 1;
                continue;
            }

            // 检查是否为新增行 (+) 且不是 diff header (+++)
            if (line.startsWith('+') && !line.startsWith('+++')) {
                currentLineNumber++;
                changedLines.push(currentLineNumber);
            } else if (line.startsWith(' ') || (line.startsWith('-') && !line.startsWith('---'))) {
                // 未变更行 (' ') 增加行号
                // 删除行 ('-') 不增加新文件的行号
                if (line.startsWith(' ')) {
                    currentLineNumber++;
                }
            }
        }

        return changedLines;
    }

    /**
     * 获取 Git 用户与提交信息
     */
    async getGitInfo(): Promise<GitInfo> {
        try {
            const name = await this.git.raw(['config', 'user.name']);
            const email = await this.git.raw(['config', 'user.email']);
            const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
            const hash = await this.git.revparse(['HEAD']);

            return {
                name: name.trim(),
                email: email.trim(),
                branch: branch.trim(),
                hash: hash.trim()
            };
        } catch (error) {
            console.warn('[GitService] 获取 Git 信息失败:', error);
            return {
                name: 'Unknown',
                email: 'unknown@example.com',
                branch: 'unknown',
                hash: 'unknown'
            };
        }
    }
}
