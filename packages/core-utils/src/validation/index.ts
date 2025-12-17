/**
 * 表单验证工具函数
 */

/**
 * 验证手机号
 * @param phone - 手机号
 * @returns 是否有效
 */
export function isPhone(phone: string): boolean {
  if (!phone) return false
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 * @param email - 邮箱
 * @returns 是否有效
 */
export function isEmail(email: string): boolean {
  if (!email) return false
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

/**
 * 验证身份证号
 * @param idCard - 身份证号
 * @returns 是否有效
 */
export function isIdCard(idCard: string): boolean {
  if (!idCard) return false
  return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idCard)
}

/**
 * 验证 URL
 * @param url - URL
 * @returns 是否有效
 */
export function isURL(url: string): boolean {
  if (!url) return false
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * 验证是否为字符串
 * @param str - 要验证的值
 * @returns 是否为字符串
 */
export function isString(str: any): str is string {
  return typeof str === 'string' || str instanceof String
}

/**
 * 验证是否为数组
 * @param arg - 要验证的值
 * @returns 是否为数组
 */
export function isArray(arg: any): arg is any[] {
  return Array.isArray(arg)
}

/**
 * 验证密码强度
 * @param password - 密码
 * @returns 验证结果
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password) {
    return { valid: false, message: '密码不能为空' }
  }
  
  if (password.length < 6) {
    return { valid: false, message: '密码长度不能少于6位' }
  }
  
  if (password.length > 20) {
    return { valid: false, message: '密码长度不能超过20位' }
  }
  
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: '密码必须包含字母和数字' }
  }
  
  return { valid: true, message: '密码符合要求' }
}

/**
 * 验证用户名
 * @param username - 用户名
 * @returns 验证结果
 */
export function validateUsername(username: string): { valid: boolean; message: string } {
  if (!username) {
    return { valid: false, message: '用户名不能为空' }
  }
  
  if (username.length < 2) {
    return { valid: false, message: '用户名长度不能少于2位' }
  }
  
  if (username.length > 20) {
    return { valid: false, message: '用户名长度不能超过20位' }
  }
  
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含中文、英文、数字和下划线' }
  }
  
  return { valid: true, message: '用户名符合要求' }
}

/**
 * 验证银行卡号（Luhn算法）
 * @param cardNumber - 银行卡号
 * @returns 是否有效
 */
export function validateBankCard(cardNumber: string): boolean {
  if (!cardNumber) return false
  
  const card = cardNumber.replace(/\s/g, '')
  if (!/^\d{16,19}$/.test(card)) return false
  
  let sum = 0
  const parity = card.length % 2
  
  for (let i = 0; i < card.length; i++) {
    let digit = parseInt(card.charAt(i))
    if (i % 2 === parity) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  
  return sum % 10 === 0
}

/**
 * 验证中文字符
 * @param str - 字符串
 * @returns 是否全为中文
 */
export function isChinese(str: string): boolean {
  if (!str) return false
  return /^[\u4e00-\u9fa5]+$/.test(str)
}

/**
 * 验证整数
 * @param value - 值
 * @returns 是否为整数
 */
export function isInteger(value: any): boolean {
  return Number.isInteger(value)
}

/**
 * 验证统一社会信用代码
 * @param code - 统一社会信用代码
 * @returns 是否有效
 */
export function isCreditCode(code: string): boolean {
  if (!code) return false
  return /^([0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}|[1-9]\d{14})$/.test(code)
}

/**
 * 验证码验证（4-6位数字）
 * @param captcha - 验证码
 * @returns 是否有效
 */
export function isCaptcha(captcha: string): boolean {
  if (!captcha) return false
  return /^\d{4,6}$/.test(captcha)
}

/**
 * 验证是否为数字
 * @param value - 值
 * @returns 是否为数字
 */
export function isNumber(value: any): boolean {
  if (!value) return false
  return /^-?\d+(\.\d+)?$/.test(String(value))
}

/**
 * 验证是否为正数
 * @param value - 值
 * @returns 是否为正数
 */
export function isPositive(value: any): boolean {
  if (!value) return false
  const num = Number(value)
  return !isNaN(num) && num > 0
}

/**
 * 最小长度验证
 * @param value - 值
 * @param min - 最小长度
 * @returns 是否满足
 */
export function minLength(value: any, min: number): boolean {
  if (value === null || value === undefined) return true
  return String(value).length >= min
}

/**
 * 最大长度验证
 * @param value - 值
 * @param max - 最大长度
 * @returns 是否满足
 */
export function maxLength(value: any, max: number): boolean {
  if (value === null || value === undefined) return true
  return String(value).length <= max
}

/**
 * 必填验证
 * @param value - 值
 * @returns 是否有值
 */
export function required(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * 自定义正则验证
 * @param value - 值
 * @param pattern - 正则表达式
 * @returns 是否匹配
 */
export function matchPattern(value: any, pattern: RegExp): boolean {
  if (!value) return false
  return pattern.test(String(value))
}
