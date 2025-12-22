import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { IAnalysisService } from '../core/interfaces';
import { ImpactAnalysisResult, DependencyInfo } from '../core/types';
import { FileStorage } from '../infra/storage';

/**
 * 影响面分析服务
 * 负责代码依赖分析与变更影响评估
 * 集成 AST 分析与持久化缓存
 */
export class AnalysisService implements IAnalysisService {
    private projectRoot: string;
    private storage: FileStorage;
    private dependencyGraph: Map<string, DependencyInfo>;

    constructor(projectRoot: string, storage: FileStorage) {
        this.projectRoot = projectRoot;
        this.storage = storage;
        this.dependencyGraph = new Map();
    }

    /**
     * 初始化依赖图谱
     * 采用增量分析策略：对比文件 Hash，未变更文件复用缓存
     */
    /**
     * 初始化依赖图谱
     * 采用增量分析策略：对比文件 Hash，未变更文件复用缓存
     */
    public async initDependencyGraph(): Promise<void> {
        console.log('[AnalysisService] 开始初始化依赖图谱...');
        const startTime = Date.now();

        // 获取上次的缓存数据
        let cachedGraph = this.storage.load<Record<string, DependencyInfo>>('dependency_graph') || {};
        const newGraph: Record<string, DependencyInfo> = {};

        const files = await this.getAllSourceFiles(this.projectRoot);
        let hitCacheCount = 0;

        for (const file of files) {
            try {
                const content = await fs.promises.readFile(file, 'utf-8');
                const hash = this.computeHash(content);

                // 检查缓存是否有效
                if (cachedGraph[file] && cachedGraph[file].hash === hash) {
                    this.dependencyGraph.set(file, cachedGraph[file]);
                    newGraph[file] = cachedGraph[file];
                    hitCacheCount++;
                } else {
                    // 重新分析
                    const info = this.extractDependencyInfo(file, content);
                    // 注入 hash
                    info.hash = hash;

                    this.dependencyGraph.set(file, info);
                    newGraph[file] = info;
                }
            } catch (error) {
                console.warn(`[AnalysisService] 分析文件失败 ${file}:`, error);
            }
        }

        // 更新缓存
        this.storage.save('dependency_graph', newGraph);

        const duration = Date.now() - startTime;
        console.log(`[AnalysisService] 依赖分析完成，耗时 ${duration}ms (文件总数: ${files.length}, 缓存命中: ${hitCacheCount})`);
    }

    /**
     * 分析变更影响范围
     */
    public async analyzeImpact(changedFiles: string[]): Promise<ImpactAnalysisResult> {
        const affectedPages: string[] = [];
        const affectedComponents: string[] = [];
        const propagationPaths: string[][] = [];

        for (const changedFile of changedFiles) {
            const paths = this.findPropagationPaths(changedFile);
            propagationPaths.push(...paths);

            this.categorizeFile(changedFile, affectedPages, affectedComponents);

            const dependents = this.findDependents(changedFile);
            for (const dependent of dependents) {
                this.categorizeFile(dependent, affectedPages, affectedComponents);
            }
        }

        // 去重
        const uniquePages = [...new Set(affectedPages)];
        const uniqueComponents = [...new Set(affectedComponents)];

        return {
            affectedPages: uniquePages,
            affectedComponents: uniqueComponents,
            impactLevel: this.evaluateImpactLevel(uniquePages.length, uniqueComponents.length),
            propagationPaths,
            regressionTestSuggestions: this.generateSuggestions(uniquePages, uniqueComponents)
        };
    }

    private categorizeFile(file: string, pages: string[], components: string[]) {
        if (file.includes('/pages/') || file.includes('/views/')) {
            pages.push(file);
        } else if (file.includes('/components/')) {
            components.push(file);
        }
    }

    private async getAllSourceFiles(dir: string): Promise<string[]> {
        let files: string[] = [];
        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!['node_modules', 'dist', '.git', '.coverage'].includes(entry.name)) {
                        files = files.concat(await this.getAllSourceFiles(fullPath));
                    }
                } else if (/\.(js|ts|jsx|tsx|vue)$/.test(entry.name)) {
                    files.push(fullPath);
                }
            }
        } catch (e) {
            // 忽略 access error
        }
        return files;
    }

    private extractDependencyInfo(filePath: string, content: string): DependencyInfo {
        // Vue 处理逻辑
        let scriptContent = content;
        if (filePath.endsWith('.vue')) {
            const match = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
            scriptContent = match ? match[1] : '';
        }

        const imports: string[] = [];
        const exports: string[] = [];
        const dependencies: string[] = [];

        // 默认 hash 为空，外部会覆盖
        const info: DependencyInfo = { filePath, imports, exports, dependencies, hash: '' };

        if (!scriptContent.trim()) {
            return info;
        }

        try {
            const ast = parse(scriptContent, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx', 'classProperties', 'decorators-legacy']
            });

            traverse(ast, {
                ImportDeclaration: (p) => {
                    const source = p.node.source.value;
                    imports.push(source);
                    const resolved = this.resolvePath(filePath, source);
                    if (resolved) dependencies.push(resolved);
                },
                ExportDeclaration: (p) => {
                    exports.push(p.node.type);
                }
            });
        } catch (e) {
            // console.warn('Parse Error', filePath);
        }

        return info;
    }

    private resolvePath(currentFile: string, importPath: string): string | null {
        let resolved = '';
        if (importPath.startsWith('.')) {
            resolved = path.resolve(path.dirname(currentFile), importPath);
        } else if (importPath.startsWith('@/')) {
            resolved = path.join(this.projectRoot, 'src', importPath.substring(2));
        }

        if (resolved) {
            // 尝试补全后缀
            if (!path.extname(resolved)) {
                for (const ext of ['.ts', '.js', '.vue', '.tsx', '.jsx', '/index.ts', '/index.js']) {
                    if (fs.existsSync(resolved + ext)) return resolved + ext;
                }
            }
            if (fs.existsSync(resolved)) return resolved;
        }
        return null;
    }

    private findPropagationPaths(startFile: string): string[][] {
        const paths: string[][] = [];
        const visited = new Set<string>();

        const dfs = (current: string, pathStack: string[]) => {
            if (visited.has(current)) return;
            visited.add(current);
            const newStack = [...pathStack, current];

            const dependents = this.findDependents(current);
            if (dependents.length === 0) {
                paths.push(newStack);
            } else {
                for (const dep of dependents) {
                    dfs(dep, newStack);
                }
            }
        };

        dfs(startFile, []);
        return paths;
    }

    private findDependents(target: string): string[] {
        const dependents: string[] = [];
        // 标准化目标路径，确保跨不同引用形式的一致性
        // const normalizedTarget = path.resolve(target); // Assuming target is already absolute as per existing logic

        for (const [file, info] of this.dependencyGraph.entries()) {
            if (info.dependencies.some(d => d === target)) {
                dependents.push(file);
            }
        }
        return dependents;
    }

    private evaluateImpactLevel(pages: number, components: number): 'high' | 'medium' | 'low' {
        const total = pages + components;
        if (total > 10 || pages > 3) return 'high';
        if (total > 5 || pages > 1) return 'medium';
        return 'low';
    }

    private generateSuggestions(pages: string[], components: string[]): string[] {
        const suggestions: string[] = [];
        if (pages.length > 0) suggestions.push(`回归测试页面: ${pages.map(p => path.basename(p)).join(', ')}`);
        if (components.length > 0) suggestions.push(`检查组件集成: ${components.map(c => path.basename(c)).join(', ')}`);
        return suggestions;
    }

    private computeHash(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
}
