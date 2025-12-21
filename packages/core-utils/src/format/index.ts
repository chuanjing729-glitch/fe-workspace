/**
 * 格式化工具函数
 */

/**
 * 默认空值占位符
 */
export const DEFAULT_PLACEHOLDER = '-'

/**
 * 格式化手机号
 */
export function formatPhone(phone: string, placeholder = DEFAULT_PLACEHOLDER): string {
  if (!phone) return placeholder
  const cleaned = phone.replace(/\D/g, '')
  if (!cleaned) return placeholder
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

/**
 * 格式化金额
 * @param amount - 金额
 * @param decimals - 小数位数
 * @param currency - 货币符号
 * @returns 格式化后的金额
 */
export function formatCurrency(
  amount: number | string,
  decimals: number = 2,
  currency: string = '¥',
  placeholder = DEFAULT_PLACEHOLDER
): string {
  if (amount === null || amount === undefined || amount === '') return placeholder

  const num = parseFloat(String(amount))
  if (isNaN(num)) return placeholder

  return `${currency}${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * 格式化日期
 * @param date - 日期
 * @param format - 格式
 * @returns 格式化后的日期
 */
export function formatDate(
  date: string | Date,
  format: string = 'YYYY-MM-DD',
  placeholder = DEFAULT_PLACEHOLDER
): string {
  if (!date) return placeholder

  const d = new Date(date)
  if (isNaN(d.getTime())) return placeholder

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
 */
export function formatBankCard(cardNumber: string, placeholder = DEFAULT_PLACEHOLDER): string {
  if (!cardNumber) return placeholder
  const cleaned = cardNumber.replace(/\s/g, '')
  if (!cleaned) return placeholder
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/**
 * 格式化身份证号（隐藏中间部分）
 * @param idCard - 身份证号
 * @returns 格式化后的身份证号
 */
export function formatIdCard(idCard: string, placeholder = DEFAULT_PLACEHOLDER): string {
  if (!idCard) return placeholder
  const cleaned = idCard.trim()
  if (!cleaned) return placeholder

  if (cleaned.length === 15) {
    return cleaned.replace(/(\d{6})(\d{6})(\d{3})/, '$1******$3')
  }
  if (cleaned.length === 18) {
    return cleaned.replace(/(\d{6})(\d{8})(\d{4})/, '$1********$3')
  }
  return cleaned
}

/**
 * 格式化百分比
 * @param value - 值（0-1之间或0-100）
 * @param decimals - 小数位数
 * @param isDecimal - 是否为小数形式（0-1）
 * @returns 格式化后的百分比
 */
export function formatPercent(
  value: number,
  decimals: number = 2,
  isDecimal: boolean = true,
  placeholder = DEFAULT_PLACEHOLDER
): string {
  if (value === null || value === undefined) return placeholder
  const num = isDecimal ? value * 100 : value
  if (isNaN(num)) return placeholder
  return `${num.toFixed(decimals)}%`
}

/**
 * 格式化数字（千分位）
 * @param num - 数字
 * @param decimals - 小数位数
 * @returns 格式化后的数字
 */
export function formatNumber(
  num: number | string,
  decimals?: number,
  placeholder = DEFAULT_PLACEHOLDER
): string {
  if (num === null || num === undefined || num === '') return placeholder

  const number = parseFloat(String(num))
  if (isNaN(number)) return placeholder

  const formatted = decimals !== undefined ? number.toFixed(decimals) : String(number)
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
