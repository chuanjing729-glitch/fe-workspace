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
  rootDir: process.cwd()
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

    compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, callback) => {
      try {
        console.log('\n🔍 开始规范检查...\n')
        
        const rootDir = this.options.rootDir || compiler.context
        
        // 加载缓存
        this.loadCache(rootDir)
        
        const files = await this.getFilesToCheck(rootDir)

        console.log(`📁 检查文件数: ${files.length}`)
        console.log(`📋 检查模式: ${this.options.mode === 'incremental' ? '增量检查' : '全量检查'}`)
        console.log('')

        const reporter = new ConsoleReporter()
        let checkedCount = 0

        for (const file of files) {
          const results = await this.checkFile(file)
          reporter.addAll(results)
          checkedCount++
          
          if (checkedCount % 10 === 0) {
            process.stdout.write(`\r检查进度: ${checkedCount}/${files.length}`)
          }
        }

        if (checkedCount > 0) {
          process.stdout.write(`\r检查进度: ${checkedCount}/${files.length}\n`)
        }

        // 输出报告
        reporter.print(rootDir)

          // 生成 HTML 报告
        if (this.options.htmlReport) {
          const htmlReporter = new HtmlReporter()
          htmlReporter.addAll([...reporter['errors'], ...reporter['warnings']])
          
          // 确保报告路径在 .spec-cache 目录中
          let reportPath = this.options.reportPath || '.spec-cache/spec-report.html'
          if (!reportPath.includes('.spec-cache')) {
            reportPath = path.join('.spec-cache', path.basename(reportPath))
          }
          
          // 确保 .spec-cache 目录存在
          const reportDir = path.dirname(path.join(rootDir, reportPath))
          if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true })
          }
          
          htmlReporter.generate(reportPath, rootDir)
        }
        
        // 保存缓存
        this.saveCache(rootDir)

        // 根据严格程度决定是否中断构建
        const shouldFail = this.options.severity === 'strict'
          ? reporter.hasErrors() || reporter.hasWarnings()
          : reporter.hasErrors()

        if (shouldFail) {
          callback(new Error('规范检查失败'))
        } else {
          callback()
        }

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
      if (cached && cached.hash === hash) {
        return cached.results
      }
      
      const results: CheckResult[] = []

      // 执行所有启用的规则检查
      for (const rule of this.rules) {
        const ruleResults = rule.check(filePath, content, this.options)
        results.push(...ruleResults)
      }
      
      // 缓存结果
      this.cache.set(filePath, {
        hash,
        results,
        timestamp: Date.now()
      })

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
}
module.exports = SpecPlugin;
// 默认导出
export default SpecPlugin

// 导出类型
export * from './types'
