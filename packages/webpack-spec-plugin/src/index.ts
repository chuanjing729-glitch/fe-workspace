import type { Compiler } from 'webpack'
import { PluginOptions, CheckResult, RuleChecker } from './types'
import { getChangedFiles, getAllFiles, shouldExcludeFile } from './utils/file-helper'
import { namingRule, performanceRule, commentsRule, importRule, variableNamingRule, memoryLeakRule, securityRule, javascriptRule, vueRule, cssRule, eventRule, nullSafetyRule, boundaryRule, bestPracticeRule, messageConsistencyRule, apiSafetyRule, formValidationRule, dependencyCheckRule } from './rules'
import { ConsoleReporter } from './reporters/console-reporter'
import { HtmlReporter } from './reporters/html-reporter'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

/**
 * 文件缓存结构
 */
interface FileCache {
  hash: string
  results: CheckResult[]
  timestamp: number
}

const DEFAULT_OPTIONS: PluginOptions = {
  mode: 'incremental',
  severity: 'normal',
  rules: {
    naming: true,
    comments: true,
    performance: true,
    imports: true,
    assets: true,
    variableNaming: true,
    memoryLeak: true,
    security: true,
    javascript: true,
    vue: true,
    css: true,
    event: true,
    nullSafety: true,
    boundary: true,
    bestPractice: true,
    messageConsistency: true,
    apiSafety: true,
    formValidation: true,
    dependencyCheck: true
  },
  performanceBudget: {
    maxImageSize: 500,
    maxJsSize: 300,
    maxCssSize: 100,
    maxFontSize: 200
  },
  htmlReport: true,
  reportPath: '.spec-cache/spec-report.html',
  exclude: ['**/node_modules/**', '**/dist/**', '*.config.js', '**/mock/**'],
  rootDir: process.cwd(),
  baselineFile: '.spec-baseline.json',
  useBaseline: false,
  generateBaseline: false
}

/**
 * Webpack 规范检查插件
 * 
 * @example
 * // webpack.config.js
 * const SpecPlugin = require('@51jbs/webpack-spec-plugin')
 * 
 * module.exports = {
 *   plugins: [
 *     new SpecPlugin({
 *       mode: 'incremental',
 *       severity: 'normal',
 *       performanceBudget: {
 *         maxImageSize: 500,
 *         maxJsSize: 300
 *       }
 *     })
 *   ]
 * }
 */
class SpecPlugin {
  private options: PluginOptions
  private rules: RuleChecker[] = []
  private cache: Map<string, FileCache> = new Map()
  private cacheDir: string = '.spec-cache'
  private baseline: Map<string, number> = new Map()

  constructor(options: Partial<PluginOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.initRules()
  }

  /**
   * 初始化检查规则
   */
  private initRules() {
    const { rules } = this.options

    if (rules?.naming) {
      this.rules.push(namingRule)
    }
    if (rules?.comments) {
      this.rules.push(commentsRule)
    }
    if (rules?.performance) {
      this.rules.push(performanceRule)
    }
    if (rules?.imports) {
      this.rules.push(importRule)
    }
    if (rules?.variableNaming) {
      this.rules.push(variableNamingRule)
    }
    if (rules?.memoryLeak) {
      this.rules.push(memoryLeakRule)
    }
    if (rules?.security) {
      this.rules.push(securityRule)
    }
    if (rules?.javascript) {
      this.rules.push(javascriptRule)
    }
    if (rules?.vue) {
      this.rules.push(vueRule)
    }
    if (rules?.css) {
      this.rules.push(cssRule)
    }
    if (rules?.event) {
      this.rules.push(eventRule)
    }
    if (rules?.nullSafety) {
      this.rules.push(nullSafetyRule)
    }
    if (rules?.boundary) {
      this.rules.push(boundaryRule)
    }
    if (rules?.bestPractice) {
      this.rules.push(bestPracticeRule)
    }
    if (rules?.messageConsistency) {
      this.rules.push(messageConsistencyRule)
    }
    if (rules?.apiSafety) {
      this.rules.push(apiSafetyRule)
    }
    if (rules?.formValidation) {
      this.rules.push(formValidationRule)
    }
    if (rules?.dependencyCheck) {
      this.rules.push(dependencyCheckRule)
    }
  }

