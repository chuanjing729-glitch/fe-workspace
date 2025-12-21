/**
 * 观察者管理 Mixin
 * 统一管理 ResizeObserver, IntersectionObserver, MutationObserver
 */

import Vue from 'vue'

// 定义观察者接口，兼容不同类型的 Observer
interface ObserverType {
  disconnect: () => void
  observe: (target: Element, options?: any) => void
  unobserve?: (target: Element) => void
}

interface ObserverData {
  $_observers: ObserverType[]
  $_observeResize(target: Element, callback: ResizeObserverCallback): ResizeObserver | undefined
  $_observeIntersection(target: Element, callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver | undefined
  $_observeMutation(target: Element, callback: MutationCallback, options?: MutationObserverInit): MutationObserver | undefined
  $_disconnectAllObservers(): void
}

export default Vue.extend({
  data() {
    return {
      // 存储 Observers
      $_observers: [] as ObserverType[]
    }
  },

  methods: {
    /**
     * 创建 ResizeObserver
     */
    $_observeResize(target: Element, callback: ResizeObserverCallback): ResizeObserver | undefined {
      if (!target || typeof callback !== 'function') return

      // 检查浏览器支持
      if (typeof ResizeObserver === 'undefined') {
        console.warn('[ObserverManager] ResizeObserver is not supported in this browser')
        return
      }

      const observer = new ResizeObserver(callback)
      observer.observe(target)

      if (this.$_observers) {
        this.$_observers.push(observer)
      }

      return observer
    },

    /**
     * 创建 IntersectionObserver
     */
    $_observeIntersection(
      target: Element,
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ): IntersectionObserver | undefined {
      if (!target || typeof callback !== 'function') return

      if (typeof IntersectionObserver === 'undefined') {
        console.warn('[ObserverManager] IntersectionObserver is not supported')
        return
      }

      const observer = new IntersectionObserver(callback, options)
      observer.observe(target)

      if (this.$_observers) {
        this.$_observers.push(observer)
      }

      return observer
    },

    /**
     * 创建 MutationObserver
     */
    $_observeMutation(
      target: Element,
      callback: MutationCallback,
      options: MutationObserverInit = { attributes: true, childList: true, subtree: true }
    ): MutationObserver | undefined {
      if (!target || typeof callback !== 'function') return

      if (typeof MutationObserver === 'undefined') {
        console.warn('[ObserverManager] MutationObserver is not supported')
        return
      }

      const observer = new MutationObserver(callback)
      observer.observe(target, options)

      if (this.$_observers) {
        this.$_observers.push(observer)
      }

      return observer
    },

    /**
     * 断开所有 Observer
     */
    $_disconnectAllObservers() {
      if (!this.$_observers || !Array.isArray(this.$_observers)) return

      this.$_observers.forEach(observer => {
        try {
          if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect()
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      })
      this.$_observers = []
    }
  },

  beforeDestroy() {
    // 自动断开所有 Observer
    (this as unknown as ObserverData).$_disconnectAllObservers()
  }
})
