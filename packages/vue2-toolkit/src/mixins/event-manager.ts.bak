/**
 * 事件管理 Mixin
 * 自动管理事件监听器的添加和移除，防止内存泄漏
 */

interface ManagedEventListener {
  target?: EventTarget
  bus?: any
  event: string
  handler: Function
  options?: AddEventListenerOptions | boolean
  type?: 'vue' | 'dom'
}

import Vue from 'vue'

interface EventListenerData {
  $_eventListeners: ManagedEventListener[]
  $_addEventListener(target: EventTarget, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void
  $_on(bus: any, event: string, handler: Function): void
  $_off(bus: any, event: string, handler: Function): void
  $_removeEventListener(target: EventTarget, event: string, handler: EventListener): void
  $_clearAllListeners(): void
}

export default Vue.extend({
  data() {
    return {
      // 存储事件监听器
      $_eventListeners: [] as ManagedEventListener[]
    }
  },
  
  methods: {
    /**
     * 添加 DOM 事件监听器
     * @param {EventTarget} target - 事件目标
     * @param {string} event - 事件名
     * @param {Function} handler - 处理函数
     * @param {Object} options - 事件选项
     */
    $_addEventListener(
      target: EventTarget, 
      event: string, 
      handler: EventListener, 
      options?: boolean | AddEventListenerOptions
    ) {
      if (!target || !event || !handler) {
        console.warn('[EventManager] Invalid parameters for $_addEventListener')
        return
      }
      
      target.addEventListener(event, handler, options)
      this.$_eventListeners.push({ target, event, handler, options, type: 'dom' })
    },
    
    /**
     * 添加 Vue 事件监听器
     * @param {Vue} bus - 事件总线
     * @param {string} event - 事件名
     * @param {Function} handler - 处理函数
     */
    $_on(bus: any, event: string, handler: Function) {
      if (!bus || !event || !handler) {
        console.warn('[EventManager] Invalid parameters for $_on')
        return
      }
      
      bus.$on(event, handler)
      this.$_eventListeners.push({ bus, event, handler, type: 'vue' })
    },
    
    /**
     * 移除 Vue 事件监听器
     * @param {Vue} bus - 事件总线
     * @param {string} event - 事件名
     * @param {Function} handler - 处理函数
     */
    $_off(bus: any, event: string, handler: Function) {
      if (!bus || !event || !handler) {
        console.warn('[EventManager] Invalid parameters for $_off')
        return
      }
      
      bus.$off(event, handler)
      // 从事件监听器列表中移除
      const index = this.$_eventListeners.findIndex(item => 
        item.bus === bus && item.event === event && item.handler === handler
      )
      if (index > -1) {
        this.$_eventListeners.splice(index, 1)
      }
    },
    
    /**
     * 移除 DOM 事件监听器
     */
    $_removeEventListener(target: EventTarget, event: string, handler: EventListener) {
      if (!target || !event || !handler) {
        console.warn('[EventManager] Invalid parameters for $_removeEventListener')
        return
      }
      
      target.removeEventListener(event, handler)
      const index = this.$_eventListeners.findIndex(item => 
        item.target === target && item.event === event && item.handler === handler
      )
      if (index > -1) {
        this.$_eventListeners.splice(index, 1)
      }
    },
    
    /**
     * 清除所有事件监听器
     */
    $_clearAllListeners() {
      this.$_eventListeners.forEach(({ target, bus, event, handler, type }) => {
        if (type === 'vue') {
          // Vue 事件
          if (bus && bus.$off) {
            bus.$off(event, handler)
          }
        } else {
          // DOM 事件
          if (target && target.removeEventListener) {
            target.removeEventListener(event, handler as EventListener)
          }
        }
      })
      
      this.$_eventListeners = []
    }
  },
  
  beforeDestroy() {
    // 自动清理所有事件监听器
    (this as unknown as EventListenerData).$_clearAllListeners()
  }
})
