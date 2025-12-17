/**
 * 定时器管理 Mixin
 * 自动管理定时器的创建和清理，防止内存泄漏
 */

export default {
  data() {
    return {
      // 存储定时器
      $_timers: [] as number[],
      $_intervals: [] as number[]
    }
  },
  
  methods: {
    /**
     * 创建 setTimeout 定时器
     * @param {Function} fn - 回调函数
     * @param {number} delay - 延迟时间(ms)
     * @returns {number} 定时器ID
     */
    $_setTimeout(fn: Function, delay: number = 0): number | undefined {
      if (typeof fn !== 'function') {
        console.warn('[TimerManager] $_setTimeout requires a function as first argument')
        return
      }
      
      const timerId = window.setTimeout(fn, delay)
      this.$_timers.push(timerId)
      return timerId
    },
    
    /**
     * 创建 setInterval 定时器
     * @param {Function} fn - 回调函数
     * @param {number} interval - 间隔时间(ms)
     * @returns {number} 定时器ID
     */
    $_setInterval(fn: Function, interval: number): number | undefined {
      if (typeof fn !== 'function') {
        console.warn('[TimerManager] $_setInterval requires a function as first argument')
        return
      }
      
      const intervalId = window.setInterval(fn, interval)
      this.$_intervals.push(intervalId)
      return intervalId
    },
    
    /**
     * 清除 setTimeout 定时器
     * @param {number} timerId - 定时器ID
     */
    $_clearTimeout(timerId: number) {
      if (timerId) {
        clearTimeout(timerId)
        const index = this.$_timers.indexOf(timerId)
        if (index > -1) {
          this.$_timers.splice(index, 1)
        }
      }
    },
    
    /**
     * 清除 setInterval 定时器
     * @param {number} intervalId - 定时器ID
     */
    $_clearInterval(intervalId: number) {
      if (intervalId) {
        clearInterval(intervalId)
        const index = this.$_intervals.indexOf(intervalId)
        if (index > -1) {
          this.$_intervals.splice(index, 1)
        }
      }
    },
    
    /**
     * 清除所有定时器
     */
    $_clearAllTimers() {
      this.$_timers.forEach(timerId => clearTimeout(timerId))
      this.$_intervals.forEach(intervalId => clearInterval(intervalId))
      this.$_timers = []
      this.$_intervals = []
    },
    
    /**
     * 创建防抖定时器
     */
    $_debounceTimeout(fn: Function, delay: number = 300): number | undefined {
      // 清除之前的定时器
      if (this.$_timers.length > 0) {
        this.$_clearTimeout(this.$_timers[this.$_timers.length - 1])
      }
      return this.$_setTimeout(fn, delay)
    }
  },
  
  beforeDestroy() {
    // 自动清理所有定时器
    this.$_clearAllTimers()
  }
}
