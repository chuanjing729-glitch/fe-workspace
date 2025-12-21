import { RuleChecker, CheckResult, PluginOptions } from '../types'
import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
import { ASTHelper } from '../utils/ast-helper'

/**
 * 空指针防护模块
 * 
 * 检查项：
 * 1. 可选链检查 (P0) - 建议使用 ?. 访问可能为空的属性
 * 2. 空值合并检查 (P1) - 建议使用 ?? 处理默认值
 * 3. 数组访问检查 (P0) - 访问数组前应检查 length
 * 4. 对象属性访问检查 (P0) - 访问嵌套属性前应检查存在性
 * 5. 函数调用检查 (P0) - 调用函数前应检查是否存在
 * 6. Props 访问检查 (P0) - Vue2 Props 访问应有默认值
 * 7. API 响应检查 (P0) - 处理 API 响应前应检查数据存在性
 * 8. DOM 元素检查 (P0) - 操作 DOM 前应检查元素存在性
 */
export const nullSafetyRule: RuleChecker = {
  name: 'null-safety',
  description: '空指针防护检查',

  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []

    // 只检查 JavaScript/TypeScript/Vue 文件
    if (!/\.(vue|js|jsx|ts|tsx)$/.test(filePath)) {
      return results
    }

    // 提取 script 部分
    let scriptContent = content
    if (filePath.endsWith('.vue')) {
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
      if (!scriptMatch) {
        return results
      }
      scriptContent = scriptMatch[1]
    }

    // 提取本地导入信息
    const currentDir = path.dirname(filePath)
    const localImports = collectLocalImports(scriptContent, currentDir)

    // 1. 检查不安全的属性访问
    results.push(...checkUnsafePropertyAccess(filePath, content, scriptContent, localImports))

    // 2. 检查数组访问
    results.push(...checkArrayAccess(filePath, content, scriptContent))

    // 3. 检查函数调用
    results.push(...checkFunctionCall(filePath, content, scriptContent, localImports))

    // 4. 检查 null/undefined 比较
    results.push(...checkNullComparison(filePath, content, scriptContent))

    // 5. 检查 API 响应处理
    results.push(...checkApiResponse(filePath, content, scriptContent))

    // 6. 检查 DOM 元素操作
    results.push(...checkDomElement(filePath, content, scriptContent))

    // 7. 检查解构赋值
    results.push(...checkDestructuring(filePath, content, scriptContent))

    if (filePath.endsWith('.vue')) {
      // Vue 特定检查
      results.push(...checkVuePropsAccess(filePath, content))
      results.push(...checkVueDataAccess(filePath, content))
    }

    return results
  }
}

/**
 * 收集本地导入的模块
 */
