/**
 * 扩展HTMLElement类型定义，添加指令所需的自定义属性
 */

declare global {
  interface HTMLElement {
    _clipboardHandler?: Function
    _lazyObserver?: IntersectionObserver
    _resizeObserver?: ResizeObserver
    _dragHandler?: Function
    _throttleHandlers?: Record<string, Function>
  }
}

export {}
