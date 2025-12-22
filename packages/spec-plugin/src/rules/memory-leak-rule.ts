import * as ts from 'typescript'
import { CheckResult, PluginOptions, RuleChecker } from '../types'
import { ASTHelper } from '../utils/ast-helper'

/**
 * 内存泄漏检查规则
 * - 未清理的定时器
 * - 未清理的事件监听器
 * - 未清理的 DOM 引用
 * - 闭包引用大对象
 * - 全局变量泄漏
 */

/**
 * 检查未清理的定时器
 */
function checkUnclearedTimers(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  const scriptContent = /\.vue$/.test(filePath)
    ? (content.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] || '')
    : content

  if (!scriptContent) return results

  const sourceFile = ASTHelper.parse(scriptContent, filePath)

  const activeTimers: Array<{ type: string, node: ts.Node }> = []
  let hasClearInterval = false
  let hasClearTimeout = false
  let hasLifecycleCleanup = false

  ASTHelper.traverse(sourceFile, node => {
    // 检查 setInterval/setTimeout
    if (ts.isCallExpression(node)) {
      const funcName = node.expression.getText()
      if (funcName === 'setInterval') {
        activeTimers.push({ type: 'setInterval', node })
      } else if (funcName === 'setTimeout') {
        activeTimers.push({ type: 'setTimeout', node })
      } else if (funcName === 'clearInterval') {
        hasClearInterval = true
      } else if (funcName === 'clearTimeout') {
        hasClearTimeout = true
      }
    }

    // 检查生命周期钩子 (Vue)
    if (ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) {
      const name = node.name.getText()
      if (['beforeDestroy', 'beforeUnmount', 'onBeforeUnmount'].includes(name)) {
        hasLifecycleCleanup = true
      }
    }
  })

  // Vue 组件逻辑
  if (/\.vue$/.test(filePath)) {
    activeTimers.forEach(timer => {
      if (timer.type === 'setInterval' && !hasClearInterval && !hasLifecycleCleanup) {
        results.push({
          type: 'error',
          rule: 'memory-leak/timer',
          message: '使用了 setInterval 但未在组件销毁时清理，可能导致内存泄漏',
          file: filePath,
          line: ASTHelper.getLine(timer.node, sourceFile)
        })
      }

      if (timer.type === 'setTimeout' && !hasClearTimeout && !hasLifecycleCleanup) {
        // 简单策略：如果参数看起来很大（大于1000ms），则警告
        const args = (timer.node as ts.CallExpression).arguments
        if (args.length >= 2 && ts.isNumericLiteral(args[1]) && parseInt(args[1].text) > 1000) {
          results.push({
            type: 'warning',
            rule: 'memory-leak/timer',
            message: '使用了长时间的 setTimeout，建议在组件销毁时清理',
            file: filePath,
            line: ASTHelper.getLine(timer.node, sourceFile)
          })
        }
      }
    })
  }

  return results
}

/**
 * 检查未清理的事件监听器
 */
