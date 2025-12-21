/**
 * 自动清理 Mixin (AutoCleanupMixin)
 * 整合了定时器、事件监听器、观察者的自动管理，为业务组件提供一站式的安全保障。
 */

import Vue from 'vue'
import TimerManager from './timer-manager'
import EventManager from './event-manager'
import ObserverManager from './observer-manager'

import RequestManager from './request-manager'

// 定义联合类型接口
interface AutoCleanupData {
    $_clearAllTimers(): void
    $_clearAllListeners(): void
    $_disconnectAllObservers(): void
    $_cancelAllRequests(): void
}

/**
 * AutoCleanupMixin
 * 继承并整合了所有资源管理 Mixins，确保在 beforeDestroy 时执行全量清理。
 */
export const AutoCleanupMixin = Vue.extend({
    mixins: [TimerManager, EventManager, ObserverManager, RequestManager],

    beforeDestroy() {
        const vm = this as unknown as AutoCleanupData

        // 执行全量清理
        try {
            if (typeof vm.$_clearAllTimers === 'function') {
                vm.$_clearAllTimers()
            }
            if (typeof vm.$_clearAllListeners === 'function') {
                vm.$_clearAllListeners()
            }
            if (typeof vm.$_disconnectAllObservers === 'function') {
                vm.$_disconnectAllObservers()
            }

            console.log(`[AutoCleanup] Component ${this.$options.name || 'Anonymous'} resources cleared.`)
        } catch (error) {
            console.error('[AutoCleanup] Failed to clear resources:', error)
        }
    }
})

export default AutoCleanupMixin
