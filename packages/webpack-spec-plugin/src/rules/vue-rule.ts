import { RuleChecker, CheckResult, PluginOptions } from '../types'

/**
 * Vue 开发规范检查
 * 
 * 检查项：
 * 1. v-for 必须使用 key (P0)
 * 2. 禁止使用 index 作为 key (P1)
 * 3. Props 类型检查 (P0)
 * 4. Props 禁止直接修改 (P0)
 * 5. 生命周期拼写检查 (P0)
 * 6. 组件大小限制 (P1)
 * 7. 事件命名规范 (P1)
 */
export const vueRule: RuleChecker = {
  name: 'vue',
  description: 'Vue 开发规范检查',

  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
   
    // 只检查 Vue 文件
    if (!filePath.endsWith('.vue')) {
      return results
    }

    // 1. v-for key 检查 (P0)
    results.push(...checkVForKey(filePath, content))

    // 2. Props 类型检查 (P0)
    results.push(...checkPropsType(filePath, content))

    // 3. Props 禁止修改 (P0)
    results.push(...checkPropsMutation(filePath, content))

    // 4. 生命周期拼写检查 (P0)
    results.push(...checkLifecycleSpelling(filePath, content))

    // 5. 组件大小限制 (P1)
    results.push(...checkComponentSize(filePath, content))

    // 6. 事件命名规范 (P1)
    results.push(...checkEventNaming(filePath, content))

    // 7. 组件命名规范 (P0)
    results.push(...checkComponentNaming(filePath, content))

    // 8. data 必须是函数 (P0)
    results.push(...checkDataFunction(filePath, content))

    // 9. 数组/对象默认值检查 (P0)
    results.push(...checkPropsDefaultFactory(filePath, content))

    // 10. v-if 和 v-for 同时使用检查 (P0)
    results.push(...checkVIfWithVFor(filePath, content))

    // 11. scoped 样式检查 (P1)
    results.push(...checkScopedStyle(filePath, content))

    // 12. beforedestory 拼写错误检查 (P0)
    results.push(...checkBeforeDestoryTypo(filePath, content))

    return results
  }
}

/**
 * 检查 v-for 是否使用 key (P0)
 */
function checkVForKey(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  // 提取 template 部分
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
  if (!templateMatch) {
    return results
  }

  const template = templateMatch[1]
  const templateStartIndex = content.indexOf(templateMatch[0])

  // 匹配 v-for 指令
  const vForPattern = /<(\w+)[^>]*\sv-for\s*=\s*["']([^"']+)["'][^>]*>/g
  let match

  while ((match = vForPattern.exec(template)) !== null) {
    const tag = match[0]
    const vForExpression = match[2]

    // 检查是否有 :key 或 v-bind:key
    const hasKey = /:key\s*=/.test(tag) || /v-bind:key\s*=/.test(tag)

    if (!hasKey) {
      const position = templateStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'vue/v-for-key',
        message: 'v-for 必须使用 :key 属性',
        file: filePath,
        type: 'error',
        line
      })
    } else {
      // 检查是否使用 index 作为 key
      const keyMatch = tag.match(/:key\s*=\s*["']([^"']+)["']/)
      if (keyMatch) {
        const keyValue = keyMatch[1]

        // 检测 index 或 (item, index) 中的 index
        if (keyValue === 'index' || /,\s*index\s*$/.test(vForExpression) && keyValue.includes('index')) {
          const position = templateStartIndex + match.index
          const lines = content.substring(0, position).split('\n')
          const line = lines.length

          results.push({
            rule: 'vue/v-for-key-index',
            message: '不建议使用 index 作为 v-for 的 key（当列表可能变化时）',
            file: filePath,
            type: 'warning',
            line
          })
        }
      }
    }
  }

  return results
}

/**
 * 检查 Props 类型定义 (P0)
 */
function checkPropsType(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  // 提取 script 部分
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    return results
  }

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 查找 props 定义
  const propsMatch = script.match(/props\s*:\s*\{([\s\S]*?)\n\s*\}/m)
  if (!propsMatch) {
    return results
  }

  const propsContent = propsMatch[1]
  const propsStartIndex = scriptStartIndex + script.indexOf(propsMatch[0])

  // 检查简写形式（如 userId: String）
  const simplePropPattern = /(\w+)\s*:\s*(String|Number|Boolean|Array|Object|Function|Date|Symbol)\s*,?/g
  let match

  while ((match = simplePropPattern.exec(propsContent)) !== null) {
    const propName = match[1]
    const propType = match[2]

    // 检查是否在对象内部（完整定义）
    const beforeProp = propsContent.substring(0, match.index)
    const afterProp = propsContent.substring(match.index + match[0].length)

    // 如果前面有 type: 说明是完整定义的一部分，跳过
    if (/type\s*:\s*$/.test(beforeProp.trim())) {
      continue
    }

    const position = propsStartIndex + match.index
    const lines = content.substring(0, position).split('\n')
    const line = lines.length

    results.push({
      rule: 'vue/props-type-definition',
      message: `prop "${propName}" 应该使用完整的类型定义`,
      file: filePath,
      type: 'error',
      line
    })
  }

  return results
}

