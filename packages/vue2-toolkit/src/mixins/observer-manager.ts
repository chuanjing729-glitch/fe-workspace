/**
 * Observer 管理 Mixin
 * 自动管理各种 Observer 的创建和清理
 */

type ObserverType = ResizeObserver | IntersectionObserver | MutationObserver

export default {
  data() {
    return {
      // 存储 Observers
      $_observers: [] as ObserverType[]
    }
  },
  
  methods: {
    /**
     * 创建 ResizeObserver
     * @param {Element} target - 目标元素
     * @param {Function} callback - 回调函数
     * @returns {ResizeObserver} Observer 实例
     */
    $_createResizeObserver(
      target: Element, 
      callback: ResizeObserverCallback
    ): ResizeObserver | null {
      if (!target || typeof callback !== 'function') {
        console.warn('[ObserverManager] Invalid parameters for $_createResizeObserver')
        return null
      }
      
      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(callback)
        observer.observe(target)
        this.$_observers.push(observer)
        return observer
      } else {
        console.warn('[ObserverManager] ResizeObserver is not supported in this browser')
        return null
      }
    },
    
    /**
     * 创建 IntersectionObserver
     * @param {Element} target - 目标元素
     * @param {Function} callback - 回调函数
     * @param {Object} options - 配置选项
     * @returns {IntersectionObserver} Observer 实例
     */
    $_createIntersectionObserver(
      target: Element, 
      callback: IntersectionObserverCallback, 
      options: IntersectionObserverInit = {}
    ): IntersectionObserver | null {
      if (!target || typeof callback !== 'function') {
        console.warn('[ObserverManager] Invalid parameters for $_createIntersectionObserver')
        return null
      }
      
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(callback, options)
        observer.observe(target)
        this.$_observers.push(observer)
        return observer
      } else {
        console.warn('[ObserverManager] IntersectionObserver is not supported in this browser')
        return null
      }
    },
    
    /**
     * 创建 MutationObserver
     * @param {Element} target - 目标元素
     * @param {Function} callback - 回调函数
     * @param {Object} options - 配置选项
     * @returns {MutationObserver} Observer 实例
     */
    $_createMutationObserver(
      target: Node, 
      callback: MutationCallback, 
      options: MutationObserverInit = { 
        childList: true, 
        subtree: true 
      }
    ): MutationObserver | null {
      if (!target || typeof callback !== 'function') {
        console.warn('[ObserverManager] Invalid parameters for $_createMutationObserver')
        return null
      }
      
      if ('MutationObserver' in window) {
        const observer = new MutationObserver(callback)
        observer.observe(target, options)
        this.$_observers.push(observer)
        return observer
      } else {
        console.warn('[ObserverManager] MutationObserver is not supported in this browser')
        return null
      }
    },
    
    /**
     * 断开指定 Observer
     */
    $_disconnectObserver(observer: ObserverType) {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect()
        const index = this.$_observers.indexOf(observer)
        if (index > -1) {
          this.$_observers.splice(index, 1)
        }
      }
    },
    
    /**
     * 断开所有 Observer
     */
    $_disconnectAllObservers() {
      this.$_observers.forEach(observer => {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect()
        }
      })
      this.$_observers = []
    }
  },
  
  beforeDestroy() {
    // 自动断开所有 Observer
    this.$_disconnectAllObservers()
  }
}
