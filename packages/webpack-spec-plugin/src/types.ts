/**
 * 插件配置选项接口
 */
export interface PluginOptions {
  /**
   * 检查模式：'incremental' 增量检查 | 'full' 全量检查
   * @default 'incremental'
   */
  mode?: 'incremental' | 'full'

  /**
   * 严格程度：'strict' 所有问题中断构建 | 'normal' 只有错误中断构建
   * @default 'normal'
   */
  severity?: 'strict' | 'normal'

  /**
   * 需要启用的检查规则
   */
  rules?: {
    /** 文件命名规范检查 */
    naming?: boolean
    /** 注释规范检查 */
    comments?: boolean
    /** 性能规范检查 */
    performance?: boolean
    /** 导入规范检查 */
    imports?: boolean
    /** 资源规范检查 */
    assets?: boolean
    /** 变量命名检查 */
    variableNaming?: boolean
    /** 内存泄漏检查 */
    memoryLeak?: boolean
    /** 安全检查 */
    security?: boolean
    /** JavaScript 语法规范检查 */
    javascript?: boolean
    /** Vue 开发规范检查 */
    vue?: boolean
    /** CSS 开发规范检查 */
    css?: boolean
    /** 事件规范检查（Vue2 + JavaScript） */
    event?: boolean
    /** 空指针防护检查 */
    nullSafety?: boolean
    /** 边界处理规范检查 */
    boundary?: boolean
    /** 最佳实践检查 */
    bestPractice?: boolean
    /** 消息提示一致性检查 */
    messageConsistency?: boolean
    /** 接口安全检查 */
    apiSafety?: boolean
    /** 表单验证检查 */
    formValidation?: boolean
    /** 依赖检查 */
    dependencyCheck?: boolean
  }

  /**
   * 边界处理规则自定义配置
   */
  boundaryConfig?: {
    /** 是否检查除零错误 */
    checkDivisionZero?: boolean
    /** 是否检查数组越界 */
    checkArrayBounds?: boolean
    /** 是否检查对象属性访问 */
    checkObjectAccess?: boolean
    /** 是否检查JSON.parse */
    checkJsonParse?: boolean
    /** 是否检查循环边界 */
    checkLoopBounds?: boolean
    /** 是否检查递归终止 */
    checkRecursion?: boolean
    /** 大索引检查阈值 */
    largeIndexThreshold?: number
    /** 最大分页大小 */
    maxPageSize?: number
  }

  /**
   * 性能预算配置
   */
  performanceBudget?: {
    /** 单个图片最大大小（KB） */
    maxImageSize?: number
    /** 单个JS文件最大大小（KB） */
    maxJsSize?: number
    /** 单个CSS文件最大大小（KB） */
    maxCssSize?: number
    /** 单个字体文件最大大小（KB） */
    maxFontSize?: number
  }

  /**
   * 是否生成HTML报告
   * @default true
   */
  htmlReport?: boolean

  /**
   * HTML报告输出路径
   * @default 'spec-report.html'
   */
  reportPath?: string

  /**
   * 排除的文件模式（glob）
   */
  exclude?: string[]

  /**
   * 项目根目录
   */
  rootDir?: string

  /**
   * 基线文件路径，用于忽略已知的存量问题
   * @default '.spec-baseline.json'
   */
  baselineFile?: string

  /**
   * 是否启用基线机制，启用后将忽略基线中记录的存量错误
   * @default false
   */
  useBaseline?: boolean

  /**
   * 是否自动生成或更新基线文件
   * @default false
   */
  generateBaseline?: boolean
}

/**
 * 检查结果类型
 */
export type CheckResultType = 'error' | 'warning'

/**
 * 检查结果接口
 */
export interface CheckResult {
  /** 结果类型 */
  type: CheckResultType
  /** 规则名称 */
  rule: string
  /** 错误消息 */
  message: string
  /** 文件路径 */
  file: string
  /** 行号（可选） */
  line?: number
  /** 列号（可选） */
  column?: number
  /** 错误代码（可选） */
  code?: string
  /** 修复建议（可选） */
  suggestion?: string
}

/**
 * 规则检查器接口
 */
export interface RuleChecker {
  /** 规则名称 */
  name: string
  /** 规则描述 */
  description: string
  /** 检查文件 */
  check: (filePath: string, content: string, options: PluginOptions) => CheckResult[]
}
