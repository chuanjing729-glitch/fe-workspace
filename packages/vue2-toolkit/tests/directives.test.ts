/**
 * Vue2 指令测试用例
 */

import debounceDirective from '../src/directives/debounce'
import clipboardDirective from '../src/directives/clipboard'
import lazyDirective from '../src/directives/lazy'
import permissionDirective from '../src/directives/permission'
import throttleDirective from '../src/directives/throttle'
import dragDirective from '../src/directives/drag'
import resizeDirective from '../src/directives/resize'
import focusDirective from '../src/directives/focus'

describe('Vue2 Directives 测试', () => {
  let mockElement: any
  let mockBinding: any
  let mockVnode: any

  beforeEach(() => {
    // Mock element
    mockElement = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      },
      style: {},
      focus: jest.fn(),
      src: ''
    }

    // Mock binding
    mockBinding = {
      value: null,
      oldValue: null,
      expression: '',
      arg: undefined,
      modifiers: {}
    }

    // Mock vnode
    mockVnode = {
      context: {
        $permissions: []
      },
      componentInstance: null
    }
  })

  // 1. debounce 指令
  describe('debounce 指令', () => {
    test('应该在元素上添加防抖处理', () => {
      const handler = jest.fn()
      mockBinding.value = handler

      debounceDirective.bind(mockElement, mockBinding)

      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      )
    })
  })

  // 2. clipboard 指令
  describe('clipboard 指令', () => {
    test('应该添加点击事件监听器', () => {
      mockBinding.value = 'test text'

      if (clipboardDirective.bind) {
        clipboardDirective.bind(mockElement, mockBinding, mockVnode, mockVnode)
      }

      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      )
    })
  })

  // 3. lazy 指令
  describe('lazy 指令', () => {
    test('应该设置默认占位图', () => {
      const img = { ...mockElement }
      mockBinding.value = 'real-image.jpg'

      if (lazyDirective.bind) {
        lazyDirective.bind(img, mockBinding, mockVnode, mockVnode)
      }

      // 测试图片被调用（IntersectionObserver 不支持的情况下直接设置）
      expect(img.src).toBeTruthy()
    })
  })

  // 4. permission 指令  
  describe('permission 指令', () => {
    test('有权限时应该显示元素', () => {
      mockVnode.context.$permissions = ['admin', 'user']
      mockBinding.value = 'admin'

      if (permissionDirective.bind) {
        permissionDirective.bind(mockElement, mockBinding, mockVnode, mockVnode)
      }

      expect(mockElement.style.display).toBe('')
    })

    test('无权限时应该隐藏元素', () => {
      mockVnode.context.$permissions = ['user']
      mockBinding.value = 'admin'

      if (permissionDirective.bind) {
        permissionDirective.bind(mockElement, mockBinding, mockVnode, mockVnode)
      }

      expect(mockElement.style.display).toBe('none')
    })
  })

  // 5. throttle 指令
  describe('throttle 指令', () => {
    test('应该添加节流处理', () => {
      const handler = jest.fn()
      mockBinding.value = handler
      mockBinding.arg = 'click'  // 默认是scroll，指定click

      if (throttleDirective.bind) {
        throttleDirective.bind(mockElement, mockBinding, mockVnode, mockVnode)
      }

      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      )
    })
  })

  // 6. drag 指令
  describe('drag 指令', () => {
    test('应该添加mousedown事件监听器', () => {
      if (dragDirective.bind) {
        dragDirective.bind(mockElement, mockBinding, mockVnode, mockVnode)
      }

      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function)
      )
    })
  })

  // 7. resize 指令
  describe('resize 指令', () => {
    test('应该调用回调函数', (done) => {
      const callback = jest.fn()
      mockBinding.value = callback
      // Mock getBoundingClientRect
      mockElement.getBoundingClientRect = jest.fn(() => ({
        width: 100,
        height: 200
      }))

      if (resizeDirective.bind) {
        resizeDirective.bind(mockElement, mockBinding, mockVnode, mockVnode)
      }

      // 异步调用，等待debounce（100ms）
      setTimeout(() => {
        expect(callback).toHaveBeenCalled()
        done()
      }, 150)
    })
  })

  // 8. focus 指令
  describe('focus 指令', () => {
    test('插入时应该聚焦元素', (done) => {
      if (focusDirective.inserted) {
        focusDirective.inserted(mockElement, mockBinding, mockVnode, mockVnode)
      }

      // nextTick
      setTimeout(() => {
        expect(mockElement.focus).toHaveBeenCalled()
        done()
      }, 10)
    })
  })
})
