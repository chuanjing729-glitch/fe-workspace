import { DirectiveOptions } from 'vue'

/**
 * 节流指令
 * 使用方法: v-throttle:scroll="handler" 或 v-throttle:scroll="[handler, 500]"
 */
const throttle: DirectiveOptions = {
  bind(el: any, binding) {
    const event = binding.arg || 'scroll'
    let handler = binding.value
    let delay = 300
    
    // 如果传入的是数组，则第一个参数是处理函数，第二个参数是延迟时间
    if (Array.isArray(binding.value)) {
      handler = binding.value[0]
      delay = binding.value[1] || delay
    }
    
    let timer: any = null
    let firstTime = true
    
    const throttledHandler = function(this: any, ...args: any[]) {
      const context = this
      
      if (firstTime) {
        handler.apply(context, args)
        firstTime = false
        return
      }
      
      if (timer) return
      
      timer = setTimeout(() => {
        handler.apply(context, args)
        timer = null
      }, delay)
    }
    
    // 保存原始处理函数和节流处理函数
    el._throttleHandlers = el._throttleHandlers || {}
    el._throttleHandlers[event] = {
      original: handler,
      throttled: throttledHandler
    }
    
    // 移除原有的事件监听器并添加节流后的事件监听器
    el.removeEventListener(event, handler)
    el.addEventListener(event, throttledHandler)
  },
  
  update(el: any, binding) {
    // 更新时重新绑定
    const event = binding.arg || 'scroll'
    let handler = binding.value
    let delay = 300
    
    if (Array.isArray(binding.value)) {
      handler = binding.value[0]
      delay = binding.value[1] || delay
    }
    
    // 如果处理函数没有改变，则不需要重新绑定
    if (el._throttleHandlers && el._throttleHandlers[event]) {
      const handlers = el._throttleHandlers[event]
      if (handlers.original === handler) {
        return
      }
      
      // 移除旧的事件监听器
      el.removeEventListener(event, handlers.throttled)
    }
    
    // 添加新的节流处理函数
    let timer: any = null
    let firstTime = true
    
    const throttledHandler = function(this: any, ...args: any[]) {
      const context = this
      
      if (firstTime) {
        handler.apply(context, args)
        firstTime = false
        return
      }
      
      if (timer) return
      
      timer = setTimeout(() => {
        handler.apply(context, args)
        timer = null
      }, delay)
    }
    
    el._throttleHandlers = el._throttleHandlers || {}
    el._throttleHandlers[event] = {
      original: handler,
      throttled: throttledHandler
    }
    
    el.addEventListener(event, throttledHandler)
  },
  
  unbind(el: any) {
    // 组件销毁时移除所有事件监听器
    if (el._throttleHandlers) {
      Object.keys(el._throttleHandlers).forEach(event => {
        const handlers = el._throttleHandlers[event]
        el.removeEventListener(event, handlers.throttled)
      })
      el._throttleHandlers = null
    }
  }
}

export default throttle
