import * as ts from 'typescript'
import { RuleChecker, CheckResult, PluginOptions } from '../types'
import { ASTHelper } from '../utils/ast-helper'

/**
 * 事件规范检查模块
 * 
 * 检查项：
 * 1. Vue2 事件命名规范 (P1)
 * 2. Vue2 自定义事件参数规范 (P0)
 * 3. Vue2 事件监听器清理检查 (P0)
 * 4. JavaScript 事件监听器清理检查 (P0)
 * 5. JavaScript 事件处理函数命名规范 (P1)
 * 6. 事件对象使用规范 (P1)
 * 7. 阻止默认行为检查 (P1)
 * 8. 事件委托建议 (P2)
 */
export const eventRule: RuleChecker = {
  name: 'event',
  description: '事件规范检查（Vue2 + JavaScript）',

  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []

    // 只检查 Vue 和 JavaScript 文件
    if (!/\.(vue|js|jsx|ts|tsx)$/.test(filePath)) {
      return results
    }

    if (filePath.endsWith('.vue')) {
      // Vue2 事件规范检查
      results.push(...checkVueEventNaming(filePath, content))
      results.push(...checkVueCustomEventParams(filePath, content))
      results.push(...checkVueEventListenerCleanup(filePath, content))
      results.push(...checkVueEventModifiers(filePath, content))
      results.push(...checkVueVagueEventNames(filePath, content))
    }

    // JavaScript 事件规范检查（包括 Vue script 部分）
    const scriptContent = filePath.endsWith('.vue')
      ? (content.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] || '')
      : content

    if (scriptContent) {
      results.push(...checkJsEventListenerCleanup(filePath, content, scriptContent))
      results.push(...checkJsEventHandlerNaming(filePath, content, scriptContent))
      results.push(...checkEventObjectUsage(filePath, content, scriptContent))
      results.push(...checkEventDelegation(filePath, content, scriptContent))
    }

    return results
  }
}

/**
 * Vue2: 检查事件命名规范 (P1)
 * 推荐使用 kebab-case，避免驼峰命名
 */
function checkVueEventNaming(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
  if (!templateMatch) return results

  const template = templateMatch[1]
  const templateStartIndex = content.indexOf(templateMatch[0])

  // 匹配 @eventName 或 v-on:eventName
  const eventPattern = /@([a-z][a-zA-Z0-9]*)|v-on:([a-z][a-zA-Z0-9]*)/g
  let match

  while ((match = eventPattern.exec(template)) !== null) {
    const eventName = match[1] || match[2]

    // 检查是否使用了驼峰命名（排除原生事件）
    const nativeEvents = ['click', 'change', 'input', 'submit', 'focus', 'blur', 'keyup', 'keydown', 'mouseenter', 'mouseleave']
    if (nativeEvents.includes(eventName)) continue

    if (/[A-Z]/.test(eventName)) {
      const position = templateStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'event/vue-event-naming',
        message: `Vue 自定义事件应使用 kebab-case 命名，不应使用驼峰：${eventName}`,
        file: filePath,
        type: 'warning',
        line
      })
    }
  }

  return results
}

/**
 * Vue2: 检查自定义事件参数规范 (P0)
 * $emit 应该有明确的参数说明
 */
function checkVueCustomEventParams(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return results

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 匹配 this.$emit('event-name')
  const emitPattern = /this\.\$emit\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  let match

  while ((match = emitPattern.exec(script)) !== null) {
    const eventName = match[1]
    const fullMatch = match[0]

    // 检查是否有参数（简单检测，只检测是否有第二个参数）
    if (!fullMatch.includes(',')) {
      const position = scriptStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'event/vue-emit-params',
        message: `自定义事件 "${eventName}" 建议传递明确的数据参数`,
        file: filePath,
        type: 'warning',
        line
      })
    }
  }

  return results
}

/**
 * Vue2: 检查事件监听器清理 (P0)
 * 使用 addEventListener 添加的事件必须在 beforeDestroy 中移除
 */
