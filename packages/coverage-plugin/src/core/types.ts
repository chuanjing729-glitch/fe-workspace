/**
 * 核心类型定义
 * 包含项目中通用的数据结构
 */

/**
 * 插件配置选项接口
 */
export interface WebpackCoveragePluginOptions {
    /** 是否启用插件 */
    enabled?: boolean;
    /** 插桩的文件模式 */
    include?: RegExp | string[];
    /** 排除的文件模式 */
    exclude?: RegExp | string[];
    /** 输出目录 (默认为 .coverage) */
    outputDir?: string;
    /** 是否启用影响范围分析 */
    enableImpactAnalysis?: boolean;
    /** 是否启用运行时小气泡 */
    enableOverlay?: boolean;
    /** 质量门禁配置 */
    qualityGate?: QualityGateConfig;
    /** 报告生成最小间隔（毫秒），默认 30000 */
    reportTimer?: number;
    /** 是否使用 istanbul-diff 进行增量覆盖率计算，默认 true（v3.0+） */
    useIstanbulDiff?: boolean;
}

/**
 * 质量门禁配置
 */
export interface QualityGateConfig {
    /** 行覆盖率阈值 (默认: 80) */
    lineCoverageThreshold?: number;
    /** 分支覆盖率阈值 (默认: 80) */
    branchCoverageThreshold?: number;
    /** 受影响接口数阈值 (默认: 10) */
    affectedInterfacesThreshold?: number;
}

/**
 * Git 变更文件信息
 */
export interface FileChange {
    /** 文件路径 */
    file: string;
    /** 变更状态 */
    status: 'added' | 'modified' | 'deleted';
    /** 变更的代码行号列表 */
    changedLines: number[];
}

/**
 * Git 提交信息
 */
export interface GitInfo {
    /** 提交者姓名 */
    name: string;
    /** 提交者邮箱 */
    email: string;
    /** 当前分支名 */
    branch: string;
    /** 提交 Hash */
    hash: string;
}

/**
 * 增量覆盖率结果
 */
export interface IncrementalCoverageResult {
    /** 整体统计 */
    overall: {
        /** 变更总行数 */
        totalChangedLines: number;
        /** 已覆盖的变更行数 */
        coveredChangedLines: number;
        /** 增量覆盖率 (0-100) */
        coverageRate: number;
    };
    /** 文件级详情 */
    files: {
        /** 文件路径 */
        file: string;
        /** 变更的代码行号 */
        changedLines: number[];
        /** 未覆盖的代码行号 */
        uncoveredLines: number[];
        /** 文件覆盖率 */
        coverageRate: number;
    }[];
}

/**
 * 影响面分析结果
 */
export interface ImpactAnalysisResult {
    /** 受影响的页面列表 */
    affectedPages: string[];
    /** 受影响的组件列表 */
    affectedComponents: string[];
    /** 影响等级 */
    impactLevel: 'high' | 'medium' | 'low';
    /** 传播路径 */
    propagationPaths: string[][];
    /** 回归测试建议中文描述 */
    regressionTestSuggestions: string[];
    /** 建议执行的测试命令 */
    regressionTestCommand?: string;
}

/**
 * API 接口定义 (YAPI)
 */
export interface ApiInterface {
    _id: number;
    method: string;
    path: string;
    title: string;
    req_body_other?: string;
    res_body?: string;
    up_time: number;
}

/**
 * Istanbul 覆盖率数据结构
 */
export interface CoverageData {
    path: string;
    statementMap: Record<string, { start: { line: number; column: number }; end: { line: number; column: number } }>;
    fnMap: Record<string, any>;
    branchMap: Record<string, any>;
    s: Record<string, number>; // statement counts
    f: Record<string, number>; // function counts
    b: Record<string, number[]>; // branch counts
}

export type CoverageMap = Record<string, CoverageData>;

/**
 * 依赖信息结构 (内部使用)
 */
export interface DependencyInfo {
    filePath: string;
    imports: string[];
    exports: string[];
    dependencies: string[];
    hash: string; // [CHANGED] Replaced lastModified with hash for consistency
}

/**
 * 报告数据结构 (Reporter 2.0)
 */
export interface ReportData {
    timestamp: string;
    environment: {
        nodeVersion: string;
        os: string;
        gitName: string;
        gitEmail: string; // [NEW] Added email
        gitBranch: string;
        gitHash: string;
        hardware: {      // [NEW] Added hardware info
            cpu: string;
            memory: string;
        };
    };
    coverage: {
        overallRate: number;
        totalLines: number;
        coveredLines: number;
        uncoveredFiles: Array<{
            file: string;
            rate: number;
            uncoveredLines: number[];
        }>;
    };
    impact: {
        level: 'high' | 'medium' | 'low';
        affectedPages: string[];
        affectedComponents: string[];
        propagationPaths: string[][];
    };
    qualityGate: {
        passed: boolean;
        gates: Array<{
            metric: string;
            value: string | number;
            threshold: string | number;
            status: 'pass' | 'fail';
        }>;
    };
    business: Array<{
        pageName: string;
        componentName: string;
        codeLines: number;
        severity: string;
    }>;
}
