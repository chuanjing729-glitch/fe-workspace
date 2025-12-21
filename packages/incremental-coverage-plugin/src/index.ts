/**
 * 主入口文件
 * 
 * 导出插件的所有公共 API
 * 
 * 使用方式：
 * ```typescript
 * import { IncrementalCoveragePlugin } from '@51jbs/incremental-coverage-plugin';
 * ```
 * 
 * @module index
 */

// 导出主插件
export { IncrementalCoveragePlugin } from './plugin';

// 导出类型定义
export type { IncrementalCoverageOptions } from './types';

// 导出核心模块（供高级用户使用）
export { CoverageCollector } from './collector';
export { CoverageDiffer } from './differ';
export { CoverageReporter } from './reporter';

// 导出 Git 工具函数
export { getGitDiff, getChangedFiles } from './git';
