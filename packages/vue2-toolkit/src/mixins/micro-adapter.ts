/**
 * 微前端适配器 Mixin (MicroAdapter)
 * 专门用于解决 qiankun 环境下的主子应用通信规范化问题。
 */

import Vue from 'vue'

export interface MicroAppState {
    user?: any
    config?: any
    [key: string]: any
}

export const MicroAdapterMixin = Vue.extend({
    data() {
        return {
            $_isMicroApp: (window as any).__POWERED_BY_QIANKUN__ || false,
            $_microState: {} as MicroAppState
        }
    },

    methods: {
        /**
         * 初始化微前端状态同步
         * @param props qiankun 传入的 props
         */
        $_initMicroState(props: any) {
            if (!this.$_isMicroApp || !props) return

            // 初始化监听 qiankun 的全局状态
            if (props.onGlobalStateChange && props.setGlobalState) {
                props.onGlobalStateChange((state: MicroAppState, prev: MicroAppState) => {
                    this.$_microState = { ...state }
                    this.$emit('micro-state-change', state, prev)
                }, true) // true 表示立即执行一次
            }
        },

        /**
         * 更新全局状态
         */
        $_setMicroState(state: Partial<MicroAppState>) {
            if (!this.$_isMicroApp) {
                console.warn('[MicroAdapter] Not in micro-app environment.')
                return
            }

            // 这里假设 props 已经通过某种方式注入到实例中（例如在 mount 阶段保存了 props）
            // 在实际工程中，通常会有一个全局单例管理 props
            if ((window as any).$_microAppProps?.setGlobalState) {
                (window as any).$_microAppProps.setGlobalState(state)
            }
        }
    }
})

export default MicroAdapterMixin
