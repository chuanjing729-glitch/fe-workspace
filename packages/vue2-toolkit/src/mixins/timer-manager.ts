/**
 * 定时器管理 Mixin
 * 自动管理定时器的创建和清理，防止内存泄漏
 */

import Vue from 'vue'

interface TimerData {
  $_timers: number[]
  $_intervals: number[]
  $_setTimeout(fn: Function, delay?: number): number | undefined
  $_setInterval(fn: Function, interval: number): number | undefined
  $_clearTimeout(timerId: number): void
  $_clearInterval(intervalId: number): void
  $_clearAllTimers(): void
  $_debounceTimeout(fn: Function, delay?: number): number | undefined
}

export default Vue.extend({
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
     */
    $_setTimeout(fn: Function, delay: number = 0): number | undefined {
      if (typeof fn !== 'function') {
        console.warn('[TimerManager] $_setTimeout requires a function as first argument')
        return
      }

      const timerId = window.setTimeout(fn, delay)
      if (this.$_timers) {
        this.$_timers.push(timerId)
      }
      return timerId
    },

    /**
     * 创建 setInterval 定时器
     */
    $_setInterval(fn: Function, interval: number): number | undefined {
      if (typeof fn !== 'function') {
        console.warn('[TimerManager] $_setInterval requires a function as first argument')
        return
      }

      const intervalId = window.setInterval(fn, interval)
      if (this.$_intervals) {
        this.$_intervals.push(intervalId)
      }
      return intervalId
    },

    /**
     * 清除 setTimeout 定时器
     */
    $_clearTimeout(timerId: number) {
      if (timerId) {
        clearTimeout(timerId)
        if (this.$_timers) {
          const index = this.$_timers.indexOf(timerId)
          if (index > -1) {
            this.$_timers.splice(index, 1)
          }
        }
      }
    },

    /**
     * 清除 setInterval 定时器
     */
    $_clearInterval(intervalId: number) {
      if (intervalId) {
        clearInterval(intervalId)
        if (this.$_intervals) {
          const index = this.$_intervals.indexOf(intervalId)
          if (index > -1) {
            this.$_intervals.splice(index, 1)
          }
        }
      }
    },

    /**
     * 清除所有定时器
     */
    $_clearAllTimers() {
      if (this.$_timers && Array.isArray(this.$_timers)) {
        this.$_timers.forEach(timerId => clearTimeout(timerId))
        this.$_timers = []
      }
      if (this.$_intervals && Array.isArray(this.$_intervals)) {
        this.$_intervals.forEach(intervalId => clearInterval(intervalId))
        this.$_intervals = []
      }
    },

    /**
     * 创建防抖定时器
     */
    $_debounceTimeout(fn: Function, delay: number = 300): number | undefined {
      // 清除之前的定时器
      if (this.$_timers && this.$_timers.length > 0) {
        this.$_clearTimeout(this.$_timers[this.$_timers.length - 1])
      }
      return this.$_setTimeout(fn, delay)
    }
  },

  beforeDestroy() {
    // 自动清理所有定时器
    (this as unknown as TimerData).$_clearAllTimers()
  }
})
