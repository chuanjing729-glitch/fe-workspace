import { DirectiveOptions } from 'vue'

/**
 * 自动聚焦指令
 * 使用方法: v-focus 或 v-focus="true/false"
 */
const focus: DirectiveOptions = {
  inserted(el: any, binding) {
    // 如果没有绑定值或者绑定值为true，则聚焦元素
    if (binding.value !== false) {
      setTimeout(() => {
        el.focus()
      }, 0)
    }
  },
  
  update(el: any, binding) {
    // 当绑定值发生变化时处理
    if (binding.value !== binding.oldValue) {
      if (binding.value) {
        setTimeout(() => {
          el.focus()
        }, 0)
      } else {
        el.blur()
      }
    }
  }
}

export default focus
