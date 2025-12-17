import { DirectiveOptions } from 'vue'

/**
 * 元素尺寸变化监听指令
 * 使用方法: v-resize="handler"
 */
const resize: DirectiveOptions = {
  bind(el: any, binding) {
    const handler = binding.value
    
    if (typeof handler !== 'function') {
      console.warn('v-resize requires a function handler')
      return
    }
    
    let timer: any = null
    const resizeHandler = () => {
      if (timer) clearTimeout(timer)
      
      timer = setTimeout(() => {
        const rect = el.getBoundingClientRect()
        handler({
          width: rect.width,
          height: rect.height
        })
      }, 100)
    }
    
    // 使用 ResizeObserver（如果支持）
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(resizeHandler)
      observer.observe(el)
      el._resizeObserver = observer
    } else {
      // 降级方案：监听窗口 resize 事件
      ;(window as Window).addEventListener('resize', resizeHandler)
      ;(el as any)._resizeHandler = resizeHandler
    }
    
    // 立即执行一次
    setTimeout(resizeHandler, 0)
  },
  
  unbind(el: any) {
    // 清理 ResizeObserver
    if (el._resizeObserver) {
      el._resizeObserver.disconnect()
      el._resizeObserver = null
    }
    
    // 清理事件监听器
    if (el._resizeHandler) {
      window.removeEventListener('resize', el._resizeHandler)
      el._resizeHandler = null
    }
  }
}

export default resize
