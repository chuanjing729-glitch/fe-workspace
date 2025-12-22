import { CheckResult, PluginOptions, RuleChecker } from '../types'

/**
 * 变量命名规范检查规则
 * - 常量使用 UPPER_SNAKE_CASE
 * - 变量使用 camelCase
 * - 类名使用 PascalCase
 * - 私有变量使用 _ 前缀
 * - 布尔变量使用 is/has/should 前缀
 */

/**
 * 检查是否为大写蛇形命名 (UPPER_SNAKE_CASE)
 */
function isUpperSnakeCase(name: string): boolean {
  return /^[A-Z][A-Z0-9_]*$/.test(name)
}

/**
 * 检查是否为驼峰命名 (camelCase)
 */
function isCamelCase(name: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(name)
}

/**
 * 检查是否为帕斯卡命名 (PascalCase)
 */
function isPascalCase(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name)
}

/**
 * 检查常量命名
 */
function checkConstNaming(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配 const 声明
  const constRegex = /\bconst\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g
  let match: RegExpExecArray | null
  
  while ((match = constRegex.exec(content)) !== null) {
    const varName = match[1]
    const line = content.substring(0, match.index).split('\n').length
    
    // 跳过解构赋值
    if (content.substring(match.index, match.index + 100).includes('{')) {
      continue
    }
    
    // 检查是否为函数（函数使用 camelCase）
    const afterMatch = content.substring(match.index + match[0].length, match.index + match[0].length + 20)
    if (afterMatch.trim().startsWith('(') || afterMatch.trim().startsWith('=>')) {
      // 函数使用 camelCase
      if (!isCamelCase(varName) && !isPascalCase(varName)) {
        results.push({
          type: 'warning',
          rule: 'variable-naming/const-function',
          message: `常量函数 "${varName}" 建议使用 camelCase 命名`,
          file: filePath,
          line
        })
      }
      continue
    }
    
    // 普通常量应该使用 UPPER_SNAKE_CASE（除非是配置对象）
    if (!isUpperSnakeCase(varName) && !isCamelCase(varName)) {
      // 如果不是配置对象，提示使用大写
      if (!afterMatch.includes('{')) {
        results.push({
          type: 'warning',
          rule: 'variable-naming/const',
          message: `常量 "${varName}" 建议使用 UPPER_SNAKE_CASE 命名（如：${varName.toUpperCase()}）`,
          file: filePath,
          line
        })
      }
    }
  }
  
  return results
}

/**
 * 检查变量命名
 */
function checkVarNaming(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配 let/var 声明
  const varRegex = /\b(let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g
  let match: RegExpExecArray | null
  
  while ((match = varRegex.exec(content)) !== null) {
    const varName = match[2]
    const line = content.substring(0, match.index).split('\n').length
    
    // 变量应使用 camelCase
    if (!isCamelCase(varName) && !varName.startsWith('_')) {
      results.push({
        type: 'warning',
        rule: 'variable-naming/var',
        message: `变量 "${varName}" 应使用 camelCase 命名`,
        file: filePath,
        line
      })
    }
  }
  
  return results
}

/**
 * 检查类名命名
 */
function checkClassNaming(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配 class 声明
  const classRegex = /\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)/g
  let match: RegExpExecArray | null
  
  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1]
    const line = content.substring(0, match.index).split('\n').length
    
    // 类名应使用 PascalCase
    if (!isPascalCase(className)) {
      results.push({
        type: 'error',
        rule: 'variable-naming/class',
        message: `类名 "${className}" 应使用 PascalCase 命名`,
        file: filePath,
        line
      })
    }
  }
  
  return results
}

/**
 * 检查函数参数命名
 */
function checkFunctionParamNaming(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配函数参数（简化版，不处理复杂情况）
  const functionRegex = /function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\(([^)]*)\)/g
  const arrowFunctionRegex = /\(([^)]*)\)\s*=>/g
  
  const checkParams = (params: string, startIndex: number) => {
    const paramList = params.split(',').map(p => p.trim())
    const line = content.substring(0, startIndex).split('\n').length
    
    for (const param of paramList) {
      if (!param) continue
      
      // 提取参数名（去除类型注解和默认值）
      const parts = param.split(/[=:]/)
      const paramName = parts[0].trim().split(/\s+/)[0]
      if (!paramName || paramName.startsWith('...')) continue
      
      // 参数应使用 camelCase
      if (!isCamelCase(paramName) && !paramName.startsWith('_')) {
        results.push({
          type: 'warning',
          rule: 'variable-naming/param',
          message: `函数参数 "${paramName}" 应使用 camelCase 命名`,
          file: filePath,
          line
        })
      }
    }
  }
  
  let match: RegExpExecArray | null
  
  // 检查普通函数
  while ((match = functionRegex.exec(content)) !== null) {
    checkParams(match[1], match.index)
  }
  
  // 检查箭头函数
  while ((match = arrowFunctionRegex.exec(content)) !== null) {
    checkParams(match[1], match.index)
  }
  
  return results
}

/**
 * 检查布尔变量命名
 */
function checkBooleanNaming(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配布尔变量（通过赋值判断）
  const boolVarRegex = /\b(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(true|false|!)/g
  let match: RegExpExecArray | null
  
  while ((match = boolVarRegex.exec(content)) !== null) {
    const varName = match[2]
    const line = content.substring(0, match.index).split('\n').length
    
    // 布尔变量建议使用 is/has/should/can 等前缀
    if (!/^(is|has|should|can|will|did)[A-Z]/.test(varName) && !varName.startsWith('_')) {
      results.push({
        type: 'warning',
        rule: 'variable-naming/boolean',
        message: `布尔变量 "${varName}" 建议使用 is/has/should/can 等前缀`,
        file: filePath,
        line
      })
    }
  }
  
  return results
}

/**
 * 检查私有成员命名
 */
function checkPrivateMemberNaming(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配类的私有成员（# 或 _ 前缀）
  const privateMemberRegex = /\b(private|#)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g
  let match: RegExpExecArray | null
  
  while ((match = privateMemberRegex.exec(content)) !== null) {
    const memberName = match[2]
    const line = content.substring(0, match.index).split('\n').length
    
    // 私有成员建议使用 _ 前缀
    if (match[1] === 'private' && !memberName.startsWith('_')) {
      results.push({
        type: 'warning',
        rule: 'variable-naming/private',
        message: `私有成员 "${memberName}" 建议使用下划线前缀（如：_${memberName}）`,
        file: filePath,
        line
      })
    }
  }
  
  return results
}

/**
 * 变量命名规范检查
 */
export const variableNamingRule: RuleChecker = {
  name: 'variable-naming',
  description: '变量命名规范检查（常量、变量、类名、参数、布尔变量、私有成员）',
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    
    // 只检查 JS/TS 文件
    if (!/\.(js|ts|jsx|tsx)$/.test(filePath)) {
      return results
    }
    
    try {
      // 1. 常量命名检查
      results.push(...checkConstNaming(content, filePath))
      
      // 2. 变量命名检查
      results.push(...checkVarNaming(content, filePath))
      
      // 3. 类名命名检查
      results.push(...checkClassNaming(content, filePath))
      
      // 4. 函数参数命名检查
      results.push(...checkFunctionParamNaming(content, filePath))
      
      // 5. 布尔变量命名检查
      results.push(...checkBooleanNaming(content, filePath))
      
      // 6. 私有成员命名检查
      results.push(...checkPrivateMemberNaming(content, filePath))
      
    } catch (error: any) {
      console.warn(`变量命名检查失败: ${filePath}`, error.message)
    }
    
    return results
  }
}