function checkVueEventListenerCleanup(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return results

  const script = scriptMatch[1]
  const sourceFile = ASTHelper.parse(script, filePath)

  let hasAddEventListener = false
  let hasBeforeDestroy = false
  let hasRemoveEventListener = false

  ASTHelper.traverse(sourceFile, node => {
    // 检查是否有 addEventListener
    if (ts.isCallExpression(node) && node.expression.getText().endsWith('addEventListener')) {
      hasAddEventListener = true
    }

    // 检查是否有 removeEventListener
    if (ts.isCallExpression(node) && node.expression.getText().endsWith('removeEventListener')) {
      hasRemoveEventListener = true
    }

    // 检查是否有 beforeDestroy 或 beforeUnmount 生命周期
    if (ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) {
      const name = node.name.getText()
      if (['beforeDestroy', 'beforeUnmount', 'onBeforeUnmount'].includes(name)) {
        hasBeforeDestroy = true
      }
    }
  })

  if (hasAddEventListener && !(hasBeforeDestroy || hasRemoveEventListener)) {
    results.push({
      rule: 'event/vue-listener-cleanup',
      message: '使用 addEventListener 添加的事件监听器必须在 beforeDestroy/beforeUnmount 中移除，否则会导致内存泄漏',
      file: filePath,
      type: 'error',
      line: 1
    })
  }

  return results
}

/**
 * Vue2: 检查事件修饰符使用 (P1)
 * 推荐使用 .prevent、.stop 等修饰符，而不是在方法中调用
 */
function checkVueEventModifiers(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return results

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 查找方法中的 event.preventDefault() 或 event.stopPropagation()
  const preventDefaultPattern = /(\w+)\.preventDefault\s*\(\s*\)/g
  const stopPropagationPattern = /(\w+)\.stopPropagation\s*\(\s*\)/g

  let match
  while ((match = preventDefaultPattern.exec(script)) !== null) {
    const eventVar = match[1]
    if (eventVar === 'event' || eventVar === 'e' || eventVar === 'evt') {
      const position = scriptStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'event/vue-prefer-modifiers',
        message: '建议在模板中使用 .prevent 修饰符，而不是在方法中调用 preventDefault()',
        file: filePath,
        type: 'warning',
        line
      })
    }
  }

  while ((match = stopPropagationPattern.exec(script)) !== null) {
    const eventVar = match[1]
    if (eventVar === 'event' || eventVar === 'e' || eventVar === 'evt') {
      const position = scriptStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'event/vue-prefer-modifiers',
        message: '建议在模板中使用 .stop 修饰符，而不是在方法中调用 stopPropagation()',
        file: filePath,
        type: 'warning',
        line
      })
    }
  }

  return results
}

/**
 * Vue2: 检查模糊事件命名 (P1)
 * 避免使用 handleClick、onChange 等模糊名称
 */
function checkVueVagueEventNames(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return results

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 模糊的事件名称
  const vagueEvents = ['click', 'change', 'input', 'action', 'event', 'handle']

  // 匹配自定义事件 $emit
  const emitPattern = /this\.\$emit\s*\(\s*['"]([^'"]+)['"]/g
  let match

  while ((match = emitPattern.exec(script)) !== null) {
    const eventName = match[1]

    // 检查事件名是否过于模糊
    if (vagueEvents.some(vague => eventName === vague || eventName === `on-${vague}`)) {
      const position = scriptStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'event/vue-specific-event-name',
        message: `事件名 "${eventName}" 过于模糊，建议使用更具体的名称（如 "submit-form"、"update-user" 等）`,
        file: filePath,
        type: 'warning',
        line
      })
    }
  }

  return results
}

/**
 * JavaScript: 检查事件监听器清理 (P0)
 * addEventListener 必须有对应的 removeEventListener
 */
