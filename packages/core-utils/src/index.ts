/**
 * 导出所有工具函数
 */

// 对象操作
export { deepClone, shallowClone, merge, isEmpty } from './object'

// 数字操作
export { 
  add, subtract, multiply, divide, 
  toFixed, clamp, randomInt, numberToChinese, formatPercentage
} from './number'

// 日期操作
export { dateDiff, getRelativeTime, isToday, isWorkday, getDaysInMonth, addDays, addMonths } from './date'

// 字符串操作
export { 
  maskPhone, maskIdCard, maskEmail,
  trimAll, capitalize, camelToSnake, snakeToCamel, truncate,
  isValidPhone, isValidEmail, isValidIdCard, randomString,
  escape, unescape, camelize, underscore,
  getByteLength, substringByByte, uuid
} from './string'

// 存储操作
export { local, session, storage, cookie } from './storage'

// 数组操作
export { 
  unique, uniqueBy, groupBy, flatten, shuffle,
  max, min, sum, average,
  intersection, union, difference,
  chunk, paginate
} from './array'

// URL 操作
export {
  parseUrlParams, removeUrlParams, buildUrlParams, buildFullUrl,
  isExternal, getQueryParam
} from './url'

// 表单验证
export {
  isPhone, isEmail, isIdCard, isURL, isString, isArray,
  validatePassword, validateUsername, validateBankCard,
  isChinese, isInteger, isCreditCode, isCaptcha, isNumber, isPositive,
  minLength, maxLength, required, matchPattern
} from './validation'

// 设备检测
export {
  isMobile, isIOS, isAndroid, isWechat, isWorkWechat, isAlipay,
  isIE, isEdge, isChrome, getBrowserInfo, getOS, isTouchDevice
} from './device'

// DOM 操作
export {
  addClass, removeClass, hasClass, toggleClass,
  getScrollTop, getScrollLeft, getElementTop, getElementLeft,
  isInViewport, scrollToElement, createElement, removeElement
} from './dom'

// 格式化工具
export {
  formatPhone, formatCurrency, formatDate, formatFileSize,
  formatBankCard, formatIdCard, formatPercent, formatNumber
} from './format'

// 事件管理
export {
  EventBus, createEventBus, globalEventBus,
  dispatchCustomEvent, delegate, waitForEvent
} from './event'

// HTTP 请求
export {
  HttpClient, createHttpClient, http
} from './http'
