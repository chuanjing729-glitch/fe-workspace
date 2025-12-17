/**
 * 格式化工具函数
 */

/**
 * 格式化手机号（隐藏中间4位）
 * @param phone - 手机号
 * @returns 格式化后的手机号
 * @example formatPhone('13800138000') // '138****8000'
 */
export function formatPhone(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

/**
 * 格式化金额
 * @param amount - 金额
 * @param decimals - 小数位数
 * @param currency - 货币符号
 * @returns 格式化后的金额
 * @example formatCurrency(12345.67) // '¥12,345.67'
 */
export function formatCurrency(
  amount: number | string, 
  decimals: number = 2, 
  currency: string = '¥'
): string {
  if (amount === null || amount === undefined) return ''
  
  const num = parseFloat(String(amount))
  if (isNaN(num)) return ''
  
  return `${currency}${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * 格式化日期
 * @param date - 日期
 * @param format - 格式
 * @returns 格式化后的日期
 * @example formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @param decimals - 小数位数
 * @returns 格式化后的文件大小
 * @example formatFileSize(1024) // '1 KB'
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  const value = (bytes / Math.pow(k, i)).toFixed(dm)
  return `${value} ${sizes[i]}`
}

/**
 * 格式化银行卡号（每4位添加空格）
 * @param cardNumber - 银行卡号
 * @returns 格式化后的银行卡号
 * @example formatBankCard('6222021234567890') // '6222 0212 3456 7890'
 */
export function formatBankCard(cardNumber: string): string {
  if (!cardNumber) return ''
  const cleaned = cardNumber.replace(/\s/g, '')
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/**
 * 格式化身份证号（隐藏中间部分）
 * @param idCard - 身份证号
 * @returns 格式化后的身份证号
 * @example formatIdCard('110101199001011234') // '110101********1234'
 */
export function formatIdCard(idCard: string): string {
  if (!idCard) return ''
  if (idCard.length === 15) {
    return idCard.replace(/(\d{6})(\d{6})(\d{3})/, '$1******$3')
  }
  if (idCard.length === 18) {
    return idCard.replace(/(\d{6})(\d{8})(\d{4})/, '$1********$3')
  }
  return idCard
}

/**
 * 格式化百分比
 * @param value - 值（0-1之间或0-100）
 * @param decimals - 小数位数
 * @param isDecimal - 是否为小数形式（0-1）
 * @returns 格式化后的百分比
 * @example formatPercent(0.123, 2) // '12.30%'
 */
export function formatPercent(
  value: number, 
  decimals: number = 2, 
  isDecimal: boolean = true
): string {
  if (value === null || value === undefined) return ''
  const num = isDecimal ? value * 100 : value
  return `${num.toFixed(decimals)}%`
}

/**
 * 格式化数字（千分位）
 * @param num - 数字
 * @param decimals - 小数位数
 * @returns 格式化后的数字
 * @example formatNumber(12345.67) // '12,345.67'
 */
export function formatNumber(num: number | string, decimals?: number): string {
  if (num === null || num === undefined) return ''
  
  const number = parseFloat(String(num))
  if (isNaN(number)) return ''
  
  const formatted = decimals !== undefined ? number.toFixed(decimals) : String(number)
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
