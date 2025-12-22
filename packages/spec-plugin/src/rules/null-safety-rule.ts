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
 * 增强的守卫检测辅助函数
 * 检查变量是否在守卫上下文中（安全访问）
 * 
 * 支持的守卫模式：
 * 1. 逻辑与：rootObj && rootObj.detail
 * 2. If 语句：if (rootObj) { ... }
 * 3. 三元表达式：rootObj ? rootObj.detail : null
 * 4. 空值合并：rootObj ?? defaultValue
 * 5. 解构默认值：const { detail } = rootObj || {}
 */
function hasGuardContext(node: ts.Node, variableName: string): boolean {
  let parent: ts.Node | undefined = node.parent

  while (parent) {
    // 1. 逻辑与运算符 (&&)
    if (ts.isBinaryExpression(parent)) {
      const op = parent.operatorToken.kind

      // rootObj && rootObj.detail
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
        const leftText = parent.left.getText()
        // 检查左侧是否包含变量名的检查
        if (leftText.includes(variableName) && parent.left !== node) {
          return true
        }
      }

      // 空值合并运算符 (??)
      if (op === ts.SyntaxKind.QuestionQuestionToken) {
        if (parent.left === node || isDescendantOf(node, parent.left)) {
          return true
        }
      }

      // 逻辑或用于默认值 (||)
      if (op === ts.SyntaxKind.BarBarToken) {
        if (parent.left === node || isDescendantOf(node, parent.left)) {
          return true
        }
      }
    }

    // 2. If 语句
    if (ts.isIfStatement(parent)) {
      const condition = parent.expression.getText()
      // 检查条件中是否包含变量检查
      if (condition.includes(variableName) && !isDescendantOf(node, parent.expression)) {
        return true
      }
    }

    // 3. 三元表达式（条件运算符）
    if (ts.isConditionalExpression(parent)) {
      const condition = parent.condition.getText()
      // rootObj ? rootObj.detail : null
      if (condition.includes(variableName) && !isDescendantOf(node, parent.condition)) {
        return true
      }
    }

    // 4. While 循环条件
    if (ts.isWhileStatement(parent)) {
      const condition = parent.expression.getText()
      if (condition.includes(variableName) && !isDescendantOf(node, parent.expression)) {
        return true
      }
    }

    parent = parent.parent
  }

  return false
}

/**
 * 检查 node 是否是 ancestor 的后代节点
 */
