import { CheckResult, PluginOptions, RuleChecker } from '../types'

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
  
  // 检查是否使用了 setTimeout/setInterval 但没有清理
  const setTimeoutRegex = /\bsetTimeout\s*\(/g
  const setIntervalRegex = /\bsetInterval\s*\(/g
  const clearTimeoutRegex = /\bclearTimeout\s*\(/g
  const clearIntervalRegex = /\bclearInterval\s*\(/g
  
  const hasSetTimeout = setTimeoutRegex.test(content)
  const hasSetInterval = setIntervalRegex.test(content)
  const hasClearTimeout = clearTimeoutRegex.test(content)
  const hasClearInterval = clearIntervalRegex.test(content)
  
  // Vue 组件中检查
  if (/\.vue$/.test(filePath)) {
    if (hasSetInterval && !hasClearInterval) {
      // 检查是否在 beforeUnmount/beforeDestroy 中清理
      if (!/beforeUnmount|beforeDestroy|onBeforeUnmount/.test(content)) {
        results.push({
          type: 'error',
          rule: 'memory-leak/timer',
          message: '使用了 setInterval 但未在组件销毁时清理，可能导致内存泄漏',
          file: filePath
        })
      }
    }
    
    if (hasSetTimeout && !hasClearTimeout) {
      // setTimeout 通常不需要清理，但如果在长时间运行的组件中使用，建议清理
      if (content.match(/setTimeout.*\d{4,}/)) { // 超过 1000ms 的定时器
        results.push({
          type: 'warning',
          rule: 'memory-leak/timer',
          message: '使用了长时间的 setTimeout，建议在组件销毁时清理',
          file: filePath
        })
      }
    }
  }
  
  return results
}

/**
 * 检查未清理的事件监听器
 */
function checkUnclearedEventListeners(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  const addEventListenerRegex = /addEventListener\s*\(['"]([^'"]+)['"]/g
  const removeEventListenerRegex = /removeEventListener\s*\(['"]([^'"]+)['"]/g
  
  const addedEvents = new Set<string>()
  const removedEvents = new Set<string>()
  
  let match: RegExpExecArray | null
  
  // 收集添加的事件
  while ((match = addEventListenerRegex.exec(content)) !== null) {
    addedEvents.add(match[1])
  }
  
  // 收集移除的事件
  while ((match = removeEventListenerRegex.exec(content)) !== null) {
    removedEvents.add(match[1])
  }
  
  // 检查是否有未移除的事件
  const unclearedEvents = [...addedEvents].filter(event => !removedEvents.has(event))
  
  if (unclearedEvents.length > 0 && /\.vue$/.test(filePath)) {
    // 检查是否在生命周期钩子中清理
    if (!/beforeUnmount|beforeDestroy|onBeforeUnmount/.test(content)) {
      results.push({
        type: 'error',
        rule: 'memory-leak/event-listener',
        message: `添加了事件监听器 (${unclearedEvents.join(', ')}) 但未在组件销毁时移除，可能导致内存泄漏`,
        file: filePath
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
  
  while ((match = windowAssignRegex.exec(content)) !== null) {
    const varName = match[1] || match[2]
    const line = content.substring(0, match.index).split('\n').length
    
    results.push({
      type: 'warning',
      rule: 'memory-leak/global-variable',
      message: `直接在 window 对象上设置属性 "${varName}"，可能导致全局污染和内存泄漏`,
      file: filePath,
      line
    })
  }
  
  return results
}

/**
 * 检查闭包中的大对象引用
 */
function checkClosureLargeObject(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
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
      
      // 4. 闭包大对象引用检查
      results.push(...checkClosureLargeObject(content, filePath))
      
    } catch (error: any) {
      console.warn(`内存泄漏检查失败: ${filePath}`, error.message)
    }
    
    return results
  }
}
