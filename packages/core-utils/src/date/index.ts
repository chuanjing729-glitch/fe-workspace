/**
 * 日期处理工具
 */

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式字符串，支持 YYYY-MM-DD HH:mm:ss
 */
export function formatDate(date: Date | number | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  if (isNaN(d.getTime())) {
    return ''
  }

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
 * 计算日期差值（天数）
 */
export function dateDiff(date1: Date | number | string, date2: Date | number | string): number {
  const d1 = new Date(date1).getTime()
  const d2 = new Date(date2).getTime()
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(date: Date | number | string): string {
  const now = new Date().getTime()
  const target = new Date(date).getTime()
  const diff = now - target

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 判断是否为今天
 */
export function isToday(date: Date | number | string): boolean {
  const d = new Date(date)
  const today = new Date()
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate()
}

/**
 * 判断是否为工作日
 */
export function isWorkday(date: Date | number | string): boolean {
  const d = new Date(date)
  const day = d.getDay()
  return day !== 0 && day !== 6
}

/**
 * 获取月份的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 添加天数
 */
export function addDays(date: Date | number | string, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * 添加月数
 */
export function addMonths(date: Date | number | string, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}