/**
 * 检查 Props 是否被直接修改 (P0)
 */
function checkPropsMutation(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  // 提取 script 部分
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    return results
  }

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 提取 props 名称
  const propsMatch = script.match(/props\s*:\s*\{([\s\S]*?)\n\s*\}/m)
  if (!propsMatch) {
    return results
  }

  const propsContent = propsMatch[1]
  const propNames: string[] = []

  const propNamePattern = /(\w+)\s*:/g
  let match

  while ((match = propNamePattern.exec(propsContent)) !== null) {
    const propName = match[1]
    // 排除 type, required, default, validator 等关键字
    if (!['type', 'required', 'default', 'validator'].includes(propName)) {
      propNames.push(propName)
    }
  }

  // 在 methods 中查找直接修改 prop 的代码
  for (const propName of propNames) {
    // 匹配 this.propName = 或 this.propName.xxx =
    const mutationPattern = new RegExp(`this\\.${propName}\\s*=`, 'g')

    while ((match = mutationPattern.exec(script)) !== null) {
      const position = scriptStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'vue/no-mutate-props',
        message: `禁止直接修改 prop "${propName}"`,
        file: filePath,
        type: 'error',
        line
      })
    }
  }

  return results
}

/**
 * 检查生命周期钩子拼写 (P0)
 */
function checkLifecycleSpelling(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  // 提取 script 部分
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    return results
  }

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 常见错误拼写映射
  const misspellings: Record<string, string> = {
    'beforedestory': 'beforeDestroy',
    'beforedestroy': 'beforeDestroy',
    'destoryed': 'destroyed',
    'destory': 'destroy',
    'beforemount': 'beforeMount',
    'beforeupdate': 'beforeUpdate',
    'beforecreate': 'beforeCreate'
  }

  // 检查每个常见错误拼写
  for (const [wrong, correct] of Object.entries(misspellings)) {
    const pattern = new RegExp(`\\b${wrong}\\s*\\(`, 'gi')
    let match

    while ((match = pattern.exec(script)) !== null) {
      const matchName = match[0].trim().slice(0, -1)

      // 如果拼写完全正确（区分大小写），则跳过
      if (matchName === correct) {
        continue
      }

      const position = scriptStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'vue/lifecycle-spelling',
        message: `生命周期钩子拼写错误："${matchName}" 应该是 "${correct}"`,
        file: filePath,
        type: 'error',
        line
      })
    }
  }

  return results
}

/**
 * 检查组件大小 (P1)
 */
function checkComponentSize(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const lines = content.split('\n')
  const totalLines = lines.length
  const MAX_LINES = 300

  if (totalLines > MAX_LINES) {
    results.push({
      rule: 'vue/max-component-lines',
      message: `组件代码过长 (${totalLines} 行，建议 ≤ ${MAX_LINES} 行)`,
      file: filePath,
      type: 'warning',
      line: 1
    })
  }

  return results
}

/**
 * 检查事件命名规范 (P1)
 */
function checkEventNaming(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  // 提取 script 部分
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    return results
  }

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 匹配 $emit 调用
  const emitPattern = /\$emit\s*\(\s*['"]([^'"]+)['"]/g
  let match

  const vagueEvents = ['click', 'change', 'input', 'action', 'event', 'handle']

  while ((match = emitPattern.exec(script)) !== null) {
    const eventName = match[1]

    // 检查是否是模糊的事件名
    if (vagueEvents.includes(eventName)) {
      const position = scriptStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'vue/specific-event-names',
        message: `事件名 "${eventName}" 过于模糊，建议使用更具体的名称`,
        file: filePath,
        type: 'warning',
        line
      })
    }
  }

  return results
}

/**
 * 检查组件命名规范 (P0)
 * 组件名必须是多个单词（避免与 HTML 元素冲突）
 */
function checkComponentNaming(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    return results
  }

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 匹配name 属性
  const nameMatch = script.match(/name\s*:\s*['"]([^'"]+)['"]/)
  if (!nameMatch) {
    return results
  }

  const componentName = nameMatch[1]

  // 检查是否是多个单词（PascalCase 或至少有连字符/下划线）
  const hasMultipleWords = /[A-Z][a-z]+[A-Z]/.test(componentName) || /-|_/.test(componentName)

  if (!hasMultipleWords) {
    const position = scriptStartIndex + script.indexOf(nameMatch[0])
    const lines = content.substring(0, position).split('\n')
    const line = lines.length

    results.push({
      rule: 'vue/multi-word-component-names',
      message: `组件名 "${componentName}" 应使用多个单词（避免与 HTML 元素冲突）`,
      file: filePath,
      type: 'error',
      line
    })
  }

  // 检查命名格式是否是 PascalCase
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName) && !/-/.test(componentName)) {
    const position = scriptStartIndex + script.indexOf(nameMatch[0])
    const lines = content.substring(0, position).split('\n')
    const line = lines.length

    results.push({
      rule: 'vue/component-name-format',
      message: `组件名 "${componentName}" 应使用 PascalCase 格式`,
      file: filePath,
      type: 'warning',
      line
    })
  }

  return results
}

