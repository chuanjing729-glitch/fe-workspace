/**
 * 设备检测工具函数
 */

/**
 * 检查是否为移动端
 * @returns 是否为移动端
 */
export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检查是否为 iOS 设备
 * @returns 是否为 iOS 设备
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

/**
 * 检查是否为 Android 设备
 * @returns 是否为 Android 设备
 */
export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

/**
 * 检查是否为微信浏览器
 * @returns 是否为微信浏览器
 */
export function isWechat(): boolean {
  if (typeof navigator === 'undefined') return false
  return /micromessenger/i.test(navigator.userAgent.toLowerCase())
}

/**
 * 检查是否为企业微信浏览器
 * @returns 是否为企业微信浏览器
 */
export function isWorkWechat(): boolean {
  if (typeof navigator === 'undefined') return false
  return /wxwork/i.test(navigator.userAgent.toLowerCase())
}

/**
 * 检查是否为支付宝浏览器
 * @returns 是否为支付宝浏览器
 */
export function isAlipay(): boolean {
  if (typeof navigator === 'undefined') return false
  return /AlipayClient/.test(navigator.userAgent)
}

/**
 * 检查是否为 IE 浏览器
 * @returns 是否为 IE 浏览器
 */
export function isIE(): boolean {
  if (typeof navigator === 'undefined') return false
  return !!navigator.userAgent.match(/MSIE/) || 
         !!navigator.userAgent.match(/Trident/) || 
         'ActiveXObject' in window
}

/**
 * 检查是否为 Edge 浏览器
 * @returns 是否为 Edge 浏览器
 */
export function isEdge(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Edge/.test(navigator.userAgent)
}

/**
 * 检查是否为 Chrome 浏览器
 * @returns 是否为 Chrome 浏览器
 */
export function isChrome(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Chrome/.test(navigator.userAgent) && 
         !/Edge/.test(navigator.userAgent) && 
         !/OPR/.test(navigator.userAgent)
}

/**
 * 获取浏览器信息
 * @returns 浏览器信息对象
 */
export function getBrowserInfo(): { name: string; version: string } {
  if (typeof navigator === 'undefined') {
    return { name: 'Unknown', version: '0' }
  }
  
  const ua = navigator.userAgent.toLowerCase()
  
  if (ua.match(/edge\/([\d.]+)/)) {
    return { name: 'Edge', version: ua.match(/edge\/([\d.]+)/)![1] }
  }
  
  if (ua.match(/rv:([\d.]+)\) like gecko/)) {
    return { name: 'IE', version: ua.match(/rv:([\d.]+)\) like gecko/)![1] }
  }
  
  if (ua.match(/msie ([\d.]+)/)) {
    return { name: 'IE', version: ua.match(/msie ([\d.]+)/)![1] }
  }
  
  if (ua.match(/firefox\/([\d.]+)/)) {
    return { name: 'Firefox', version: ua.match(/firefox\/([\d.]+)/)![1] }
  }
  
  if (ua.match(/chrome\/([\d.]+)/)) {
    return { name: 'Chrome', version: ua.match(/chrome\/([\d.]+)/)![1] }
  }
  
  if (ua.match(/opera.([\d.]+)/)) {
    return { name: 'Opera', version: ua.match(/opera.([\d.]+)/)![1] }
  }
  
  if (ua.match(/version\/([\d.]+).*safari/)) {
    return { name: 'Safari', version: ua.match(/version\/([\d.]+).*safari/)![1] }
  }
  
  return { name: 'Unknown', version: '0' }
}

/**
 * 获取操作系统信息
 * @returns 操作系统名称
 */
export function getOS(): string {
  if (typeof navigator === 'undefined') return 'Unknown'
  
  const { userAgent } = navigator
  
  if ('platform' in navigator && navigator.platform) {
    return navigator.platform
  }
  
  if (/Windows/.test(userAgent)) {
    return 'Windows'
  } else if (/Mac/.test(userAgent)) {
    return 'Mac'
  } else if (/Linux/.test(userAgent)) {
    return 'Linux'
  } else if (/Android/.test(userAgent)) {
    return 'Android'
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    return 'iOS'
  } else {
    return 'Unknown'
  }
}

/**
 * 检查是否支持触摸事件
 * @returns 是否支持触摸事件
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 || 
         (navigator as any).msMaxTouchPoints > 0
}
