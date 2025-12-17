import { RuleChecker, CheckResult, PluginOptions } from '../types'

/**
 * CSS 开发规范检查
 * 
 * 检查项：
 * 1. 选择器嵌套深度检查 (P1)
 * 2. 禁止使用 ID 选择器 (P1)
 * 3. 禁止使用通用选择器 (P1)
 */
export const cssRule: RuleChecker = {
  name: 'css',
  description: 'CSS 开发规范检查',
  
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    
    // 提取 CSS 内容
    let cssContent = content
    let cssStartIndex = 0
    
    if (filePath.endsWith('.vue')) {
      // Vue 文件，提取 style 部分
      const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/)
      if (!styleMatch) {
        return results
      }
      cssContent = styleMatch[1]
      cssStartIndex = content.indexOf(styleMatch[0])
    } else if (!/\.(css|scss|sass|less)$/.test(filePath)) {
      return results
    }
    
    // 1. 嵌套深度检查 (P1)
    results.push(...checkNestingDepth(filePath, content, cssContent, cssStartIndex))
    
    // 2. 禁止 ID 选择器 (P1)
    results.push(...checkIdSelector(filePath, content, cssContent, cssStartIndex))
    
    // 3. 禁止通用选择器 (P1)
    results.push(...checkUniversalSelector(filePath, content, cssContent, cssStartIndex))
    
    return results
  }
}

/**
 * 检查选择器嵌套深度 (P1)
 */
function checkNestingDepth(
  filePath: string, 
  fullContent: string, 
  cssContent: string, 
  cssStartIndex: number
): CheckResult[] {
  const results: CheckResult[] = []
  const lines = cssContent.split('\n')
  
  let depth = 0
  let maxDepth = 0
  let maxDepthLine = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 跳过注释
    if (line.startsWith('/*') || line.startsWith('//')) {
      continue
    }
    
    // 计算花括号
    const openBraces = (line.match(/{/g) || []).length
    const closeBraces = (line.match(/}/g) || []).length
    
    depth += openBraces
    
    if (depth > maxDepth && openBraces > 0) {
      maxDepth = depth
      maxDepthLine = i + 1
    }
    
    depth -= closeBraces
    depth = Math.max(0, depth) // 防止负数
  }
  
  const MAX_DEPTH = 3
  
  if (maxDepth > MAX_DEPTH) {
    const position = cssStartIndex + cssContent.split('\n').slice(0, maxDepthLine - 1).join('\n').length
    const lines = fullContent.substring(0, position).split('\n')
    const line = lines.length
    
    results.push({
      rule: 'css/max-nesting-depth',
      message: `CSS 选择器嵌套过深 (${maxDepth} 层，建议 ≤ ${MAX_DEPTH} 层)`,
      file: filePath,
      type: 'warning',
      line
    })
  }
  
  return results
}

/**
 * 检查 ID 选择器 (P1)
 */
function checkIdSelector(
  filePath: string, 
  fullContent: string, 
  cssContent: string, 
  cssStartIndex: number
): CheckResult[] {
  const results: CheckResult[] = []
  const lines = cssContent.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 跳过注释和空行
    if (!line || line.startsWith('/*') || line.startsWith('//')) {
      continue
    }
    
    // 匹配 ID 选择器（行首或逗号后的 #开头）
    if (/^#[\w-]+|,\s*#[\w-]+/.test(line)) {
      const position = cssStartIndex + cssContent.split('\n').slice(0, i).join('\n').length
      const lineNumber = fullContent.substring(0, position).split('\n').length + 1
      
      results.push({
        rule: 'css/no-id-selector',
        message: '避免使用 ID 选择器，建议使用 class',
        file: filePath,
        type: 'warning',
        line: lineNumber
      })
    }
  }
  
  return results
}

/**
 * 检查通用选择器 (P1)
 */
function checkUniversalSelector(
  filePath: string, 
  fullContent: string, 
  cssContent: string, 
  cssStartIndex: number
): CheckResult[] {
  const results: CheckResult[] = []
  const lines = cssContent.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 跳过注释和空行
    if (!line || line.startsWith('/*') || line.startsWith('//')) {
      continue
    }
    
    // 匹配通用选择器 *，但排除伪元素 ::before, ::after
    if (/^\*\s*\{|,\s*\*\s*\{/.test(line) && !/::before|::after/.test(line)) {
      const position = cssStartIndex + cssContent.split('\n').slice(0, i).join('\n').length
      const lineNumber = fullContent.substring(0, position).split('\n').length + 1
      
      results.push({
        rule: 'css/no-universal-selector',
        message: '避免使用通用选择器 *，影响性能',
        file: filePath,
        type: 'warning',
        line: lineNumber
      })
    }
  }
  
  return results
}
