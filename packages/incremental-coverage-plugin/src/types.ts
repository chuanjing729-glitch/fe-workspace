/**
 * 类型定义文件
 * 
 * 定义了插件使用的所有核心类型和接口
 */

/**
 * 插件配置选项
 * 
 * 所有配置项都是可选的，插件会提供合理的默认值
 */
export interface IncrementalCoverageOptions {
  include?: string[];
  exclude?: string[];
  gitDiffBase?: string;
  outputDir?: string;
  reportFormat?: 'html' | 'json' | 'both';
  enableOverlay?: boolean;
  baselinePath?: string;
  autoSaveBaseline?: boolean;
  threshold?: number;
  reportInterval?: number; // 报告生成的最小间隔（毫秒），默认 10000ms
  historyCount?: number;   // 保留的历史报告数量，默认 15
  failOnError?: boolean;    // 覆盖率未达标时是否抛出错误（主要用于 CI）
}

export interface CoverageData {
  path: string;
  statementMap: Record<string, any>;
  fnMap: Record<string, any>;
  branchMap: Record<string, any>;
  s: Record<string, number>;
  f: Record<string, number>;
  b: Record<string, number[]>;
}

export type CoverageMap = Record<string, CoverageData>;

export interface IncrementalCoverageResult {
  overall: {
    totalLines: number;
    coveredLines: number;
    coverageRate: number;
  };
  files: Array<{
    file: string;
    changedLines: number[];
    uncoveredLines: number[];
    coverageRate: number;
    sourceCode?: string;
  }>;
  changedFiles: string[];
  timestamp: number;
}

export interface GitDiffResult {
  files: string[];
  additions: Record<string, number[]>;
  deletions: Record<string, number[]>;
}

export interface ReportData {
  result: IncrementalCoverageResult;
  baseline?: CoverageMap;
  current: CoverageMap;
  diff: any;
}
