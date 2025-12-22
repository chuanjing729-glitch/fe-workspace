import { RuleChecker, CheckResult, PluginOptions } from '../types'

/**
 * JavaScript/TypeScript 开发规范检查（增强版）
 * 
 * 检查项：
 * 1. 禁止使用 var (P0)
 * 2. 字符串拼接检查 (P1) - 建议使用模板字符串
 * 3. 回调嵌套深度检查 (P1)
 * 4. 禁止使用 == 和 != (P1) - 建议使用 === 和 !==
 * 5. 禁止使用 arguments (P1) - 建议使用剩余参数
 * 6. 禁止匿名函数 (P1) - 建议命名或箭头函数
 * 7. 检查 console.log (P1) - 生产代码不应包含
 * 8. 禁止使用 eval (P0) - 安全风险
 */
export const javascriptRule: RuleChecker = {
  name: 'javascript',
  description: 'JavaScript 基础语法规范检查',
  
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    
    // 只检查 JavaScript/TypeScript 文件
    if (!/\.(js|jsx|ts|tsx|vue)$/.test(filePath)) {
      return results
    }
    
    // 提取 script 部分（如果是 Vue 文件）
    let scriptContent = content
    if (filePath.endsWith('.vue')) {
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
      if (!scriptMatch) {
        return results
      }
      scriptContent = scriptMatch[1]
    }
    
    // 1. 检查是否使用 var (P0)
    results.push(...checkVarUsage(filePath, content, scriptContent))
    
    // 2. 检查字符串拼接 (P1)
    results.push(...checkStringConcatenation(filePath, content, scriptContent))
    
    // 3. 检查回调嵌套深度 (P1)
    results.push(...checkCallbackNesting(filePath, content, scriptContent))
    
    // 4. 检查 == 和 != (P1)
    results.push(...checkLooseEquality(filePath, content, scriptContent))
    
    // 5. 检查 arguments (P1)
    results.push(...checkArgumentsUsage(filePath, content, scriptContent))
    
    // 6. 检查匿名函数 (P1)
    results.push(...checkAnonymousFunction(filePath, content, scriptContent))
    
    // 7. 检查 console.log (P1)
    results.push(...checkConsoleLog(filePath, content, scriptContent))
    
    // 8. 检查 eval (P0)
    results.push(...checkEvalUsage(filePath, content, scriptContent))
    
    return results
  }
}

/**
 * 检查是否使用 var (P0)
 */
function checkVarUsage(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配var 声明（不包括variant等单词中的var）
  const varPattern = /\bvar\s+\w+/g
  let match
  const seen = new Set<number>()  // 避免重复检测
  
  while ((match = varPattern.exec(scriptContent)) !== null) {
    if (seen.has(match.index)) continue
    seen.add(match.index)
    
    const position = filePath.endsWith('.vue') 
      ? fullContent.indexOf(scriptContent) + match.index
      : match.index
      
    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length
    
    results.push({
      rule: 'javascript/no-var',
      message: '禁止使用 var，请使用 const 或 let',
      file: filePath,
      type: 'error',
      line,
      column: lines[lines.length - 1].length
    })
  }
  
  return results
}

/**
 * 检查字符串拼接 (P1)
 */
function checkStringConcatenation(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配字符串拼接模式：'string' + variable 或 variable + 'string'
  const concatPattern = /(['"])([^'"]*)\1\s*\+\s*[\w.[\]]+|[\w.[\]]+\s*\+\s*(['"])([^'"]*)\3/g
  let match
  
  while ((match = concatPattern.exec(scriptContent)) !== null) {
    // 排除特殊情况：数字加法
    const beforeContext = scriptContent.substring(Math.max(0, match.index - 20), match.index)
    const afterContext = scriptContent.substring(match.index + match[0].length, Math.min(scriptContent.length, match.index + match[0].length + 20))
    
    // 如果前后有数字运算符，跳过
    if (/\d\s*$/.test(beforeContext) || /^\s*\d/.test(afterContext)) {
      continue
    }
    
    const position = filePath.endsWith('.vue') 
      ? fullContent.indexOf(scriptContent) + match.index
      : match.index
      
    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length
    
    results.push({
      rule: 'javascript/prefer-template-literals',
      message: '建议使用模板字符串代替字符串拼接',
      file: filePath,
      type: 'warning',
      line,
      column: lines[lines.length - 1].length
    })
  }
  
  return results
}

/**
 * 检查回调嵌套深度 (P1)
 */
function checkCallbackNesting(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 移除注释和字符串，避免干扰
  const cleanContent = scriptContent
    .replace(/\/\/.*$/gm, '')  // 移除单行注释
    .replace(/\/\*[\s\S]*?\*\//g, '')  // 移除多行注释
    .replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g, '""')  // 移除字符串
  
  // 计算每个位置的嵌套深度
  let maxDepth = 0
  let maxDepthIndex = 0
  let currentDepth = 0
  
  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i]
    
    // 检测 function 关键字
    if (cleanContent.substring(i, i + 8) === 'function') {
      currentDepth++
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth
        maxDepthIndex = i
      }
    }
    
    // 检测算括号来减少嵌套
    if (char === '}') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }
  
  const MAX_CALLBACK_DEPTH = 3
  
  if (maxDepth > MAX_CALLBACK_DEPTH) {
    const position = filePath.endsWith('.vue') 
      ? fullContent.indexOf(scriptContent) + maxDepthIndex
      : maxDepthIndex
      
    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length
    
    results.push({
      rule: 'javascript/max-callback-depth',
      message: `回调嵌套层数过深 (${maxDepth} 层，建议 ≤ ${MAX_CALLBACK_DEPTH} 层)`,
      file: filePath,
      type: 'warning',
      line
    })
  }
  
  return results
}

