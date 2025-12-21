/**
 * 请求管理 Mixin (RequestManager)
 * 自动管理异步请求的取消，防止组件销毁后回调触发导致的错误或内存泄漏。
 */

import Vue from 'vue'

interface RequestManagerData {
    $_abortController: AbortController
    $_cancelAllRequests(): void
}

export default Vue.extend({
    data() {
        return {
            // 为每个组件实例创建一个独立的 AbortController
            $_abortController: new AbortController()
        }
    },

    computed: {
        /**
         * 获取当前组件的终止信号
         * 传递给 HttpClient 的 request(url, { signal: this.$_cancelSignal })
         */
        $_cancelSignal(): AbortSignal {
            return (this as any).$_abortController.signal
        }
    },

    methods: {
        /**
         * 手动取消所有正在进行的请求
         */
        $_cancelAllRequests() {
            if (this.$data.$_abortController) {
                this.$data.$_abortController.abort()
                // 重新创建一个 controller，以便后续可能的请求（如果不希望彻底禁用）
                this.$data.$_abortController = new AbortController()
            }
        }
    },

    beforeDestroy() {
        // 组件销毁时自动取消所有关联请求
        if (this.$data.$_abortController) {
            this.$data.$_abortController.abort()
            console.log(`[RequestManager] Component ${this.$options.name || 'Anonymous'} requests cancelled.`)
        }
    }
})
