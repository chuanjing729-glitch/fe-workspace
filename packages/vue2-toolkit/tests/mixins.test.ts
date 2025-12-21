import TimerManager from '../src/mixins/timer-manager'
import EventManager from '../src/mixins/event-manager'
import ObserverManager from '../src/mixins/observer-manager'
import RequestManager from '../src/mixins/request-manager'
import PermissionManager from '../src/mixins/permission-manager'
import { AutoCleanup, MicroAdapter } from '../src/mixins'

// --- Advanced Test Helper ---
function createMixinInstance(mixinId: any, mocks: any = {}) {
    const options = mixinId.options || mixinId;

    // Add stub for logs
    const vm: any = {
        $destroy: jest.fn(),
        $options: { name: 'MockComponent' },
        $emit: jest.fn(),
        ...mocks
    };

    // 2. 初始化 Data
    if (typeof options.data === 'function') {
        const data = options.data.call(vm);
        Object.assign(vm, data);
        vm.$data = { ...data, ...mocks.$data };
    }

    // 3. 绑定 Methods
    if (options.methods) {
        Object.keys(options.methods).forEach(key => {
            vm[key] = options.methods[key].bind(vm);
        });
    }

    // 4. 绑定 Computed
    if (options.computed) {
        Object.keys(options.computed).forEach(key => {
            Object.defineProperty(vm, key, {
                get: () => options.computed[key].call(vm),
                enumerable: true,
                configurable: true
            });
        });
    }

    // 5. 提取 Lifecycle Hooks
    const getHook = (name: string) => {
        if (Array.isArray(options[name])) return options[name][0];
        return options[name];
    };

    return {
        vm,
        beforeDestroy: () => {
            const hook = getHook('beforeDestroy');
            if (hook) hook.call(vm);
        }
    };
}

