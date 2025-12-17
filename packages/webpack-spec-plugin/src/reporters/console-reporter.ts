import chalk from 'chalk'
import { CheckResult } from '../types'
import path from 'path'

/**
 * 控制台报告器 - 彩色输出检查结果
 */
export class ConsoleReporter {
  private errors: CheckResult[] = []
  private warnings: CheckResult[] = []

  add(result: CheckResult) {
    if (result.type === 'error') {
      this.errors.push(result)
    } else {
      this.warnings.push(result)
    }
  }

  addAll(results: CheckResult[]) {
    results.forEach(r => this.add(r))
  }

  print(rootDir: string) {
    console.log('\n')
    console.log(chalk.bold('📋 规范检查报告'))
    console.log(chalk.gray('='.repeat(60)))
    console.log('')

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(chalk.green('✓ 所有文件符合规范！'))
      return
    }

    // 按文件分组
    const grouped = this.groupByFile([...this.errors, ...this.warnings], rootDir)

    Object.entries(grouped).forEach(([file, results]) => {
      const relativePath = path.relative(rootDir, file)
      console.log(chalk.cyan.bold(`\n${relativePath}`))
      
      results.forEach(result => {
        const icon = result.type === 'error' ? chalk.red('✖') : chalk.yellow('⚠')
        const location = result.line ? `:${result.line}` : ''
        const rule = chalk.gray(`[${result.rule}]`)
        
        console.log(`  ${icon} ${result.message} ${rule}${location}`)
      })
    })

    console.log('')
    console.log(chalk.gray('='.repeat(60)))
    
    const summary = [
      this.errors.length > 0 ? chalk.red(`${this.errors.length} 个错误`) : null,
      this.warnings.length > 0 ? chalk.yellow(`${this.warnings.length} 个警告`) : null
    ].filter(Boolean).join(', ')

    console.log(chalk.bold(`\n总计: ${summary}\n`))

    if (this.errors.length > 0) {
      console.log(chalk.red.bold('❌ 构建失败：发现规范错误，请修复后重试'))
    } else if (this.warnings.length > 0) {
      console.log(chalk.yellow.bold('⚠️  构建警告：建议修复这些问题以提升代码质量'))
    }

    console.log('')
  }

  private groupByFile(results: CheckResult[], rootDir: string): Record<string, CheckResult[]> {
    const grouped: Record<string, CheckResult[]> = {}
    
    results.forEach(result => {
      if (!grouped[result.file]) {
        grouped[result.file] = []
      }
      grouped[result.file].push(result)
    })

    // 按文件路径排序
    return Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key]
        return acc
      }, {} as Record<string, CheckResult[]>)
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0
  }

  getErrorCount(): number {
    return this.errors.length
  }

  getWarningCount(): number {
    return this.warnings.length
  }
}
