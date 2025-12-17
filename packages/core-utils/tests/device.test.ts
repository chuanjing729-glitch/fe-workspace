/**
 * Device 模块测试用例
 */

import {
  isMobile, isIOS, isAndroid, isWechat, isWorkWechat, isAlipay,
  isIE, isEdge, isChrome, getBrowserInfo, getOS, isTouchDevice
} from '../src/device'

// Mock navigator
const mockNavigator = (userAgent: string, platform?: string) => {
  Object.defineProperty(global.navigator, 'userAgent', {
    value: userAgent,
    writable: true,
    configurable: true
  })
  if (platform) {
    Object.defineProperty(global.navigator, 'platform', {
      value: platform,
      writable: true,
      configurable: true
    })
  }
}

describe('Device 模块测试', () => {
  beforeEach(() => {
    // 重置 navigator
    mockNavigator('Mozilla/5.0')
  })

  // 1. isMobile
  test('isMobile: iPhone检测', () => {
    mockNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
    expect(isMobile()).toBe(true)
  })

  test('isMobile: Android检测', () => {
    mockNavigator('Mozilla/5.0 (Linux; Android 10)')
    expect(isMobile()).toBe(true)
  })

  test('isMobile: PC检测', () => {
    mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    expect(isMobile()).toBe(false)
  })

  // 2. isIOS
  test('isIOS: iPhone检测', () => {
    mockNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
    expect(isIOS()).toBe(true)
  })

  test('isIOS: iPad检测', () => {
    mockNavigator('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)')
    expect(isIOS()).toBe(true)
  })

  // 3. isAndroid
  test('isAndroid: Android检测', () => {
    mockNavigator('Mozilla/5.0 (Linux; Android 10)')
    expect(isAndroid()).toBe(true)
  })

  // 4. isWechat
  test('isWechat: 微信浏览器检测', () => {
    mockNavigator('Mozilla/5.0 MicroMessenger/7.0')
    expect(isWechat()).toBe(true)
  })

  // 5. isWorkWechat
  test('isWorkWechat: 企业微信检测', () => {
    mockNavigator('Mozilla/5.0 wxwork/3.0')
    expect(isWorkWechat()).toBe(true)
  })

  // 6. isAlipay
  test('isAlipay: 支付宝检测', () => {
    mockNavigator('Mozilla/5.0 AlipayClient/10.0')
    expect(isAlipay()).toBe(true)
  })

  // 7. isIE
  test('isIE: IE浏览器检测', () => {
    mockNavigator('Mozilla/5.0 (Windows NT 10.0; Trident/7.0)')
    expect(isIE()).toBe(true)
  })

  // 8. isEdge
  test('isEdge: Edge浏览器检测', () => {
    mockNavigator('Mozilla/5.0 Edge/18.0')
    expect(isEdge()).toBe(true)
  })

  // 9. isChrome
  test('isChrome: Chrome浏览器检测', () => {
    mockNavigator('Mozilla/5.0 Chrome/90.0')
    expect(isChrome()).toBe(true)
  })

  // 10. getBrowserInfo
  test('getBrowserInfo: Chrome信息', () => {
    mockNavigator('mozilla/5.0 chrome/90.0.4430.93')
    const info = getBrowserInfo()
    expect(info.name).toBe('Chrome')
    expect(info.version).toBe('90.0.4430.93')
  })

  // 11. getOS
  test('getOS: Windows检测', () => {
    mockNavigator('Mozilla/5.0 (Windows NT 10.0)')
    expect(getOS()).toContain('Windows')
  })

  test('getOS: 使用platform', () => {
    mockNavigator('Mozilla/5.0', 'MacIntel')
    expect(getOS()).toBe('MacIntel')
  })

  // 12. isTouchDevice
  test('isTouchDevice: 触摸设备检测', () => {
    Object.defineProperty(global.navigator, 'maxTouchPoints', {
      value: 5,
      writable: true
    })
    expect(isTouchDevice()).toBe(true)
  })
})
