import { RuleChecker, CheckResult } from '../types'

/**
 * 消息提示一致性规则检查器
 * 检测不一致的消息提示用法，推荐统一使用工具库
 */
export const messageConsistencyRule: RuleChecker = {
  name: '消息提示一致性检查',
  description: '检测不一致的消息提示用法，确保团队统一使用 @51jbs/vue2-toolkit 的消息提示',
  
  check(filePath: string, content: string): CheckResult[] {
    const results: CheckResult[] = []

    // 只检查 JS/Vue 文件
    if (!filePath.match(/\.(js|ts|jsx|tsx|vue)$/)) {
      return results
    }

    const lines = content.split('\n')
    const messagePatterns: Map<string, number> = new Map()

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // 1. 检测 this.$message 的不同用法
      const messageMatch = line.match(/this\.\$message(\.(success|error|warning|info))?\s*\(/g)
      if (messageMatch) {
        messageMatch.forEach(match => {
          const count = messagePatterns.get(match) || 0
          messagePatterns.set(match, count + 1)
        })
      }

      // 2. 检测 Element UI 的 Message
      if (line.includes('this.$message({') && line.includes('type:')) {
        results.push({
          rule: '消息提示一致性检查',
          type: 'warning',
          message: '使用了对象形式的消息提示',
          suggestion: '建议统一使用 this.$message.success() / error() / warning() / info() 简化形式',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 3. 检测直接使用 Message 组件
      if (line.match(/import\s+.*Message.*from\s+['"]element-ui['"]/)) {
        results.push({
          rule: '消息提示一致性检查',
          type: 'warning',
          message: '直接导入 Element UI 的 Message',
          suggestion: '建议使用 @51jbs/vue2-toolkit 统一的消息提示插件',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 4. 检测原生 alert/confirm
      if (line.match(/\balert\s*\(/) || line.match(/\bconfirm\s*\(/)) {
        if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          results.push({
            rule: '消息提示一致性检查',
            type: 'warning',
            message: '使用了原生 alert/confirm',
            suggestion: '建议使用 this.$message 或 this.$confirm 替代原生弹窗',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 5. 检测硬编码的消息文本（中文）
      const chineseTextMatch = line.match(/this\.\$message.*['"]([^'"]*[\u4e00-\u9fa5]+[^'"]*)['"]/)
      if (chineseTextMatch) {
        const messageText = chineseTextMatch[1]
        // 检查是否过长（超过20个字符）
        if (messageText.length > 20) {
          results.push({
            rule: '消息提示一致性检查',
            type: 'warning',
            message: '消息文本过长',
            suggestion: '消息文本应简洁明了，建议不超过20个字符',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 6. 检测缺少错误处理的成功提示
      if (line.includes('this.$message.success') && !content.includes('.catch') && !content.includes('try')) {
        results.push({
          rule: '消息提示一致性检查',
          type: 'warning',
          message: '成功提示但未发现错误处理',
          suggestion: '确保接口调用有完整的错误处理逻辑',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }
    })

    // 7. 检测同一文件中使用了多种消息提示方式
    if (messagePatterns.size > 2) {
      const patterns = Array.from(messagePatterns.keys()).join(', ')
      results.push({
        rule: '消息提示一致性检查',
        type: 'warning',
        message: `文件中使用了 ${messagePatterns.size} 种不同的消息提示方式`,
        suggestion: `统一使用一种方式，当前使用了: ${patterns}`,
        file: filePath,
        line: 1
      })
    }

    return results
  }
}
