/**
 * 字符串处理工具
 */

/**
 * 手机号脱敏
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) {
    return phone
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 身份证脱敏
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 15) {
    return idCard
  }
  return idCard.replace(/(\d{6})\d+(\d{4})/, '$1********$2')
}

/**
 * 邮箱脱敏
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email
  }
  const [name, domain] = email.split('@')
  const maskedName = name.length > 2
    ? name[0] + '***' + name[name.length - 1]
    : name
  return `${maskedName}@${domain}`
}

/**
 * 清理所有空格
 */
export function trimAll(str: string): string {
  return str.replace(/\s+/g, '')
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 驼峰转下划线
 */
export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

/**
 * 下划线转驼峰
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 截断字符串
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) {
    return str
  }
  return str.substring(0, maxLength - suffix.length) + suffix
}

/**
 * 验证手机号
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 验证身份证
 */
export function isValidIdCard(idCard: string): boolean {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * HTML 特殊字符转义
 */
export function escape(str: string): string {
  if (typeof str !== 'string') return str
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\//g, '&#x2F;')
}

/**
 * HTML 特殊字符反转义
 */
export function unescape(str: string): string {
  if (typeof str !== 'string') return str
  
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#96;/g, '`')
    .replace(/&#x2F;/g, '/')
}

/**
 * 下划线转驼峰（支持多种分隔符）
 */
export function camelize(str: string): string {
  if (typeof str !== 'string') return str
  return str.replace(/[-_\s]+(.)? /g, (_, c) => c ? c.toUpperCase() : '')
}

/**
 * 驼峰转下划线
 */
export function underscore(str: string): string {
  if (typeof str !== 'string') return str
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
}

/**
 * 获取字符串字节长度（中文2字节，英文1字节）
 */
export function getByteLength(str: string): number {
  if (typeof str !== 'string') return 0
  
  let len = 0
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      len += 2
    } else {
      len += 1
    }
  }
  return len
}

/**
 * 按字节长度截取字符串
 */
export function substringByByte(str: string, byteLength: number, suffix: string = '...'): string {
  if (typeof str !== 'string') return str
  
  let len = 0
  let index = 0
  
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      len += 2
    } else {
      len += 1
    }
    
    if (len > byteLength) {
      break
    }
    index = i
  }
  
  return len > byteLength ? str.substring(0, index + 1) + suffix : str
}

/**
 * 生成 UUID
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
