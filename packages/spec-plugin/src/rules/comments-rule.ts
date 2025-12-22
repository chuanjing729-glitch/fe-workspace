import { RuleChecker, CheckResult, PluginOptions } from '../types'
import { isJsFile, isVueFile } from '../utils/file-helper'

/**
 * 注释规范检查
 * 
 * 规则：
 * - 复杂函数必须有 JSDoc 注释
 * - TODO/FIXME 必须包含责任人
 * - 不应有大段注释代码
 */
export const commentsRule: RuleChecker = {
  name: 'comments',
  description: '注释规范检查',
  
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    
    if (!isJsFile(filePath) && !isVueFile(filePath)) {
      return results
    }

    const lines = content.split('\n')

    // 检查函数是否有 JSDoc 注释
    const functionPattern = /(export\s+)?(async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g
    const classMethodPattern = /(async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g
    
    let match
    while ((match = functionPattern.exec(content)) !== null) {
      const funcName = match[3]
      const funcIndex = match.index
      
      // 查找函数前是否有 JSDoc 注释
      const beforeFunc = content.substring(Math.max(0, funcIndex - 200), funcIndex)
      const hasJsDoc = /\/\*\*[\s\S]*?\*\//.test(beforeFunc)
      
      // 简单函数可以不需要 JSDoc
      const funcBody = content.substring(funcIndex, funcIndex + 500)
      const funcLines = funcBody.split('\n').length
      
      if (funcLines > 10 && !hasJsDoc) {
        const lineNumber = content.substring(0, funcIndex).split('\n').length
        results.push({
          type: 'warning',
          rule: 'comments/jsdoc',
          message: `复杂函数 "${funcName}" 建议添加 JSDoc 注释说明参数和返回值`,
          file: filePath,
          line: lineNumber
        })
      }
    }

    // 检查 TODO/FIXME 格式
    lines.forEach((line, index) => {
      if (/\/\/\s*(TODO|FIXME)(?!\()/i.test(line)) {
        results.push({
          type: 'warning',
          rule: 'comments/todo-format',
          message: 'TODO/FIXME 应标注责任人，格式：// TODO(zhangsan): 说明',
          file: filePath,
          line: index + 1
        })
      }
    })

    // 检查是否有大段注释代码（超过10行连续注释代码）
    let commentedCodeLines = 0
    let commentBlockStart = 0
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      const isCommentedCode = /^\/\/\s*(const|let|var|function|class|import|export|if|for|while)/.test(trimmed)
      
      if (isCommentedCode) {
        if (commentedCodeLines === 0) {
          commentBlockStart = index + 1
        }
        commentedCodeLines++
      } else {
        if (commentedCodeLines > 10) {
          results.push({
            type: 'warning',
            rule: 'comments/commented-code',
            message: `发现大段注释代码（${commentedCodeLines}行），建议直接删除，使用 Git 历史查看`,
            file: filePath,
            line: commentBlockStart
          })
        }
        commentedCodeLines = 0
      }
    })

    return results
  }
}