describe('Vue2 Toolkit Mixins - High Quality Coverage', () => {

    describe('TimerManager', () => {
        let instance: any
        beforeEach(() => { jest.useFakeTimers(); instance = createMixinInstance(TimerManager); })
        afterEach(() => { jest.useRealTimers(); })

        test('Data 初始化', () => {
            expect(instance.vm.$_timers).toEqual([]);
        })

        test('setTimeout & clearTimeout', () => {
            const spy = jest.fn();
            const id = instance.vm.$_setTimeout(spy, 100);
            expect(id).toBeDefined();
            jest.advanceTimersByTime(100);
            expect(spy).toHaveBeenCalled();
            instance.vm.$_clearTimeout(id);
            expect(instance.vm.$_timers).not.toContain(id);
        })

        test('防抖', () => {
            const spy = jest.fn();
            instance.vm.$_debounceTimeout(spy, 100);
            instance.vm.$_debounceTimeout(spy, 100);
            jest.advanceTimersByTime(100);
            expect(spy).toHaveBeenCalledTimes(1);
        })

        test('Lifecycle Clean', () => {
            (globalThis as any).clearTimeout = jest.fn();
            instance.vm.$_timers = [1];
            instance.beforeDestroy();
            expect((globalThis as any).clearTimeout).toHaveBeenCalledWith(1);
        })
    })

    describe('EventManager', () => {
        let instance: any, el: any
        beforeEach(() => {
            el = { addEventListener: jest.fn(), removeEventListener: jest.fn() };
            instance = createMixinInstance(EventManager);
        })

        test('监听与移除 DOM', () => {
            const fn = jest.fn();
            instance.vm.$_addEventListener(el, 'click', fn);
            expect(el.addEventListener).toHaveBeenCalled();

            instance.vm.$_removeEventListener(el, 'click', fn);
            expect(el.removeEventListener).toHaveBeenCalled();
        })

        test('监听 Vue 事件', () => {
            const bus = { $on: jest.fn(), $off: jest.fn() };
            instance.vm.$_onVueEvent(bus, 'e', jest.fn());
            expect(bus.$on).toHaveBeenCalled();

            instance.vm.$_offVueEvent(bus, 'e', jest.fn());
            expect(bus.$off).toHaveBeenCalled();
        })

        test('Lifecycle Clean', () => {
            instance.vm.$_eventListeners = [{ target: el, type: 'dom', event: 'c', handler: jest.fn() }];
            instance.beforeDestroy();
            expect(el.removeEventListener).toHaveBeenCalled();
        })
    })

    describe('RequestManager', () => {
        let instance: any
        beforeEach(() => { instance = createMixinInstance(RequestManager); })

        test('Computed & Methods', () => {
            expect(instance.vm.$_cancelSignal).toBeInstanceOf(AbortSignal);

            const abort = jest.spyOn(instance.vm.$data.$_abortController, 'abort');
            instance.vm.$_cancelAllRequests();
            expect(abort).toHaveBeenCalled();
        })

        test('Lifecycle', () => {
            const abort = jest.spyOn(instance.vm.$data.$_abortController, 'abort');
            instance.beforeDestroy();
            expect(abort).toHaveBeenCalled();
        })
    })

    describe('PermissionManager', () => {
        let instance: any
        beforeEach(() => {
            instance = createMixinInstance(PermissionManager, {
                $store: { state: { user: { permissions: ['p1'], roles: ['r1'] } } }
            });
        })

        test('Computed & Check', () => {
            expect(instance.vm.$_userPermissions).toEqual(['p1']);
            expect(instance.vm.$_hasPermission('p1')).toBe(true);
            expect(instance.vm.$_hasRole('r1')).toBe(true);
        })

        test('Decorator', () => {
            const ok = jest.fn();
            instance.vm.$_checkPermission('p1', ok);
            expect(ok).toHaveBeenCalled();
        })
    })

    describe('ObserverManager', () => {
        let instance: any
        beforeEach(() => {
            instance = createMixinInstance(ObserverManager);
            (globalThis as any).ResizeObserver = class { observe() { }; disconnect() { } };
        })

        test('Creation & Cleanup', () => {
            const obs = instance.vm.$_observeResize({}, jest.fn());
            expect(obs).toBeDefined();

            const disc = jest.fn();
            instance.vm.$_observers = [{ disconnect: disc }];
            instance.beforeDestroy();
            expect(disc).toHaveBeenCalled();
        })
    })

    describe('MicroAdapter', () => {
        let instance: any
        beforeEach(() => {
            instance = createMixinInstance(MicroAdapter);
        })

        test('API 方法调用', () => {
            const props = { onGlobalStateChange: jest.fn(), setGlobalState: jest.fn() };
            instance.vm.$_isMicroApp = true;

            // Init
            instance.vm.$_initMicroState(props);
            expect(props.onGlobalStateChange).toHaveBeenCalled();

            // Set
            (window as any).$_microAppProps = { setGlobalState: jest.fn() };
            instance.vm.$_setMicroState({ user: 'test' });
            expect((window as any).$_microAppProps.setGlobalState).toHaveBeenCalledWith({ user: 'test' });
        })
    })

    describe('AutoCleanup', () => {
        test.skip('集成调用验证', () => {
            const clearTimers = jest.fn();
            const clearListeners = jest.fn();
            const disconnectObservers = jest.fn();
            const cancelRequests = jest.fn();

            // Manually inject methods that would be mixed in
            const instance = createMixinInstance(AutoCleanup, {
                $_clearAllTimers: clearTimers,
                $_clearAllListeners: clearListeners,
                $_disconnectAllObservers: disconnectObservers,
                $_cancelAllRequests: cancelRequests
            });

            instance.beforeDestroy();

            expect(clearTimers).toHaveBeenCalled();
            expect(clearListeners).toHaveBeenCalled();
            expect(disconnectObservers).toHaveBeenCalled();
            expect(cancelRequests).toHaveBeenCalled();
        })
    })
})
