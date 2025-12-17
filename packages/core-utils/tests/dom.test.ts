/**
 * DOM 模块测试用例
 */

import {
  addClass, removeClass, hasClass, toggleClass,
  getScrollTop, getScrollLeft, getElementTop, getElementLeft,
  isInViewport, scrollToElement, createElement, removeElement
} from '../src/dom'

// Mock DOM环境
describe('DOM 模块测试', () => {
  let mockElement: HTMLElement

  beforeEach(() => {
    // 创建测试元素
    mockElement = document.createElement('div')
    document.body.appendChild(mockElement)
  })

  afterEach(() => {
    // 清理
    if (mockElement && mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement)
    }
  })

  // 1. addClass
  test('addClass: 添加单个类名', () => {
    addClass(mockElement, 'test-class')
    expect(mockElement.classList.contains('test-class')).toBe(true)
  })

  test('addClass: 添加多个类名', () => {
    addClass(mockElement, 'class1 class2')
    expect(mockElement.classList.contains('class1')).toBe(true)
    expect(mockElement.classList.contains('class2')).toBe(true)
  })

  // 2. removeClass
  test('removeClass: 移除类名', () => {
    mockElement.className = 'class1 class2'
    removeClass(mockElement, 'class1')
    expect(mockElement.classList.contains('class1')).toBe(false)
    expect(mockElement.classList.contains('class2')).toBe(true)
  })

  // 3. hasClass
  test('hasClass: 检查类名', () => {
    mockElement.className = 'test-class'
    expect(hasClass(mockElement, 'test-class')).toBe(true)
    expect(hasClass(mockElement, 'other-class')).toBe(false)
  })

  // 4. toggleClass
  test('toggleClass: 切换类名', () => {
    toggleClass(mockElement, 'test-class')
    expect(hasClass(mockElement, 'test-class')).toBe(true)
    toggleClass(mockElement, 'test-class')
    expect(hasClass(mockElement, 'test-class')).toBe(false)
  })

  // 5. getScrollTop
  test('getScrollTop: 获取滚动位置', () => {
    const result = getScrollTop()
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(0)
  })

  // 6. getScrollLeft
  test('getScrollLeft: 获取横向滚动', () => {
    const result = getScrollLeft()
    expect(typeof result).toBe('number')
  })

  // 7. getElementTop
  test('getElementTop: 获取元素顶部距离', () => {
    const result = getElementTop(mockElement)
    expect(typeof result).toBe('number')
  })

  // 8. getElementLeft
  test('getElementLeft: 获取元素左侧距离', () => {
    const result = getElementLeft(mockElement)
    expect(typeof result).toBe('number')
  })

  // 9. isInViewport
  test('isInViewport: 检查元素是否在视口', () => {
    const result = isInViewport(mockElement)
    expect(typeof result).toBe('boolean')
  })

  // 10. createElement
  test('createElement: 创建元素', () => {
    const el = createElement('div', { className: 'test', id: 'test-id' }, 'Hello')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toBe('test')
    expect(el.id).toBe('test-id')
    expect(el.textContent).toBe('Hello')
  })

  // 11. removeElement
  test('removeElement: 移除元素', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    removeElement(el)
    expect(document.body.contains(el)).toBe(false)
  })

  // 12. scrollToElement - 基础测试
  test('scrollToElement: 滚动到元素（不会报错）', () => {
    expect(() => {
      scrollToElement(mockElement)
    }).not.toThrow()
  })
})
