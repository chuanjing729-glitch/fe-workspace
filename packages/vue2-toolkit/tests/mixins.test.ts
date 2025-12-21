import Vue from 'vue'
import { AutoCleanup, MicroAdapter } from '../src/mixins'

describe('Mixins 测试', () => {
    describe('AutoCleanup', () => {
        let vm: any

        beforeEach(() => {
            const Component = Vue.extend({
                mixins: [AutoCleanup],
                template: '<div></div>'
            })
            vm = new Component().$mount()
        })

        test('应当初始化核心管理器', () => {
            expect(vm.$data.$_timers).toBeDefined()
            expect(vm.$data.$_eventListeners).toBeDefined()
            expect(vm.$data.$_observers).toBeDefined()
        })

        test('销毁时应当调用清理函数', () => {
            const spyTimers = jest.spyOn(vm, '$_clearAllTimers')
            const spyListeners = jest.spyOn(vm, '$_clearAllListeners')
            const spyObservers = jest.spyOn(vm, '$_disconnectAllObservers')

            vm.$destroy()

            expect(spyTimers).toHaveBeenCalled()
            expect(spyListeners).toHaveBeenCalled()
            expect(spyObservers).toHaveBeenCalled()
        })
    })

    describe('MicroAdapter', () => {
        test('应当正确识别 qiankun 环境 (Mock)', () => {
            // Mock window
            Object.defineProperty(window, '__POWERED_BY_QIANKUN__', {
                value: true,
                configurable: true
            });

            const Component = Vue.extend({
                mixins: [MicroAdapter]
            })
            const vm: any = new Component().$mount()

            expect(vm.$data.$_isMicroApp).toBe(true)

            // Restore
            // @ts-ignore
            delete window.__POWERED_BY_QIANKUN__
        })

        test('非微前端环境下 $_isMicroApp 为 false', () => {
            const Component = Vue.extend({
                mixins: [MicroAdapter]
            })
            const vm: any = new Component().$mount()
            expect(vm.$data.$_isMicroApp).toBe(false)
        })
    })
})