  /**
   * Webpack 插件入口
   */
  apply(compiler: Compiler) {
    const pluginName = 'SpecPlugin'

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      // 存储检查结果（如果需要在此注入）
      (compilation as any)._specPluginResults = []
    })

    compiler.hooks.emit.tapAsync(pluginName, async (compilation, callback) => {
      try {
        console.log('\n🔍 开始规范检查...\n')

        const rootDir = this.options.rootDir || compiler.context
        this.loadCache(rootDir)
        this.loadBaseline(rootDir)

        const files = await this.getFilesToCheck(rootDir)
        console.log(`📁 检查文件数: ${files.length}`)
        console.log(`📋 检查模式: ${this.options.mode === 'incremental' ? '增量检查' : '全量检查'}`)
        console.log('')

        const reporter = new ConsoleReporter()
        let checkedCount = 0

        for (const file of files) {
          const results = await this.checkFile(file)
          reporter.addAll(results)

          // 将结果转换为 Webpack Error/Warning 对象
          results.forEach(res => {
            const message = `[SpecPlugin] [${res.rule}] ${res.message}\nFile: ${res.file}${res.line ? `:${res.line}` : ''}`

            // 使用适配 Webpack 的 Error 构造
            const webpackError = new (compiler as any).webpack.WebpackError(message)
            // 尝试绑定到具体的文件位置
            webpackError.file = res.file

            if (res.type === 'error') {
              compilation.errors.push(webpackError)
            } else {
              compilation.warnings.push(webpackError)
            }
          })

          checkedCount++
          if (checkedCount % 10 === 0) {
            process.stdout.write(`\r检查进度: ${checkedCount}/${files.length}`)
          }
        }

        if (checkedCount > 0) {
          process.stdout.write(`\r检查进度: ${checkedCount}/${files.length}\n`)
        }

        // 输出终端控制台报告
        reporter.print(rootDir)

        // 生成 HTML 报告
        if (this.options.htmlReport) {
          const htmlReporter = new HtmlReporter()
          htmlReporter.addAll([...reporter['errors'], ...reporter['warnings']])
          let reportPath = this.options.reportPath || '.spec-cache/spec-report.html'
          const reportDir = path.dirname(path.join(rootDir, reportPath))
          if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true })
          htmlReporter.generate(reportPath, rootDir)
        }

        if (this.options.generateBaseline) {
          this.saveBaseline(rootDir, [...reporter['errors'], ...reporter['warnings']])
        }

        this.saveCache(rootDir)

        // 根据严格程度决定是否中断构建
        const hasCriticalErrors = compilation.errors.length > 0
        const hasWarnings = compilation.warnings.length > 0
        const shouldFail = this.options.severity === 'strict'
          ? (hasCriticalErrors || hasWarnings)
          : hasCriticalErrors

        if (shouldFail) {
          return callback(new Error('[SpecPlugin] 规范检查未通过，构建中断。'))
        }

        callback()
      } catch (error) {
        console.error('规范检查过程中出错:', error)
        callback(error as Error)
      }
    })
  }

  /**
   * 获取需要检查的文件列表
   */
  private async getFilesToCheck(rootDir: string): Promise<string[]> {
    let files: string[] = []

    if (this.options.mode === 'incremental') {
      files = await getChangedFiles(rootDir, this.options.exclude)

      // 如果没有检测到变更文件，回退到全量检查
      if (files.length === 0) {
        console.log('⚠️  未检测到 Git 变更文件，切换到全量检查模式')
        files = await getAllFiles(rootDir, this.options.exclude)
      }
    } else {
      files = await getAllFiles(rootDir, this.options.exclude)
    }

    // getAllFiles 已经应用了排除规则，这里不需要再次过滤
    return files
  }

  /**
   * 检查单个文件
   */
  private async checkFile(filePath: string): Promise<CheckResult[]> {
    try {
      // 读取文件内容
      const content = fs.readFileSync(filePath, 'utf-8')

      // 计算文件哈希
      const hash = this.calculateHash(content)

      // 检查缓存
      const cached = this.cache.get(filePath)
      let results: CheckResult[] = []

      if (cached && cached.hash === hash) {
        results = cached.results
      } else {
        // 执行所有启用的规则检查
        for (const rule of this.rules) {
          const ruleResults = rule.check(filePath, content, this.options)
          results.push(...ruleResults)
        }

        // 缓存结果
        this.cache.set(filePath, {
          hash,
          results: [...results], // 保存一份原始结果的副本到缓存
          timestamp: Date.now()
        })
      }

      // 如果启用基线，过滤掉基线中已有的问题
      if (this.options.useBaseline && !this.options.generateBaseline) {
        const seenInThisFile = new Map<string, number>()
        return results.filter(res => {
          const fingerprint = this.getFingerprint(res)
          const count = seenInThisFile.get(fingerprint) || 0
          seenInThisFile.set(fingerprint, count + 1)

          const baselineLimit = this.baseline.get(fingerprint) || 0
          // 只有当出现的次数超过基线中的限制时，才判定为新问题
          return (count + 1) > baselineLimit
        })
      }

      return results
    } catch (error) {
      // 忽略无法读取的文件（如二进制文件）
      return []
    }
  }

  /**
   * 计算文件哈希
   */
  private calculateHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex')
  }

  /**
   * 加载缓存
   */
  private loadCache(rootDir: string) {
    try {
      const cacheFile = path.join(rootDir, this.cacheDir, 'check-cache.json')
      if (fs.existsSync(cacheFile)) {
        const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
        this.cache = new Map(Object.entries(cacheData))
      }
    } catch (error) {
      // 缓存加载失败，忽略
    }
  }

  /**
   * 保存缓存
   */
  private saveCache(rootDir: string) {
    try {
      const cacheDir = path.join(rootDir, this.cacheDir)
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true })
      }

      const cacheFile = path.join(cacheDir, 'check-cache.json')
      const cacheData = Object.fromEntries(this.cache)
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2))
    } catch (error) {
      // 缓存保存失败，忽略
    }
  }

  /**
   * 获取指纹（用于识别唯一问题）
   */
  private getFingerprint(result: CheckResult): string {
    // 使用相对路径，确保在不同机器上一致
    const rootDir = this.options.rootDir || process.cwd()
    const relativeFile = path.relative(rootDir, result.file)
    return `${relativeFile}|${result.rule}|${result.message}`
  }

  /**
   * 加载基线文件
   */
  private loadBaseline(rootDir: string) {
    try {
      if (!this.options.useBaseline) return

      const baselinePath = path.join(rootDir, this.options.baselineFile || '.spec-baseline.json')
      if (fs.existsSync(baselinePath)) {
        const data = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'))
        const issues = data.issues || []

        // 统计每个指纹出现的次数
        this.baseline.clear()
        issues.forEach((f: string) => {
          this.baseline.set(f, (this.baseline.get(f) || 0) + 1)
        })

        console.log(`📋 已加载基线文件: ${baselinePath}`)
        console.log(`📋 包含存量问题: ${issues.length} 条`)
      }
    } catch (error) {
      console.warn('⚠️  基线文件加载失败:', error)
    }
  }

  /**
   * 保存基线文件
   */
  private saveBaseline(rootDir: string, results: CheckResult[]) {
    try {
      const baselinePath = path.join(rootDir, this.options.baselineFile || '.spec-baseline.json')
      const fingerprints = results.map(res => this.getFingerprint(res))
      const data = {
        updatedAt: new Date().toISOString(),
        total: fingerprints.length,
        issues: Array.from(new Set(fingerprints))
      }
      fs.writeFileSync(baselinePath, JSON.stringify(data, null, 2))
      console.log(`✅ 基线文件已更新: ${baselinePath} (${fingerprints.length} 条问题)`)
    } catch (error) {
      console.error('❌ 基线文件保存失败:', error)
    }
  }
}
module.exports = SpecPlugin;
// 默认导出
export default SpecPlugin

// 导出类型
export * from './types'
