import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

interface DependencyInfo {
  filePath: string;
  imports: string[];
  exports: string[];
  dependencies: string[];
}

interface ImpactAnalysisResult {
  affectedPages: string[];
  affectedComponents: string[];
  impactLevel: 'high' | 'medium' | 'low';
  propagationPaths: string[][];
  regressionTestSuggestions: string[];
  // 可执行的回归测试命令
  regressionTestCommand?: string;
}

class ImpactAnalyzer {
  private projectRoot: string;
  private dependencyGraph: Map<string, DependencyInfo>;
  
  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.dependencyGraph = new Map();
  }
  
  /**
   * 分析项目中的代码依赖关系
   */
  public analyzeDependencies(): void {
    console.log('[ImpactAnalyzer] 开始分析项目依赖关系...');
    
    // 遍历项目中的所有JavaScript/TypeScript文件
    const files = this.getAllSourceFiles(this.projectRoot);
    
    for (const file of files) {
      try {
        const dependencyInfo = this.extractDependencyInfo(file);
        this.dependencyGraph.set(file, dependencyInfo);
      } catch (error) {
        console.warn(`[ImpactAnalyzer] 解析文件 ${file} 时出错:`, error);
      }
    }
    
    console.log(`[ImpactAnalyzer] 依赖关系分析完成，共分析 ${this.dependencyGraph.size} 个文件`);
  }
  
  /**
   * 分析代码变更的影响范围
   * @param changedFiles 发生变更的文件列表
   * @returns 影响分析结果
   */
  public analyzeImpact(changedFiles: string[]): ImpactAnalysisResult {
    console.log('[ImpactAnalyzer] 开始分析代码变更影响范围...');
    
    const affectedPages: string[] = [];
    const affectedComponents: string[] = [];
    const propagationPaths: string[][] = [];
    
    // 对于每个变更的文件，找出所有依赖它的文件
    for (const changedFile of changedFiles) {
      const paths = this.findPropagationPaths(changedFile);
      propagationPaths.push(...paths);
      
      // 根据文件路径判断是页面还是组件
      if (changedFile.includes('/pages/') || changedFile.includes('/views/')) {
        affectedPages.push(changedFile);
      } else if (changedFile.includes('/components/')) {
        affectedComponents.push(changedFile);
      }
      
      // 查找依赖变更文件的其他文件
      const dependents = this.findDependents(changedFile);
      for (const dependent of dependents) {
        if (dependent.includes('/pages/') || dependent.includes('/views/')) {
          if (!affectedPages.includes(dependent)) {
            affectedPages.push(dependent);
          }
        } else if (dependent.includes('/components/')) {
          if (!affectedComponents.includes(dependent)) {
            affectedComponents.push(dependent);
          }
        }
      }
    }
    
    // 评估影响级别
    const impactLevel = this.evaluateImpactLevel(affectedPages.length, affectedComponents.length);
    
    // 生成回归测试建议
    const regressionTestSuggestions = this.generateRegressionTestSuggestions(
      affectedPages, 
      affectedComponents
    );
    
    // 生成可执行的回归测试命令
    const regressionTestCommand = this.generateRegressionTestCommand(
      affectedPages, 
      affectedComponents
    );
    
    console.log('[ImpactAnalyzer] 影响范围分析完成');
    
    return {
      affectedPages,
      affectedComponents,
      impactLevel,
      propagationPaths,
      regressionTestSuggestions,
      regressionTestCommand
    };
  }
  
  /**
   * 获取所有源代码文件
   */
  private getAllSourceFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // 排除node_modules和dist等目录
        if (!['node_modules', 'dist', '.git', '.coverage'].includes(entry.name)) {
          files.push(...this.getAllSourceFiles(fullPath));
        }
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  /**
   * 提取文件的依赖信息
   */
  private extractDependencyInfo(filePath: string): DependencyInfo {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports: string[] = [];
    const exports: string[] = [];
    const dependencies: string[] = [];
    
    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
      
      traverse(ast, {
        ImportDeclaration: (path) => {
          const source = path.node.source.value;
          imports.push(source);
          
          // 解析相对路径导入
          if (source.startsWith('.')) {
            const resolvedPath = require('path').resolve(require('path').dirname(filePath), source);
            dependencies.push(resolvedPath);
          }
        },
        ExportDeclaration: (path) => {
          exports.push(path.node.type);
        }
      });
    } catch (error) {
      console.warn(`[ImpactAnalyzer] 解析文件AST时出错 ${filePath}:`, error);
    }
    
    return {
      filePath,
      imports,
      exports,
      dependencies
    };
  }
  
  /**
   * 查找依赖传播路径
   */
  private findPropagationPaths(changedFile: string): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();
    
    const dfs = (currentFile: string, currentPath: string[]) => {
      if (visited.has(currentFile)) {
        return;
      }
      
      visited.add(currentFile);
      const newPath = [...currentPath, currentFile];
      
      // 查找依赖当前文件的文件
      for (const [file, info] of this.dependencyGraph.entries()) {
        if (info.dependencies.includes(currentFile)) {
          dfs(file, newPath);
        }
      }
      
      // 如果没有更多的依赖者，这是一个终端节点
      paths.push(newPath);
    };
    
    dfs(changedFile, []);
    return paths;
  }
  
  /**
   * 查找依赖指定文件的文件
   */
  private findDependents(targetFile: string): string[] {
    const dependents: string[] = [];
    
    for (const [file, info] of this.dependencyGraph.entries()) {
      if (info.dependencies.includes(targetFile)) {
        dependents.push(file);
      }
    }
    
    return dependents;
  }
  
  /**
   * 评估影响级别
   */
  private evaluateImpactLevel(pageCount: number, componentCount: number): 'high' | 'medium' | 'low' {
    const totalAffected = pageCount + componentCount;
    
    if (totalAffected > 10 || pageCount > 3) {
      return 'high';
    } else if (totalAffected > 5 || pageCount > 1) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  /**
   * 生成回归测试建议
   */
  private generateRegressionTestSuggestions(
    affectedPages: string[], 
    affectedComponents: string[]
  ): string[] {
    const suggestions: string[] = [];
    
    if (affectedPages.length > 0) {
      suggestions.push(`优先测试以下页面: ${affectedPages.slice(0, 3).join(', ')}`);
    }
    
    if (affectedComponents.length > 0) {
      suggestions.push(`检查以下组件的集成: ${affectedComponents.slice(0, 5).join(', ')}`);
    }
    
    if (affectedPages.length + affectedComponents.length > 5) {
      suggestions.push('建议进行全面回归测试');
    } else if (affectedPages.length + affectedComponents.length > 0) {
      suggestions.push('建议进行局部回归测试');
    }
    
    return suggestions;
  }
  
  /**
   * 生成可执行的回归测试命令
   */
  private generateRegressionTestCommand(
    affectedPages: string[], 
    affectedComponents: string[]
  ): string {
    // 合并所有受影响的文件
    const affectedFiles = [...affectedPages, ...affectedComponents];
    
    if (affectedFiles.length > 0) {
      // 生成npx jest命令，包含所有受影响的文件
      return `npx jest ${affectedFiles.join(' ')}`;
    }
    
    return '';
  }
}

export default ImpactAnalyzer;
export { ImpactAnalysisResult };