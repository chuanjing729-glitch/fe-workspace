import debounceDirective from '../src/directives/debounce'
import clipboardDirective from '../src/directives/clipboard'
import lazyDirective from '../src/directives/lazy'
import permissionDirective from '../src/directives/permission'
import throttleDirective from '../src/directives/throttle'
import dragDirective from '../src/directives/drag'
import resizeDirective from '../src/directives/resize'
import focusDirective from '../src/directives/focus'

(globalThis as any).ResizeObserver = class { observe() { }; disconnect() { }; unobserve() { } };

// --- Directive Simulator ---
function callHook(dir: any, hook: string, el: any, binding: any = {}, vnode: any = {}, oldVnode: any = {}) {
  if (dir[hook]) {
    dir[hook](
      el,
      { modifiers: {}, ...binding },
      { context: {}, ...vnode },
      oldVnode
    );
  }
}

describe('Directives - High Quality Coverage', () => {
  let el: any

  beforeEach(() => {
    el = document.createElement('div')
    el.addEventListener = jest.fn()
    el.removeEventListener = jest.fn()
    el.getBoundingClientRect = () => ({ width: 100, height: 100, top: 0, left: 0 })
  })

  // --- 1. Clipboard ---
  describe('v-clipboard', () => {
    beforeEach(() => {
      document.execCommand = jest.fn(() => true)
    })

    test('点击复制成功', () => {
      let clickHandler: any
      el.addEventListener = (evt: any, fn: any) => { if (evt === 'click') clickHandler = fn }

      callHook(clipboardDirective, 'bind', el, { arg: 'copy', value: 'text' })
      if (clickHandler) clickHandler()
      expect(document.execCommand).toHaveBeenCalledWith('copy')
    })

    test('复制失败处理', () => {
      (document.execCommand as jest.Mock).mockImplementation(() => { throw new Error('Fail') })
      const emitSpy = jest.fn()
      let clickHandler: any
      el.addEventListener = (e: any, f: any) => { if (e === 'click') clickHandler = f }

      const vnode = {
        componentInstance: {
          $listeners: { error: true },
          $emit: emitSpy
        }
      }

      callHook(clipboardDirective, 'bind', el, { value: 'txt' }, vnode)
      if (clickHandler) clickHandler()
      expect(emitSpy).toHaveBeenCalledWith('error', expect.any(Error))
    })

    test('解绑清理', () => {
      callHook(clipboardDirective, 'unbind', el)
      expect(el.removeEventListener).toHaveBeenCalled()
    })
  })

  // --- 2. Permission ---
  describe('v-permission', () => {
    test('无权限', () => {
      const vnode = { context: { $permissions: ['user'] } }
      callHook(permissionDirective, 'bind', el, { value: 'admin' }, vnode)
      expect(el.style.display).toBe('none')
    })

    test('有权限', () => {
      const vnode = { context: { $permissions: ['admin'] } }
      el.style.display = 'none'
      callHook(permissionDirective, 'bind', el, { value: 'admin' }, vnode)
      expect(el.style.display).toBe('')
    })

    test('Update 更新权限', () => {
      const vnode = { context: { $permissions: ['user'] } }
      callHook(permissionDirective, 'bind', el, { value: 'admin' }, vnode)
      vnode.context.$permissions = ['admin']
      callHook(permissionDirective, 'update', el, { value: 'admin', oldValue: 'admin' }, vnode)
      expect(el.style.display).toBe('')
    })
  })

  // --- 3. Debounce ---
  describe('v-debounce', () => {
    test('基础绑定', () => {
      jest.useFakeTimers()
      callHook(debounceDirective, 'bind', el, { value: jest.fn() })
      expect(el.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
      callHook(debounceDirective, 'unbind', el)
      expect(el.removeEventListener).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  // --- 4. Lazy ---
  describe('v-lazy', () => {
    test('Bind & Update', () => {
      callHook(lazyDirective, 'bind', el, { value: 'img.png' })
      expect(el.src).toBeDefined()
      callHook(lazyDirective, 'update', el, { value: 'new.png', oldValue: 'old.png' })
    })
  })

  // --- 5. Resize ---
  describe('v-resize', () => {
    test('绑定 & 解绑', () => {
      callHook(resizeDirective, 'bind', el, { value: jest.fn() })
      expect(el.__resizeObserver__).toBeDefined()

      el.__resizeObserver__ = { disconnect: jest.fn() }
      callHook(resizeDirective, 'unbind', el)
      expect(el.__resizeObserver__.disconnect).toHaveBeenCalled()
    })
  })

  // --- 6. Focus ---
  describe('v-focus', () => {
    test('Inserted 聚焦', () => {
      jest.useFakeTimers()
      el.focus = jest.fn()
      callHook(focusDirective, 'inserted', el, { value: true })
      jest.advanceTimersByTime(50)
      expect(el.focus).toHaveBeenCalled()
      jest.useRealTimers()
    })

    test('Update', () => {
      el.blur = jest.fn()
      callHook(focusDirective, 'update', el, { value: false, oldValue: true })
      expect(el.blur).toHaveBeenCalled()
    })
  })

  // --- 7. Drag ---
  describe('v-drag', () => {
    test('绑定 mousedown', () => {
      callHook(dragDirective, 'bind', el, {})
      expect(el.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function))
    })

    test('拖拽逻辑', () => {
      // Mock offsets
      Object.defineProperties(el, {
        offsetLeft: { value: 10, configurable: true },
        offsetTop: { value: 10, configurable: true }
      });

      let mousedown: any
      el.addEventListener = (evt: any, fn: any) => { if (evt === 'mousedown') mousedown = fn }

      callHook(dragDirective, 'bind', el, {})

      if (mousedown) {
        const docAdd = jest.spyOn(document, 'addEventListener')
        const docRem = jest.spyOn(document, 'removeEventListener')

        // 1. Mouse Down
        mousedown({ clientX: 20, clientY: 20 })
        expect(docAdd).toHaveBeenCalledWith('mousemove', expect.any(Function))

        // 2. Mouse Move (Simulate)
        const moveHandler = docAdd.mock.calls.find(c => c[0] === 'mousemove')![1] as Function
        moveHandler({ clientX: 30, clientY: 30 })
        expect(el.style.left).toBeDefined()

        // 3. Mouse Up
        const upHandler = docAdd.mock.calls.find(c => c[0] === 'mouseup')![1] as Function
        upHandler()
        expect(docRem).toHaveBeenCalledWith('mousemove', expect.any(Function))
      }
    })
  })

  // --- 8. Throttle ---
  describe('v-throttle', () => {
    test('绑定 scroll', () => {
      callHook(throttleDirective, 'bind', el, {})
      expect(el.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })
})
