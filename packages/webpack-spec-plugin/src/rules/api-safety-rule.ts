import { RuleChecker, CheckResult } from '../types'

/**
 * 接口安全规则检查器
 * 检测接口调用缺少错误处理的情况
 */
export const apiSafetyRule: RuleChecker = {
  name: '接口安全检查',
  description: '检测接口调用缺少错误处理，避免未捕获的异常导致页面崩溃',
  
  check(filePath: string, content: string): CheckResult[] {
    const results: CheckResult[] = []

    // 只检查 JS/TS/Vue 文件
    if (!filePath.match(/\.(js|ts|jsx|tsx|vue)$/)) {
      return results
    }

    const lines = content.split('\n')

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // 1. 检测 axios/fetch 没有 .catch
      const axiosMatch = line.match(/(axios\.(get|post|put|delete|patch)|fetch)\s*\(/)
      if (axiosMatch) {
        // 查找后续几行是否有 .catch 或 try/catch
        const nextLines = lines.slice(index, Math.min(index + 10, lines.length)).join('\n')
        
        if (!nextLines.includes('.catch') && !nextLines.includes('try')) {
          results.push({
            rule: '接口安全检查',
            type: 'error',
            message: '接口调用缺少错误处理',
            suggestion: '添加 .catch() 或使用 try/catch 处理接口错误',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 2. 检测 Promise 链缺少 .catch
      if (line.includes('.then(') && !line.includes('.catch')) {
        // 查找后续行是否有 .catch
        const nextLines = lines.slice(index, Math.min(index + 5, lines.length)).join('\n')
        
        if (!nextLines.includes('.catch')) {
          results.push({
            rule: '接口安全检查',
            type: 'warning',
            message: 'Promise 链缺少 .catch',
            suggestion: '添加 .catch() 处理 Promise 错误',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 3. 检测 async 函数内的 await 没有 try/catch
      if (line.includes('await ') && (line.includes('axios') || line.includes('fetch') || line.includes('request'))) {
        // 向上查找是否在 try 块内
        const prevLines = lines.slice(Math.max(0, index - 20), index).join('\n')
        const nextLines = lines.slice(index, Math.min(index + 5, lines.length)).join('\n')
        
        if (!prevLines.includes('try {') && !nextLines.includes('catch')) {
          results.push({
            rule: '接口安全检查',
            type: 'error',
            message: 'await 接口调用缺少 try/catch',
            suggestion: '使用 try/catch 包裹 await 调用',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 4. 检测接口响应没有校验
      if (line.match(/\.(then|success)\s*\(\s*(?:res|response|data)\s*=>/)) {
        const nextLines = lines.slice(index, Math.min(index + 3, lines.length)).join('\n')
        
        // 检查是否有响应状态校验
        if (!nextLines.match(/if\s*\(.*\.(code|status|success)/)) {
          results.push({
            rule: '接口安全检查',
            type: 'warning',
            message: '接口响应缺少状态校验',
            suggestion: '添加响应状态校验，如 if (res.code === 200)',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 5. 检测直接访问响应数据（可能为 undefined）
      if (line.match(/res\.(data|result)\.\w+/) && !line.includes('?.')) {
        results.push({
          rule: '接口安全检查',
          type: 'warning',
          message: '直接访问响应数据可能导致空指针',
          suggestion: '使用可选链 res.data?.xxx 或先判空',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 6. 检测接口超时未设置
      if (line.match(/axios\.(get|post)\s*\(/) && !content.includes('timeout')) {
        results.push({
          rule: '接口安全检查',
          type: 'warning',
          message: '接口调用未设置超时时间',
          suggestion: '在 axios 配置中设置 timeout，避免请求挂起',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 7. 检测重复请求未处理
      if (line.match(/@click.*=.*fetch|@click.*=.*axios/)) {
        const functionContent = content.substring(content.indexOf(line))
        
        if (!functionContent.includes('loading') && !functionContent.includes('disabled')) {
          results.push({
            rule: '接口安全检查',
            type: 'warning',
            message: '点击事件中的接口调用未防止重复点击',
            suggestion: '添加 loading 状态或使用防抖指令',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }

      // 8. 检测接口调用在循环中（性能问题）
      if (line.match(/for\s*\(|forEach|map/) && content.includes('axios') || content.includes('fetch')) {
        const nextLines = lines.slice(index, Math.min(index + 10, lines.length)).join('\n')
        
        if (nextLines.match(/axios\.(get|post)/)) {
          results.push({
            rule: '接口安全检查',
            type: 'warning',
            message: '循环中调用接口可能导致性能问题',
            suggestion: '考虑使用批量接口或 Promise.all() 并发调用',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }
    })

    return results
  }
}