function collectLocalImports(content: string, currentDir: string): Map<string, string> {
  const imports = new Map<string, string>()

  // 匹配 import { a } from './b' 或 import a from './b' 或 import * as a from './b'
  const importPattern = /import\s+(?:([\w\s{},*]+)\s+from\s+)?['"](\.{1,2}\/.*?)['"]/g
  let match

  while ((match = importPattern.exec(content)) !== null) {
    const importClause = match[1]
    const sourcePath = match[2]

    if (!importClause) continue

    const fullPath = resolveLocalPath(currentDir, sourcePath)
    if (!fullPath) continue

    // 处理 default import: import a from './b'
    if (!importClause.includes('{') && !importClause.includes('*')) {
      imports.set(importClause.trim(), fullPath)
    }
    // 处理 namespace import: import * as a from './b'
    else if (importClause.includes('* as')) {
      const name = importClause.split('as')[1].trim()
      imports.set(name, fullPath)
    }
    // 处理 named imports: import { a, b } from './b'
    else if (importClause.includes('{')) {
      const namedMatches = importClause.match(/\{([\s\S]*?)\}/)
      if (namedMatches) {
        const names = namedMatches[1].split(',').map(n => n.trim().split(/\s+as\s+/).pop()!)
        names.forEach(name => {
          if (name) imports.set(name, fullPath)
        })
      }
    }
  }

  // 匹配 require('./b')
  const requirePattern = /(?:const|let|var)\s+([\w\s{},:]+)\s*=\s*require\s*\(\s*['"](\.{1,2}\/.*?)['"]\s*\)/g
  while ((match = requirePattern.exec(content)) !== null) {
    const requireClause = match[1]
    const sourcePath = match[2]
    const fullPath = resolveLocalPath(currentDir, sourcePath)
    if (!fullPath) continue

    if (requireClause.includes('{')) {
      const namedMatches = requireClause.match(/\{([\s\S]*?)\}/)
      if (namedMatches) {
        const names = namedMatches[1].split(',').map(n => n.trim().split(':').pop()!.trim())
        names.forEach(name => {
          if (name) imports.set(name, fullPath)
        })
      }
    } else {
      imports.set(requireClause.trim(), fullPath)
    }
  }

  return imports
}

/**
 * 解析本地文件路径
 */
function resolveLocalPath(currentDir: string, relativePath: string): string | null {
  const exts = ['.ts', '.js', '.vue', '.tsx', '.jsx', '/index.ts', '/index.js']
  const base = path.resolve(currentDir, relativePath)

  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base

  for (const ext of exts) {
    const full = base + ext
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full
  }

  return null
}

/**
 * 检查成员是否在源文件中定义
 */
function checkMemberExists(sourcePath: string, memberName: string): boolean {
  try {
    const content = fs.readFileSync(sourcePath, 'utf8')
    // 简单的正则检查：检查 export, function 定义或对象属性定义
    const patterns = [
      new RegExp(`export\\s+(?:const|let|var|function|class)\\s+${memberName}\\b`),
      new RegExp(`\\b${memberName}\\s*[:(]`),
      new RegExp(`export\\s+{\\s*[^}]*\\b${memberName}\\b[^}]*\\}`),
      new RegExp(`get\\s+${memberName}\\s*\\(`),
      new RegExp(`set\\s+${memberName}\\s*\\(`)
    ]

    return patterns.some(p => p.test(content))
  } catch (e) {
    return false
  }
}

/**
 * 检查不安全的属性访问 (P0)
 * 检测可能导致 "Cannot read property 'xxx' of undefined" 的代码
 */
function checkUnsafePropertyAccess(filePath: string, fullContent: string, scriptContent: string, localImports: Map<string, string>): CheckResult[] {
  const results: CheckResult[] = []
  const sourceFile = ASTHelper.parse(scriptContent, filePath)

  ASTHelper.traverse(sourceFile, node => {
    // 匹配类似 a.b.c 的多层属性访问
    if (ts.isPropertyAccessExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const fullMatch = node.getText()

      // 检查是否已经是可选链
      if (node.questionDotToken) return;
      if ((node.expression as ts.PropertyAccessExpression).questionDotToken) return;

      // 获取根对象
      let current: ts.Expression = node.expression
      while (ts.isPropertyAccessExpression(current)) {
        current = current.expression
      }
      const rootObj = current.getText()

      // 跳过安全的全局对象与常用库
      const safeObjects = ['this', 'window', 'document', 'console', 'Vue', 'Vuex', 'VueRouter', 'axios', 'lodash', '_', 'moment', 'dayjs', 'process', 'global', 'path', 'fs', 'ts', 'ASTHelper', 'Array', 'Object', 'String', 'Number', 'JSON', 'Math']
      if (safeObjects.includes(rootObj)) return

      // 检查是否有空值校验 (简单检查：前面代码块中是否有 if(rootObj) 或 rootObj &&)
      // 在 AST 中我们可以更精确地检查包裹它的语句
      let hasGuard = false
      let parent = node.parent
      while (parent) {
        if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
          if (parent.left.getText().includes(rootObj)) {
            hasGuard = true
            break
          }
        }
        if (ts.isIfStatement(parent)) {
          if (parent.expression.getText().includes(rootObj)) {
            hasGuard = true
            break
          }
        }
        if (ts.isConditionalExpression(parent)) {
          if (parent.condition.getText().includes(rootObj)) {
            hasGuard = true
            break
          }
        }
        parent = parent.parent
      }

      if (!hasGuard) {
        results.push({
          rule: 'null-safety/unsafe-property-access',
          message: `检测到潜在不安全的深层属性访问 "${fullMatch}"。建议使用可选链 (?.) 或 @51jbs/core-utils 的 safeGet 工具。`,
          file: filePath,
          type: 'error',
          line: ASTHelper.getLine(node, sourceFile)
        })
      }
    }
  })

  return results
}

/**
 * 检查数组访问 (P0)
 * 访问数组元素前应检查长度或使用可选链
 */
function checkArrayAccess(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []

  // 匹配数组索引访问 arr[0] 或 arr[i]
  const arrayAccessPattern = /(\w+)\[(\d+|\w+)\]/g
  let match

  while ((match = arrayAccessPattern.exec(scriptContent)) !== null) {
    const arrayName = match[1]
    const index = match[2]
    const fullMatch = match[0]

    // 跳过字符串索引（通常用于对象）
    if (arrayName === 'arguments' || arrayName === 'this') {
      continue
    }

    // 检查前面是否有长度检查
    const contextBefore = scriptContent.substring(Math.max(0, match.index - 100), match.index)
    const hasLengthCheck = new RegExp(`${arrayName}\\.length`, 'm').test(contextBefore) ||
      new RegExp(`if\\s*\\(\\s*${arrayName}`, 'm').test(contextBefore)

    // 检查是否使用了可选链
    const hasOptionalChain = scriptContent.substring(match.index, match.index + fullMatch.length + 5).includes('?.[')

    if (!hasLengthCheck && !hasOptionalChain) {
      const position = filePath.endsWith('.vue')
        ? fullContent.indexOf(scriptContent) + match.index
        : match.index

      const lines = fullContent.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'null-safety/unsafe-array-access',
        message: `不安全的数组访问："${fullMatch}"，访问前应检查 ${arrayName}.length 或使用 ${arrayName}?.[${index}]`,
        file: filePath,
        type: 'error',
        line
      })
    }
  }

  return results
}

