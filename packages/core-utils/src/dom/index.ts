/**
 * DOM 操作工具函数
 */

/**
 * 添加类名
 * @param el - 元素
 * @param cls - 类名
 */
export function addClass(el: Element, cls: string): void {
  if (!el) return
  
  const classes = cls.split(' ')
  
  for (let i = 0, len = classes.length; i < len; i++) {
    const clsName = classes[i]
    if (!clsName) continue
    
    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      el.className += ' ' + clsName
    }
  }
}

/**
 * 移除类名
 * @param el - 元素
 * @param cls - 类名
 */
export function removeClass(el: Element, cls: string): void {
  if (!el || !cls) return
  
  const classes = cls.split(' ')
  
  for (let i = 0, len = classes.length; i < len; i++) {
    const clsName = classes[i]
    if (!clsName) continue
    
    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      const reg = new RegExp('(\\s|^)' + clsName + '(\\s|$)')
      el.className = el.className.replace(reg, ' ')
    }
  }
}

/**
 * 检查是否有类名
 * @param el - 元素
 * @param cls - 类名
 * @returns 是否有类名
 */
export function hasClass(el: Element, cls: string): boolean {
  if (!el || !cls) return false
  
  if (cls.indexOf(' ') !== -1) {
    throw new Error('className should not contain space.')
  }
  
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

/**
 * 切换类名
 * @param el - 元素
 * @param cls - 类名
 */
export function toggleClass(el: Element, cls: string): void {
  if (!el || !cls) return
  
  if (hasClass(el, cls)) {
    removeClass(el, cls)
  } else {
    addClass(el, cls)
  }
}

/**
 * 获取滚动顶部距离
 * @returns 滚动顶部距离
 */
export function getScrollTop(): number {
  if (typeof window === 'undefined') return 0
  return window.pageYOffset || 
         document.documentElement.scrollTop || 
         document.body.scrollTop || 0
}

/**
 * 获取滚动左侧距离
 * @returns 滚动左侧距离
 */
export function getScrollLeft(): number {
  if (typeof window === 'undefined') return 0
  return window.pageXOffset || 
         document.documentElement.scrollLeft || 
         document.body.scrollLeft || 0
}

/**
 * 获取元素到页面顶部的距离
 * @param el - 元素
 * @returns 元素到页面顶部的距离
 */
export function getElementTop(el: HTMLElement): number {
  let actualTop = el.offsetTop
  let current = el.offsetParent as HTMLElement | null
  
  while (current !== null) {
    actualTop += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  
  return actualTop
}

/**
 * 获取元素到页面左侧的距离
 * @param el - 元素
 * @returns 元素到页面左侧的距离
 */
export function getElementLeft(el: HTMLElement): number {
  let actualLeft = el.offsetLeft
  let current = el.offsetParent as HTMLElement | null
  
  while (current !== null) {
    actualLeft += current.offsetLeft
    current = current.offsetParent as HTMLElement | null
  }
  
  return actualLeft
}

/**
 * 检查元素是否在视口中
 * @param el - 元素
 * @param offset - 偏移量
 * @returns 是否在视口中
 */
export function isInViewport(el: Element, offset: number = 0): boolean {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  )
}

/**
 * 滚动到指定元素
 * @param el - 元素或选择器
 * @param options - 滚动选项
 */
export function scrollToElement(
  el: Element | string, 
  options: {
    behavior?: ScrollBehavior
    block?: ScrollLogicalPosition
    inline?: ScrollLogicalPosition
    offset?: number
  } = {}
): void {
  const element = typeof el === 'string' ? document.querySelector(el) : el
  
  if (!element) {
    console.warn('Element not found:', el)
    return
  }
  
  const {
    behavior = 'smooth',
    offset = 0
  } = options
  
  const rect = element.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const targetTop = rect.top + scrollTop - offset
  
  window.scrollTo({
    top: targetTop,
    behavior
  })
}

/**
 * 创建元素
 * @param tagName - 标签名
 * @param attributes - 属性对象
 * @param textContent - 文本内容
 * @returns 创建的元素
 */
export function createElement(
  tagName: string, 
  attributes: Record<string, any> = {}, 
  textContent: string = ''
): HTMLElement {
  const el = document.createElement(tagName)
  
  // 设置属性
  Object.keys(attributes).forEach(key => {
    if (key === 'className') {
      el.className = attributes[key]
    } else if (key === 'innerHTML') {
      el.innerHTML = attributes[key]
    } else {
      el.setAttribute(key, attributes[key])
    }
  })
  
  // 设置文本内容
  if (textContent) {
    el.textContent = textContent
  }
  
  return el
}

/**
 * 移除元素
 * @param el - 要移除的元素
 */
export function removeElement(el: Element): void {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}
