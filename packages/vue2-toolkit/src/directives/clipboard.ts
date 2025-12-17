import { DirectiveOptions } from 'vue'

/**
 * 剪贴板指令
 * 使用方法: v-clipboard="text" @success="onSuccess" @error="onError"
 */
const clipboard: DirectiveOptions = {
  bind(el, binding, vnode) {
    const text = binding.value
    
    el._clipboardHandler = function() {
      const value = typeof text === 'function' ? text() : text
      
      // 使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(() => {
          if (vnode.componentInstance && vnode.componentInstance.$listeners.success) {
            vnode.componentInstance.$emit('success', value)
          }
        }).catch((err) => {
          console.error('Failed to copy:', err)
          if (vnode.componentInstance && vnode.componentInstance.$listeners.error) {
            vnode.componentInstance.$emit('error', err)
          }
        })
      } else {
        // 降级方案：使用 execCommand
        try {
          const textArea = document.createElement('textarea')
          textArea.value = value
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          
          const successful = document.execCommand('copy')
          document.body.removeChild(textArea)
          
          if (successful) {
            if (vnode.componentInstance && vnode.componentInstance.$listeners.success) {
              vnode.componentInstance.$emit('success', value)
            }
          } else {
            throw new Error('Copy command was unsuccessful')
          }
        } catch (err) {
          console.error('Fallback: Could not copy text:', err)
          if (vnode.componentInstance && vnode.componentInstance.$listeners.error) {
            vnode.componentInstance.$emit('error', err)
          }
        }
      }
    }
    
    el.addEventListener('click', el._clipboardHandler as EventListener)
  },
  
  unbind(el) {
    if (el._clipboardHandler) {
      el.removeEventListener('click', el._clipboardHandler as EventListener)
      delete el._clipboardHandler
    }
  }
}

export default clipboard