function isDescendantOf(node: ts.Node, ancestor: ts.Node): boolean {
  let current: ts.Node | undefined = node
  while (current) {
    if (current === ancestor) return true
    current = current.parent
  }
  return false
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

      // 使用增强的守卫检测
      if (!hasGuardContext(node, rootObj)) {
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
 * 检查数组访问 (P0) - AST版本
 * 访问数组元素前应检查长度或使用可选链
 */
function checkArrayAccess(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  const sourceFile = ASTHelper.parse(scriptContent, filePath)

  ASTHelper.traverse(sourceFile, node => {
    //检测 ElementAccessExpression: arr[0] 或 arr[index]
    if (ts.isElementAccessExpression(node)) {
      // 跳过已使用可选链的情况：arr?.[0]
      if (node.questionDotToken) return

      const arrayExpr = node.expression.getText()
      const indexExpr = node.argumentExpression.getText()

      // 跳过安全的内置对象和特殊情况
      const safeArrays = ['arguments', 'this', 'Array', 'Object', 'String', 'process']
      if (safeArrays.includes(arrayExpr)) return

      // 跳过字符串字面量索引（通常是对象属性访问）
      if (node.argumentExpression.kind === ts.SyntaxKind.StringLiteral) return

      // 使用增强的守卫检测
      // 检查是否有 length 检查或其他守卫
      const hasLengthGuard = hasArrayLengthGuard(node, arrayExpr)
      const hasGeneralGuard = hasGuardContext(node, arrayExpr)

      if (!hasLengthGuard && !hasGeneralGuard) {
        results.push({
          rule: 'null-safety/unsafe-array-access',
          message: `不安全的数组访问：\"${arrayExpr}[${indexExpr}]\"，访问前应检查 ${arrayExpr}.length 或使用 ${arrayExpr}?.[${indexExpr}]`,
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
 * 检查是否有数组长度守卫
 */
function hasArrayLengthGuard(node: ts.Node, arrayName: string): boolean {
  let parent: ts.Node | undefined = node.parent

  while (parent) {
    if (ts.isBinaryExpression(parent)) {
      const leftText = parent.left.getText()
      const rightText = parent.right.getText()
      // 检查 arr.length > 0, arr.length >= 1 等
      if (leftText.includes(`${arrayName}.length`) || rightText.includes(`${arrayName}.length`)) {
        return true
      }
    }

    if (ts.isIfStatement(parent)) {
      const conditionText = parent.expression.getText()
      if (conditionText.includes(`${arrayName}.length`)) {
        return true
      }
    }

    parent = parent.parent
  }

  return false
}


/**
 * 检查函数调用 (P0) - AST 版本
 * 调用函数前应检查是否为函数
 */
function checkFunctionCall(filePath: string, fullContent: string, scriptContent: string, localImports: Map<string, string>): CheckResult[] {
  const results: CheckResult[] = []
  const sourceFile = ASTHelper.parse(scriptContent, filePath)

  ASTHelper.traverse(sourceFile, node => {
    // 检测 CallExpression: obj.method()
    if (ts.isCallExpression(node)) {
      const expression = node.expression

      // 只检查属性访问形式的调用：obj.method()
      if (ts.isPropertyAccessExpression(expression)) {
        // 跳过已使用可选链的情况：obj?.method()
        if (expression.questionDotToken) return

        const objExpr = expression.expression.getText()
        const methodName = expression.name.getText()

        // 跳过安全的全局对象和常用库
        const safeObjects = ['this', 'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Date', 'Vue', 'Vuex', 'VueRouter', 'axios', 'lodash', '_', 'moment', 'dayjs', 'path', 'fs', 'ts', 'ASTHelper', 'process', 'global', 'window', 'document', 'Promise', 'Set', 'Map', 'WeakMap', 'WeakSet']
        if (safeObjects.includes(objExpr)) return

        // 如果是本地导入的对象访问，尝试检查方法是否存在
        if (localImports.has(objExpr)) {
          const sourcePath = localImports.get(objExpr)!
          if (checkMemberExists(sourcePath, methodName)) {
            return
          }
        }

        // 跳过已知的数组方法
        const arrayMethods = ['forEach', 'map', 'filter', 'reduce', 'find', 'some', 'every', 'findIndex', 'includes', 'indexOf', 'join', 'slice', 'splice']
        if (arrayMethods.includes(methodName)) return

        // 跳过 Vue 组件的 props
        if (objExpr === 'props') return

        // 使用增强的守卫检测
        // 也检查是否有 typeof 检查
        const hasTypeCheck = hasFunctionTypeGuard(node, `${objExpr}.${methodName}`)
        const hasGeneralGuard = hasGuardContext(node, objExpr)

        if (!hasTypeCheck && !hasGeneralGuard) {
          results.push({
            rule: 'null-safety/unsafe-function-call',
            message: `不安全的函数调用：\"${objExpr}.${methodName}()\"，建议使用可选链 \"${objExpr}?.${methodName}()\" 或添加类型检查`,
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
 * 检查是否有函数类型守卫
 */
function hasFunctionTypeGuard(node: ts.Node, functionExpr: string): boolean {
  let parent: ts.Node | undefined = node.parent

  while (parent) {
    if (ts.isBinaryExpression(parent)) {
      const leftText = parent.left.getText()
      const rightText = parent.right.getText()

      // 检查 typeof obj.method === 'function'
      if ((leftText.includes(`typeof ${functionExpr}`) && rightText.includes('function')) ||
        (rightText.includes(`typeof ${functionExpr}`) && leftText.includes('function'))) {
        return true
      }

      // 检查 obj.method && ...
      if (parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
        if (leftText.includes(functionExpr)) {
          return true
        }
      }
    }

    if (ts.isIfStatement(parent)) {
      const conditionText = parent.expression.getText()
      if (conditionText.includes(`typeof ${functionExpr}`) || conditionText.includes(functionExpr)) {
        return true
      }
    }

    parent = parent.parent
  }

  return false
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
 * 检查解构赋值 (P1) - AST 版本
 * 解构可能为空的对象时应提供默认值
 */
function checkDestructuring(filePath: string, fullContent: string, scriptContent: string): CheckResult[] {
  const results: CheckResult[] = []
  const sourceFile = ASTHelper.parse(scriptContent, filePath)

  ASTHelper.traverse(sourceFile, node => {
    // 检测变量声明中的对象解构
    if (ts.isVariableDeclaration(node) && node.name.kind === ts.SyntaxKind.ObjectBindingPattern) {
      const bindingPattern = node.name as ts.ObjectBindingPattern

      // 获取初始化表达式
      if (!node.initializer) return

      const initializerText = node.initializer.getText()

      //跳过 this 对象
      if (initializerText === 'this') return

      // 检查是否有默认值：const { a } = obj || {}
      const hasDefaultFallback = ts.isBinaryExpression(node.initializer) &&
        (node.initializer.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
          node.initializer.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)

      if (hasDefaultFallback) return

      // 检查解构模式中是否所有属性都有默认值
      const allPropertiesHaveDefaults = bindingPattern.elements.every(element => {
        return element.initializer !== undefined
      })

      if (allPropertiesHaveDefaults) return

      // 跳过简单的对象字面量初始化
      if (ts.isObjectLiteralExpression(node.initializer)) return

      // 使用增强的守卫检测
      // 对于简单标识符，检查它是否有守卫
      if (ts.isIdentifier(node.initializer)) {
        const varName = node.initializer.getText()
        if (hasGuardContext(node, varName)) return
      }

      // 获取属性列表（用于错误消息）
      const properties = bindingPattern.elements
        .map(el => el.propertyName ? el.propertyName.getText() : el.name.getText())
        .join(', ')

      results.push({
        rule: 'null-safety/unsafe-destructuring',
        message: `不安全的解构赋值，\"${initializerText}\" 可能为空，建议添加默认值：const { ${properties} } = ${initializerText} || {}`,
        file: filePath,
        type: 'warning',
        line: ASTHelper.getLine(node, sourceFile)
      })
    }
  })

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
