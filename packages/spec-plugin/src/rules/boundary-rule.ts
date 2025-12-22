/**
 * 边界处理规范检查
 * 检查代码中的边界条件处理是否完善
 */

import { CheckResult, PluginOptions, RuleChecker } from '../types'

export const boundaryRule: RuleChecker = {
  name: 'boundary',
  description: '边界处理规范检查',
  
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    
    // 只检查 JS/TS/Vue 文件
    if (!/\.(js|ts|jsx|tsx|vue)$/.test(filePath)) {
      return results
    }
    
    // 提取 script 部分
    let scriptContent = content
    if (filePath.endsWith('.vue')) {
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
      if (!scriptMatch) return results
      scriptContent = scriptMatch[1]
    }
    
    // 获取自定义配置（默认全部启用）
    const config = options.boundaryConfig || {}
    const checkDivision = config.checkDivisionZero !== false
    const checkArray = config.checkArrayBounds !== false
    const checkObject = config.checkObjectAccess !== false
    const checkJson = config.checkJsonParse !== false
    const checkLoop = config.checkLoopBounds !== false
    const checkRecur = config.checkRecursion !== false
    
    // 1. 数组操作边界检查
    if (checkArray) {
      results.push(...checkArrayBoundary(filePath, content, scriptContent))
    }
    
    // 2. 字符串操作边界检查
    if (checkArray) {
      results.push(...checkStringBoundary(filePath, content, scriptContent))
    }
    
    // 3. 数字计算边界检查
    if (checkDivision) {
      results.push(...checkNumberBoundary(filePath, content, scriptContent))
    }
    
    // 4. 循环边界检查
    if (checkLoop) {
      results.push(...checkLoopBoundary(filePath, content, scriptContent))
    }
    
    // 5. 递归边界检查
    if (checkRecur) {
      results.push(...checkRecursionBoundary(filePath, content, scriptContent))
    }
    
    // 6. 索引访问边界检查
    if (checkArray) {
      results.push(...checkIndexBoundary(filePath, content, scriptContent, config))
    }
    
    // 7. 分页边界检查
    results.push(...checkPaginationBoundary(filePath, content, scriptContent, config))
    
    // 8. 输入值边界检查
    results.push(...checkInputBoundary(filePath, content, scriptContent))
    
    // 9. 时间日期边界检查
    results.push(...checkDateBoundary(filePath, content, scriptContent))
    
    // 10. 对象属性访问边界检查
    if (checkObject) {
      results.push(...checkObjectPropertyAccess(filePath, content, scriptContent, checkJson))
    }
    
    return results
  }
}

/**
 * 检查数组操作边界
 */
