/**
 * URL 处理工具函数
 */

/**
 * 解析 URL 参数
 * @param url - URL 字符串（可选，默认使用当前页面URL）
 * @returns 参数对象
 */
export function parseUrlParams(url?: string): Record<string, string> {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const search = decodeURIComponent(targetUrl.split('?')[1] || '').replace(/\+/g, ' ')
  
  if (!search) {
    return {}
  }
  
  const obj: Record<string, string> = {}
  const searchArr = search.split('&')
  
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  
  return obj
}

/**
 * 删除 URL 中指定参数
 * @param url - URL 字符串
 * @param params - 要删除的参数名数组
 * @returns 删除参数后的 URL
 */
export function removeUrlParams(url: string, params: string[]): string {
  if (!url || !Array.isArray(params) || params.length === 0) {
    return url
  }
  
  let resultUrl = url
  
  params.forEach(param => {
    const fromIndex = resultUrl.indexOf(`${param}=`)
    if (fromIndex !== -1) {
      const startIndex = resultUrl.indexOf('=', fromIndex)
      const endIndex = resultUrl.indexOf('&', fromIndex)
      const hashIndex = resultUrl.indexOf('#', fromIndex)
      
      let reg: RegExp
      if (endIndex !== -1) {
        // 后面还有search参数的情况
        const num = endIndex - startIndex
        reg = new RegExp(`${param}=.{${num}}`)
        resultUrl = resultUrl.replace(reg, '')
      } else if (hashIndex !== -1) {
        // 有hash参数的情况
        const num = hashIndex - startIndex - 1
        reg = new RegExp(`&?${param}=.{${num}}`)
        resultUrl = resultUrl.replace(reg, '')
      } else {
        // search参数在最后或只有一个参数的情况
        reg = new RegExp(`&?${param}=?.*`)
        resultUrl = resultUrl.replace(reg, '')
      }
    }
  })
  
  // 如果已经没有参数，删除?号
  if (resultUrl.indexOf('=') === -1) {
    resultUrl = resultUrl.replace(/\?/, '')
  }
  
  return resultUrl
}

/**
 * 构建 URL 参数字符串
 * @param params - 参数对象
 * @returns 参数字符串
 */
export function buildUrlParams(params: Record<string, any>): string {
  if (!params || typeof params !== 'object') {
    return ''
  }
  
  const paramArray: string[] = []
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      paramArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    }
  })
  
  return paramArray.length > 0 ? paramArray.join('&') : ''
}

/**
 * 构建完整 URL
 * @param baseUrl - 基础 URL
 * @param params - 参数对象
 * @returns 完整 URL
 */
export function buildFullUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!baseUrl) return ''
  
  const paramStr = params ? buildUrlParams(params) : ''
  if (!paramStr) return baseUrl
  
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${paramStr}`
}

/**
 * 检查是否为外部链接
 * @param path - 路径
 * @returns 是否为外部链接
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 获取 URL 中的查询参数
 * @param name - 参数名
 * @param url - URL字符串（可选，默认使用当前页面URL）
 * @returns 参数值或 null
 */
export function getQueryParam(name: string, url?: string): string | null {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(\\s|&|$)', 'i')
  
  if (reg.test(decodeURIComponent(targetUrl))) {
    return decodeURIComponent(RegExp.$2.replace(/\+/g, ' '))
  }
  
  return null
}
