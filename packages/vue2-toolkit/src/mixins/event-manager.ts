/**
 * 事件管理 Mixin
 * 统一管理 DOM 事件和 Vue 事件，支持自动清理
 */

import Vue from 'vue'

interface ManagedEventListener {
  target?: EventTarget
  bus?: Vue
  event: string
  handler: Function
  type: 'dom' | 'vue'
}

interface EventListenerData {
  $_eventListeners: ManagedEventListener[]
  $_addEventListener(target: EventTarget, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void
  $_removeEventListener(target: EventTarget, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void
  $_onVueEvent(bus: Vue, event: string | string[], handler: Function): void
  $_offVueEvent(bus: Vue, event: string | string[], handler: Function): void
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
     */
    $_addEventListener(
      target: EventTarget,
      event: string,
      handler: EventListener,
      options?: boolean | AddEventListenerOptions
    ) {
      if (!target || !event || !handler) {
        console.warn('[EventManager] Invalid arguments for $_addEventListener')
        return
      }

      target.addEventListener(event, handler, options)

      if (this.$_eventListeners) {
        this.$_eventListeners.push({
          target,
          event,
          handler,
          type: 'dom'
        })
      }
    },

    /**
     * 移除 DOM 事件监听器
     */
    $_removeEventListener(
      target: EventTarget,
      event: string,
      handler: EventListener,
      options?: boolean | AddEventListenerOptions
    ) {
      if (!target || !event) return

      target.removeEventListener(event, handler, options)

      if (this.$_eventListeners) {
        const index = this.$_eventListeners.findIndex(l =>
          l.target === target &&
          l.event === event &&
          l.handler === handler
        )
        if (index > -1) {
          this.$_eventListeners.splice(index, 1)
        }
      }
    },

    /**
     * 监听 Vue 事件
     */
    $_onVueEvent(bus: Vue, event: string | string[], handler: Function) {
      if (!bus || !event || !handler) return

      bus.$on(event, handler)

      if (this.$_eventListeners) {
        const events = Array.isArray(event) ? event : [event]
        events.forEach(e => {
          this.$_eventListeners.push({
            bus,
            event: e,
            handler,
            type: 'vue'
          })
        })
      }
    },

    /**
     * 移除 Vue 事件监听
     */
    $_offVueEvent(bus: Vue, event: string | string[], handler: Function) {
      if (!bus || !event) return

      bus.$off(event, handler)

      if (this.$_eventListeners) {
        const events = Array.isArray(event) ? event : [event]
        events.forEach(e => {
          const index = this.$_eventListeners.findIndex(l =>
            l.bus === bus &&
            l.event === e &&
            l.handler === handler
          )
          if (index > -1) {
            this.$_eventListeners.splice(index, 1)
          }
        })
      }
    },

    /**
     * 清除所有事件监听器
     */
    $_clearAllListeners() {
      if (!this.$_eventListeners || !Array.isArray(this.$_eventListeners)) return

      this.$_eventListeners.forEach(({ target, bus, event, handler, type }) => {
        try {
          if (type === 'vue') {
            // Vue 事件
            if (bus && typeof bus.$off === 'function') {
              bus.$off(event, handler)
            }
          } else {
            // DOM 事件
            if (target && typeof target.removeEventListener === 'function') {
              target.removeEventListener(event, handler as EventListener)
            }
          }
        } catch (e) {
          // Ignore errors during cleanup
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
