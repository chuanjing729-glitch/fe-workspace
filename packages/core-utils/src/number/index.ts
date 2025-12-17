/**
 * 数字精确计算工具
 * 解决 JavaScript 浮点数精度问题
 */

/**
 * 精确加法
 */
export function add(num1: number, num2: number): number {
  const num1Digits = getDigits(num1)
  const num2Digits = getDigits(num2)
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits))
  return (num1 * baseNum + num2 * baseNum) / baseNum
}

/**
 * 精确减法
 */
export function subtract(num1: number, num2: number): number {
  const num1Digits = getDigits(num1)
  const num2Digits = getDigits(num2)
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits))
  return (num1 * baseNum - num2 * baseNum) / baseNum
}

/**
 * 精确乘法
 */
export function multiply(num1: number, num2: number): number {
  const num1Digits = getDigits(num1)
  const num2Digits = getDigits(num2)
  const baseNum = Math.pow(10, num1Digits + num2Digits)
  return (num1 * Math.pow(10, num1Digits) * num2 * Math.pow(10, num2Digits)) / baseNum
}

/**
 * 精确除法
 */
export function divide(num1: number, num2: number): number {
  if (num2 === 0) {
    throw new Error('除数不能为0')
  }
  const num1Digits = getDigits(num1)
  const num2Digits = getDigits(num2)
  return (num1 * Math.pow(10, num2Digits)) / (num2 * Math.pow(10, num1Digits))
}

/**
 * 获取小数位数
 */
function getDigits(num: number): number {
  const numStr = num.toString()
  const dotIndex = numStr.indexOf('.')
  return dotIndex === -1 ? 0 : numStr.length - dotIndex - 1
}

/**
 * 格式化数字（千分位）
 */
export function formatNumber(num: number, decimals: number = 2): string {
  const parts = num.toFixed(decimals).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * 格式化货币
 */
export function formatCurrency(num: number, symbol: string = '¥'): string {
  return symbol + formatNumber(num, 2)
}

/**
 * 保留小数位
 */
export function toFixed(num: number, decimals: number = 2): number {
  return Number(num.toFixed(decimals))
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%'
  return (value * 100).toFixed(decimals) + '%'
}

/**
 * 数字范围限制
 */
export function clamp(num: number, min: number, max: number): number {
  if (typeof num !== 'number' || isNaN(num)) return min
  if (typeof min !== 'number' || isNaN(min)) min = Number.NEGATIVE_INFINITY
  if (typeof max !== 'number' || isNaN(max)) max = Number.POSITIVE_INFINITY
  
  return Math.min(Math.max(num, min), max)
}

/**
 * 随机整数
 */
export function randomInt(min: number, max: number): number {
  if (typeof min !== 'number' || typeof max !== 'number') return 0
  if (min > max) [min, max] = [max, min]
  
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 数字转中文大写
 */
export function numberToChinese(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) return ''
  
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟']
  const bigUnits = ['', '万', '亿', '兆']
  
  if (num === 0) return digits[0]
  
  let result = ''
  const integral = Math.floor(num)
  const decimal = num - integral
  
  // 处理整数部分
  if (integral > 0) {
    const integralStr = integral.toString()
    let count = 0
    
    for (let i = integralStr.length - 1; i >= 0; i--) {
      const digit = parseInt(integralStr[i])
      const unitIndex = count % 4
      const bigUnitIndex = Math.floor(count / 4)
      
      if (digit !== 0 || result.startsWith(digits[0])) {
        result = digits[digit] + units[unitIndex] + 
          (bigUnitIndex > 0 && count % 4 === 0 ? bigUnits[bigUnitIndex] : '') + result
      } else if (result !== '' && !result.startsWith(digits[0])) {
        result = digits[0] + result
      }
      
      count++
    }
  }
  
  // 处理小数部分
  if (decimal > 0) {
    result += '点'
    const decimalStr = decimal.toString().substring(2)
    
    for (let i = 0; i < decimalStr.length; i++) {
      const digit = parseInt(decimalStr[i])
      result += digits[digit]
    }
  }
  
  return result
}