/**
 * 检查 data 必须是函数 (P0)
 */
function checkDataFunction(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    return results
  }

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 匹配 data: { 或 data: Object 模式（错误用法）
  const dataObjectPattern = /\bdata\s*:\s*\{/
  const match = dataObjectPattern.exec(script)

  if (match) {
    const position = scriptStartIndex + match.index
    const lines = content.substring(0, position).split('\n')
    const line = lines.length

    results.push({
      rule: 'vue/data-function',
      message: 'data 必须是函数，不能是对象（会导致所有实例共享数据）',
      file: filePath,
      type: 'error',
      line
    })
  }

  return results
}

/**
 * 检查数组/对象默认值必须用工厂函数 (P0)
 */
function checkPropsDefaultFactory(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    return results
  }

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 匹配 props 定义
  const propsMatch = script.match(/props\s*:\s*\{([\s\S]*?)\n\s*\}/m)
  if (!propsMatch) {
    return results
  }

  const propsContent = propsMatch[1]
  const propsStartIndex = scriptStartIndex + script.indexOf(propsMatch[0])

  // 检查数组默认值：default: []
  const arrayDefaultPattern = /default\s*:\s*\[\s*\]/g
  let match

  while ((match = arrayDefaultPattern.exec(propsContent)) !== null) {
    const position = propsStartIndex + match.index
    const lines = content.substring(0, position).split('\n')
    const line = lines.length

    results.push({
      rule: 'vue/props-default-factory',
      message: '数组类型的 prop 默认值必须使用工厂函数：default: () => []',
      file: filePath,
      type: 'error',
      line
    })
  }

  // 检查对象默认值：default: {}
  const objectDefaultPattern = /default\s*:\s*\{\s*\}/g

  while ((match = objectDefaultPattern.exec(propsContent)) !== null) {
    const position = propsStartIndex + match.index
    const lines = content.substring(0, position).split('\n')
    const line = lines.length

    results.push({
      rule: 'vue/props-default-factory',
      message: '对象类型的 prop 默认值必须使用工厂函数：default: () => ({})',
      file: filePath,
      type: 'error',
      line
    })
  }

  return results
}

/**
 * 检查 v-if 和 v-for 不能同时使用 (P0)
 */
function checkVIfWithVFor(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
  if (!templateMatch) {
    return results
  }

  const template = templateMatch[1]
  const templateStartIndex = content.indexOf(templateMatch[0])

  // 匹配同时有 v-for 和 v-if 的元素
  const pattern = /<(\w+)[^>]*\s(v-for|v-if)\s*=[^>]*\s(v-if|v-for)\s*=[^>]*>/g
  let match

  while ((match = pattern.exec(template)) !== null) {
    const position = templateStartIndex + match.index
    const lines = content.substring(0, position).split('\n')
    const line = lines.length

    results.push({
      rule: 'vue/no-v-if-with-v-for',
      message: 'v-if 和 v-for 不能在同一元素上同时使用，建议使用计算属性过滤数据',
      file: filePath,
      type: 'error',
      line
    })
  }

  return results
}

/**
 * 检查是否使用 scoped 样式 (P1)
 */
function checkScopedStyle(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  // 匹配 <style> 标签
  const stylePattern = /<style(?![^>]*\bscoped\b)[^>]*>/g
  let match

  while ((match = stylePattern.exec(content)) !== null) {
    const lines = content.substring(0, match.index).split('\n')
    const line = lines.length

    // 排除空的 style 标签
    const styleEndIndex = content.indexOf('</style>', match.index)
    if (styleEndIndex > match.index) {
      const styleContent = content.substring(match.index + match[0].length, styleEndIndex).trim()
      if (styleContent.length > 0) {
        results.push({
          rule: 'vue/scoped-style',
          message: '建议使用 <style scoped> 避免样式污染',
          file: filePath,
          type: 'warning',
          line
        })
      }
    }
  }

  return results
}

/**
 * 检查 beforedestory 拼写错误 (P0)
 * 正确拼写是 beforeDestroy
 */
function checkBeforeDestoryTypo(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    return results
  }

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 检查常见拼写错误
  const typos = [
    { wrong: 'beforedestory', correct: 'beforeDestroy' },
    { wrong: 'beforeDestory', correct: 'beforeDestroy' },
    { wrong: 'beforedestroy', correct: 'beforeDestroy' },
  ]

  for (const typo of typos) {
    const pattern = new RegExp(`\\b${typo.wrong}\\s*\\(`, 'g')
    let match

    while ((match = pattern.exec(script)) !== null) {
      const position = scriptStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'vue/lifecycle-spelling',
        message: `生命周期钩子拼写错误："${typo.wrong}" 应该是 "${typo.correct}"`,
        file: filePath,
        type: 'error',
        line
      })
    }
  }

  return results
}