/**
 * 检查函数调用 (P0)
 * 调用函数前应检查是否为函数
 */
function checkFunctionCall(filePath: string, fullContent: string, scriptContent: string, localImports: Map<string, string>): CheckResult[] {
  const results: CheckResult[] = []

  // 匹配对象方法调用 obj.method()
  const methodCallPattern = /(\w+)\.(\w+)\s*\(/g
  let match

  while ((match = methodCallPattern.exec(scriptContent)) !== null) {
    const obj = match[1]
    const method = match[2]
    const fullMatch = match[0]

    // 跳过常见的安全调用和第三方库
    const safeObjects = ['this', 'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Date', 'Vue', 'Vuex', 'VueRouter', 'axios', 'lodash', '_', 'moment', 'dayjs', 'path', 'fs', 'ts', 'ASTHelper', 'process', 'global']
    if (safeObjects.includes(obj)) {
      continue
    }

    // 如果是本地导入的对象访问，尝试检查方法是否存在
    if (localImports.has(obj)) {
      const sourcePath = localImports.get(obj)!
      if (checkMemberExists(sourcePath, method)) {
        continue
      }
    }

    // 跳过已知的全局函数
    const globalMethods = ['forEach', 'map', 'filter', 'reduce', 'find', 'some', 'every']
    if (globalMethods.includes(method)) {
      continue
    }

    // 检查是否有类型检查
    const contextBefore = scriptContent.substring(Math.max(0, match.index - 100), match.index)
    const hasTypeCheck = new RegExp(`typeof\\s+${obj}\\.${method}\\s*===\\s*['"]function['"]`, 'm').test(contextBefore) ||
      new RegExp(`${obj}\\.${method}\\s*&&`, 'm').test(contextBefore)

    // 检查是否使用可选链调用
    const hasOptionalCall = scriptContent.substring(match.index, match.index + fullMatch.length + 2).includes('?.(')

    if (!hasTypeCheck && !hasOptionalCall && obj !== 'props') {
      const position = filePath.endsWith('.vue')
        ? fullContent.indexOf(scriptContent) + match.index
        : match.index

      const lines = fullContent.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'null-safety/unsafe-function-call',
        message: `不安全的函数调用："${fullMatch}"，建议使用可选链 "${obj}?.${method}()" 或添加类型检查`,
        file: filePath,
        type: 'warning',
        line
      })
    }
  }

  return results
}

