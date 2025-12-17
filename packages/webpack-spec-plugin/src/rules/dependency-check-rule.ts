import { RuleChecker, CheckResult } from '../types'

/**
 * 依赖检查规则检查器
 * 检测未使用的导入和重复依赖
 */
export const dependencyCheckRule: RuleChecker = {
  name: '依赖检查',
  description: '检测未使用的导入、重复依赖等问题，优化包体积',
  
  check(filePath: string, content: string): CheckResult[] {
    const results: CheckResult[] = []

    // 只检查 JS/TS/Vue 文件
    if (!filePath.match(/\.(js|ts|jsx|tsx|vue)$/)) {
      return results
    }

    const lines = content.split('\n')
    const imports: Map<string, number> = new Map()

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // 1. 检测重复导入
      const importMatch = line.match(/import\s+.*from\s+['"](.+)['"]/)
      if (importMatch) {
        const moduleName = importMatch[1]
        if (imports.has(moduleName)) {
          results.push({
            rule: '依赖检查',
            type: 'warning',
            message: `重复导入模块 ${moduleName}`,
            suggestion: '合并导入语句，避免重复导入',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
        imports.set(moduleName, lineNumber)
      }

      // 2. 检测导入但未使用
      const namedImportMatch = line.match(/import\s+\{(.+)\}\s+from/)
      if (namedImportMatch) {
        const importedNames = namedImportMatch[1].split(',').map(n => n.trim().split(' as ')[0])
        importedNames.forEach(name => {
          const cleanName = name.trim()
          // 简单检查：在文件中搜索使用
          const usageRegex = new RegExp(`\\b${cleanName}\\b`, 'g')
          const matches = content.match(usageRegex) || []
          // 如果只出现一次（就是导入语句本身），说明未使用
          if (matches.length === 1) {
            results.push({
              rule: '依赖检查',
              type: 'warning',
              message: `导入了 ${cleanName} 但未使用`,
              suggestion: '移除未使用的导入',
              file: filePath,
              line: lineNumber,
              code: line.trim()
            })
          }
        })
      }

      // 3. 检测导入整个库但只使用少量功能
      if (line.match(/import\s+\*\s+as\s+\w+\s+from\s+['"]lodash['"]/)) {
        results.push({
          rule: '依赖检查',
          type: 'warning',
          message: '导入了整个 lodash 库',
          suggestion: '使用按需导入，如 import { debounce } from \'lodash-es\'',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 4. 检测导入了 moment 但项目可能已有 dayjs
      if (line.match(/import.*from\s+['"]moment['"]/)) {
        results.push({
          rule: '依赖检查',
          type: 'warning',
          message: '使用了 moment 库',
          suggestion: '考虑使用更轻量的 dayjs 或 @51jbs/core-utils 的日期工具',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 5. 检测导入了 jQuery
      if (line.match(/import.*from\s+['"]jquery['"]/)) {
        results.push({
          rule: '依赖检查',
          type: 'warning',
          message: '使用了 jQuery',
          suggestion: 'Vue 项目建议使用原生 DOM 操作或 @51jbs/core-utils 的 DOM 工具',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 6. 检测导入相对路径过深
      if (line.match(/from\s+['"](\.\.[/\\]){3,}/)) {
        results.push({
          rule: '依赖检查',
          type: 'warning',
          message: '导入路径层级过深',
          suggestion: '考虑配置路径别名（@/）简化导入',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }
    })

    return results
  }
}