/**
 * 检查是否使用 == 或 != (P1)
 */
function checkLooseEquality(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配 == 或 != （排除 === 和 !==）
  // 使用负向预查，确保不是 === 或 !==
  const looseEqualityPattern = /([^=!])(==|!=)(?!=)/g
  let match
  const seen = new Set<number>()
  
  while ((match = looseEqualityPattern.exec(scriptContent)) !== null) {
    if (seen.has(match.index)) continue
    seen.add(match.index)
    
    const operator = match[2]
    const position = filePath.endsWith('.vue') 
      ? fullContent.indexOf(scriptContent) + match.index + 1  // +1 跳过第一个字符
      : match.index + 1
      
    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length
    
    results.push({
      rule: 'javascript/no-loose-equality',
      message: `建议使用严格相等 "${operator === '==' ? '===' : '!=='}" 代替 "${operator}"，避免类型转换`,
      file: filePath,
      type: 'warning',
      line
    })
  }
  
  return results
}

/**
 * 检查是否使用 arguments (P1)
 */
function checkArgumentsUsage(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配 arguments 关键字
  const argumentsPattern = /\barguments\b/g
  let match
  
  while ((match = argumentsPattern.exec(scriptContent)) !== null) {
    const position = filePath.endsWith('.vue') 
      ? fullContent.indexOf(scriptContent) + match.index
      : match.index
      
    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length
    
    results.push({
      rule: 'javascript/no-arguments',
      message: '建议使用剩余参数 (...args) 代替 arguments 对象',
      file: filePath,
      type: 'warning',
      line
    })
  }
  
  return results
}

/**
 * 检查匿名函数 (P1)
 */
function checkAnonymousFunction(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配匿名函数：function() { 但不包含 function name()
  const anonymousPattern = /function\s*\(/g
  let match
  
  while ((match = anonymousPattern.exec(scriptContent)) !== null) {
    // 检查前面是否有函数名或赋值
    const before = scriptContent.substring(Math.max(0, match.index - 20), match.index)
    
    // 如果是函数表达式赋值，跳过
    if (/\w+\s*=\s*$/.test(before) || /:\s*$/.test(before)) {
      continue
    }
    
    const position = filePath.endsWith('.vue') 
      ? fullContent.indexOf(scriptContent) + match.index
      : match.index
      
    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length
    
    results.push({
      rule: 'javascript/no-anonymous-function',
      message: '建议使用箭头函数或命名函数，避免匿名函数（难以调试）',
      file: filePath,
      type: 'warning',
      line
    })
  }
  
  return results
}

/**
 * 检查 console.log (P1)
 */
function checkConsoleLog(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配 console.log/debug/info/warn （但不包括 console.error）
  const consolePattern = /console\.(log|debug|info|warn)\(/g
  let match
  
  while ((match = consolePattern.exec(scriptContent)) !== null) {
    const position = filePath.endsWith('.vue') 
      ? fullContent.indexOf(scriptContent) + match.index
      : match.index
      
    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length
    
    results.push({
      rule: 'javascript/no-console',
      message: `生产代码不应包含 console.${match[1]}，建议移除或使用日志库`,
      file: filePath,
      type: 'warning',
      line
    })
  }
  
  return results
}

/**
 * 检查是否使用 eval (P0)
 */
function checkEvalUsage(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配 eval 调用
  const evalPattern = /\beval\s*\(/g
  let match
  
  while ((match = evalPattern.exec(scriptContent)) !== null) {
    const position = filePath.endsWith('.vue') 
      ? fullContent.indexOf(scriptContent) + match.index
      : match.index
      
    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length
    
    results.push({
      rule: 'javascript/no-eval',
      message: '禁止使用 eval，存在安全风险且性能很差',
      file: filePath,
      type: 'error',
      line
    })
  }
  
  return results
}
