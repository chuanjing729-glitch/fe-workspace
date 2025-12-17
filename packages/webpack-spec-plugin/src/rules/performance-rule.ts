import { RuleChecker, CheckResult, PluginOptions } from '../types'
import { isImageFile, isFontFile, isJsFile, isStyleFile, getFileSize } from '../utils/file-helper'

/**
 * 性能规范检查
 * 
 * 规则：
 * - 图片大小限制（默认 500KB）
 * - JS 文件大小限制（默认 300KB）
 * - CSS 文件大小限制（默认 100KB）
 * - 字体文件大小限制（默认 200KB）
 * - 检查是否使用懒加载
 * - 检查是否有防抖/节流
 */
export const performanceRule: RuleChecker = {
  name: 'performance',
  description: '性能规范检查',
  
  check(filePath: string, content: string, options: PluginOptions): CheckResult[] {
    const results: CheckResult[] = []
    // 优先使用 content 长度，如果 content 为空则尝试读取文件
    let fileSize = content ? Math.round(Buffer.byteLength(content, 'utf8') / 1024) : getFileSize(filePath)
    const budget = options.performanceBudget || {}

    // 检查图片大小
    if (isImageFile(filePath)) {
      const maxSize = budget.maxImageSize || 500
      if (fileSize > maxSize) {
        results.push({
          type: 'error',
          rule: 'performance/image-size',
          message: `图片文件过大 (${fileSize}KB > ${maxSize}KB)，建议压缩或使用更优化的格式`,
          file: filePath
        })
      }

      // 检查是否使用了推荐的图片格式
      if (filePath.endsWith('.bmp') || filePath.endsWith('.tif')) {
        results.push({
          type: 'warning',
          rule: 'performance/image-format',
          message: '不推荐使用 BMP/TIF 格式，建议使用 WebP、PNG 或 JPEG',
          file: filePath
        })
      }
    }

    // 检查 JS 文件大小
    if (isJsFile(filePath) && !filePath.includes('.min.')) {
      const maxSize = budget.maxJsSize || 300
      if (fileSize > maxSize) {
        results.push({
          type: 'error',
          rule: 'performance/js-size',
          message: `JS 文件过大 (${fileSize}KB > ${maxSize}KB)，建议进行代码分割`,
          file: filePath
        })
      }

      // 检查是否使用了懒加载
      const hasLazyLoad = /import\s*\(|React\.lazy|defineAsyncComponent/.test(content)
      const hasRoutes = /router|routes/i.test(content)
      
      if (hasRoutes && !hasLazyLoad && fileSize > 50) {
        results.push({
          type: 'warning',
          rule: 'performance/lazy-load',
          message: '路由文件建议使用懒加载提升首屏性能',
          file: filePath
        })
      }

      // 检查是否使用了防抖/节流
      const hasEventHandler = /addEventListener|onClick|onScroll|onResize|onInput/i.test(content)
      const hasDebounceThrottle = /debounce|throttle/i.test(content)
      
      if (hasEventHandler && !hasDebounceThrottle) {
        // 检查是否有高频事件
        if (/onScroll|onResize|onInput|onMouseMove/.test(content)) {
          results.push({
            type: 'warning',
            rule: 'performance/debounce-throttle',
            message: '高频事件建议使用防抖（debounce）或节流（throttle）优化性能',
            file: filePath
          })
        }
      }

      // 检查是否有循环中的 DOM 操作
      const hasLoopDomOperation = /(for|while|forEach|map)[\s\S]{0,100}(appendChild|innerHTML|createElement)/.test(content)
      if (hasLoopDomOperation) {
        results.push({
          type: 'warning',
          rule: 'performance/loop-dom',
          message: '避免在循环中进行 DOM 操作，建议使用文档片段或虚拟列表',
          file: filePath
        })
      }
    }

    // 检查 CSS 文件大小
    if (isStyleFile(filePath)) {
      const maxSize = budget.maxCssSize || 100
      if (fileSize > maxSize) {
        results.push({
          type: 'warning',
          rule: 'performance/css-size',
          message: `CSS 文件过大 (${fileSize}KB > ${maxSize}KB)，建议分割或优化`,
          file: filePath
        })
      }

      // 检查是否有复杂的选择器
      const complexSelectors = content.match(/[^{]+\{[^}]+\}/g) || []
      const hasComplexSelector = complexSelectors.some(selector => {
        const selectorPart = selector.split('{')[0]
        // 选择器层级超过 4 层
        return (selectorPart.match(/\s+/g) || []).length > 4
      })

      if (hasComplexSelector) {
        results.push({
          type: 'warning',
          rule: 'performance/css-selector',
          message: 'CSS 选择器层级过深（>4层），会影响渲染性能',
          file: filePath
        })
      }
    }

    // 检查字体文件大小
    if (isFontFile(filePath)) {
      const maxSize = budget.maxFontSize || 200
      if (fileSize > maxSize) {
        results.push({
          type: 'error',
          rule: 'performance/font-size',
          message: `字体文件过大 (${fileSize}KB > ${maxSize}KB)，建议使用字体子集或 Web 字体`,
          file: filePath
        })
      }
    }

    return results
  }
}