/**
 * 检查 null/undefined 比较 (P1)
 * 建议使用 == null 同时检查 null 和 undefined
 */
function checkNullComparison(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []

  // 匹配 === undefined 或 !== undefined
  const undefinedPattern = /(\w+)\s*(!==|===)\s*undefined/g
  let match

  while ((match = undefinedPattern.exec(scriptContent)) !== null) {
    const variable = match[1]
    const operator = match[2]

    const position = filePath.endsWith('.vue')
      ? fullContent.indexOf(scriptContent) + match.index
      : match.index

    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length

    const suggestion = operator === '===' ? `${variable} == null` : `${variable} != null`

    results.push({
      rule: 'null-safety/prefer-null-check',
      message: `建议使用 "${suggestion}" 同时检查 null 和 undefined，而不是单独检查 undefined`,
      file: filePath,
      type: 'warning',
      line
    })
  }

  return results
}

/**
 * 检查 API 响应处理 (P0)
 * 处理 API 数据前应检查响应状态和数据存在性
 */
function checkApiResponse(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []

  // 匹配 .then(res => res.data.xxx) 模式
  const thenPattern = /\.then\s*\(\s*(?:res|response|data)\s*=>\s*(?:res|response|data)\.data\.(\w+)/g
  let match

  while ((match = thenPattern.exec(scriptContent)) !== null) {
    const property = match[1]

    // 检查是否有错误处理或数据检查
    const contextAfter = scriptContent.substring(match.index, match.index + 200)
    const hasErrorHandling = /\.catch/.test(contextAfter) || /try\s*\{/.test(scriptContent.substring(Math.max(0, match.index - 50), match.index))
    const hasDataCheck = /if\s*\(/.test(contextAfter) || /\?\./.test(contextAfter)

    if (!hasErrorHandling && !hasDataCheck) {
      const position = filePath.endsWith('.vue')
        ? fullContent.indexOf(scriptContent) + match.index
        : match.index

      const lines = fullContent.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'null-safety/unsafe-api-response',
        message: `不安全的 API 响应处理，访问 data.${property} 前应检查数据存在性或使用可选链`,
        file: filePath,
        type: 'error',
        line
      })
    }
  }

  return results
}

/**
 * 检查 DOM 元素操作 (P0)
 * 操作 DOM 元素前应检查元素是否存在
 */
function checkDomElement(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []

  // 匹配 document.querySelector/getElementById 后立即访问属性或方法
  const domPattern = /(document\.(?:querySelector|getElementById|getElementsByClassName|getElementsByTagName)\([^)]+\))\.(\w+)/g
  let match

  while ((match = domPattern.exec(scriptContent)) !== null) {
    const domQuery = match[1]
    const property = match[2]

    // 检查是否先赋值给变量并检查
    const before = scriptContent.substring(Math.max(0, match.index - 100), match.index)
    const hasNullCheck = /if\s*\(/.test(before)

    if (!hasNullCheck) {
      const position = filePath.endsWith('.vue')
        ? fullContent.indexOf(scriptContent) + match.index
        : match.index

      const lines = fullContent.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'null-safety/unsafe-dom-access',
        message: `不安全的 DOM 操作，querySelector 可能返回 null，访问 .${property} 前应检查元素存在性`,
        file: filePath,
        type: 'error',
        line
      })
    }
  }

  return results
}

/**
 * 检查解构赋值 (P1)
 * 解构可能为空的对象时应提供默认值
 */
