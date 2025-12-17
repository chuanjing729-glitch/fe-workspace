/**
 * Validation 模块测试用例
 */

import {
  isPhone, isEmail, isIdCard, isURL, isString, isArray,
  validatePassword, validateUsername, validateBankCard,
  isChinese, isInteger, isCreditCode, isCaptcha, isNumber, isPositive,
  minLength, maxLength, required, matchPattern
} from '../src/validation'

describe('Validation 模块测试', () => {
  // 1. isPhone - 手机号验证
  test('isPhone: 有效手机号', () => {
    expect(isPhone('13800138000')).toBe(true)
    expect(isPhone('15912345678')).toBe(true)
  })

  test('isPhone: 无效手机号', () => {
    expect(isPhone('12345678901')).toBe(false)
    expect(isPhone('1380013800')).toBe(false)
    expect(isPhone('')).toBe(false)
  })

  // 2. isEmail - 邮箱验证
  test('isEmail: 有效邮箱', () => {
    expect(isEmail('test@example.com')).toBe(true)
    expect(isEmail('user.name@domain.co.uk')).toBe(true)
  })

  test('isEmail: 无效邮箱', () => {
    expect(isEmail('test@')).toBe(false)
    expect(isEmail('@example.com')).toBe(false)
    expect(isEmail('test')).toBe(false)
  })

  // 3. isIdCard - 身份证验证
  test('isIdCard: 18位身份证', () => {
    expect(isIdCard('110101199003078515')).toBe(true)
  })

  test('isIdCard: 无效身份证', () => {
    expect(isIdCard('123456')).toBe(false)
    expect(isIdCard('')).toBe(false)
  })

  // 4. isURL - URL验证
  test('isURL: 有效URL', () => {
    expect(isURL('https://www.example.com')).toBe(true)
    expect(isURL('http://example.com/path?query=1')).toBe(true)
  })

  test('isURL: 无效URL', () => {
    expect(isURL('not-a-url')).toBe(false)
    expect(isURL('')).toBe(false)
  })

  // 5. isString - 字符串判断
  test('isString: 字符串类型', () => {
    expect(isString('test')).toBe(true)
    expect(isString('')).toBe(true)
    expect(isString(123)).toBe(false)
  })

  // 6. isArray - 数组判断
  test('isArray: 数组类型', () => {
    expect(isArray([1, 2, 3])).toBe(true)
    expect(isArray([])).toBe(true)
    expect(isArray('123')).toBe(false)
  })

  // 7. validatePassword - 密码强度
  test('validatePassword: 有效密码', () => {
    const result = validatePassword('abc123')
    expect(result.valid).toBe(true)
  })

  test('validatePassword: 过短', () => {
    const result = validatePassword('abc12')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('6位')
  })

  test('validatePassword: 缺少数字', () => {
    const result = validatePassword('abcdefg')
    expect(result.valid).toBe(false)
  })

  // 8. validateUsername - 用户名验证
  test('validateUsername: 有效用户名', () => {
    const result = validateUsername('test_user')
    expect(result.valid).toBe(true)
  })

  test('validateUsername: 过短', () => {
    const result = validateUsername('a')
    expect(result.valid).toBe(false)
  })

  // 9. validateBankCard - 银行卡验证（Luhn算法）
  test('validateBankCard: 测试格式', () => {
    expect(validateBankCard('6222021234567890123')).toBe(false)
    expect(validateBankCard('123')).toBe(false)
  })

  // 10. isChinese - 中文判断
  test('isChinese: 中文字符', () => {
    expect(isChinese('测试')).toBe(true)
    expect(isChinese('test')).toBe(false)
    expect(isChinese('测试test')).toBe(false)
  })

  // 11. isInteger - 整数判断
  test('isInteger: 整数类型', () => {
    expect(isInteger(123)).toBe(true)
    expect(isInteger(0)).toBe(true)
    expect(isInteger(1.5)).toBe(false)
  })

  // 12. isCreditCode - 统一社会信用代码
  test('isCreditCode: 有效信用代码', () => {
    expect(isCreditCode('91110000600037341L')).toBe(true)
  })

  test('isCreditCode: 无效信用代码', () => {
    expect(isCreditCode('123')).toBe(false)
    expect(isCreditCode('')).toBe(false)
  })

  // 13. isCaptcha - 验证码
  test('isCaptcha: 有效验证码', () => {
    expect(isCaptcha('1234')).toBe(true)
    expect(isCaptcha('123456')).toBe(true)
  })

  test('isCaptcha: 无效验证码', () => {
    expect(isCaptcha('123')).toBe(false)
    expect(isCaptcha('1234567')).toBe(false)
    expect(isCaptcha('abc')).toBe(false)
  })

  // 14. isNumber - 数字验证
  test('isNumber: 有效数字', () => {
    expect(isNumber('123')).toBe(true)
    expect(isNumber('123.45')).toBe(true)
    expect(isNumber('-123')).toBe(true)
  })

  test('isNumber: 无效数字', () => {
    expect(isNumber('abc')).toBe(false)
    expect(isNumber('')).toBe(false)
  })

  // 15. isPositive - 正数验证
  test('isPositive: 正数', () => {
    expect(isPositive(123)).toBe(true)
    expect(isPositive(0.1)).toBe(true)
  })

  test('isPositive: 非正数', () => {
    expect(isPositive(0)).toBe(false)
    expect(isPositive(-1)).toBe(false)
    expect(isPositive('')).toBe(false)
  })

  // 16. minLength - 最小长度
  test('minLength: 满足最小长度', () => {
    expect(minLength('test', 3)).toBe(true)
    expect(minLength('test', 4)).toBe(true)
  })

  test('minLength: 不满足最小长度', () => {
    expect(minLength('ab', 3)).toBe(false)
  })

  test('minLength: 空值处理', () => {
    expect(minLength(null, 3)).toBe(true)
    expect(minLength(undefined, 3)).toBe(true)
  })

  // 17. maxLength - 最大长度
  test('maxLength: 满足最大长度', () => {
    expect(maxLength('test', 5)).toBe(true)
    expect(maxLength('test', 4)).toBe(true)
  })

  test('maxLength: 超出最大长度', () => {
    expect(maxLength('test', 3)).toBe(false)
  })

  // 18. required - 必填验证
  test('required: 有值', () => {
    expect(required('test')).toBe(true)
    expect(required([1, 2])).toBe(true)
    expect(required(true)).toBe(true)
  })

  test('required: 空值', () => {
    expect(required('')).toBe(false)
    expect(required('   ')).toBe(false)
    expect(required([])).toBe(false)
    expect(required(null)).toBe(false)
    expect(required(undefined)).toBe(false)
  })

  // 19. matchPattern - 自定义正则
  test('matchPattern: 匹配正则', () => {
    expect(matchPattern('abc123', /^[a-z]+[0-9]+$/)).toBe(true)
  })

  test('matchPattern: 不匹配正则', () => {
    expect(matchPattern('abc', /^[0-9]+$/)).toBe(false)
    expect(matchPattern('', /^.+$/)).toBe(false)
  })
})
