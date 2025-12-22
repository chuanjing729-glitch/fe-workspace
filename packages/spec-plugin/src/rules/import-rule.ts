import { CheckResult, PluginOptions, RuleChecker } from '../types'
import * as path from 'path'
import * as fs from 'fs'

/**
 * 导入规范检查规则
 * - 循环依赖检测
 * - 未使用的导入
 * - 重复导入
 * - 导入路径规范
 */

interface DependencyGraph {
  [file: string]: Set<string>
}

/**
 * 检测循环依赖
 */
function detectCircularDependencies(
  filePath: string,
  content: string,
  rootDir: string,
  graph: DependencyGraph = {},
  visited: Set<string> = new Set(),
  stack: string[] = []
): string[] | null {
  const normalizedPath = path.normalize(filePath)
  
  // 检测到循环
  if (stack.includes(normalizedPath)) {
    const cycleStart = stack.indexOf(normalizedPath)
    return stack.slice(cycleStart).concat([normalizedPath])
  }
  
  // 已访问过的节点
  if (visited.has(normalizedPath)) {
    return null
  }
  
  visited.add(normalizedPath)
  stack.push(normalizedPath)
  
  // 获取当前文件的所有导入
  const imports = extractImports(content, filePath)
  graph[normalizedPath] = new Set(imports)
  
  // 递归检查每个导入
  for (const importPath of imports) {
    if (!fs.existsSync(importPath)) continue
    
    try {
      const importContent = fs.readFileSync(importPath, 'utf-8')
      const cycle = detectCircularDependencies(
        importPath,
        importContent,
        rootDir,
        graph,
        visited,
        [...stack]
      )
      
      if (cycle) {
        return cycle
      }
    } catch {
      // 忽略无法读取的文件
    }
  }
  
  stack.pop()
  return null
}

/**
 * 提取文件中的所有导入路径
 */
function extractImports(content: string, currentFile: string): string[] {
  const imports: string[] = []
  const dir = path.dirname(currentFile)
  
  // 匹配 ES6 import
  const es6ImportRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g
  // 匹配 CommonJS require
  const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g
  // 匹配动态 import
  const dynamicImportRegex = /import\s*\(['"]([^'"]+)['"]\)/g
  
  let match: RegExpExecArray | null
  
  // ES6 imports
  while ((match = es6ImportRegex.exec(content)) !== null) {
    const importPath = resolveImportPath(match[1], dir)
    if (importPath) imports.push(importPath)
  }
  
  // CommonJS requires
  while ((match = requireRegex.exec(content)) !== null) {
    const importPath = resolveImportPath(match[1], dir)
    if (importPath) imports.push(importPath)
  }
  
  // Dynamic imports
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    const importPath = resolveImportPath(match[1], dir)
    if (importPath) imports.push(importPath)
  }
  
  return imports
}

/**
 * 解析导入路径为绝对路径
 */
function resolveImportPath(importPath: string, currentDir: string): string | null {
  // 跳过 node_modules 导入
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null
  }
  
  let resolved = path.resolve(currentDir, importPath)
  
  // 尝试添加扩展名
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '']
  for (const ext of extensions) {
    const testPath = resolved + ext
    if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
      return testPath
    }
  }
  
  // 尝试 index 文件
  for (const ext of extensions) {
    const testPath = path.join(resolved, `index${ext}`)
    if (fs.existsSync(testPath)) {
      return testPath
    }
  }
  
  return null
}

/**
 * 检查未使用的导入
 */
function checkUnusedImports(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 匹配所有命名导入
  const namedImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g
  let match: RegExpExecArray | null
  
  while ((match = namedImportRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(s => {
      const parts = s.trim().split(/\s+as\s+/)
      return parts[parts.length - 1].trim()
    })
    
    for (const importName of imports) {
      // 检查导入是否在代码中使用
      const usageRegex = new RegExp(`\\b${importName}\\b`, 'g')
      const matches = content.match(usageRegex)
      
      // 如果只出现一次（即只在导入语句中），则未使用
      if (matches && matches.length === 1) {
        results.push({
          type: 'warning',
          rule: 'import/unused',
          message: `导入 "${importName}" 未使用，建议移除`,
          file: filePath
        })
      }
    }
  }
  
  return results
}

/**
 * 检查重复导入
 */
function checkDuplicateImports(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  const importMap = new Map<string, number>()
  
  const importRegex = /(?:import|require)\s*(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1]
    const count = importMap.get(importPath) || 0
    importMap.set(importPath, count + 1)
  }
  
  for (const [importPath, count] of importMap.entries()) {
    if (count > 1) {
      results.push({
        type: 'warning',
        rule: 'import/duplicate',
        message: `重复导入 "${importPath}" ${count} 次，建议合并`,
        file: filePath
      })
    }
  }
  
  return results
}

/**
 * 检查导入路径规范
 */
function checkImportPathStyle(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  const importRegex = /(?:import|require)\s*(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1]
    
    // 检查是否使用相对路径导入上层目录过多
    const parentDirCount = (importPath.match(/\.\.\//g) || []).length
    if (parentDirCount > 3) {
      results.push({
        type: 'warning',
        rule: 'import/deep-relative',
        message: `导入路径 "${importPath}" 嵌套层级过深（${parentDirCount}层），建议使用别名`,
        file: filePath,
        line: content.substring(0, match.index).split('\n').length
      })
    }
    
    // 检查是否缺少文件扩展名（Vue 文件除外）
    if (importPath.startsWith('.') && !importPath.match(/\.(js|ts|jsx|tsx|vue|css|scss|less)$/)) {
      const dir = path.dirname(filePath)
      const resolved = resolveImportPath(importPath, dir)
      
      // 如果解析成功但路径中没有扩展名，建议添加
      if (resolved && !importPath.includes('/index')) {
        results.push({
          type: 'warning',
          rule: 'import/extension',
          message: `导入路径 "${importPath}" 建议显式添加文件扩展名`,
          file: filePath,
          line: content.substring(0, match.index).split('\n').length
        })
      }
    }
  }
  
  return results
}

/**
 * 导入规范检查
 */
export const importRule: RuleChecker = {
  name: 'import',
  description: '导入规范检查（循环依赖、未使用导入、重复导入、导入路径规范）',
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    
    // 只检查 JS/TS/Vue 文件
    if (!/\.(js|ts|jsx|tsx|vue)$/.test(filePath)) {
      return results
    }
    
    try {
      const rootDir = options.rootDir || process.cwd()
      
      // 1. 循环依赖检测
      const cycle = detectCircularDependencies(filePath, content, rootDir)
      if (cycle) {
        const cycleStr = cycle.map(p => path.relative(rootDir, p)).join(' → ')
        results.push({
          type: 'error',
          rule: 'import/circular',
          message: `检测到循环依赖: ${cycleStr}`,
          file: filePath
        })
      }
      
      // 2. 未使用的导入检查
      results.push(...checkUnusedImports(content, filePath))
      
      // 3. 重复导入检查
      results.push(...checkDuplicateImports(content, filePath))
      
      // 4. 导入路径规范检查
      results.push(...checkImportPathStyle(content, filePath))
      
    } catch (error: any) {
      // 忽略检查错误，不影响构建
      console.warn(`导入规范检查失败: ${filePath}`, error.message)
    }
    
    return results
  }
}
