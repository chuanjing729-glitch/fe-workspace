/**
 * 事件管理工具
 */

type EventCallback = (data?: any) => void

interface EventMap {
  [event: string]: EventCallback[]
}

/**
 * 事件总线类
 */
export class EventBus {
  private events: EventMap = {}
  
  /**
   * 订阅事件
   * @param event - 事件名
   * @param callback - 回调函数
   * @returns 取消订阅函数
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    
    // 返回取消订阅函数
    return () => this.off(event, callback)
  }
  
  /**
   * 发布事件
   * @param event - 事件名
   * @param data - 数据
   */
  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  }
  
  /**
   * 取消订阅
   * @param event - 事件名
   * @param callback - 回调函数
   */
  off(event: string, callback?: EventCallback): void {
    if (!this.events[event]) return
    
    if (callback) {
      const index = this.events[event].indexOf(callback)
      if (index > -1) {
        this.events[event].splice(index, 1)
      }
    } else {
      // 如果没有传callback，则清空该事件的所有监听器
      this.events[event] = []
    }
  }
  
  /**
   * 订阅一次性事件
   * @param event - 事件名
   * @param callback - 回调函数
   */
  once(event: string, callback: EventCallback): void {
    const onceWrapper = (data?: any) => {
      callback(data)
      this.off(event, onceWrapper)
    }
    this.on(event, onceWrapper)
  }
  
  /**
   * 清空所有事件
   */
  clear(): void {
    this.events = {}
  }
  
  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    return this.events[event]?.length || 0
  }
}

/**
 * 创建事件管理器
 * @returns 事件管理器实例
 * @example
 * const bus = createEventBus()
 * const unsubscribe = bus.on('update', (data) => console.log(data))
 * bus.emit('update', { message: 'hello' })
 * unsubscribe()
 */
export function createEventBus(): EventBus {
  return new EventBus()
}

/**
 * 全局事件总线单例
 */
export const globalEventBus = new EventBus()

/**
 * 自定义事件触发器
 * @param target - 目标元素
 * @param eventName - 事件名
 * @param detail - 事件详情
 */
export function dispatchCustomEvent(
  target: HTMLElement | Window | Document, 
  eventName: string, 
  detail?: any
): void {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true
  })
  target.dispatchEvent(event)
}

/**
 * 事件委托
 * @param parent - 父元素
 * @param selector - 选择器
 * @param eventType - 事件类型
 * @param handler - 处理函数
 * @returns 取消监听函数
 */
export function delegate(
  parent: HTMLElement,
  selector: string,
  eventType: string,
  handler: (event: Event, target: HTMLElement) => void
): () => void {
  const listener = (event: Event) => {
    const target = event.target as HTMLElement
    const element = target.closest(selector) as HTMLElement
    if (element && parent.contains(element)) {
      handler(event, element)
    }
  }
  
  parent.addEventListener(eventType, listener)
  
  return () => {
    parent.removeEventListener(eventType, listener)
  }
}

/**
 * 等待事件触发（Promise封装）
 * @param target - 目标元素
 * @param eventName - 事件名
 * @param timeout - 超时时间（毫秒）
 * @returns Promise
 */
export function waitForEvent(
  target: EventTarget,
  eventName: string,
  timeout?: number
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const handler = (event: Event) => {
      target.removeEventListener(eventName, handler)
      if (timer) clearTimeout(timer)
      resolve(event)
    }
    
    target.addEventListener(eventName, handler, { once: true })
    
    let timer: number | undefined
    if (timeout) {
      timer = window.setTimeout(() => {
        target.removeEventListener(eventName, handler)
        reject(new Error(`Event '${eventName}' timeout after ${timeout}ms`))
      }, timeout)
    }
  })
}