function checkArrayBoundary(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  const lines = fullContent.split('\n')
  
  // 检查 slice/substring/substr 是否处理边界
  const slicePattern = /(\w+)\.(?:slice|substring|substr)\s*\(\s*([^)]+)\s*\)/g
  let match
  
  while ((match = slicePattern.exec(scriptContent)) !== null) {
    const [fullMatch, varName, params] = match
    const line = findLineNumber(fullContent, match.index)
    
    // 检查前面是否有长度检查
    const contextBefore = scriptContent.substring(Math.max(0, match.index - 200), match.index)
    const hasLengthCheck = new RegExp(`${varName}\\.length`, 'i').test(contextBefore)
    const hasIfCheck = /if\s*\(/.test(contextBefore.split('\n').pop() || '')
    
    if (!hasLengthCheck && !hasIfCheck) {
      results.push({
        file: filePath,
        rule: 'boundary/array-slice',
        message: `数组切片操作 "${varName}.slice()" 前应检查数组长度，避免超出边界`,
        type: 'warning',
        line
      })
    }
  }
  
  // 检查 splice 操作
  const splicePattern = /(\w+)\.splice\s*\(\s*([^)]+)\s*\)/g
  while ((match = splicePattern.exec(scriptContent)) !== null) {
    const [fullMatch, varName, params] = match
    const line = findLineNumber(fullContent, match.index)
    
    const contextBefore = scriptContent.substring(Math.max(0, match.index - 200), match.index)
    const hasLengthCheck = new RegExp(`${varName}\\.length`, 'i').test(contextBefore)
    
    if (!hasLengthCheck) {
      results.push({
        file: filePath,
        rule: 'boundary/array-splice',
        message: `数组 splice 操作前应检查数组长度和索引有效性`,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}

/**
 * 检查字符串操作边界
 */
function checkStringBoundary(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查 charAt/charCodeAt
  const charAtPattern = /(\w+)\.(?:charAt|charCodeAt)\s*\(\s*(\d+|[\w.]+)\s*\)/g
  let match
  
  while ((match = charAtPattern.exec(scriptContent)) !== null) {
    const [fullMatch, strVar, index] = match
    const line = findLineNumber(fullContent, match.index)
    
    // 如果索引是变量，检查是否有长度验证
    if (!/^\d+$/.test(index)) {
      const contextBefore = scriptContent.substring(Math.max(0, match.index - 200), match.index)
      const hasLengthCheck = new RegExp(`${strVar}\\.length`, 'i').test(contextBefore)
      const hasIndexCheck = new RegExp(`${index}\\s*[<>=]`, 'i').test(contextBefore)
      
      if (!hasLengthCheck && !hasIndexCheck) {
        results.push({
          file: filePath,
          rule: 'boundary/string-index',
          message: `字符串索引访问 "${strVar}.charAt(${index})" 应检查索引是否在有效范围内`,
          type: 'warning',
          line
        })
      }
    }
  }
  
  return results
}

/**
 * 检查数字计算边界
 */
function checkNumberBoundary(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 移除字符串字面量和正则表达式（避免误判）
  const cleanedContent = scriptContent
    .replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length))  // 移除块注释
    .replace(/\/\/.*$/gm, (match) => ' '.repeat(match.length))  // 移除行注释
    .replace(/['`"]([^'`"]*?)['`"]/g, (match) => ' '.repeat(match.length))  // 移除字符串
    .replace(/\/(\\.|[^\/\\\n])+\/[gimuy]*/g, (match) => ' '.repeat(match.length))  // 移除正则表达式
  
  // 更精确的除法检查：排除类型注解、正则等误报
  const divisionPattern = /(?<![\w$])([a-zA-Z_$][\w$]*)\s*\/\s*([a-zA-Z_$][\w$]*)(?![\w$])/g
  let match
  
  while ((match = divisionPattern.exec(cleanedContent)) !== null) {
    const [fullMatch, dividend, divisor] = match
    const line = findLineNumber(fullContent, match.index)
    
    // 跳过常见的非除法场景
    if (divisor === 'g' || divisor === 'i' || divisor === 'm' || divisor === 'y' || divisor === 'u') {
      continue  // 可能是正则表达式标志
    }
    
    // 检查是否在赋值语句的右侧（真正的除法）
    const contextBefore = cleanedContent.substring(Math.max(0, match.index - 300), match.index)
    const contextAfter = cleanedContent.substring(match.index, Math.min(cleanedContent.length, match.index + 100))
    
    // 跳过三元表达式和条件判断中的除法
    if (/\?/.test(contextAfter)) continue
    
    // 检查是否有零值检查（更智能的检测）
    const hasZeroCheck = (
      new RegExp(`${divisor}\\s*[!=]=\\s*0`, 'i').test(contextBefore) ||
      new RegExp(`${divisor}\\s*>\\s*0`, 'i').test(contextBefore) ||
      new RegExp(`if\\s*\\(\\s*${divisor}\\s*\\)`, 'i').test(contextBefore) ||
      /Math\.max|Math\.min/.test(contextBefore)
    )
    
    // 跳过常量除法
    if (divisor === '0' || divisor === '1' || /^\d+$/.test(divisor)) {
      continue
    }
    
    if (!hasZeroCheck) {
      results.push({
        file: filePath,
        rule: 'boundary/division-zero',
        message: `除法运算前应检查除数 "${divisor}" 是否为 0，避免除零错误`,
        type: 'error',
        line
      })
    }
  }
  
  // 检查 parseInt/parseFloat
  const parsePattern = /(?:parseInt|parseFloat)\s*\(\s*([^)]+)\s*\)/g
  while ((match = parsePattern.exec(scriptContent)) !== null) {
    const [fullMatch, param] = match
    const line = findLineNumber(fullContent, match.index)
    
    // 检查后面是否有 NaN 检查
    const contextAfter = scriptContent.substring(match.index, match.index + 300)
    const hasNaNCheck = /isNaN|Number\.isNaN/.test(contextAfter)
    
    if (!hasNaNCheck) {
      results.push({
        file: filePath,
        rule: 'boundary/parse-nan',
        message: `${fullMatch.split('(')[0]} 后应检查结果是否为 NaN`,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}

/**
 * 检查循环边界
 */
function checkLoopBoundary(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查 for 循环
  const forPattern = /for\s*\(\s*(?:let|var|const)?\s*(\w+)\s*=\s*([^;]+);\s*\1\s*([<>]=?)\s*([^;]+);\s*([^)]+)\)/g
  let match
  
  while ((match = forPattern.exec(scriptContent)) !== null) {
    const [fullMatch, varName, init, operator, limit, increment] = match
    const line = findLineNumber(fullContent, match.index)
    
    // 检查是否可能无限循环
    if (operator.includes('<') && !increment.includes('++') && !increment.includes('+')) {
      results.push({
        file: filePath,
        rule: 'boundary/infinite-loop',
        message: `循环变量 "${varName}" 可能未正确递增，可能导致无限循环`,
        type: 'error',
        line
      })
    }
    
    // 检查数组遍历是否正确
    if (/\.length/.test(limit)) {
      const arrayName = limit.match(/(\w+)\.length/)?.[1]
      if (arrayName && operator === '<') {
        // 正确
      } else if (arrayName && operator === '<=') {
        results.push({
          file: filePath,
          rule: 'boundary/loop-off-by-one',
          message: `遍历数组 "${arrayName}" 应使用 "< length" 而不是 "<= length"，避免越界`,
          type: 'error',
          line
        })
      }
    }
  }
  
  // 检查 while 循环
  const whilePattern = /while\s*\([^)]+\)\s*\{/g
  while ((match = whilePattern.exec(scriptContent)) !== null) {
    const line = findLineNumber(fullContent, match.index)
    const loopContent = extractBlockContent(scriptContent, match.index + match[0].length)
    
    // 检查是否有退出条件
    const hasBreak = /break/.test(loopContent)
    const hasReturn = /return/.test(loopContent)
    const hasCounter = /\+\+|--|\+=|-=/.test(loopContent)
    
    if (!hasBreak && !hasReturn && !hasCounter) {
      results.push({
        file: filePath,
        rule: 'boundary/while-no-exit',
        message: `while 循环应确保有明确的退出条件（break/return/计数器），避免无限循环`,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}

/**
 * 检查递归边界
 */
function checkRecursionBoundary(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 查找所有函数定义
  const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*\{/g
  let match
  
  while ((match = functionPattern.exec(scriptContent)) !== null) {
    const [fullMatch, funcName] = match
    const line = findLineNumber(fullContent, match.index)
    const funcBody = extractBlockContent(scriptContent, match.index + match[0].length)
    
    // 检查是否递归调用
    const recursiveCall = new RegExp(`\\b${funcName}\\s*\\(`, 'g')
    if (recursiveCall.test(funcBody)) {
      // 检查是否有终止条件
      const hasBaseCase = /if\s*\(/.test(funcBody) && /return/.test(funcBody)
      const hasDepthLimit = /depth|level|count|limit/i.test(funcBody)
      
      if (!hasBaseCase && !hasDepthLimit) {
        results.push({
          file: filePath,
          rule: 'boundary/recursion-no-base',
          message: `递归函数 "${funcName}" 应有明确的终止条件（基准情况），避免栈溢出`,
          type: 'error',
          line
        })
      }
    }
  }
  
  return results
}

/**
 * 检查索引访问边界
 */
function checkIndexBoundary(filePath: string, fullContent: string, scriptContent: string, config: any = {}): CheckResult[] {
  const results: CheckResult[] = []
  const threshold = config.largeIndexThreshold || 10
  
  // 检查固定索引访问
  const fixedIndexPattern = /(\w+)\[(\d+)\]/g
  let match
  
  while ((match = fixedIndexPattern.exec(scriptContent)) !== null) {
    const [fullMatch, varName, index] = match
    const line = findLineNumber(fullContent, match.index)
    const indexNum = parseInt(index)
    
    // 如果索引较大，建议检查
    if (indexNum > threshold) {
      results.push({
        file: filePath,
        rule: 'boundary/large-index',
        message: `访问较大索引 "${varName}[${index}]" 前应检查数组长度是否足够`,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}

/**
 * 检查分页边界
 */
function checkPaginationBoundary(filePath: string, fullContent: string, scriptContent: string, config: any = {}): CheckResult[] {
  const results: CheckResult[] = []
  const maxPageSize = config.maxPageSize || 100
  
  // 检查分页相关变量
  const pagePattern = /(?:page|currentPage|pageNum)\s*[=:]\s*([^,;\n}]+)/gi
  let match
  
  while ((match = pagePattern.exec(scriptContent)) !== null) {
    const [fullMatch, value] = match
    const line = findLineNumber(fullContent, match.index)
    
    // 检查同一作用域是否有最大页数限制
    const contextAround = scriptContent.substring(Math.max(0, match.index - 500), match.index + 500)
    const hasTotalPages = /totalPages|maxPage|pageCount/i.test(contextAround)
    const hasPageCheck = /if\s*\([^)]*(?:page|currentPage)/i.test(contextAround)
    
    if (!hasTotalPages && !hasPageCheck) {
      results.push({
        file: filePath,
        rule: 'boundary/pagination-max',
        message: `分页参数应检查是否超过最大页数，避免请求无效数据`,
        type: 'warning',
        line
      })
    }
  }
  
  // 检查 pageSize
  const pageSizePattern = /(?:pageSize|limit|size)\s*[=:]\s*([^,;\n}]+)/gi
  while ((match = pageSizePattern.exec(scriptContent)) !== null) {
    const [fullMatch, value] = match
    const line = findLineNumber(fullContent, match.index)
    
    const contextAround = scriptContent.substring(Math.max(0, match.index - 300), match.index + 300)
    const hasMaxCheck = /Math\.min|Math\.max/.test(contextAround)
    
    if (!hasMaxCheck && !/^\d+$/.test(value.trim())) {
      results.push({
        file: filePath,
        rule: 'boundary/pagesize-max',
        message: `pageSize 应设置最大值限制（如 Math.min(pageSize, 100)），避免一次性加载过多数据`,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}

/**
 * 检查输入值边界
 */
function checkInputBoundary(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查用户输入处理
  const inputPattern = /(?:input|value|param|data)\s*[=:]\s*(?:this\.)?\$?(?:refs|event\.target\.value|query|body)/gi
  let match
  
  while ((match = inputPattern.exec(scriptContent)) !== null) {
    const line = findLineNumber(fullContent, match.index)
    const contextAfter = scriptContent.substring(match.index, match.index + 300)
    
    // 检查是否有验证
    const hasValidation = /if\s*\(|validate|check|trim|length|match|test/i.test(contextAfter)
    
    if (!hasValidation) {
      results.push({
        file: filePath,
        rule: 'boundary/input-validation',
        message: `用户输入应进行验证（非空、长度、格式等），避免异常值`,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}

/**
 * 检查时间日期边界
 */
function checkDateBoundary(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查 Date 构造
  const datePattern = /new\s+Date\s*\(\s*([^)]+)\s*\)/g
  let match
  
  while ((match = datePattern.exec(scriptContent)) !== null) {
    const [fullMatch, param] = match
    const line = findLineNumber(fullContent, match.index)
    
    // 跳过空参数（new Date()）
    if (!param || param.trim() === '') {
      continue
    }
    
    // 检查是否验证日期有效性
    const contextAfter = scriptContent.substring(match.index, match.index + 500)
    const hasValidCheck = /isNaN|getTime|instanceof\s+Date/.test(contextAfter)
    
    if (!hasValidCheck) {
      results.push({
        file: filePath,
        rule: 'boundary/date-invalid',
        message: `创建 Date 对象后应检查日期是否有效（isNaN(date.getTime())）`,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}

/**
 * 检查对象属性访问边界
 */
function checkObjectPropertyAccess(filePath: string, fullContent: string, scriptContent: string, checkJson: boolean = true): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查多层属性访问（未使用可选链）
  const deepAccessPattern = /(\w+)(?:\.\w+){2,}/g
  let match
  
  while ((match = deepAccessPattern.exec(scriptContent)) !== null) {
    const [fullMatch, rootObj] = match
    const line = findLineNumber(fullContent, match.index)
    
    // 检查是否使用了可选链操作符
    const hasOptionalChaining = /\?\./.test(fullMatch)
    
    // 检查前后文是否有 null/undefined 检查
    const contextBefore = scriptContent.substring(Math.max(0, match.index - 300), match.index)
    const hasNullCheck = (
      new RegExp(`${rootObj}\\s*[!=]=\\s*null`, 'i').test(contextBefore) ||
      new RegExp(`${rootObj}\\s*[!=]=\\s*undefined`, 'i').test(contextBefore) ||
      new RegExp(`typeof\\s+${rootObj}`, 'i').test(contextBefore) ||
      /if\s*\(/.test(contextBefore.split('\n').pop() || '')
    )
    
    // 如果是多层访问且没有保护，建议使用可选链
    if (!hasOptionalChaining && !hasNullCheck && fullMatch.split('.').length > 2) {
      results.push({
        file: filePath,
        rule: 'boundary/object-property-access',
        message: `多层属性访问 "${fullMatch}" 应使用可选链 (?.) 或检查 null/undefined，避免运行时错误`,
        type: 'warning',
        line
      })
    }
  }
  
  // 检查数组索引访问（obj[key]）
  const dynamicAccessPattern = /(\w+)\[(['"`]?)(\w+)\2\]/g
  while ((match = dynamicAccessPattern.exec(scriptContent)) !== null) {
    const [fullMatch, obj, quote, key] = match
    const line = findLineNumber(fullContent, match.index)
    
    // 如果 key 是变量（没有引号），建议检查
    if (!quote) {
      const contextBefore = scriptContent.substring(Math.max(0, match.index - 200), match.index)
      const hasKeyCheck = (
        new RegExp(`${key}\\s+in\\s+${obj}`, 'i').test(contextBefore) ||
        new RegExp(`${obj}\.hasOwnProperty\\(\\s*${key}`, 'i').test(contextBefore) ||
        new RegExp(`Object\.prototype\.hasOwnProperty\.call\\(\\s*${obj}`, 'i').test(contextBefore)
      )
      
      if (!hasKeyCheck) {
        results.push({
          file: filePath,
          rule: 'boundary/object-key-access',
          message: `动态键访问 "${obj}[${key}]" 应检查键是否存在（${key} in ${obj}）`,
          type: 'warning',
          line
        })
      }
    }
  }
  
  // 检查 JSON.parse 后的访问
  const jsonParsePattern = /JSON\.parse\s*\([^)]+\)/g
  while ((match = jsonParsePattern.exec(scriptContent)) !== null) {
    const line = findLineNumber(fullContent, match.index)
    
    // 检查是否有 try-catch
    const contextBefore = scriptContent.substring(Math.max(0, match.index - 500), match.index)
    const hasTryCatch = /try\s*\{/.test(contextBefore) && !(/catch\s*\(/.test(contextBefore.substring(contextBefore.lastIndexOf('try'))))
    
    if (!hasTryCatch) {
      results.push({
        file: filePath,
        rule: 'boundary/json-parse',
        message: `JSON.parse() 应使用 try-catch 包裹，避免解析失败导致程序崩溃`,
        type: 'error',
        line
      })
    }
  }
  
  return results
}

/**
 * 查找行号
 */
function findLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length
}

/**
 * 提取代码块内容
 */
function extractBlockContent(content: string, startIndex: number): string {
  let depth = 1
  let i = startIndex
  
  while (i < content.length && depth > 0) {
    if (content[i] === '{') depth++
    if (content[i] === '}') depth--
    i++
  }
  
  return content.substring(startIndex, i - 1)
}
