import { RuleChecker, CheckResult, PluginOptions } from '../types'

/**
 * Vue 性能优化检查
 * 
 * 检查项：
 * 1. 路由懒加载检查 (P1)
 * 2. 组件异步加载检查 (P1)
 * 3. 图片懒加载检查 (P1)
 * 4. 避免 deep watch + JSON.stringify (P1)
 */
export const performanceVueRule: RuleChecker = {
  name: 'performance-vue',
  description: 'Vue 性能优化检查',
  
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    
    // 1. 路由懒加载检查
    if (filePath.includes('router') || filePath.includes('route')) {
      results.push(...checkRouteLazyLoading(filePath, content))
    }
    
    // 2. 组件异步加载检查
    if (filePath.endsWith('.vue') || filePath.endsWith('.js') || filePath.endsWith('.ts')) {
      results.push(...checkComponentLazyLoading(filePath, content))
    }
    
    // 3. 图片懒加载检查
    if (filePath.endsWith('.vue')) {
      results.push(...checkImageLazyLoading(filePath, content))
    }
    
    // 4. 避免 deep watch + JSON.stringify
    if (filePath.endsWith('.vue')) {
      results.push(...checkDeepWatchStringify(filePath, content))
    }
    
    return results
  }
}

/**
 * 检查路由懒加载 (P1)
 */
function checkRouteLazyLoading(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 检查同步导入的 Vue 组件
  const importPattern = /import\s+(\w+)\s+from\s+['"]([^'"]*\.vue)['"]/g
  let match
  
  const componentImports = new Map<string, number>()
  
  while ((match = importPattern.exec(content)) !== null) {
    const componentName = match[1]
    const lines = content.substring(0, match.index).split('\n')
    const line = lines.length
    
    componentImports.set(componentName, line)
  }
  
  // 检查这些组件是否在路由配置中使用
  for (const [componentName, line] of componentImports) {
    // 查找路由配置中直接使用组件名的情况
    const routePattern = new RegExp(`component:\\s*${componentName}[,\\s]`, 'g')
    
    if (routePattern.test(content)) {
      results.push({
        rule: 'performance/route-lazy-loading',
        message: `路由组件 "${componentName}" 应该使用懒加载`,
        file: filePath,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}

/**
 * 检查组件异步加载 (P1)
 */
function checkComponentLazyLoading(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 跳过路由文件
  if (filePath.includes('router') || filePath.includes('route')) {
    return results
  }
  
  // 提取 components 注册部分
  const componentsMatch = content.match(/components\s*:\s*\{([\s\S]*?)\}/m)
  if (!componentsMatch) {
    return results
  }
  
  const componentsContent = componentsMatch[1]
  const componentsStartIndex = content.indexOf(componentsMatch[0])
  
  // 检查大型组件库组件的同步导入
  const heavyComponents = ['Chart', 'Editor', 'Table', 'Grid', 'Calendar', 'Upload']
  
  for (const heavy of heavyComponents) {
    const pattern = new RegExp(`${heavy}\\w*\\s*:`, 'g')
    let match
    
    while ((match = pattern.exec(componentsContent)) !== null) {
      const componentName = match[0].replace(':', '').trim()
      
      // 检查是否是同步导入
      const importPattern = new RegExp(`import\\s+${componentName}\\s+from`)
      if (importPattern.test(content)) {
        const position = componentsStartIndex + match.index
        const lines = content.substring(0, position).split('\n')
        const line = lines.length
        
        results.push({
          rule: 'performance/component-lazy-loading',
          message: `大型组件 "${componentName}" 建议使用异步加载`,
          file: filePath,
          type: 'warning',
          line
        })
      }
    }
  }
  
  return results
}

/**
 * 检查图片懒加载 (P1)
 */
function checkImageLazyLoading(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 提取 template 部分
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
  if (!templateMatch) {
    return results
  }
  
  const template = templateMatch[1]
  const templateStartIndex = content.indexOf(templateMatch[0])
  
  // 查找 img 标签
  const imgPattern = /<img[^>]*>/g
  let match
  
  while ((match = imgPattern.exec(template)) !== null) {
    const imgTag = match[0]
    
    // 检查是否有懒加载属性
    const hasLazy = /v-lazy|loading\s*=\s*["']lazy["']/.test(imgTag)
    
    // 检查是否在循环中
    const beforeImg = template.substring(0, match.index)
    const isInLoop = /<[^>]*v-for/.test(beforeImg) && !/<\/[^>]+>/.test(beforeImg.slice(beforeImg.lastIndexOf('<')))
    
    if (!hasLazy && (isInLoop || imgTag.length > 50)) {
      const position = templateStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length
      
      results.push({
        rule: 'performance/image-lazy-loading',
        message: '建议为图片添加懒加载',
        file: filePath,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}

/**
 * 检查 deep watch + JSON.stringify (P1)
 */
function checkDeepWatchStringify(filePath: string, content: string): CheckResult[] {
  const results: CheckResult[] = []
  
  // 提取 script 部分
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    return results
  }
  
  const script = scriptMatch[1]
  const scriptStartIndex = content.indexOf(scriptMatch[0])
  
  // 查找 watch 定义
  const watchMatch = script.match(/watch\s*:\s*\{([\s\S]*?)\n\s*\}/m)
  if (!watchMatch) {
    return results
  }
  
  const watchContent = watchMatch[1]
  const watchStartIndex = scriptStartIndex + script.indexOf(watchMatch[0])
  
  // 检查 deep watch 中使用 JSON.stringify
  const deepWatchPattern = /(\w+)\s*:\s*\{[\s\S]*?deep\s*:\s*true[\s\S]*?\}/g
  let match
  
  while ((match = deepWatchPattern.exec(watchContent)) !== null) {
    const watchBlock = match[0]
    
    // 检查是否在 handler 中使用 JSON.stringify
    if (/JSON\.stringify/.test(watchBlock)) {
      const position = watchStartIndex + match.index
      const lines = content.substring(0, position).split('\n')
      const line = lines.length
      
      results.push({
        rule: 'performance/no-deep-watch-stringify',
        message: '避免在 deep watch 中使用 JSON.stringify，影响性能',
        file: filePath,
        type: 'warning',
        line
      })
    }
  }
  
  return results
}