function checkDestructuring(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []

  // 匹配解构赋值 const { a, b } = obj
  const destructPattern = /const\s*\{\s*([^}]+)\}\s*=\s*(\w+)/g
  let match

  while ((match = destructPattern.exec(scriptContent)) !== null) {
    const properties = match[1]
    const sourceObj = match[2]

    // 跳过有默认值的情况
    if (properties.includes('=') || sourceObj === 'this') {
      continue
    }

    // 检查源对象是否可能为空
    const contextBefore = scriptContent.substring(Math.max(0, match.index - 100), match.index)
    const hasNullCheck = new RegExp(`if\\s*\\(\\s*${sourceObj}`, 'm').test(contextBefore) ||
      new RegExp(`${sourceObj}\\s*=\\s*\\{`, 'm').test(contextBefore)

    if (!hasNullCheck) {
      const position = filePath.endsWith('.vue')
        ? fullContent.indexOf(scriptContent) + match.index
        : match.index

      const lines = fullContent.substring(0, position).split('\n')
      const line = lines.length

      results.push({
        rule: 'null-safety/unsafe-destructuring',
        message: `不安全的解构赋值，"${sourceObj}" 可能为空，建议添加默认值：const { ${properties.trim()} } = ${sourceObj} || {}`,
        file: filePath,
        type: 'warning',
        line
      })
    }
  }

  return results
}

/**
 * Vue2: 检查 Props 访问 (P0)
 * Props 访问应有默认值或空值检查
 */
function checkVuePropsAccess(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return results

  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])

  // 查找 props 定义
  const propsMatch = script.match(/props\s*:\s*\{([\s\S]*?)\n\s*\}/m)
  if (!propsMatch) return results

  const propsContent = propsMatch[1]

  // 提取所有 prop 名称
  const propNames: string[] = []
  const propPattern = /(\w+)\s*:/g
  let match

  while ((match = propPattern.exec(propsContent)) !== null) {
    propNames.push(match[1])
  }

  // 检查每个 prop 是否在使用时有空值检查
  for (const propName of propNames) {
    // 查找 this.propName.xxx 的使用
    const usagePattern = new RegExp(`this\\.${propName}\\.\\w+`, 'g')

    while ((match = usagePattern.exec(script)) !== null) {
      // 检查是否有空值检查
      const contextBefore = script.substring(Math.max(0, match.index - 100), match.index)
      const hasNullCheck = new RegExp(`if\\s*\\(\\s*this\\.${propName}`, 'm').test(contextBefore) ||
        new RegExp(`this\\.${propName}\\s*&&`, 'm').test(contextBefore)

      // 检查 prop 定义中是否有 required: true
      const propDefPattern = new RegExp(`${propName}\\s*:\\s*\\{[^}]*required\\s*:\\s*true`, 'm')
      const isRequired = propDefPattern.test(propsContent)

      if (!hasNullCheck && !isRequired) {
        const position = scriptStartIndex + match.index
        const lines = content.substring(0, position).split('\n')
        const line = lines.length

        results.push({
          rule: 'null-safety/vue-props-access',
          message: `访问 prop "${propName}" 的属性前应检查其存在性，或在 props 中设置 required: true`,
          file: filePath,
          type: 'error',
          line
        })
      }
    }
  }

  return results
}

/**
 * Vue2: 检查 Data 访问 (P1)
 * 访问可能未初始化的 data 属性
 */
function checkVueDataAccess(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []

  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return results

  const script = scriptMatch[1]

  // 查找异步赋值的 data 属性（如 this.userData = ...）
  const asyncAssignPattern = /this\.(\w+)\s*=\s*(?:response|res|data)/g
  const asyncProps: string[] = []
  let match

  while ((match = asyncAssignPattern.exec(script)) !== null) {
    asyncProps.push(match[1])
  }

  // 检查这些属性的访问是否安全
  for (const prop of asyncProps) {
    const accessPattern = new RegExp(`this\\.${prop}\\.\\w+`, 'g')

    while ((match = accessPattern.exec(script)) !== null) {
      const contextBefore = script.substring(Math.max(0, match.index - 100), match.index)
      const hasNullCheck = new RegExp(`if\\s*\\(\\s*this\\.${prop}`, 'm').test(contextBefore)

      if (!hasNullCheck) {
        const scriptStartIndex = content.indexOf(scriptMatch[0])
        const position = scriptStartIndex + match.index
        const lines = content.substring(0, position).split('\n')
        const line = lines.length

        results.push({
          rule: 'null-safety/vue-async-data-access',
          message: `访问异步数据 "${prop}" 前应检查其是否已加载完成`,
          file: filePath,
          type: 'warning',
          line
        })
      }
    }
  }

  return results
}
