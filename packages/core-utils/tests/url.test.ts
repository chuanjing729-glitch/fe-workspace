/**
 * URL 模块测试用例
 */

import {
  parseUrlParams, removeUrlParams, buildUrlParams,
  buildFullUrl, isExternal, getQueryParam
} from '../src/url'

describe('URL 模块测试', () => {
  // 1. parseUrlParams
  test('parseUrlParams: 解析URL参数', () => {
    const url = 'https://example.com?name=test&age=18'
    expect(parseUrlParams(url)).toEqual({
      name: 'test',
      age: '18'
    })
  })

  test('parseUrlParams: 空参数', () => {
    expect(parseUrlParams('https://example.com')).toEqual({})
  })

  // 2. removeUrlParams
  test('removeUrlParams: 删除参数', () => {
    const url = 'https://example.com?name=test&age=18&city=beijing'
    const result = removeUrlParams(url, ['age'])
    expect(result).toContain('name=test')
    expect(result).not.toContain('age=18')
  })

  // 3. buildUrlParams
  test('buildUrlParams: 构建参数字符串', () => {
    const params = { name: 'test', age: 18 }
    const result = buildUrlParams(params)
    expect(result).toContain('name=test')
    expect(result).toContain('age=18')
  })

  test('buildUrlParams: 过滤null和undefined', () => {
    const params = { name: 'test', age: null, city: undefined }
    const result = buildUrlParams(params)
    expect(result).toBe('name=test')
  })

  // 4. buildFullUrl
  test('buildFullUrl: 构建完整URL', () => {
    const result = buildFullUrl('https://example.com', { name: 'test' })
    expect(result).toBe('https://example.com?name=test')
  })

  test('buildFullUrl: URL已有参数', () => {
    const result = buildFullUrl('https://example.com?id=1', { name: 'test' })
    expect(result).toContain('?id=1&name=test')
  })

  // 5. isExternal
  test('isExternal: 外部链接检测', () => {
    expect(isExternal('https://example.com')).toBe(true)
    expect(isExternal('http://example.com')).toBe(true)
    expect(isExternal('mailto:test@example.com')).toBe(true)
    expect(isExternal('/home')).toBe(false)
    expect(isExternal('./home')).toBe(false)
  })

  // 6. getQueryParam
  test('getQueryParam: 获取单个参数', () => {
    const url = 'https://example.com?name=test&age=18'
    expect(getQueryParam('name', url)).toBe('test')
    expect(getQueryParam('age', url)).toBe('18')
    expect(getQueryParam('city', url)).toBeNull()
  })
})
