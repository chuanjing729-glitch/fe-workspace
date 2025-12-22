import { RuleChecker, CheckResult } from '../types'

/**
 * 最佳实践规则检查器
 * 检测常见的不良编程实践
 */
export const bestPracticeRule: RuleChecker = {
  name: '最佳实践检查',
  description: '检测常见的不良编程实践，如不安全的深拷贝、console调试、var关键字等',
  
  check(filePath: string, content: string): CheckResult[] {
    const results: CheckResult[] = []

    // 只检查 JS/TS/Vue 文件
    if (!filePath.match(/\.(js|ts|jsx|tsx|vue)$/)) {
      return results
    }

    const lines = content.split('\n')

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // 1. 检测不安全的深拷贝：JSON.parse(JSON.stringify())
      if (line.includes('JSON.parse') && line.includes('JSON.stringify')) {
        results.push({
          rule: '最佳实践检查',
          type: 'warning',
          message: '不建议使用 JSON.parse(JSON.stringify()) 进行深拷贝',
          suggestion: '使用 @51jbs/core-utils 的 deepClone() 方法，避免循环引用和函数丢失问题',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 2. 检测 console.log（生产环境应移除）
      if (line.match(/console\.(log|info|debug|warn)\s*\(/)) {
        // 排除注释中的 console
        if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          results.push({
            rule: '最佳实践检查',
            type: 'warning',
            message: '代码中包含 console 调试语句',
            suggestion: '生产环境应移除 console 语句，或使用统一的日志工具',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 3. 检测 var 关键字（应使用 let/const）
      if (line.match(/\bvar\s+\w+/)) {
        if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          results.push({
            rule: '最佳实践检查',
            type: 'warning',
            message: '使用了 var 关键字',
            suggestion: '使用 let 或 const 替代 var，避免变量提升问题',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 4. 检测 == 和 !=（应使用 === 和 !==）
      if (line.match(/[^=!]==[^=]|[^!]!=[^=]/)) {
        if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          results.push({
            rule: '最佳实践检查',
            type: 'warning',
            message: '使用了非严格相等比较',
            suggestion: '使用 === 或 !== 进行严格相等比较',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 5. 检测 setTimeout/setInterval 未清理
      if (line.match(/setTimeout|setInterval/) && !content.includes('clearTimeout') && !content.includes('clearInterval')) {
        results.push({
          rule: '最佳实践检查',
          type: 'warning',
          message: '使用了 setTimeout/setInterval 但未找到清理代码',
          suggestion: '确保在组件销毁时清理定时器，避免内存泄漏',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 6. 检测直接修改 props（Vue）
      if (line.match(/this\.\$props\.\w+\s*=/)) {
        results.push({
          rule: '最佳实践检查',
          type: 'error',
          message: '直接修改 props',
          suggestion: 'props 应该是只读的，使用 data 或 computed 处理数据',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 7. 检测大数字直接运算（精度问题）
      if (line.match(/\d+\.\d+\s*[\+\-\*\/]\s*\d+\.\d+/)) {
        results.push({
          rule: '最佳实践检查',
          type: 'warning',
          message: '浮点数直接运算可能导致精度问题',
          suggestion: '使用 @51jbs/core-utils 的 precision 方法或 decimal.js 进行精确计算',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 8. 检测未使用 async/await（Promise 链过长）
      const promiseChainMatch = line.match(/\.then\(.*\.then\(.*\.then\(/g)
      if (promiseChainMatch) {
        results.push({
          rule: '最佳实践检查',
          type: 'warning',
          message: 'Promise 链过长',
          suggestion: '使用 async/await 替代多层 .then()，提升代码可读性',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 9. 检测硬编码的魔法数字
      if (line.match(/\b(if|while|for).*[>\<]\s*\d{2,}\b/) && !line.includes('length')) {
        results.push({
          rule: '最佳实践检查',
          type: 'warning',
          message: '使用了魔法数字',
          suggestion: '将数字提取为常量，增强代码可维护性',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 10. 检测未处理的 Promise
      if (line.match(/new Promise\(/) && !line.includes('.then') && !line.includes('.catch') && !line.includes('await')) {
        results.push({
          rule: '最佳实践检查',
          type: 'warning',
          message: 'Promise 未处理',
          suggestion: '确保 Promise 有 .catch() 或 try/catch 处理错误',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }
    })

    return results
  }
}