function checkJsEventListenerCleanup(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  const sourceFile = ASTHelper.parse(scriptContent, filePath)

  const addedListeners: Array<{ element: string, event: string, handler: string, node: ts.Node }> = []
  const removedListeners: Array<{ element: string, event: string, handler: string }> = []

  ASTHelper.traverse(sourceFile, node => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const methodName = node.expression.name.getText()
      const objectName = node.expression.expression.getText()

      if (methodName === 'addEventListener' && node.arguments.length >= 2) {
        addedListeners.push({
          element: objectName,
          event: node.arguments[0].getText().replace(/['"]/g, ''),
          handler: node.arguments[1].getText().trim(),
          node: node
        })
      } else if (methodName === 'removeEventListener' && node.arguments.length >= 2) {
        removedListeners.push({
          element: objectName,
          event: node.arguments[0].getText().replace(/['"]/g, ''),
          handler: node.arguments[1].getText().trim()
        })
      }
    }
  })

  // 检查每个添加的监听器是否有对应的移除
  for (const added of addedListeners) {
    const hasRemove = removedListeners.some(removed =>
      removed.element === added.element &&
      removed.event === added.event &&
      removed.handler === added.handler
    )

    if (!hasRemove) {
      const line = ASTHelper.getLine(added.node, sourceFile)

      results.push({
        rule: 'event/js-listener-cleanup',
        message: `事件监听器 ${added.element}.addEventListener('${added.event}', ...) 没有对应的 removeEventListener，可能导致内存泄漏`,
        file: filePath,
        type: 'error',
        line
      })
    }
  }

  return results
}

/**
 * JavaScript: 检查事件处理函数命名规范 (P1)
 * 推荐使用 handle* 或 on* 前缀
 */
function checkJsEventHandlerNaming(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  const sourceFile = ASTHelper.parse(scriptContent, filePath)

  ASTHelper.traverse(sourceFile, node => {
    let funcName: string | undefined
    let parameters: ts.NodeArray<ts.ParameterDeclaration> | undefined

    if (ts.isFunctionDeclaration(node) && node.name) {
      funcName = node.name.getText()
      parameters = node.parameters
    } else if (ts.isVariableDeclaration(node) && node.initializer &&
      (ts.isFunctionExpression(node.initializer) || ts.isArrowFunction(node.initializer))) {
      funcName = node.name.getText()
      parameters = node.initializer.parameters
    } else if (ts.isMethodDeclaration(node)) {
      funcName = node.name.getText()
      parameters = node.parameters
    }

    if (funcName && parameters) {
      // 判断是否为事件处理函数：依据是参数中包含 event/e/evt
      const isEventHandler = parameters.some(p => {
        const pName = p.name.getText()
        return ['event', 'e', 'evt'].includes(pName)
      })

      if (isEventHandler && !/^(handle|on)[A-Z]/.test(funcName)) {
        // 排除 Vue 生命周期等内置方法
        const builtInMethods = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed', 'data', 'setup']
        if (!builtInMethods.includes(funcName)) {
          results.push({
            rule: 'event/js-handler-naming',
            message: `事件处理函数 "${funcName}" 建议使用 handle* 或 on* 前缀命名（如 handleClick、onSubmit）`,
            file: filePath,
            type: 'warning',
            line: ASTHelper.getLine(node, sourceFile)
          })
        }
      }
    }
  })

  return results
}

/**
 * JavaScript: 检查事件对象使用规范 (P1)
 * 建议统一使用 event 而不是 e、evt 等缩写
 */
function checkEventObjectUsage(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  const sourceFile = ASTHelper.parse(scriptContent, filePath)

  ASTHelper.traverse(sourceFile, node => {
    if (ts.isParameter(node)) {
      const paramName = node.name.getText()
      if (paramName === 'e' || paramName === 'evt') {
        results.push({
          rule: 'event/prefer-event-name',
          message: `事件参数建议使用完整的 "event" 而不是缩写 "${paramName}"，提高代码可读性`,
          file: filePath,
          type: 'warning',
          line: ASTHelper.getLine(node, sourceFile)
        })
      }
    }
  })

  return results
}

/**
 * JavaScript: 检查事件委托 (P2)
 * 当有多个相同事件监听器时，建议使用事件委托
 */
function checkEventDelegation(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []

  // 统计相同事件的监听器数量
  const eventCounts: Map<string, number> = new Map()
  const addPattern = /\.addEventListener\s*\(\s*['"]([^'"]+)['"]/g
  let match

  while ((match = addPattern.exec(scriptContent)) !== null) {
    const eventType = match[1]
    eventCounts.set(eventType, (eventCounts.get(eventType) || 0) + 1)
  }

  // 如果同一事件类型监听器超过 3 个，建议使用事件委托
  for (const [eventType, count] of eventCounts.entries()) {
    if (count >= 3) {
      results.push({
        rule: 'event/prefer-delegation',
        message: `检测到 ${count} 个 "${eventType}" 事件监听器，建议使用事件委托优化性能`,
        file: filePath,
        type: 'warning',
        line: 1
      })
    }
  }

  return results
}
