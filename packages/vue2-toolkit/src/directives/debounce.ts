/**
 * 防抖指令
 * 用法：v-debounce="handleClick" 或 v-debounce:500="handleClick"
 */

interface DebounceOptions {
  fn: Function
  delay: number
}

const debounceMap = new WeakMap<HTMLElement, number>()

export default {
  bind(el: HTMLElement, binding: any) {
    const delay = Number(binding.arg) || 300
    const fn = binding.value

    if (typeof fn !== 'function') {
      console.error('[v-debounce] 绑定值必须是函数')
      return
    }

    el.addEventListener('click', function(this: any, event: Event) {
      const timerId = debounceMap.get(el)
      if (timerId) {
        clearTimeout(timerId)
      }

      const newTimerId = window.setTimeout(() => {
        fn.call(this, event)
      }, delay)

      debounceMap.set(el, newTimerId)
    })
  },

  unbind(el: HTMLElement) {
    const timerId = debounceMap.get(el)
    if (timerId) {
      clearTimeout(timerId)
      debounceMap.delete(el)
    }
  }
}
