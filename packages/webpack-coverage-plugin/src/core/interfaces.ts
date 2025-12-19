import {
    FileChange,
    GitInfo,
    IncrementalCoverageResult,
    CoverageMap,
    ImpactAnalysisResult,
    ApiInterface
} from './types';

/**
 * Git 服务接口
 * 负责与 Git 仓库交互
 */
export interface IGitService {
    /** 获取变更文件列表 */
    getChangedFiles(targetBranch?: string): Promise<string[]>;
    /** 获取特定文件的变更行号 */
    getFileDiff(filePath: string, targetBranch?: string): Promise<number[]>;
    /** 获取 Git 用户与提交信息 */
    getGitInfo(): Promise<GitInfo>;
}

/**
 * 覆盖率服务接口
 * 负责计算增量覆盖率
 */
export interface ICoverageService {
    /** 计算增量覆盖率 */
    calculate(coverageMap: CoverageMap): Promise<IncrementalCoverageResult>;
    /** 注册基准元数据 (v3.0) */
    registerBaseline(filename: string, metadata: any): void;
}

/**
 * 影响面分析服务接口
 * 负责 AST 分析与依赖推导
 */
export interface IAnalysisService {
    /** 初始化依赖分析 (通常全量扫描) */
    initDependencyGraph(): Promise<void>;
    /** 分析变更文件的影响范围 */
    analyzeImpact(changedFiles: string[]): Promise<ImpactAnalysisResult>;
}

/**
 * API 服务接口
 * 负责 YAPI 监控与数据上报
 */
export interface IApiService {
    /** 获取 API 列表 */
    fetchApiList(): Promise<ApiInterface[]>;
    /** 检查 API 变更 */
    checkApiChanges(currentApis: ApiInterface[]): Promise<any>;
}
