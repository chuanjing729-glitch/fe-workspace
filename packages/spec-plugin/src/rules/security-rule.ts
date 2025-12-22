import { CheckResult, PluginOptions, RuleChecker } from '../types'

/**
 * 安全检查规则
 * - XSS 风险检测
 * - SQL 注入风险
 * - eval 使用检测
 * - innerHTML 使用检测
 * - 敏感信息泄漏
 * - HTTPS 检查
 */

/**
 * 检查 XSS 风险
 */
function checkXSSRisks(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查危险的 DOM 操作
  const dangerousAPIs = [
    { api: 'innerHTML', message: '使用 innerHTML 可能导致 XSS 攻击，建议使用 textContent 或进行 HTML 转义' },
    { api: 'outerHTML', message: '使用 outerHTML 可能导致 XSS 攻击，建议谨慎使用' },
    { api: 'document.write', message: '使用 document.write 可能导致 XSS 攻击，建议使用 DOM 操作' },
    { api: 'insertAdjacentHTML', message: '使用 insertAdjacentHTML 可能导致 XSS 攻击，建议使用 textContent' }
  ]
  
  for (const { api, message } of dangerousAPIs) {
    const regex = new RegExp(`\\b${api.replace('.', '\\.')}\\s*[=(]`, 'g')
    let match: RegExpExecArray | null
    
    while ((match = regex.exec(content)) !== null) {
      const line = content.substring(0, match.index).split('\n').length
      
      results.push({
        type: 'warning',
        rule: 'security/xss',
        message,
        file: filePath,
        line
      })
    }
  }
  
  // 检查 v-html 的使用（Vue）
  const vHtmlRegex = /v-html\s*=\s*["']([^"']+)["']/g
  let match: RegExpExecArray | null
  
  while ((match = vHtmlRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length
    
    results.push({
      type: 'warning',
      rule: 'security/xss',
      message: '使用 v-html 可能导致 XSS 攻击，请确保内容已经过转义或来自可信源',
      file: filePath,
      line
    })
  }
  
  // 检查 dangerouslySetInnerHTML (React)
  if (content.includes('dangerouslySetInnerHTML')) {
    const line = content.split('\n').findIndex(l => l.includes('dangerouslySetInnerHTML')) + 1
    
    results.push({
      type: 'warning',
      rule: 'security/xss',
      message: '使用 dangerouslySetInnerHTML 可能导致 XSS 攻击，请确保内容已经过转义',
      file: filePath,
      line
    })
  }
  
  return results
}

/**
 * 检查 eval 和 Function 构造器使用
 */
function checkEvalUsage(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查 eval 使用
  const evalRegex = /\beval\s*\(/g
  let match: RegExpExecArray | null
  
  while ((match = evalRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length
    
    results.push({
      type: 'error',
      rule: 'security/eval',
      message: '禁止使用 eval()，存在安全风险且影响性能',
      file: filePath,
      line
    })
  }
  
  // 检查 new Function 使用
  const newFunctionRegex = /new\s+Function\s*\(/g
  
  while ((match = newFunctionRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length
    
    results.push({
      type: 'error',
      rule: 'security/function-constructor',
      message: '禁止使用 Function 构造器，存在安全风险',
      file: filePath,
      line
    })
  }
  
  return results
}

/**
 * 检查敏感信息泄漏
 */
function checkSensitiveInfo(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查可能的 API Key、密码等敏感信息
  const sensitivePatterns = [
    { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]([a-zA-Z0-9_-]{10,})['"]/gi, type: 'API Key' },
    { pattern: /\b(sk|pk)_[a-zA-Z0-9]{6,}/g, type: 'API Key' },  // 匹配 sk_123456 格式
    { pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/gi, type: '密码' },
    { pattern: /(?:secret|token)\s*[:=]\s*['"][^'"]{20,}['"]/gi, type: 'Secret/Token' },
    { pattern: /(?:access[_-]?token)\s*[:=]\s*['"][^'"]{20,}['"]/gi, type: 'Access Token' }
  ]
  
  for (const { pattern, type } of sensitivePatterns) {
    let match: RegExpExecArray | null
    
    while ((match = pattern.exec(content)) !== null) {
      const line = content.substring(0, match.index).split('\n').length
      
      // 跳过明显的示例代码
      if (match[0].includes('your-') || match[0].includes('example') || match[0].includes('xxx')) {
        continue
      }
      
      results.push({
        type: 'error',
        rule: 'security/sensitive-info',
        message: `检测到可能的${type}硬编码，请使用环境变量或配置文件`,
        file: filePath,
        line
      })
    }
  }
  
  return results
}

/**
 * 检查不安全的HTTP请求
 */
function checkInsecureRequests(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查 HTTP 请求（非 HTTPS）
  const httpUrlRegex = /['"]http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)[^'"]+['"]/g
  let match: RegExpExecArray | null
  
  while ((match = httpUrlRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length
    
    results.push({
      type: 'warning',
      rule: 'security/insecure-http',
      message: '检测到非 HTTPS 请求，建议使用 HTTPS 保证数据安全',
      file: filePath,
      line
    })
  }
  
  return results
}

/**
 * 检查不安全的随机数生成
 */
function checkInsecureRandom(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查 Math.random() 用于安全相关场景
  const mathRandomRegex = /Math\.random\(\)/g
  
  // 如果文件中包含 token、password、secret 等关键词，提示使用安全的随机数生成
  if (/\b(token|password|secret|key|salt)\b/i.test(content)) {
    let match: RegExpExecArray | null
    
    while ((match = mathRandomRegex.exec(content)) !== null) {
      const line = content.substring(0, match.index).split('\n').length
      
      results.push({
        type: 'warning',
        rule: 'security/insecure-random',
        message: 'Math.random() 不应用于安全相关场景，建议使用 crypto.getRandomValues()',
        file: filePath,
        line
      })
    }
  }
  
  return results
}

/**
 * 检查console.log中的敏感信息
 */
function checkConsoleLog(content: string, filePath: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查 console.log 中可能包含敏感信息
  const consoleLogRegex = /console\.log\s*\([^)]*(?:password|token|secret|key)[^)]*\)/gi
  let match: RegExpExecArray | null
  
  while ((match = consoleLogRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length
    
    results.push({
      type: 'warning',
      rule: 'security/console-log-sensitive',
      message: 'console.log 可能包含敏感信息，生产环境请移除',
      file: filePath,
      line
    })
  }
  
  return results
}

/**
 * 安全检查
 */
export const securityRule: RuleChecker = {
  name: 'security',
  description: '安全检查（XSS、eval、敏感信息、不安全HTTP、不安全随机数）',
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    
    // 只检查 JS/TS/Vue 文件
    if (!/\.(js|ts|jsx|tsx|vue)$/.test(filePath)) {
      return results
    }
    
    try {
      // 1. XSS 风险检查
      results.push(...checkXSSRisks(content, filePath))
      
      // 2. eval 使用检查
      results.push(...checkEvalUsage(content, filePath))
      
      // 3. 敏感信息泄漏检查
      results.push(...checkSensitiveInfo(content, filePath))
      
      // 4. 不安全的 HTTP 请求检查
      results.push(...checkInsecureRequests(content, filePath))
      
      // 5. 不安全的随机数生成检查
      results.push(...checkInsecureRandom(content, filePath))
      
      // 6. console.log 敏感信息检查
      results.push(...checkConsoleLog(content, filePath))
      
    } catch (error: any) {
      console.warn(`安全检查失败: ${filePath}`, error.message)
    }
    
    return results
  }
}
