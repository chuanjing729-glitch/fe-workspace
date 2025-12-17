import {
  EventBus,
  createEventBus,
  globalEventBus,
  dispatchCustomEvent,
  delegate,
  waitForEvent
} from '../src/event'

describe('event模块测试', () => {
  describe('EventBus', () => {
    let bus: EventBus

    beforeEach(() => {
      bus = new EventBus()
    })

    test('订阅和发布事件', () => {
      const callback = jest.fn()
      bus.on('test-event', callback)
      bus.emit('test-event', { message: 'hello' })
      
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith({ message: 'hello' })
    })

    test('取消订阅事件', () => {
      const callback = jest.fn()
      bus.on('test-event', callback)
      bus.off('test-event', callback)
      bus.emit('test-event')
      
      expect(callback).not.toHaveBeenCalled()
    })

    test('on方法返回取消订阅函数', () => {
      const callback = jest.fn()
      const unsubscribe = bus.on('test-event', callback)
      unsubscribe()
      bus.emit('test-event')
      
      expect(callback).not.toHaveBeenCalled()
    })

    test('once订阅一次性事件', () => {
      const callback = jest.fn()
      bus.once('test-event', callback)
      bus.emit('test-event')
      bus.emit('test-event')
      
      expect(callback).toHaveBeenCalledTimes(1)
    })

    test('清空所有事件', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      bus.on('event1', callback1)
      bus.on('event2', callback2)
      
      bus.clear()
      bus.emit('event1')
      bus.emit('event2')
      
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })

    test('获取事件监听器数量', () => {
      bus.on('test-event', jest.fn())
      bus.on('test-event', jest.fn())
      
      expect(bus.listenerCount('test-event')).toBe(2)
      expect(bus.listenerCount('non-existent')).toBe(0)
    })

    test('多个订阅者', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      
      bus.on('test-event', callback1)
      bus.on('test-event', callback2)
      bus.emit('test-event', 'data')
      
      expect(callback1).toHaveBeenCalledWith('data')
      expect(callback2).toHaveBeenCalledWith('data')
    })
  })

  describe('createEventBus', () => {
    test('创建独立的事件总线', () => {
      const bus1 = createEventBus()
      const bus2 = createEventBus()
      
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      
      bus1.on('event', callback1)
      bus2.on('event', callback2)
      
      bus1.emit('event')
      
      expect(callback1).toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })
  })

  describe('globalEventBus', () => {
    test('全局事件总线', () => {
      const callback = jest.fn()
      globalEventBus.on('global-event', callback)
      globalEventBus.emit('global-event', 'data')
      
      expect(callback).toHaveBeenCalledWith('data')
      
      // 清理
      globalEventBus.clear()
    })
  })

  describe('dispatchCustomEvent', () => {
    test('触发自定义事件', () => {
      const element = document.createElement('div')
      const callback = jest.fn()
      
      element.addEventListener('custom-event', callback as EventListener)
      dispatchCustomEvent(element, 'custom-event', { data: 'test' })
      
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('delegate', () => {
    test('事件委托', () => {
      const parent = document.createElement('div')
      const child = document.createElement('button')
      child.className = 'test-button'
      parent.appendChild(child)
      
      const handler = jest.fn()
      const unlisten = delegate(parent, '.test-button', 'click', handler)
      
      child.click()
      
      expect(handler).toHaveBeenCalledTimes(1)
      
      // 清理
      unlisten()
    })

    test('取消事件委托', () => {
      const parent = document.createElement('div')
      const child = document.createElement('button')
      child.className = 'test-button'
      parent.appendChild(child)
      
      const handler = jest.fn()
      const unlisten = delegate(parent, '.test-button', 'click', handler)
      
      unlisten()
      child.click()
      
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('waitForEvent', () => {
    test('等待事件触发', async () => {
      const element = document.createElement('div')
      
      setTimeout(() => {
        element.dispatchEvent(new Event('ready'))
      }, 100)
      
      const event = await waitForEvent(element, 'ready')
      expect(event.type).toBe('ready')
    })

    test('等待事件超时', async () => {
      const element = document.createElement('div')
      
      await expect(
        waitForEvent(element, 'never', 100)
      ).rejects.toThrow('timeout')
    })
  })
})
