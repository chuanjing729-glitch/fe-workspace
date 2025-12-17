import path from 'path'
import { RuleChecker, CheckResult, PluginOptions } from '../types'
import { isVueFile, isJsFile, getBaseName } from '../utils/file-helper'

/**
 * 文件命名规范检查
 * 
 * 规则：
 * - Vue 组件文件使用 PascalCase（如 UserProfile.vue）
 * - JS/TS 文件使用 kebab-case（如 api-client.js）
 * - 测试文件必须包含 .test. 或 .spec.
 * - 目录使用 kebab-case
 */
export const namingRule: RuleChecker = {
  name: 'naming',
  description: '文件命名规范检查',
  
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    const fileName = path.basename(filePath)
    const baseName = getBaseName(filePath)
    const dirName = path.basename(path.dirname(filePath))

    // 检查 Vue 组件命名
    if (isVueFile(filePath)) {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(baseName)) {
        results.push({
          type: 'error',
          rule: 'naming/vue-component',
          message: `Vue 组件文件应使用 PascalCase 命名，当前: ${fileName}`,
          file: filePath
        })
      }
    }

    // 检查 JS/TS 文件命名（排除 Vue 文件和测试文件）
    if (isJsFile(filePath) && !filePath.includes('.vue')) {
      const isTestFile = /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(fileName)
      
      if (!isTestFile) {
        // 普通 JS/TS 文件应使用 kebab-case
        if (!/^[a-z][a-z0-9-]*$/.test(baseName)) {
          results.push({
            type: 'error',
            rule: 'naming/js-file',
            message: `JS/TS 文件应使用 kebab-case 命名，当前: ${fileName}`,
            file: filePath
          })
        }
      } else {
        // 测试文件的主文件名也应该是 kebab-case
        const mainName = baseName.replace(/\.(test|spec)$/, '')
        if (!/^[a-z][a-z0-9-]*$/.test(mainName)) {
          results.push({
            type: 'warning',
            rule: 'naming/test-file',
            message: `测试文件的主文件名应使用 kebab-case，当前: ${fileName}`,
            file: filePath
          })
        }
      }
    }

    // 检查目录命名（应使用 kebab-case）
    if (dirName && !['src', 'dist', 'node_modules', 'build'].includes(dirName)) {
      if (!/^[a-z][a-z0-9-]*$/.test(dirName) && dirName !== '.') {
        results.push({
          type: 'warning',
          rule: 'naming/directory',
          message: `目录应使用 kebab-case 命名，当前: ${dirName}`,
          file: filePath
        })
      }
    }

    // 检查文件名中是否包含空格或特殊字符
    if (/[\s\u4e00-\u9fa5]/.test(fileName)) {
      results.push({
        type: 'error',
        rule: 'naming/special-chars',
        message: `文件名不应包含空格或中文字符，当前: ${fileName}`,
        file: filePath
      })
    }

    return results
  }
}
