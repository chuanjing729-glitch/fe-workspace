import { DirectiveOptions } from 'vue'

/**
 * 拖拽指令（简化版，适用于对话框等）
 * 使用方法: v-drag
 */
const drag: DirectiveOptions = {
  bind(el: any) {
    el.style.cursor = 'move'
    el.style.position = 'absolute'
    
    el._dragHandler = {
      mousedown: (e: MouseEvent) => {
        const disX = e.clientX - el.offsetLeft
        const disY = e.clientY - el.offsetTop
        
        const mousemove = (e: MouseEvent) => {
          el.style.left = e.clientX - disX + 'px'
          el.style.top = e.clientY - disY + 'px'
        }
        
        const mouseup = () => {
          document.removeEventListener('mousemove', mousemove)
          document.removeEventListener('mouseup', mouseup)
        }
        
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
      }
    }
    
    el.addEventListener('mousedown', el._dragHandler.mousedown)
  },
  
  unbind(el: any) {
    if (el._dragHandler) {
      el.removeEventListener('mousedown', el._dragHandler.mousedown)
      delete el._dragHandler
    }
  }
}

export default drag