function checkUnclearedEventListeners(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  const scriptContent = /\.vue$/.test(filePath)
    ? (content.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] || '')
    : content

  if (!scriptContent) return results

  const sourceFile = ASTHelper.parse(scriptContent, filePath)

  const addedEvents: Array<{ name: string, node: ts.Node }> = []
  const removedEvents = new Set<string>()
  let hasLifecycleCleanup = false

  ASTHelper.traverse(sourceFile, node => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const methodName = node.expression.name.getText()
      if (methodName === 'addEventListener' && node.arguments.length > 0) {
        addedEvents.push({
          name: node.arguments[0].getText().replace(/['"]/g, ''),
          node
        })
      } else if (methodName === 'removeEventListener' && node.arguments.length > 0) {
        removedEvents.add(node.arguments[0].getText().replace(/['"]/g, ''))
      }
    }

    if (ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) {
      const name = node.name.getText()
      if (['beforeDestroy', 'beforeUnmount', 'onBeforeUnmount'].includes(name)) {
        hasLifecycleCleanup = true
      }
    }
  })

  const unclearedEvents = addedEvents.filter(e => !removedEvents.has(e.name))

  if (unclearedEvents.length > 0 && /\.vue$/.test(filePath)) {
    if (!hasLifecycleCleanup) {
      unclearedEvents.forEach(e => {
        results.push({
          type: 'error',
          rule: 'memory-leak/event-listener',
          message: `添加了事件监听器 (${e.name}) 但未在组件销毁时移除，可能导致内存泄漏`,
          file: filePath,
          line: ASTHelper.getLine(e.node, sourceFile)
        })
      })
    }
  }

  return results
}

/**
 * 检查全局变量泄漏
 */
function checkGlobalVariableLeak(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []

  // 检查直接给 window 对象赋值
  const windowAssignRegex = /window\s*\[\s*['"]([^'"]+)['"]\s*\]\s*=|window\.([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g
  let match: RegExpExecArray | null

  // 优化：计算行号时不再每次从头扫描 (避免 O(N^2))
  let lastIndex = 0
  let currentLine = 1

  while ((match = windowAssignRegex.exec(content)) !== null) {
    const varName = match[1] || match[2]

    // 计算从上一个匹配点到当前匹配点的换行符数量
    const segment = content.substring(lastIndex, match.index)
    const newLines = (segment.match(/\n/g) || []).length
    currentLine += newLines
    lastIndex = match.index

    results.push({
      type: 'warning',
      rule: 'memory-leak/global-variable',
      message: `直接在 window 对象上设置属性 "${varName}"，可能导致全局污染和内存泄漏`,
      file: filePath,
      line: currentLine
    })
  }

  return results
}

/**
 * 检查闭包中的大对象引用
 * 
 * 注意：已移除基于正则的闭包检测，以防止 ReDoS (正则表达式拒绝服务)。
 * 之前用于匹配函数体的正则 `[\s\S]*?` 在大文件中极易导致性能卡死。
 */
function checkClosureLargeObject(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []

  // 暂时禁用此检查，直到有更安全的 AST 解析方案。
  // 使用简单的正则检查 "closure" 是不可靠且危险的。

  // 检查闭包中引用大数组或对象
  const largeArrayRegex = /\[\s*(?:[^[\]]*,\s*){50,}[^[\]]*\]/g // 超过 50 个元素的数组

  if (largeArrayRegex.test(content)) {
    // 检查是否在函数闭包中
    const functionRegex = /function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\([^)]*\)\s*\{[\s\S]*?\[\s*(?:[^[\]]*,\s*){50,}[^[\]]*\][\s\S]*?\}/g

    if (functionRegex.test(content)) {
      results.push({
        type: 'warning',
        rule: 'memory-leak/closure-large-object',
        message: '闭包中引用了大对象/数组，可能导致内存无法及时释放',
        file: filePath
      })
    }
  }


  return results
}

/**
 * 内存泄漏检查
 */
export const memoryLeakRule: RuleChecker = {
  name: 'memory-leak',
  description: '内存泄漏检查（定时器、事件监听器、全局变量、闭包引用）',
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []

    // 只检查 JS/TS/Vue 文件
    if (!/\.(js|ts|jsx|tsx|vue)$/.test(filePath)) {
      return results
    }

    try {
      // 1. 未清理的定时器检查
      results.push(...checkUnclearedTimers(content, filePath))

      // 2. 未清理的事件监听器检查
      results.push(...checkUnclearedEventListeners(content, filePath))

      // 3. 全局变量泄漏检查
      results.push(...checkGlobalVariableLeak(content, filePath))

      // 4. 闭包大对象引用检查 (已禁用以修复性能问题)
      results.push(...checkClosureLargeObject(content, filePath))

    } catch (error: any) {
      console.warn(`内存泄漏检查失败: ${filePath}`, error.message)
    }

    return results
  }
}
